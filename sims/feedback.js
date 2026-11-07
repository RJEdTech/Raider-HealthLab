(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Model: e(t) is the gap from the set point. de/dt = s·g·e(t − τ), with s = −1 (negative feedback) or +1 (positive).
   Time runs in "loop units" (10 min for blood sugar, 5 min for temperature, 1 day for the feed, illustrative steps for the hormone loops).
   Before t = 0 the value sat at the set point; the push sets e(0) = D. */
const SC={
 glucose:{name:'Blood sugar after a snack',short:'Blood sugar',u:'mg/dL',set:90,push:40,band:10,tu:10,W:18,lo:-60,hi:150,ymin:20,ymax:240,ystep:40,dec:0,sign:'neg',kind:'band',tl:'Minutes after the push',xstep:3},
 temp:{name:'Body temperature on a hard run',short:'Body temperature',u:'°C',set:37,push:1,band:0.3,tu:5,W:18,lo:-3,hi:3,ymin:34,ymax:40,ystep:1,dec:1,sign:'neg',kind:'band',tl:'Minutes after the push',xstep:3},
 lh:{name:'The LH surge before ovulation',short:'LH level',u:'units',set:1,push:0.5,band:0.5,tu:0,W:18,lo:-1,hi:9,ymin:0,ymax:11,ystep:2,dec:1,sign:'pos',kind:'end',endL:'Ovulation',tl:'Time (illustrative steps)',xstep:3},
 birth:{name:'Oxytocin during childbirth',short:'Contraction strength',u:'units',set:1,push:0.5,band:0.5,tu:0,W:18,lo:-1,hi:9,ymin:0,ymax:11,ystep:2,dec:1,sign:'pos',kind:'end',endL:'Birth',tl:'Time (illustrative steps)',xstep:3},
 feed:{name:'Your feed’s engagement loop',short:'Minutes a day on the app',u:'min/day',set:60,push:20,band:0,tu:1440,W:21,lo:-60,hi:180,ymin:0,ymax:250,ystep:50,dec:0,sign:'pos',kind:'over',tl:'Days after the push',xstep:3}
};
const DT=0.05,GAINS=[];for(let i=0;i<30;i++)GAINS.push(+(0.05+i*0.05).toFixed(2));
const sc=sim=>SC[sim.p.scen]||SC.glucose;
const sgn=sim=>sim.p.sign==='pos'?1:-1;
const lagOf=sim=>atLeast('honors')?+sim.p.lag:1;
const pushOf=sim=>sim.p.push*sc(sim).push;
const natural=sim=>sc(sim).sign===sim.p.sign;
/* Run the loop. Returns the gap at every DT, and the time the endpoint is reached (end loops). */
const MEMO=new Map();
function run(scen,D,g,s,lag){const key=scen+'|'+D+'|'+g+'|'+s+'|'+lag;if(MEMO.has(key))return MEMO.get(key);
 const C=SC[scen],n=Math.round(C.W/DT),L=Math.round(lag/DT),e=new Float64Array(n+1);e[0]=clamp(D,C.lo,C.hi);let tEnd=null;
 for(let i=0;i<n;i++){let v;
  if(tEnd!==null)v=e[i]-e[i]*DT*1.5;/* after the endpoint the loop is over and the value falls back */
  else{const past=L===0?e[i]:(i-L>=0?e[i-L]:0);v=clamp(e[i]+s*g*past*DT,C.lo,C.hi);
   if(C.kind==='end'&&s>0&&v>=C.hi-1e-9){v=C.hi;tEnd=(i+1)*DT;}}
  e[i+1]=v;}
 const r={e,tEnd,n};if(MEMO.size>400)MEMO.clear();MEMO.set(key,r);return r;}
const runP=(sim,g,s)=>run(sim.p.scen,pushOf(sim),g==null?sim.p.gain:g,s==null?sgn(sim):s,lagOf(sim));
/* The score the gut and the math are both judged on (lower is better):
   band loops: time outside the target band; the feed: extra minutes over the limit; end loops (positive): time to reach the endpoint. */
function score(sim,g,s){const C=sc(sim),r=runP(sim,g,s);s=s==null?sgn(sim):s;
 if(C.kind==='end'&&s>0)return r.tEnd===null?C.W:r.tEnd;
 let c=0;if(C.kind==='over'){for(let i=0;i<r.n;i++)if(r.e[i]>0)c+=r.e[i]*DT;return c;}
 for(let i=0;i<r.n;i++)if(Math.abs(r.e[i])>C.band+1e-9)c+=DT;return c;}
/* Real units of the score */
function scoreMin(sim,v){const C=sc(sim);if(C.kind==='end'&&sgn(sim)>0)return null;if(C.kind==='over')return v;if(!C.tu)return null;return v*C.tu;}
function bestGain(sim,s){let bg=GAINS[0],bv=Infinity;for(const g of GAINS){const v=score(sim,g,s);if(v<bv-1e-9){bv=v;bg=g;}}return {g:bg,v:bv};}
function overshoot(sim,g){const r=runP(sim,g),D=pushOf(sim);if(!D)return 0;let m=0;for(let i=0;i<=r.n;i++){const x=r.e[i]*Math.sign(D);if(x<m)m=x;}return Math.abs(m)/Math.abs(D)*100;}
function behave(sim,g){const C=sc(sim),r=runP(sim,g),s=sgn(sim),D=pushOf(sim);
 if(!D)return 'Stays at the set point: nothing pushed it';
 if(s>0){if(C.kind==='end')return r.tEnd!==null?`Amplifies until ${C.endL.toLowerCase()} ends the loop`:(D<0?'Shrinks toward zero':'Amplifies, but has not reached the endpoint yet');
  return 'Runs away from the set point';}
 const third=Math.floor(r.n/3);let a=0,b=0;for(let i=0;i<third;i++)a=Math.max(a,Math.abs(r.e[i]));for(let i=r.n-third;i<=r.n;i++)b=Math.max(b,Math.abs(r.e[i]));
 if(b>a*0.98)return 'Swings get bigger: unstable';
 const os=overshoot(sim,g);if(os<1)return 'Settles smoothly, no overshoot';
 if(b>Math.abs(D)*0.15)return 'Swings back and forth, slowly settling';
 return `Overshoots by ${Math.round(os)}% of the push, then settles`;}
const fmt=(sim,x)=>fmtNum(x,sc(sim).dec);
const valAt=(sim,e)=>sc(sim).set+e;
const minTxt=v=>Math.round(v)+' min';
function offText(sim,g){const C=sc(sim),v=score(sim,g),s=sgn(sim);
 if(C.kind==='end'&&s>0)return v>=C.W-1e-9?`Has not reached ${C.endL.toLowerCase()} in ${C.W} steps`:`Reaches ${C.endL.toLowerCase()} after ${fmtNum(v,1)} steps`;
 if(C.kind==='over')return `${Math.round(v)} extra minutes over ${C.set} min/day in 3 weeks`;
 if(C.kind==='end')return `${fmtNum(v,1)} steps outside the band`;
 return `${minTxt(v*C.tu)} outside ${fmt(sim,C.set-C.band)} to ${fmt(sim,C.set+C.band)} ${C.u}`;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function newLoop(sim){const C=sc(sim);if(sim.p.sign!==C.sign)BioLab.setValues(sim,{sign:C.sign});clearGut(sim);}

/* Diagram text: [long, short, sub] for the four boxes */
function boxes(sim){const C=sc(sim),up=pushOf(sim)>=0,s=sgn(sim),nat=natural(sim);let B;
 switch(sim.p.scen){
  case 'glucose':B=up?[['Blood sugar rises','Sugar rises','The change: a snack adds glucose'],['Pancreas senses it','Pancreas senses','Sensor and control: beta cells'],['Releases insulin','Insulin out','Signal: insulin travels in the blood'],['Cells take in glucose','Cells take it in','Effect: liver and muscle store it']]
   :[['Blood sugar falls','Sugar falls','The change: long practice, no food'],['Pancreas senses it','Pancreas senses','Sensor and control: alpha cells'],['Releases glucagon','Glucagon out','Signal: glucagon travels in the blood'],['Liver releases glucose','Liver adds sugar','Effect: stored glucose comes out']];break;
  case 'temp':B=up?[['Body temp rises','Temp rises','The change: a hard run'],['Hypothalamus senses it','Brain senses','Sensor and control: the brain'],['Sweat, skin vessels widen','Sweat','Response: sweat glands, blood vessels'],['Body loses heat','Heat leaves','Effect: sweat evaporates']]
   :[['Body temp falls','Temp falls','The change: cold wind'],['Hypothalamus senses it','Brain senses','Sensor and control: the brain'],['Shiver, skin vessels narrow','Shiver','Response: muscles, blood vessels'],['Body keeps more heat','Heat kept','Effect: less heat lost, more made']];break;
  case 'lh':B=[['Estrogen rises','Estrogen rises','The change: a maturing follicle'],['Brain and pituitary','Pituitary','Control: hypothalamus and pituitary'],['Release more LH','More LH','Signal: luteinizing hormone (LH)'],['Follicle makes more estrogen','More estrogen','Effect: the change grows']];break;
  case 'birth':B=[['Baby presses on cervix','Cervix stretches','The change: labor begins'],['Nerves signal the brain','Brain gets signal','Sensor: stretch receptors'],['Pituitary releases oxytocin','Oxytocin out','Signal: the hormone oxytocin'],['Stronger contractions','Stronger push','Effect: more pressure on the cervix']];break;
  default:B=s<0?[['You go over your limit','Over your limit','The change: one long night'],['Screen-time timer sees it','Timer sees it','Sensor: your phone’s timer'],['Your rule: cut back','Cut back','Response: your stopping rule'],['Less watching next day','Less tomorrow','Effect: back toward your limit']]
   :[['You watch more of a topic','You watch more','The change: one long night'],['App logs your watch time','App logs it','Sensor: the recommendation model'],['Feed shows more of it','More of it','Response: more of that topic'],['Harder to put down','Harder to stop','Effect: tomorrow you watch more']];}
 if(!nat&&sim.p.scen!=='feed'){if(s>0){B[2]=['Response pushes the same way','Same-way push','What-if: not how this loop really works'];B[3]=['The change grows','Change grows','Effect: farther from the set point'];}
  else{B[2]=['Response opposes it','Opposes it','What-if: not how this loop really works'];B[3]=['The change shrinks','Change shrinks','Effect: back toward baseline'];}}
 return B;}

function drawDiagram(sim,ctx,k){const C=sc(sim),B=boxes(sim),big=k>1.3,s=sgn(sim);
 txt(ctx,big?C.short:C.name,20,28*Math.min(k,1.3),{s:15*k,w:700});
 const x0=78,w=270,h=big?42:52,ys=[78,163,248,333].map(y=>y+(big?6:0));
 const fills=[PAL['card'],PAL['card'],PAL['card'],PAL['card']];
 ys.forEach((y,i)=>{rr(ctx,x0,y,w,h,10);ctx.fillStyle=fills[i];ctx.fill();ctx.strokeStyle=i===0?PAL['rj']:PAL['line'];ctx.lineWidth=i===0?2.5:1.5;ctx.stroke();
  txt(ctx,big?B[i][1]:B[i][0],x0+w/2,y+(big?h/2+5*k:22),{s:14*k,w:700,a:'center'});
  if(!big)txt(ctx,B[i][2],x0+w/2,y+40,{s:12,c:PAL['cv-soft'],a:'center'});
  if(i<3){const ax=x0+w/2,a1=y+h+3,a2=ys[i+1]-4;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax,a1);ctx.lineTo(ax,a2);ctx.stroke();
   ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(ax-6,a2-8);ctx.lineTo(ax+6,a2-8);ctx.lineTo(ax,a2);ctx.closePath();ctx.fill();}});
 /* the return path: box 4 back to box 1 */
 const col=s<0?PAL['s2']:PAL['s1'],lx=36,yb=ys[3]+h/2,yt=ys[0]+h/2;
 ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0-3,yb);ctx.lineTo(lx,yb);ctx.lineTo(lx,yt);ctx.lineTo(x0-10,yt);ctx.stroke();
 ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x0-12,yt-7);ctx.lineTo(x0-12,yt+7);ctx.lineTo(x0-2,yt);ctx.closePath();ctx.fill();
 const cy=(yb+yt)/2,r=17*Math.min(k,1.3);ctx.beginPath();ctx.arc(lx,cy,r,0,7);ctx.fillStyle=col;ctx.fill();
 txt(ctx,s<0?'−':'+',lx,cy+8*Math.min(k,1.3),{s:24*Math.min(k,1.3),w:700,c:'#fff',a:'center'});
 const foot=s<0?(big?'Negative: opposes':'Negative feedback: the response opposes the change'):(big?'Positive: amplifies':'Positive feedback: the response amplifies the change');
 txt(ctx,foot,20,ys[3]+h+28*Math.min(k,1.3),{s:13*k,w:700,c:col});
 if(C.kind==='end'&&s>0)txt(ctx,big?`Ends at ${C.endL.toLowerCase()}`:`It runs until ${C.endL.toLowerCase()} ends the loop.`,20,ys[3]+h+28*Math.min(k,1.3)+18*k,{s:12*k,c:PAL['cv-soft']});
 else if(sim.p.scen==='feed'&&s<0)txt(ctx,big?'A stopping rule':'Your daily limit is the set point.',20,ys[3]+h+28*Math.min(k,1.3)+18*k,{s:12*k,c:PAL['cv-soft']});}

function drawChart(sim,ctx,k){const C=sc(sim),big=k>1.3,G=GS(sim);
 const L=big?446:430,R=784,T=big?84:70,Bt=big?346:368,W=C.W;
 const X=t=>L+(t/W)*(R-L),Y=v=>Bt-(v-C.ymin)/(C.ymax-C.ymin)*(Bt-T);
 ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,T,R-L,Bt-T);
 /* target band or limit */
 const s=sgn(sim);
 if(C.kind==='band'||(C.kind==='end'&&s<0)){ctx.fillStyle=PAL['cv-leaf'];ctx.globalAlpha=.18;ctx.fillRect(L,Y(C.set+C.band),R-L,Y(C.set-C.band)-Y(C.set+C.band));ctx.globalAlpha=1;}
 if(C.kind==='over'){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.08;ctx.fillRect(L,T,R-L,Y(C.set)-T);ctx.globalAlpha=1;}
 /* grid and ticks */
 ctx.strokeStyle=PAL['g-grid'];ctx.lineWidth=1;const fs=12*Math.min(k,1.5);
 for(let v=C.ymin;v<=C.ymax+1e-9;v+=C.ystep){const y=Y(v);if(y<T-1)continue;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();txt(ctx,fmtNum(v,C.ystep<1?1:0),L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
 const xs=big?C.xstep*2:C.xstep;for(let t=0;t<=W+1e-9;t+=xs){const x=X(t);ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,Bt);ctx.stroke();txt(ctx,C.tu&&C.tu<1440?String(Math.round(t*C.tu)):String(t),x,Bt+16*Math.min(k,1.4),{s:fs,c:PAL['cv-soft'],a:'center'});}
 txt(ctx,C.tl,(L+R)/2,Bt+34*Math.min(k,1.35),{s:fs,c:PAL['cv-soft'],a:'center'});
 txt(ctx,big?C.u:(C.short+' ('+C.u+')'),L-30,T-30*Math.min(k,1.2),{s:fs,w:700,c:PAL['cv-ink']});
 /* set point / endpoint lines */
 ctx.setLineDash([7,5]);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,Y(C.set));ctx.lineTo(R,Y(C.set));ctx.stroke();
 if(C.kind==='end'){ctx.strokeStyle=PAL['s5'];ctx.beginPath();ctx.moveTo(L,Y(C.set+C.hi));ctx.lineTo(R,Y(C.set+C.hi));ctx.stroke();}
 ctx.setLineDash([]);
 const spl=C.kind==='over'?(s<0?'Your limit':'Your usual'):(C.kind==='end'?'Baseline':'Set point');
 const below=pushOf(sim)>=0;txt(ctx,spl+(big?'':': '+fmt(sim,C.set)+' '+C.u),L+6,Y(C.set)+(below?16*Math.min(k,1.3):-6),{s:fs,w:700,c:PAL['cv-ink']});
 if(C.kind==='end')txt(ctx,C.endL,R-6,Y(C.set+C.hi)-6,{s:fs,w:700,c:PAL['s5'],a:'right'});
 /* curves */
 const curve=(g,s2,col,dash,wd)=>{const r=run(sim.p.scen,pushOf(sim),g,s2,lagOf(sim));ctx.strokeStyle=col;ctx.lineWidth=wd;ctx.setLineDash(dash||[]);ctx.beginPath();
  for(let i=0;i<=r.n;i+=2){const x=X(i*DT),y=clamp(Y(C.set+r.e[i]),T,Bt);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);
  if(r.tEnd!==null){const x=X(r.tEnd),y=Y(C.set+C.hi);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill();}};
 const items=[];
 if(G&&G.m){curve(G.m.gain,G.m.s,PAL['s3'],null,3);items.push(['Math',PAL['s3']]);}
 if(G&&G.g){curve(G.g.gain,G.g.s,PAL['s4'],[8,5],2.5);items.push(['Your gut',PAL['s4']]);}
 curve(sim.p.gain,sgn(sim),PAL['rj'],null,3);items.unshift(['Gain '+fmtNum(sim.p.gain,2),PAL['rj']]);
 /* legend, right-aligned above the chart */
 ctx.font='700 '+fs+'px '+FONT;let lx=R;for(let i=items.length-1;i>=0;i--){const w=ctx.measureText(items[i][0]).width;lx-=w;txt(ctx,items[i][0],lx,T-10,{s:fs,w:700,c:items[i][1]});ctx.fillStyle=items[i][1];ctx.fillRect(lx-18,T-16,14,4);lx-=30;}
 /* readout pill */
 pill(ctx,offText(sim,sim.p.gain).replace(/ in 3 weeks$/,''),(L+R)/2,Bt+(big?78:66),PAL['rj'],'#fff',12*Math.min(k,1.3));}

const SIM={
 id:'feedback',hash:'feedback',apUnit:3,order:1,tab:'Feedback loops: body and machine',kind:'Simulation',next:['feedbuilder','scroll'],
 card:'Tune how hard your body pushes back after a snack, then see why a feed that shows you more of what you watch is the opposite kind of loop.',
 title:'Feedback loops: how your body and your feed respond to a change',
 lede:{bio:'Your body keeps blood sugar and temperature near a set point with negative feedback: the response opposes the change. Some loops do the opposite. Positive feedback amplifies a change until something ends it, and your feed can run on the same kind of loop.',
  honors:'A feedback loop has a sensor, a control center and an effector. The sign of the loop decides whether it settles or runs away. The gain and the delay decide how it settles: too weak is slow, too strong overshoots.',
  ap:'Model the gap from the set point as de/dt = ∓g·e(t − τ). With a delay τ, the loop settles with no overshoot only when g·τ ≤ 1/e ≈ 0.37, and its swings grow once g·τ > π/2 ≈ 1.57.'},
 scale:'One loop at a time, drawn as a cycle on the left and as a graph over time on the right. Bands, gains and time steps are illustrative, not clinical values. Nothing you set here leaves your browser.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The loop',
 controls:[
  {id:'gain',label:'Response strength (gain)',type:'range',min:0.05,max:1.5,step:0.05,def:0.2,d:2,help:'How hard the loop pushes back. A gain of 0.5 pushes at a rate that would close half the gap in one time step (10 minutes for blood sugar) if nothing else changed.'},
  {id:'scen',label:'Which loop',type:'seg',def:'glucose',noGut:true,onChange:newLoop,options:[{v:'glucose',l:'Blood sugar'},{v:'temp',l:'Body temp'},{v:'lh',l:'LH surge'},{v:'birth',l:'Childbirth'},{v:'feed',l:'Your feed'}]},
  {id:'sign',label:'Kind of loop',type:'seg',def:'neg',noGut:true,onChange:clearGut,options:[{v:'neg',l:'Negative: opposes'},{v:'pos',l:'Positive: amplifies'}],help:'Each loop starts as the kind it really is. On your feed, switching to negative means adding a stopping rule: a daily limit.'},
  {id:'push',label:'Size of the push (1 = typical; below 0 pushes it down)',type:'range',min:-2,max:2,step:0.25,def:1,d:2,noGut:true,onChange:clearGut,help:'Typical pushes: a snack, +40 mg/dL; a hard run, +1.0 °C; one long night on the app, +20 minutes.'},
  {id:'lag',label:'Delay before the response lands',type:'seg',def:1,lvl:'honors',noGut:true,onChange:clearGut,options:[{v:0,l:'None'},{v:0.5,l:'Short'},{v:1,l:'Normal'},{v:2,l:'Long'}],help:'Hormones take time to be released, travel and act. Normal is one time step: 10 minutes for blood sugar, 5 for temperature, 1 day for the feed.'}
 ],
 actions:[{id:'best',label:'Find the fastest gain',lvl:'honors',run(sim){if(sc(sim).kind!=='end'&&sgn(sim)>0)BioLab.setValues(sim,{sign:'neg'});BioLab.setValues(sim,{gain:bestGain(sim).g});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'offMin',label:'Minutes off target',unit:'min',d:0,min:0,max:null,get:sim=>scoreMin(sim,score(sim))},
  {id:'offTxt',label:'Off target',text:true,get:sim=>offText(sim,sim.p.gain)},
  {id:'what',label:'What the loop does',text:true,get:sim=>behave(sim,sim.p.gain)},
  {id:'over',label:'Overshoot past the set point',unit:'% of the push',d:0,min:0,max:100,lvl:'honors',get:sim=>sgn(sim)<0?overshoot(sim,sim.p.gain):null},
  {id:'gtau',label:'Gain × delay (g·τ)',unit:'',d:2,min:0,max:3,lvl:'ap',get:sim=>sim.p.gain*lagOf(sim)},
  {id:'eq',label:'The equation',text:true,lvl:'ap',get:sim=>{const t=lagOf(sim),g=sim.p.gain,s=sgn(sim);if(t===0)return `de/dt = ${s<0?'−':'+'}${fmtNum(g,2)}·e(t). With no delay, the gap ${s<0?'shrinks':'grows'} by a factor of e^(${s<0?'−':''}${fmtNum(g,2)}) each step: ${s<0?'stronger is always faster':'it runs away'}.`;
   return `de/dt = ${s<0?'−':'+'}${fmtNum(g,2)}·e(t − ${fmtNum(t,1)}). g·τ = ${fmtNum(g*t,2)}. `+(s>0?'Positive: it grows for any gain.':(g*t<=1/Math.E?'At or below 1/e ≈ 0.37: no overshoot.':(g*t<Math.PI/2?'Between 1/e and π/2: it overshoots but the swings die out.':'Above π/2 ≈ 1.57: the swings grow.')));}}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);drawDiagram(sim,ctx,k);drawChart(sim,ctx,k);},
 narrate(sim){const C=sc(sim),s=sgn(sim),D=pushOf(sim),g=sim.p.gain,b=behave(sim,g);
  if(!D)return `Nothing has pushed the ${C.short.toLowerCase()} away from its set point, so the loop has nothing to do. <b>Set a push to see it respond.</b>`;
  if(C.kind==='end'&&s>0)return `${C.name}: each round of the loop makes the signal stronger, so the change grows. <b>That is positive feedback: it does not return to a set point.</b> It stops only when ${C.endL.toLowerCase()} ends the loop.`;
  if(C.kind!=='end'&&s>0)return sim.p.scen==='feed'?`More watching teaches the feed what holds you, so it shows more of it, so you watch more. <b>Positive feedback: one long night grows instead of fading.</b> Switch to negative to add a stopping rule.`
   :`What-if: if the response pushed the same way as the change, the ${C.short.toLowerCase()} would run away from the set point. <b>Your body uses negative feedback here, so this does not happen.</b>`;
  if(C.kind==='end')return `What-if: real ${sim.p.scen==='lh'?'LH surges':'contractions'} build by positive feedback. With the sign flipped, the loop just damps the change out.`;
  const os=overshoot(sim,g),best=bestGain(sim);
  if(Math.abs(g-best.g)<0.026)return `${b}. <b>This is the fastest gain for this push:</b> ${offText(sim,g)}.`;
  if(g<best.g&&os<1)return `The response is gentle, so the ${C.short.toLowerCase()} creeps back: ${offText(sim,g)}. <b>A stronger response would close the gap faster.</b>`;
  return `The response lands late, so by the time it acts the gap has already closed and it keeps pushing: <b>it overshoots ${Math.round(os)}% of the push</b> past the set point. ${offText(sim,g)}.`;},
 gut:{better:'lower',controls:['gain'],
  ask:{bio:'Drag <b>Response strength</b> here to how hard you think the loop should push back to get into the green target band fastest. Too gentle is slow, too hard can overshoot. Then lock it in.',
   honors:'Before you look at the delay: set <b>Response strength</b> to the gain you think returns the loop to its band fastest, then lock it in.'},
  lock(sim){const v=score(sim);return {v,gain:sim.p.gain,s:sgn(sim),label:`gain ${fmtNum(sim.p.gain,2)}: ${offText(sim,sim.p.gain)}`};},
  solve(sim){const C=sc(sim);if(C.kind!=='end'&&sgn(sim)>0)sim.p.sign='neg';const b=bestGain(sim);sim.p.gain=b.g;return {v:b.v,gain:b.g,s:sgn(sim),label:`gain ${fmtNum(b.g,2)}${sgn(sim)<0&&C.kind!=='end'&&sim.gutS&&sim.gutS.g&&sim.gutS.g.s>0?', with negative feedback':''}: ${offText(sim,b.g)}`};},
  how:{bio:'The math runs the loop for every gain from 0.05 to 1.50 and times how long each one stays outside the band. The winner is fastest. Because the response lands late, the winner is strong but not the strongest.',
   ap:'The tool integrates de/dt = −g·e(t − τ) in steps of 0.05 for each gain on the slider and keeps the one with the least time outside the band. Theory says g·τ = 1/e is the fastest with zero overshoot; with a band to land in, a little more gain is faster still.'},
  compare(sim,g,m){const C=sc(sim),gm=scoreMin(sim,g.v),mm=scoreMin(sim,m.v);
   if(C.kind==='end'&&g.s>0){if(Math.abs(g.v-m.v)<0.05)return `Positive loops do not return to a set point, so there is nothing to tune back. Your gain reaches ${C.endL.toLowerCase()} as fast as any. <b>No gain makes a positive loop settle.</b>`;
    return `This loop is positive, so it never returns to a set point. Your gain reaches ${C.endL.toLowerCase()} after ${fmtNum(g.v,1)} steps; the strongest gain gets there in ${fmtNum(m.v,1)}. <b>No gain makes a positive loop settle: it runs until something ends it.</b>`;}
   if(g.s>0&&C.kind!=='end'){const lost=C.kind==='over'?`<b>${Math.round(g.v-m.v)} extra minutes</b> on the app over 3 weeks (about ${fmtNum((g.v-m.v)/60,1)} hours)`:`<b>${Math.round(gm-mm)} more minutes</b> off target`;
    return `No gain can fix a positive loop: it always runs away. Switching to negative feedback${C.kind==='over'?' (a stopping rule)':''} with a gain of ${fmtNum(m.gain,2)} saves ${lost}.`;}
   const diff=g.v-m.v;
   if(C.kind==='over'){if(diff<1)return `Your gut was right on: a stopping rule of strength ${fmtNum(g.gain,2)} keeps you to about ${Math.round(g.v)} extra minutes over your limit in 3 weeks, as good as the math.`;
    return `Your stopping rule ${g.gain<m.gain?'was too gentle':'was so harsh it swung you under the limit and back over'}. It cost <b>${Math.round(g.v)} extra minutes</b> over 3 weeks; the math’s rule costs ${Math.round(m.v)}. That is <b>${Math.round(diff)} minutes (${fmtNum(diff/60,1)} hours)</b> of your time back.`;}
   if(gm==null){return `Your gain: ${fmtNum(g.v,1)} steps outside the band. The math: ${fmtNum(m.v,1)} steps.`;}
   if(gm-mm<2)return `Your gut was right on: within ${Math.round(Math.abs(gm-mm))} minutes of the fastest gain. You already sense that a late response should be strong, but not too strong.`;
   const why=g.gain<m.gain?`Your gain was too gentle, so the ${C.short.toLowerCase()} crept back slowly.`:`Your gain was too strong: because the response lands late, it overshot past the set point and swung back.`;
   return `${why} It spent <b>${Math.round(gm)} minutes</b> outside the target band. The math’s gain of ${fmtNum(m.gain,2)} gets it back in <b>${Math.round(mm)} minutes: ${Math.round(gm-mm)} fewer minutes off target</b>.`;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)],sc2=R(['glucose','glucose','temp','feed']);
   sim.p.scen=sc2;sim.p.sign=sc2==='feed'?'neg':'neg';sim.p.push=R([0.5,0.75,1,1.25,1.5,2,-0.75,-1]);if(sc2==='feed')sim.p.push=Math.abs(sim.p.push);sim.p.gain=0.2;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Blood sugar rises after a snack. The pancreas releases insulin, and cells take glucose out of the blood. What kind of loop is this?',choices:['Positive feedback: insulin makes the change bigger','Negative feedback: insulin opposes the change','Not a loop: insulin is released no matter what'],correct:1,explain:'The response (insulin) pushes blood sugar back down, the opposite way from the change. That is negative feedback. When blood sugar falls too low, glucagon pushes it back up: the same loop working the other way.'},
  {lvl:'bio',instant:true,q:'During childbirth, pressure on the cervix triggers oxytocin, which makes contractions stronger, which adds more pressure. What stops this loop?',choices:['The body runs out of oxytocin','Birth: once the baby is born, the pressure that drives the loop is gone','Insulin turns it off'],correct:1,explain:'This is positive feedback: each round amplifies the last. A positive loop does not settle on its own. It runs until an endpoint removes its trigger, here the birth.'},
  {lvl:'bio',instant:true,q:'Your feed shows more of whatever you watch. One night you watch 20 extra minutes of one topic. With no stopping rule, what does this loop do to that topic over the next weeks?',choices:['It fades back to normal on its own','It grows: more watching brings more of it, which brings more watching','It stays at exactly 20 extra minutes'],correct:1,explain:'More watching leads to more of that content, which leads to more watching. In this model, at gain 0.20 the 20 extra minutes grow until you hit the assumed 4-hour ceiling, in about 2 weeks. A daily limit adds a negative loop that pulls it back.'},
  {lvl:'honors',instant:true,q:'Blood sugar, normal delay. A gain of 0.70 gets back into the band in about 21 minutes. If you double the gain to 1.40, what happens?',choices:['It gets back in about half the time','It overshoots low and swings, spending far longer off target','Nothing changes'],correct:1,explain:'The insulin lands late, so a strong response keeps pushing after the gap has closed. At gain 1.40 blood sugar overshoots below the band and swings, spending about 134 minutes off target instead of 21.'},
  {lvl:'honors',instant:true,q:'Same snack, same gain of 0.70, but the response now takes twice as long to land (Long delay). What happens?',choices:['It gets back faster','It overshoots more and takes much longer to settle','The delay makes no difference'],correct:1,explain:'With a long delay, the response is still pushing long after the gap closed. At gain 0.70 the time off target grows from about 21 minutes to about 145 minutes. Delay is why the strongest response is not the fastest.'},
  {lvl:'ap',instant:true,q:'For de/dt = −g·e(t − τ) with τ = 1 step, what is the largest gain that returns to the set point with no overshoot at all?',choices:['g = 1/e ≈ 0.37','g = 0.5','g = 1','g = π/2 ≈ 1.57'],correct:0,explain:'Try e(t) = e^(λt): λ = −g·e^(−λτ). Real (non-swinging) solutions exist only when g·τ ≤ 1/e. Above that, the roots are complex and the loop overshoots.'},
  {lvl:'ap',instant:true,q:'With a Long delay (τ = 2 steps), above about what gain do the swings grow instead of dying out?',choices:['0.18','0.79','1.57','Never: negative feedback always settles'],correct:1,explain:'The loop stays stable only while g·τ < π/2. With τ = 2, that is g < π/4 ≈ 0.79. Negative feedback with too much gain and too much delay can be unstable.'}
 ],
 tour:[
  {title:'The loop',text:'On the left is one feedback loop, drawn as a cycle. A change (red box) is sensed, the body sends a signal, and the effect feeds back on the change. The blue minus sign means the response opposes the change.',focus:[0,0,380,450],pause:true,setup:sim=>BioLab.setValues(sim,{scen:'glucose',sign:'neg',push:1,lag:1,gain:0.2})},
  {title:'The graph',text:'On the right is blood sugar over three hours. A snack pushes it 40 mg/dL above its set point of 90. The green band is the target. The insulin signal takes 10 minutes to land.',focus:[392,0,408,450],pause:true},
  {title:'Too gentle',text:'At a gain of 0.20 the response is gentle. Blood sugar creeps back and spends about 65 minutes outside the band.',focus:[392,0,408,450],pause:true,setup:sim=>BioLab.setValues(sim,{gain:0.2})},
  {title:'Too strong',text:'At 1.40 the response is strong, but it lands late, so it keeps pushing after the gap has closed. Blood sugar overshoots below the band and swings: about 134 minutes off target.',focus:[392,0,408,450],pause:true,setup:sim=>BioLab.setValues(sim,{gain:1.4})},
  {title:'Fastest',text:'At 0.70 it overshoots only a little, stays inside the band, and is back in about 21 minutes. Strong, but not the strongest.',focus:[392,0,408,450],pause:true,setup:sim=>BioLab.setValues(sim,{gain:0.7})},
  {title:'Positive feedback',text:'Some loops amplify. Before ovulation, high estrogen makes the brain and pituitary release more LH, and the surge keeps building until ovulation ends it. It never returns to a set point on its own.',pause:true,setup:sim=>BioLab.setValues(sim,{scen:'lh',sign:'pos',push:1,gain:0.4})},
  {title:'Your feed',text:'A feed that shows you more of what you watch is a positive loop: one long night grows instead of fading. Switching to negative adds a stopping rule, a daily limit, and the loop settles like your body does.',pause:true,setup:sim=>BioLab.setValues(sim,{scen:'feed',sign:'pos',push:1,gain:0.2})},
  {lvl:'ap',title:'The math',text:'The graph solves de/dt = −g·e(t − τ). The loop settles without overshoot when g·τ ≤ 1/e ≈ 0.37 and swings with growing size when g·τ > π/2 ≈ 1.57.',pause:true,setup:sim=>BioLab.setValues(sim,{scen:'glucose',sign:'neg',push:1,lag:1,gain:0.35})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{scen:'glucose',sign:'neg',push:1,lag:1,gain:0.2});},
 lab:{bio:'<p><b>Question:</b> How does the response strength change how fast blood sugar returns to its band?</p><ol><li>Choose <b>Blood sugar</b> and a push of 1. Set the gain to 0.10 and record a trial.</li><li>Repeat for gains of 0.30, 0.50, 0.70, 1.00 and 1.40.</li><li>Graph <b>Minutes off target</b> against the gain.</li></ol><p>Write one sentence: why is the strongest response not the fastest?</p>',
  honors:'<p><b>Question:</b> How does the delay change the best gain?</p><ol><li>For each delay (None, Short, Normal, Long), press <b>Find the fastest gain</b> and record a trial.</li><li>Compare the best gain and the overshoot across delays.</li><li>Switch to <b>Your feed</b> with positive feedback, then negative. Record the extra minutes for each.</li></ol>',
  ap:'<p><b>Question:</b> Where are the boundaries between smooth, swinging and unstable?</p><ol><li>With a Long delay, find the gain where the loop first overshoots and the gain where the swings start to grow.</li><li>Compare with g·τ = 1/e and g·τ = π/2.</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning from λ = −g·e^(−λτ).</p>'},
 terms:[
  {t:'Set point',d:'The value a negative feedback loop works to hold, like a body temperature of about 37 °C.'},
  {t:'Negative feedback',d:'A loop in which the response opposes the change, so the value returns toward its set point.'},
  {t:'Positive feedback',d:'A loop in which the response amplifies the change, so it grows until an endpoint ends the loop.'},
  {t:'Insulin and glucagon',d:'Hormones from the pancreas. Insulin lowers blood sugar; glucagon raises it.'},
  {t:'Gain',d:'How strongly a loop responds to a gap. Higher gain means a harder push back.'},
  {t:'Overshoot',d:'When a loop pushes past its set point to the other side before settling.',lvl:'honors'},
  {t:'Sensor, control center, effector',d:'The parts of a loop: what detects the change, what decides the response, and what carries it out.',lvl:'honors'},
  {t:'Delay (τ)',d:'The time between sensing a change and the response taking effect.',lvl:'honors'},
  {t:'Delay differential equation',d:'An equation where the rate of change depends on an earlier value: de/dt = −g·e(t − τ).',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The gap from the set point, e, follows de/dt = s·g·e(t − τ), where s = −1 for negative feedback and +1 for positive, g is the gain and τ the delay. Before the push, the value sat at its set point. The tool steps time in increments of 0.05 and counts the time outside the band. One time step is 10 minutes for blood sugar, 5 minutes for temperature and 1 day for the feed; the hormone loops use illustrative steps. Positive loops stop at a ceiling (the endpoint, or for the feed an assumed 4 hours a day of free time).</p><p><b>What is simplified.</b> Real blood sugar control uses insulin and glucagon together, involves many organs and is not linear. The set points (90 mg/dL, 37 °C), the target bands (±10 mg/dL, ±0.3 °C), the pushes and the delays are round numbers for illustration, not clinical targets. The LH and childbirth loops show the direction of feedback only, in illustrative units. The feed model is an assumption for illustration, not any real app’s algorithm. This is a simplified model, not medical advice.</p><p><b>Science.</b> Negative feedback in blood sugar (insulin and glucagon from the pancreas) and body temperature (the hypothalamus, sweating, shivering and blood vessel changes), and positive feedback in the LH surge before ovulation and in oxytocin during childbirth, are standard textbook examples. The stability limits g·τ ≤ 1/e (no overshoot) and g·τ < π/2 (stable) are standard results for this equation. The link to algorithms comes from Cathy O’Neil’s <i>Weapons of Math Destruction</i>, which argues that harmful algorithms often run on feedback loops.</p>'
};
BioLab.register(SIM);
})();

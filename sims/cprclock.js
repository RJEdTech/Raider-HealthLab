(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* A teaching model of out-of-hospital cardiac arrest.
   s0 = people out of 100 who would go home with a shock the instant they collapsed (an assumption for illustration).
   With no CPR the chance falls r per minute; during CPR it falls rc per minute (an assumption); the first shock
   (bystander AED or paramedics on arrival) ends the countdown, and the chance at that moment is the chance of going home.
   Exponential: lose r of what is left each minute. Linear: lose r of the starting chance each minute. */
const R=sim=>(atLeast('honors')?sim.p.rate:10)/100;
const RC=sim=>(atLeast('ap')?sim.p.rcpr:3)/100;
const S0=sim=>atLeast('ap')?sim.p.s0:50;
const LIN=sim=>atLeast('ap')&&sim.p.model==='lin';
/* chance (out of 100) at minute t, for CPR starting at tc and the first shock at td */
function at(sim,t,tc,td){const r=R(sim),rc=RC(sim),s0=S0(sim),u=Math.min(t,td),a=Math.min(u,tc),b=Math.max(0,u-tc);
 return LIN(sim)?s0*Math.max(0,1-r*a-rc*b):s0*Math.pow(1-r,a)*Math.pow(1-rc,b);}
const tC=sim=>sim.p.cpr?sim.p.tcpr:Infinity;
const tD=sim=>Math.min(sim.p.aed?sim.p.taed:Infinity,sim.p.ems);
const home=sim=>at(sim,tD(sim),tC(sim),tD(sim));
const none=sim=>at(sim,sim.p.ems,Infinity,sim.p.ems);
const cprOnly=sim=>at(sim,sim.p.ems,sim.p.tcpr,sim.p.ems);
const both=sim=>{const td=Math.min(sim.p.taed,sim.p.ems);return at(sim,td,sim.p.tcpr,td);};
const cprUsed=sim=>sim.p.cpr&&sim.p.tcpr<tD(sim);
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
/* The curve and the count stay hidden while the student works it out ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const k3=v=>(+v.toFixed(3)).toString(),f2=v=>(Math.round(v*100)/100).toString(),mins=v=>f1(v)+(Math.abs(v-1)<1e-9?' minute':' minutes');
const seg=sim=>{const td=tD(sim),tc=tC(sim);return {td,a:Math.min(td,tc),b:Math.max(0,td-tc),r:R(sim),rc:RC(sim),s0:S0(sim)};};
function fLine(sim){const q=seg(sim),h=home(sim);
 if(LIN(sim))return `${q.s0} × (1 − ${k3(q.r)} × ${f1(q.a)}${q.b>0?' − '+k3(q.rc)+' × '+f1(q.b):''}) = ${f1(h)} of 100`;
 return `${q.s0} × ${k3(1-q.r)}^${f1(q.a)}${q.b>0?' × '+k3(1-q.rc)+'^'+f1(q.b):''} = ${f1(h)} of 100`;}
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toString();
const n0=v=>Math.round(v);
const pl=(n,w)=>n+' '+(n===1?w:w.replace('person','people'));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function scen(sim,big){const c=cprUsed(sim),a=sim.p.aed&&sim.p.taed<sim.p.ems;
 const cs=sim.p.cpr&&!c?(big?'CPR too late':'CPR would start after the shock'):c?(big?'CPR at ':'CPR starts at ')+f1(sim.p.tcpr)+' min':(big?'No CPR':'No one does CPR');
 const as=a?(big?'AED at ':'AED shocks at ')+f1(sim.p.taed)+' min':sim.p.aed?(big?'AED too late':'AED arrives after the ambulance'):(big?'No AED':'no AED nearby');
 return cs+' · '+as+' · '+(big?'Ambulance ':'ambulance at ')+f1(sim.p.ems)+' min';}
function halo(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;ctx.textAlign=o.a||'left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.strokeStyle=PAL['cv-bg'];ctx.lineWidth=4;ctx.strokeText(s,x,y);txt(ctx,s,x,y,o);}
function fig(ctx,x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*0.27,s*0.17,0,7);ctx.fill();rr(ctx,x-s*0.27,y-s*0.06,s*0.54,s*0.44,s*0.18);ctx.fill();}

const SIM={
 id:'cprclock',hash:'cprclock',apUnit:5,order:1,tab:'The cardiac arrest clock',kind:'Simulation',
 skills:{bio:'Exponential decay: keep 90% of what is left each minute · Algebra 2 (Unit 5), Health',honors:'Exponential decay with a rate range, and a two-piece model · Algebra 2 (Unit 5), Health',ap:'Piecewise exponential vs. linear models · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), Health'},
 card:'Someone collapses at a game. Guess how many people like them go home, then see what CPR and an AED in the first minutes change.',
 title:'The cardiac arrest clock: what you do in the first minutes',
 lede:{bio:'When a heart suddenly stops pumping, a clock starts. Every minute without help, the chance of surviving drops. A bystander who starts CPR slows that drop, and an AED shock can stop it. The ambulance is usually still minutes away.',
  honors:'In cardiac arrest the heart’s electrical rhythm often turns into a quiver (ventricular fibrillation), so it stops pumping. CPR pushes oxygen-rich blood to the brain and heart by hand. An AED reads the rhythm and, if it finds a shockable one, gives a shock that can let the heart restart its normal beat.',
  ap:'Model the chance as S(t) = S₀(1 − r)ᵗ with no CPR and a slower rate during CPR, piecewise, until the first shock at time T. The commonly cited rule of thumb is r = 7% to 10% per minute. Read “falls 10% a minute” as linear instead, S₀(1 − rt), and the answer changes a lot.'},
 scale:'One person, from collapse (minute 0) until the first shock. The 100 figures are 100 people in the same situation. Every number is a simplified teaching model, not medical training.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The scenario',
 controls:[
  {id:'guess',label:'Your gut: out of 100 people like this, how many go home?',type:'range',min:0,max:100,step:1,def:50,unit:' people'},
  {id:'cpr',label:'A bystander starts CPR',type:'toggle',def:false,noGut:true,onChange:clearGut,help:'In 2025, bystanders gave CPR in 42.5% of the cardiac arrests in the national CARES registry.'},
  {id:'tcpr',label:'Minutes until CPR starts',type:'range',min:0.5,max:10,step:0.5,def:1,unit:' min',noGut:true,onChange:clearGut},
  {id:'aed',label:'Someone brings an AED',type:'toggle',def:false,noGut:true,onChange:clearGut,help:'An AED (automated external defibrillator) talks you through every step. In 2025, a bystander used one in only 13.9% of cardiac arrests in public places (CARES).'},
  {id:'taed',label:'Minutes until the AED shocks',type:'range',min:1,max:12,step:0.5,def:3,unit:' min',noGut:true,onChange:clearGut},
  {id:'ems',label:'Minutes until the ambulance arrives',type:'range',min:3,max:20,step:0.1,def:7.6,unit:' min',noGut:true,onChange:clearGut,help:'7.6 minutes was the national median EMS response time in the 2025 CARES registry. This model assumes paramedics shock as soon as they arrive.'},
  {id:'rate',label:'Chance lost per minute with no CPR',type:'range',min:7,max:10,step:0.5,def:10,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'The CARES report gives 7% to 10% per minute as a rule of thumb. 10% is the high end.'},
  {id:'rcpr',label:'Chance lost per minute during CPR (assumption)',type:'range',min:1,max:6,step:0.5,def:3,unit:'%',lvl:'ap',noGut:true,onChange:clearGut,help:'The research notes behind this tool give no measured rate for this. 3% a minute is an assumption for illustration.'},
  {id:'s0',label:'Go home with a shock at once (assumption)',type:'range',min:20,max:70,step:5,def:50,unit:' of 100',lvl:'ap',noGut:true,onChange:clearGut,help:'A round number for illustration, not a measured value.'},
  {id:'model',label:'How the chance falls',type:'seg',def:'exp',lvl:'ap',noGut:true,onChange:clearGut,options:[{v:'exp',l:'Share of what is left (exponential)'},{v:'lin',l:'Same amount each minute (linear)'}]},
  {id:'reveal',label:'Show the results now',type:'toggle',def:false,noGut:true,help:'Normally the results appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'home',label:'Go home in this scenario',unit:'of 100',d:0,min:0,max:100,get:sim=>hid(sim,home(sim))},
  {id:'none',label:'Go home if no one helps',unit:'of 100',d:0,min:0,max:100,get:sim=>hid(sim,none(sim))},
  {id:'extra',label:'Extra people who go home because someone helped',unit:'of 100',d:0,min:0,max:100,get:sim=>hid(sim,home(sim)-none(sim))},
  {id:'shock',label:'First shock',unit:'min',d:1,min:0,max:20,get:tD},
  {id:'cpronly',label:'With CPR only (no AED)',unit:'of 100',d:0,lvl:'honors',min:0,max:100,get:sim=>hid(sim,cprOnly(sim))},
  {id:'both',label:'With CPR and an AED',unit:'of 100',d:0,lvl:'honors',min:0,max:100,get:sim=>hid(sim,both(sim))},
  {id:'kept',label:'Share of the starting chance kept',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>hid(sim,100*home(sim)/S0(sim))},
  {id:'math',label:'The model, with your numbers',text:true,lvl:'ap',get:sim=>{if(!shown(sim))return 'Lock in your gut answer to see the math.';const r=R(sim),rc=RC(sim),s0=S0(sim),td=tD(sim),tc=tC(sim),a=Math.min(td,tc),b=Math.max(0,td-tc),h=home(sim);
   return LIN(sim)?`S = ${s0} × (1 − ${r.toFixed(3)} × ${f1(a)} − ${rc.toFixed(3)} × ${f1(b)}) = ${f1(h)} out of 100`:`S = ${s0} × ${(1-r).toFixed(3)}^${f1(a)} × ${(1-rc).toFixed(3)}^${f1(b)} = ${f1(h)} out of 100`;}}
 ],
 draw(sim,ctx,vdt,k){const big=k>1.3,sh=shown(sim),G=GS(sim),s0=S0(sim),td=tD(sim),tc=tC(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(540,0,260,450);
  /* header: the scenario and the starting assumption */
  txt(ctx,scen(sim,big),16,24*k,{s:13*k,w:700});
  txt(ctx,big?`Start: ${s0} of 100 (shock at once)`:`Start: ${s0} of 100 would go home with a shock at once (an assumption)`,16,44*k,{s:12*k,c:PAL['cv-soft']});
  /* graph */
  const L=50+14*k,Rr=520,T=40+30*k,B=446-36*k,xmax=Math.max(10,Math.ceil(sim.p.ems+2)),ymax=Math.min(100,Math.ceil((s0+30)/10)*10);
  const X=t=>L+t/xmax*(Rr-L),Y=v=>B-v/ymax*(B-T);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const ys=big?20:10,xs=xmax>14||big?4:2;
  for(let v=0;v<=ymax;v+=ys){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(Rr,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  for(let t=0;t<=xmax;t+=xs)txt(ctx,String(t),X(t),B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,T-6);ctx.lineTo(L,B);ctx.lineTo(Rr,B);ctx.stroke();
  txt(ctx,'Minutes after the collapse',(L+Rr)/2,B+33*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.save();ctx.translate(16,(T+B)/2);ctx.rotate(-Math.PI/2);txt(ctx,big?'Go home, of 100':'Go home, out of 100',0,0,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});ctx.restore();
  /* events: one row each, so labels never collide */
  const ev=[];if(sim.p.cpr&&tc<td)ev.push([tc,big?'CPR':'CPR starts',PAL['s3']]);if(sim.p.aed&&sim.p.taed<sim.p.ems)ev.push([sim.p.taed,big?'AED shock':'AED shock',PAL['s2']]);ev.push([sim.p.ems,big?'Ambulance':'Ambulance arrives',PAL['cv-soft']]);
  ctx.font='700 '+(12*k)+'px '+FONT;
  ev.forEach((e,i)=>{const x=X(e[0]),y=T+(14+16*i)*k;ctx.strokeStyle=e[2];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x,B);ctx.stroke();ctx.setLineDash([]);
   const s=e[1]+' '+f1(e[0])+' min',w=ctx.measureText(s).width,right=x+4+w>Rr;txt(ctx,s,right?x-4:x+4,y,{s:12*k,w:700,c:e[2],a:right?'right':'left'});});
  /* start dot */
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(0),Y(s0),5,0,7);ctx.fill();
  if(sh){/* no one helps, dashed */
   const nh=!(cprUsed(sim)||(sim.p.aed&&sim.p.taed<sim.p.ems));
   const curve=(tcx,tdx,col,dash,w)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash);ctx.beginPath();for(let t=0;t<=xmax+1e-9;t+=0.05){const v=at(sim,t,tcx,tdx),px=X(t),py=Y(v);t<0.01?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
   const vn=none(sim),vh=home(sim);
   if(!nh){curve(Infinity,sim.p.ems,PAL['cv-soft'],[7,5],2);halo(ctx,(big?'No help: ':'No one helps: ')+n0(vn),Rr-4,Math.min(B-5,Y(vn)+16*k),{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});}
   curve(tc,td,PAL['rj'],[],3);
   ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(td),Y(vh),6,0,7);ctx.fill();
   const pt=n0(vh)+' go home',ps=13*Math.min(k,1.4);ctx.font='700 '+ps+'px '+FONT;const pw=ctx.measureText(pt).width+16,onR=X(td)+10+pw<=Rr-2,px=onR?X(td)+10+pw/2:Math.max(L+pw/2+2,X(td)-10-pw/2),py=Math.min(Y(vh),G?Y(G.guess)-4:Infinity)-20*k;
   pill(ctx,pt,px,py,PAL['rj'],'#fff',ps);
   if(G){const gy=Y(G.guess),gx=X(td);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(gx,gy,7,0,7);ctx.stroke();
    const gl=(big?'Gut: ':'Your gut: ')+G.guess;ctx.font='700 '+(12*k)+'px '+FONT;const gw=ctx.measureText(gl).width;
    if(Math.abs(G.guess-vh)>=1){const left=gx-12-gw>L+4,right=gx+12+gw<Rr-2;halo(ctx,gl,left?gx-12:right?gx+12:gx,left||right?gy+4*k:gy+24*k,{s:12*k,w:700,c:PAL['s4'],a:left?'right':right?'left':'center'});}}}
  else txt(ctx,big?'Lock in your gut to see the curve.':'Lock in your gut answer to see how the chance falls.',L+12,B-14*k,{s:12*k,c:PAL['cv-soft']});
  /* 100 people */
  const gx0=560,gy0=40+20*k,cs=22;txt(ctx,big?'100 people':'100 people like this',670,24*k,{s:13*k,w:700,a:'center'});
  const vn=n0(none(sim)),vh=n0(home(sim));
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=gx0+c*cs+cs/2,y=gy0+r*cs+cs/2+2;
   const col=!sh?PAL['cv-soft']:i<vn?PAL['s2']:i<vh?PAL['s3']:PAL['cv-soft'];ctx.globalAlpha=!sh||i>=vh?.4:1;fig(ctx,x,y,cs,col);ctx.globalAlpha=1;}
  const ly=gy0+10*cs+22*k,sw=(y,col,s)=>{fig(ctx,gx0+8,y-4*k,16*k,col);txt(ctx,s,gx0+22*k,y,{s:12*k,w:700});};
  if(sh){sw(ly,PAL['s2'],(big?'Home anyway: ':'Home even with no help: ')+vn);sw(ly+20*k,PAL['s3'],(big?'Saved by help: ':'Home because of help: ')+(vh-vn));ctx.globalAlpha=.4;fig(ctx,gx0+8,ly+36*k,16*k,PAL['cv-soft']);ctx.globalAlpha=1;sw(ly+40*k,'rgba(0,0,0,0)',(big?'Do not survive: ':'Do not survive: ')+(100-vh));}
  if(sh&&!big&&sim.gutS&&sim.gutS.m&&!(sim.tour&&sim.tour.on)){txt(ctx,'The math:',gx0,ly+68*k,{s:12*k,w:700,c:PAL['rj']});txt(ctx,fLine(sim).replace(' of 100',''),gx0,ly+86*k,{s:12*k,w:700,c:PAL['rj']});}
  if(!sh){txt(ctx,big?'How many go home?':'How many of these go home?',670,ly,{s:12*k,w:700,a:'center'});txt(ctx,big?'Lock in your gut.':'Lock in your gut answer to see.',670,ly+20*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}},
 narrate(sim){const td=tD(sim),h=home(sim),n=none(sim),r=Math.round(R(sim)*100),lin=LIN(sim);
  const loss=lin?`${r}% of the starting chance`:`${r}% of what is left`;
  if(!shown(sim))return `The ambulance is ${f1(sim.p.ems)} minutes away. Until someone shocks the heart, each minute with no CPR takes away about ${loss}. <b>Out of 100 people like this, how many go home?</b>`;
  if(!cprUsed(sim)&&!(sim.p.aed&&sim.p.taed<sim.p.ems))return `No one starts CPR, so for ${f1(td)} minutes the chance falls fast, about ${loss} every minute. <b>When paramedics shock, about ${n0(h)} of 100 go home.</b> Starting CPR at minute 1 would bring that to about ${n0(at(sim,td,1,td))}.`;
  const why=cprUsed(sim)?`CPR from minute ${f1(sim.p.tcpr)} slows the drop`:'No one does CPR, but';
  return `${why}${sim.p.aed&&sim.p.taed<sim.p.ems?`, and the AED shock at minute ${f1(sim.p.taed)} stops the clock before the ambulance arrives`:`, until paramedics shock at minute ${f1(td)}`}. <b>About ${n0(h)} of 100 go home instead of ${n0(n)}: ${pl(n0(h)-n0(n),'more person')} because someone nearby acted.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Read the scenario at the top of the picture. If 50 out of 100 people like this would go home with a shock the instant they fell, how many still go home in this scenario? Drag the slider here by feel, then lock it in.',
   honors:'Before the curve appears: out of 100 people in the scenario shown, how many go home? Set the slider by feel, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-home(sim)),guess:sim.p.guess,label:`${sim.p.guess} of 100 go home`};},
  solve(sim){const h=home(sim);sim.p.guess=Math.round(h);return {v:Math.abs(sim.p.guess-h),guess:sim.p.guess,label:`about ${n0(h)} of 100 go home`};},
  hint:{bio:'Lock in your gut answer. Then you will work out the number yourself, minute by minute.'},
  calc:{unit:'of 100',d:1,tol:1,
   prompt:{bio:sim=>{const q=seg(sim);let t=`Start at <b>${q.s0} of 100</b>. Each minute with no CPR keeps <b>${k3(1-q.r)}</b> (${Math.round((1-q.r)*1000)/10}%) of what is left.`;
     if(q.b>0)t+=` CPR starts at minute ${f1(q.a)}, and each minute of CPR keeps <b>${k3(1-q.rc)}</b>.`;
     t+=` The first shock (${sim.p.aed&&sim.p.taed<sim.p.ems?'the AED':'the ambulance'}) comes at minute <b>${f1(q.td)}</b> and stops the clock. How many of 100 go home?`;return t;},
    ap:sim=>{const q=seg(sim);return LIN(sim)?`Linear model: S = S₀(1 − r·a − c·b) with S₀ = ${q.s0}, r = ${k3(q.r)}, c = ${k3(q.rc)}, a = ${f1(q.a)} minutes with no CPR and b = ${f1(q.b)} minutes of CPR before the shock. Find S.`
     :`Exponential model: S = S₀(1 − r)^a(1 − c)^b with S₀ = ${q.s0}, r = ${k3(q.r)}, c = ${k3(q.rc)}, a = ${f1(q.a)} minutes with no CPR and b = ${f1(q.b)} minutes of CPR before the shock. Find S.`;}},
   answer:home,
   hint:'Raise the share kept per minute to the number of minutes (the ^ key on a calculator), then multiply by the starting number.',
   steps(sim){const q=seg(sim),h=home(sim),out=[];
    if(LIN(sim)){out.push(`Linear: lose ${k3(q.r)} of the starting chance for each of ${f1(q.a)} minutes with no CPR${q.b>0?`, and ${k3(q.rc)} for each of ${f1(q.b)} minutes of CPR`:''}.`);out.push(`${q.s0} × (1 − ${k3(q.r*q.a)}${q.b>0?' − '+k3(q.rc*q.b):''}) = <b>${f2(h)}</b> of 100.`);return out;}
    const A=Math.pow(1-q.r,q.a);out.push(`${mins(q.a)} with no CPR: ${k3(1-q.r)}^${f1(q.a)} = ${A.toFixed(3)}, so ${q.s0} × ${A.toFixed(3)} = ${f1(q.s0*A)}.`);
    if(q.b>0){const B=Math.pow(1-q.rc,q.b);out.push(`${mins(q.b)} of CPR: ${k3(1-q.rc)}^${f1(q.b)} = ${B.toFixed(3)}, so ${f1(q.s0*A)} × ${B.toFixed(3)} = ${f1(h)}.`);}
    out.push(`The shock at minute ${f1(q.td)} stops the clock: about <b>${f2(h)}</b> of 100 go home.`);return out;}},
  formula:fLine,
  how:{bio:'Start at 50 of 100. Each minute with no CPR, take away 10% of what is left: 50, then 45, then 40.5, and so on. During CPR, take away a smaller share each minute. Stop at the first shock: what is left then is how many go home.',
   ap:'S = S₀ × (1 − r)^a × (1 − c)^b, where r is the loss per minute with no CPR, c is the loss per minute during CPR, a is minutes with no CPR and b is minutes of CPR before the first shock at T = the earlier of the AED time and the ambulance time. The linear reading is S = S₀(1 − ra − cb).'},
  compare(sim,g,m){const h=home(sim),n=none(sim),gap=Math.abs(g.guess-h),helped=n0(h)-n0(n);
   const tail=helped>0?` In this scenario, what bystanders did means <b>${pl(helped,'more person')} out of every 100 go home</b> (${n0(n)} → ${n0(h)}).`:` Here no one acted before the ambulance. Starting CPR at minute 1 and an AED shock at minute 3 would bring it from ${n0(n)} to about ${n0(at(sim,Math.min(3,sim.p.ems),1,Math.min(3,sim.p.ems)))} out of 100.`;
   if(gap<2.5)return `Your gut was right on: about ${n0(h)} of 100 go home.`+tail;
   return `Your gut was off by <b>${pl(Math.round(gap),'person')} out of 100</b>. ${g.guess>h?'You guessed high: the chance shrinks in every one of those minutes.':'You guessed low: the chance falls fast, but in this scenario help comes in time to keep more of it.'}`+tail;},
  again(sim){const R2=a=>a[Math.floor(Math.random()*a.length)];sim.p.cpr=Math.random()<0.6;sim.p.tcpr=R2([0.5,1,1.5,2,3,4,5]);sim.p.aed=Math.random()<0.5;sim.p.taed=R2([2,3,4,5,6]);sim.p.ems=R2([5,6,7.6,9,10,12]);sim.p.guess=50;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In this model, 50 of 100 would go home with an instant shock, and each minute with no CPR keeps 90% of what is left. No one does CPR, and the ambulance arrives and shocks at 5 minutes. How many of 100 go home?',answer:29.5,tol:1,unit:'of 100',d:1,hint:'Multiply 50 by 0.9 five times, or use 0.9^5.',explain:'0.9^5 ≈ 0.590, and 50 × 0.590 ≈ 29.5, so about 30 of 100. At 7.6 minutes it would be about 22.'},
  {lvl:'bio',instant:true,q:'A bystander starts CPR at 1 minute and someone shocks with an AED at 3 minutes. How many of 100 go home now, compared with 22 when no one helps?',choices:['About 25','About 42, nearly twice as many','All 50'],correct:1,explain:'One minute with no CPR (50 × 0.9 = 45), then 2 minutes of CPR at 3% a minute (45 × 0.97² ≈ 42.3). The shock at 3 minutes stops the clock, so about 20 more people out of 100 go home.'},
  {lvl:'bio',instant:true,q:'You are not sure the person needs a shock. Can an AED shock someone whose heart does not need it?',choices:['Yes, so only a doctor should use one','No: an AED checks the heart rhythm first and only advises a shock if it finds one that needs it','It does not matter what the rhythm is'],correct:1,explain:'An AED reads the heart’s rhythm through its pads and talks you through each step. It only advises a shock for a shockable rhythm. That is why AEDs are built for untrained bystanders.'},
  {lvl:'honors',instant:true,q:'Ambulance at 7.6 minutes. Option A: CPR starts at 1 minute, no AED. Option B: no CPR, but an AED shocks at 3 minutes. Which sends more people home?',choices:['A, by a lot','B, by a lot','About the same (37 vs. 36), and doing both gives 42'],correct:2,explain:'A: 50 × 0.9 × 0.97^6.6 ≈ 36.8. B: 50 × 0.9³ ≈ 36.5. CPR buys time and the early shock stops the clock. Together: about 42.3.'},
  {lvl:'honors',instant:true,q:'The CARES report gives 7% to 10% a minute as a rule of thumb. With no help and the ambulance at 7.6 minutes, what share of the starting chance is left?',choices:['24% to 47%','About 45% to 58%','90% to 93%'],correct:1,explain:'0.90^7.6 ≈ 0.449 and 0.93^7.6 ≈ 0.576. A range of only 3 points per minute adds up to a big range after 7.6 minutes, which is why it helps to model both ends.'},
  {lvl:'ap',instant:true,q:'“Survival falls 10% a minute.” Read as linear, S = S₀(1 − 0.1t). Read as exponential, S = S₀(0.9)ᵗ. At 7.6 minutes with no help, what share of S₀ does each keep?',choices:['Both keep 24%','Linear 24%, exponential 44.9%','Linear 44.9%, exponential 24%'],correct:1,explain:'Linear: 1 − 0.76 = 0.24. Exponential: 0.9^7.6 ≈ 0.449. The linear reading reaches zero at 10 minutes; the exponential one never quite does. The same words give two different models.'},
  {lvl:'ap',instant:true,q:'In the exponential model, you change S₀ from 50 to 30. What happens to the ratio of people who go home with CPR at 1 minute and an AED at 3 minutes, compared with no help?',choices:['The ratio stays 1.89','The ratio gets bigger','The ratio gets smaller'],correct:0,explain:'Ratio = 0.9 × 0.97² ÷ 0.9^7.6 = 0.97² ÷ 0.9^6.6 ≈ 1.89. S₀ cancels, so the uncertain starting number does not change how many times better the bystander scenario is.'}
 ],
 tour:[
  {title:'The clock starts',text:'At minute 0 someone collapses. Their heart has stopped pumping. In this teaching model, if a shock came the instant they fell, 50 of 100 people like this would go home. That starting number is an assumption, so watch how it changes, not the exact value.',pause:true,setup:sim=>BioLab.setValues(sim,{cpr:false,aed:false,ems:7.6,tcpr:1,taed:3,rate:10,rcpr:3,s0:50,model:'exp'})},
  {title:'Waiting costs a share each minute',text:'With no CPR, each minute takes away 10% of the chance that is left: 50, 45, 40.5, and so on. When the ambulance arrives at 7.6 minutes and paramedics shock, about 22 of 100 go home.',pause:true,focus:sim=>[0,0,540,450]},
  {title:'Someone starts CPR',text:'Now a bystander starts CPR at minute 1. Pushing on the chest keeps some oxygen-rich blood moving, so the chance falls much more slowly (3% a minute here, an assumption). About 37 of 100 go home.',pause:true,setup:sim=>BioLab.setValues(sim,{cpr:true,tcpr:1})},
  {title:'An AED stops the clock',text:'Someone grabs the AED from the hallway and shocks at minute 3. The countdown stops there instead of at 7.6 minutes. About 42 of 100 go home: nearly twice the 22 with no help.',pause:true,setup:sim=>BioLab.setValues(sim,{aed:true,taed:3})},
  {title:'Count the people',text:'Blue figures go home even with no help. Green figures go home only because people nearby acted: about 20 out of every 100.',pause:true,focus:[540,0,260,450]},
  {lvl:'honors',title:'The rule of thumb is a range',text:'The CARES report says 7% to 10% a minute. At 7%, no help leaves about 29 of 100 and CPR plus the AED leaves about 44. The bystander still adds about 15 people out of 100.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:7})},
  {lvl:'ap',title:'Linear or exponential?',text:'Read “10% a minute” as the same amount each minute and no help leaves only 12 of 100 at 7.6 minutes, with zero at 10 minutes. The exponential reading leaves about 22. Same words, different models: always ask which one a statistic means.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:10,model:'lin',aed:false,cpr:false})},
  {title:'The two links bystanders control',text:'Nationally, bystanders gave CPR in 42.5% of cases in 2025, and used an AED in only 13.9% of public ones. Those are the two links in the chain of survival that depend on the people nearby. Certified CPR and AED courses are offered by the American Heart Association and the American Red Cross.',pause:true,setup:sim=>BioLab.setValues(sim,{model:'exp',rate:10,cpr:true,aed:true,tcpr:1,taed:3})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the first minute of CPR matter?</p><ol><li>Turn on <b>A bystander starts CPR</b>. Keep the AED off and the ambulance at 7.6 minutes.</li><li>Record a trial with CPR starting at 1, 2, 4 and 6 minutes.</li><li>Turn the AED on at 3 minutes and record one more.</li></ol><p>Write one sentence: what is the most useful thing a bystander can do, and how soon?</p>',
  honors:'<p><b>Question:</b> When the ambulance is far away, which matters more: CPR or an AED?</p><ol><li>Set the ambulance to 12 minutes. Record <b>Go home if no one helps</b>, <b>With CPR only</b> and <b>With CPR and an AED</b>.</li><li>Repeat at 7.6 and 5 minutes.</li><li>Repeat at 7% a minute.</li></ol><p>Explain, using what CPR does and what a shock does, why the AED column barely changes with the ambulance time.</p>',
  ap:'<p><b>Question:</b> How much does the choice of model change the answer?</p><ol><li>With no help, record S at ambulance times of 4, 6, 8 and 10 minutes for both the exponential and the linear model.</li><li>Find the half-life of the exponential model at 10% a minute: solve 0.9ᵗ = 0.5.</li><li>Change S₀ and check whether the ratio of CPR-plus-AED to no help changes.</li></ol><p><b>CER:</b> Claim which model is more reasonable for “falls 7% to 10% per minute,” with evidence from your table and reasoning about what each model predicts at long times.</p>'},
 terms:[
  {t:'Cardiac arrest',d:'The heart suddenly stops pumping blood. It is not the same as a heart attack, where blood flow to part of the heart muscle is blocked.'},
  {t:'CPR',d:'Cardiopulmonary resuscitation: pushing hard and fast on the center of the chest to move blood by hand until the heart can be restarted.'},
  {t:'AED',d:'Automated external defibrillator: a portable device that reads the heart’s rhythm and gives a shock only if the rhythm needs one. It talks you through each step.'},
  {t:'Chain of survival',d:'The linked steps that save a life in cardiac arrest, including calling 911, early CPR and early defibrillation.'},
  {t:'Ventricular fibrillation',d:'A chaotic electrical rhythm in which the lower chambers of the heart quiver instead of pumping. It is the main rhythm an AED shock is meant to stop.',lvl:'honors'},
  {t:'Commotio cordis',d:'Cardiac arrest caused by a blow to the chest at a vulnerable moment in the heartbeat.',lvl:'honors'},
  {t:'Exponential decay',d:'Losing the same share of what is left in each time step: S = S₀(1 − r)ᵗ.',lvl:'ap'},
  {t:'Piecewise model',d:'A model that uses different rules on different time intervals, here one rate before CPR, another during CPR, and none after the shock.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified teaching model, not medical training.</b> It shows why minutes matter. It cannot teach you how to do CPR or use an AED. Certified CPR and AED courses are offered by the American Heart Association and the American Red Cross.</p><p><b>The model.</b> The chance of going home starts at S₀ = 50 out of 100 (an assumption for illustration, adjustable at Deep dive). With no CPR it falls by r per minute; during CPR it falls by c = 3% per minute (an assumption for illustration; the notes behind this tool give no measured rate). The first shock, from a bystander’s AED or from paramedics as soon as they arrive (an assumption), ends the countdown. Exponential: S = S₀(1 − r)^a(1 − c)^b, for a minutes with no CPR and b minutes of CPR before the shock. Linear: S = S₀(1 − ra − cb). Real outcomes also depend on the heart’s rhythm, whether a shock works, CPR quality, care after the shock and much more. A shock does not always restart the heart, and not every rhythm can be shocked.</p><p><b>Sources.</b> The CARES report says that for every minute without CPR or defibrillation, the chance of survival falls by 7% to 10% (<a href="https://mycares.net/sitepages/uploads/2018/2017flipbook/inc/html/21.html" target="_blank" rel="noopener">CARES Annual Report 2017, p. 21</a>). That is a commonly cited rule of thumb, not a fitted survival curve. National figures for 2025 from the <a href="https://beta.mycares.net/sitepages/uploads/2026/CARES%202025%20Metrics%20Summary.pdf" target="_blank" rel="noopener">CARES 2025 Metrics Summary</a>: 140,427 out-of-hospital cardiac arrests, 10.5% overall survival, bystander CPR in 42.5%, a bystander-applied AED in 13.9% of public arrests, and a median EMS response time of 7.6 minutes. The 10.5% counts every arrest in the registry, including ones no one saw happen, so it is a different group from the person in this scenario who collapses in front of you.</p><p><b>Laws.</b> Damar Hamlin of the Buffalo Bills collapsed during a January 2023 game after a blow to the chest stopped his heart, and he was resuscitated. The federal HEARTS Act, signed in December 2024, requires public K-12 schools to develop cardiac emergency response plans and provides grants for AEDs and CPR training (<a href="https://www.wesanews.org/health-science-tech/2024-12-26/damar-hamlin-hearts-act-schools" target="_blank" rel="noopener">WESA, Dec 26, 2024</a>). Colorado’s SB23-023, signed March 23, 2023, encourages, but does not require, public high schools to teach CPR and AED use in grades 9 to 12 (<a href="https://leg.colorado.gov/bills/SB23-023" target="_blank" rel="noopener">Colorado General Assembly</a>).</p><p><b>In a real emergency,</b> CPR courses teach calling 911 first; dispatchers can talk a caller through each step. Your doctor or the school nurse can answer questions about your own heart health.</p>'
};
BioLab.register(SIM);
})();

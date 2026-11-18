(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* The craving loop, from one nerve cell.
   Nicotine level (as a share of one pouch's peak): L(t) = Σ (1/2)^((t − tᵢ)/h), h = 2 h (Hukkanen, Jacob & Benowitz, Pharmacol Rev 2005).
   Receptors R (1 = never used): climb to 1.30 over the first 4 weeks of daily use, then level off (PET/SPECT find roughly a quarter to a third more
   β2-containing receptors in daily smokers). After quitting, R − 1 shrinks by e^(−weeks/3), so it is near normal by 6 to 12 weeks (Cosgrove et al. 2009).
   The brain's "normal line" C = 25% of one pouch's peak × (R − 1)/0.30. Below C = craving. A teaching model: real withdrawal depends on much more. */
const X0=420,X1=1440; /* 7 AM to midnight, in minutes after midnight */
const clk=m=>{const t=((Math.round(m)%1440)+1440)%1440;let h=Math.floor(t/60),mi=t%60;const ap=h<12?'AM':'PM';h=h%12||12;return h+(mi?':'+String(mi).padStart(2,'0'):'')+' '+ap;};
const topts=(a,b,s)=>{const o=[];for(let m=a;m<=b;m+=s)o.push({v:m,l:clk(m)});return o;};
const HL=sim=>atLeast('ap')?sim.p.half:2;
const N=sim=>atLeast('honors')?sim.p.n:1;
const GAP=sim=>atLeast('honors')?sim.p.gap:2;
const QUIT=sim=>atLeast('honors')?sim.p.quit:0;
const upW=w=>Math.min(1,w/4);
const Rnow=sim=>{const d=upW(sim.p.weeks);return 1+0.30*d*Math.exp(-QUIT(sim)/3);};
const dep=sim=>(Rnow(sim)-1)/0.30;
const C=sim=>0.25*dep(sim);
function doses(sim){if(QUIT(sim)>0)return [];const out=[],n=N(sim),g=GAP(sim)*60,last=sim.p.last;for(let i=n-1;i>=0;i--){const t=last-i*g;if(t>=X0-120)out.push(t);}return out;}
const lev=(D,t,h)=>D.reduce((s,ti)=>s+(t>=ti?Math.pow(0.5,(t-ti)/(60*h)):0),0);
const L0=sim=>lev(doses(sim),sim.p.last,HL(sim));
/* hours after the last pouch until the level drops below the normal line */
function hrs(sim){const c=C(sim),l=L0(sim);if(QUIT(sim)>0||c<=1e-9||l<=c)return 0;return HL(sim)*Math.log2(l/c);}
function cravMin(sim){const D=doses(sim),c=C(sim),h=HL(sim);if(c<=1e-9)return 0;let m=0;for(let t=X0;t<X1;t+=2)if(lev(D,t,h)<c)m+=2;return m;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const pc=v=>Math.round(v*100)+'%';
const nn=v=>(Math.round(v*100)/100).toString();
const hm=hh=>{const t=Math.round(hh*60),H=Math.floor(t/60),M=t%60;return (H?H+' h'+(M?' ':''):'')+(M||!H?M+' min':'');};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fLine(sim){const c=C(sim),l=L0(sim),h=HL(sim);if(c<=1e-9)return 'No daily use yet, so no normal line and no craving';if(l<=c)return 'The level is already below the normal line';return `hours = ${nn(h)} × log₂(${pc(l)} ÷ ${pc(c)}) = ${nn(h)} × ${nn(Math.log2(l/c))} = ${nn(hrs(sim))} h`;}
/* receptor positions on the membrane, fixed */
/* 20 slots across the membrane; the 15 a never-user has are spread out, and new ones fill the gaps */
const SLOT=[...Array(20).keys()].map(i=>60+i*35);
const NEWS=[2,6,10,14,18],OLDS=[...Array(20).keys()].filter(i=>NEWS.indexOf(i)<0);
const RX=OLDS.concat(NEWS).map(i=>SLOT[i]);

const SIM={
 id:'hooked',hash:'hooked',apUnit:7,order:1,tab:'Hooked: the craving loop',kind:'Simulation',next:['freebase','betterthan','caffeinecurve'],
 skills:{bio:'Half-life: counting halvings · Algebra 2 (Unit 5), Biology (nervous system), Health (Unit 7)',honors:'Exponential decay of several doses that add · Algebra 2 (Unit 5), Biology, Health (Units 4 and 7)',ap:'Solving exponential equations with logarithms: t = h·log₂(L₀/C) · Algebra 2 (Unit 5), AP Precalculus (Unit 2B), AP Biology (Unit 4)'},
 card:'Watch what a pouch does at one nerve cell, how weeks of daily use move the brain’s “normal,” and guess when the craving comes back.',
 title:'Hooked: why the craving comes back',
 lede:{bio:'Nicotine fits receptors on nerve cells and makes them release dopamine, a “that was good, do it again” signal. With daily use, the brain builds more of these receptors and starts to count on nicotine being there. Then feeling normal needs nicotine, and the craving comes back each time the level drops.',
  honors:'The receptors are nicotinic acetylcholine receptors (nAChRs), mainly the α4β2 type. Daily use upregulates them: brain scans of daily smokers find roughly a quarter to a third more. Your body clears about half of the nicotine in your blood every 2 hours, so the level falls below the new normal within hours of the last pouch.',
  ap:'After the last dose, every earlier dose decays with the same half-life, so the total is one exponential: L(t) = L₀(1/2)^(t/h). The level crosses the normal line C when t = h·log₂(L₀/C).'},
 scale:'Top: a short stretch of one nerve cell’s membrane in the brain’s reward circuit, with its nicotine receptors (each a protein about 10 nm across, drawn huge). Bottom: one day, 7 AM to midnight, nicotine level as a share of one pouch’s peak.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'The person in the model (made up, not you)',
 controls:[
  {id:'guess',label:'Your gut: hours after the last pouch until the craving starts',type:'range',min:0,max:10,step:0.5,def:0,unit:' h'},
  {id:'weeks',label:'Weeks of daily use so far',type:'range',min:0,max:16,step:1,def:12,noGut:true,onChange:clearGut,help:'In the model, receptors climb over the first 4 weeks of daily use, then level off. The real timing varies from person to person.'},
  {id:'last',label:'Time of the last pouch today',type:'select',def:900,noGut:true,onChange:clearGut,options:topts(480,1320,30)},
  {id:'n',label:'Pouches today',type:'range',min:1,max:8,step:1,def:1,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'gap',label:'Hours between pouches',type:'range',min:1,max:4,step:0.5,def:2,unit:' h',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'quit',label:'Weeks since quitting (0 = still using)',type:'range',min:0,max:12,step:1,def:0,lvl:'honors',noGut:true,onChange:clearGut,help:'Brain scans of people who quit smoking found receptor levels back to those of people who never smoked by 6 to 12 weeks (Cosgrove et al., 2009).'},
  {id:'half',label:'Nicotine half-life in the blood',type:'range',min:1.5,max:3,step:0.5,def:2,unit:' h',lvl:'ap',noGut:true,onChange:clearGut,help:'About 2 hours on average; it varies from person to person.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true,help:'Normally the answer appears once you lock in your gut answer.'}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'rec',label:'Nicotine receptors compared with someone who never used',unit:'%',d:0,min:0,max:140,get:sim=>100*Rnow(sim)},
  {id:'line',label:'The brain’s normal line (share of one pouch’s peak)',unit:'%',d:0,min:0,max:30,get:sim=>100*C(sim)},
  {id:'hrs',label:'Hours after the last pouch until the craving starts',unit:'h',d:2,min:0,max:null,get:sim=>hid(sim,hrs(sim))},
  {id:'when',label:'The craving starts at',text:true,get:sim=>{if(!shown(sim))return 'Lock in your gut answer to see this.';if(QUIT(sim)>0)return `No pouches: ${QUIT(sim)} week${QUIT(sim)>1?'s':''} after quitting, the normal line is down to ${pc(C(sim))}.`;if(C(sim)<=1e-9)return 'Never: with no daily use, the brain has no nicotine “normal” to miss.';return clk(sim.p.last+60*hrs(sim));}},
  {id:'crav',label:'Hours below the normal line, 7 AM to midnight',unit:'h',d:1,min:0,max:17,lvl:'honors',get:sim=>hid(sim,cravMin(sim)/60)}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,big=k>1.3,sh=shown(sim);
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const h=HL(sim),q8=stg===8?Math.min(12,tau*1.6):null,D=stg===8?[]:doses(sim),c=stg===8?0.25*Math.exp(-q8/3):C(sim),showLine=stg>=4&&c>1e-9;
  /* the time cursor sweeps the day (12 s a day); some walkthrough steps hold it */
  let cur=sim._cur!=null?sim._cur:(stg>=99&&!sh)?Math.min(X1,sim.p.last+20):X0+((t*85)%(X1-X0));
  if(sim._sweep){const a=sim._sweep;cur=Math.min(a[1],a[0]+tau*a[2]);}
  const Lc=lev(D,cur,h),below=showLine&&Lc<c&&(sh||stg<99);
  /* ---- top: the membrane ---- */
  const MY=Math.round(96+6*k);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,0,800,MY+40);
  ctx.fillStyle='#e9c46a';ctx.globalAlpha=.55;ctx.fillRect(0,MY-8,800,16);ctx.globalAlpha=1;
  txt(ctx,'Outside the cell',12,20*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Inside the nerve cell',12,MY+30*k,{s:12*k,c:PAL['cv-soft']});
  let R=Rnow(sim);if(stg===3){R=1+0.30*Math.min(1,tau/3);}if(stg<3)R=1;if(stg===8){R=1+0.30*Math.exp(-q8/3);}
  const nR=Math.round(15*R),base=15;
  const fill=Lc/(Lc+0.35);/* share of receptors with nicotine bound, illustrative */
  for(let i=0;i<nR;i++){const x=RX[i]*(i<20?1:1);const isNew=i>=base;const bound=(i*0.618)%1<fill;
   ctx.fillStyle=isNew?'#9b5de5':'#4f6fd1';rr(ctx,x-9,MY-18,18,36,6);ctx.fill();
   if(isNew&&(stg===3||stg===8)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;rr(ctx,x-12,MY-21,24,42,8);ctx.stroke();}
   if(bound){ctx.fillStyle='#e63946';ctx.beginPath();ctx.arc(x,MY-24,6,0,7);ctx.fill();
    const ph=((t*1.3+i*0.37)%1);ctx.fillStyle='#f4a261';ctx.globalAlpha=1-ph;ctx.beginPath();ctx.arc(x+((i%3)-1)*6,MY+22+ph*26,3.5,0,7);ctx.fill();ctx.globalAlpha=1;}}
  const yL=MY+56*k;
  if(!big||stg<99){txt(ctx,`${nR} receptors`+(nR>base?` (${nR-base} new)`:''),788,20*k,{s:13*k,w:700,c:nR>base?'#9b5de5':PAL['cv-ink'],a:'right'});}
  if(below){const p=.55+.45*Math.sin(t*6);ctx.globalAlpha=p;pill(ctx,'Craving: the receptors expect nicotine',400,yL-4,PAL['rj'],'#fff',13*Math.min(k,1.4));ctx.globalAlpha=1;}
  else if(Lc>0.05&&stg>=2){pill(ctx,fill>0.5?'Nicotine bound: dopamine released':'Some nicotine still bound',400,yL-4,'#e76f51','#fff',13*Math.min(k,1.4));}
  else if(stg<=1||(stg>=99&&D.length===0&&c<=1e-9))pill(ctx,'No nicotine: receptors empty, and nothing is missing',400,yL-4,PAL['muted'],'#fff',13*Math.min(k,1.4));
  /* ---- bottom: the day ---- */
  const Lx=Math.round(44+22*k),Rx=786,T=Math.round(MY+76+8*k),B=Math.round(420-12*k);
  const ymax=Math.max(1.2,Math.ceil((lev(D,sim.p.last,h)+0.1)*5)/5);
  const X=m=>Lx+(m-X0)/(X1-X0)*(Rx-Lx),Y=v=>B-v/ymax*(B-T);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const st=big?240:120;
  for(let m=X0;m<=X1;m+=st){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X(m),T);ctx.lineTo(X(m),B);ctx.stroke();ctx.globalAlpha=1;txt(ctx,clk(m),X(m),B+16*k,{s:12*k,c:PAL['cv-soft'],a:m===X0?'left':m===X1?'right':'center'});}
  [0,0.5,1].forEach(v=>{if(v<=ymax){const y=Y(v);txt(ctx,Math.round(v*100)+'%',Lx-6,y+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}});
  if(!big)txt(ctx,'Nicotine level (share of one pouch’s peak)',Lx+4,B-6,{s:12*k,c:PAL['cv-soft']});
  const curveOn=stg>=2&&(sh||stg<99);
  if(showLine&&(sh||stg<99)){/* craving zones */const zEnd=stg===5?Math.min(X1,cur):X1;ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.16;let s0=null;
   for(let m=D.length?Math.max(X0,D[0]):X0;m<=zEnd;m+=2){const b=lev(D,m,h)<c;if(b&&s0===null)s0=m;if((!b||m+2>zEnd)&&s0!==null){ctx.fillRect(X(s0),T,X(m)-X(s0),B-T);s0=null;}}ctx.globalAlpha=1;
   const y=Y(c);ctx.strokeStyle=PAL['rj'];ctx.setLineDash([7,5]);ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(Lx,y);ctx.lineTo(Rx,y);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,(big?'Normal ':'The brain’s new normal: ')+pc(c),Rx-4,y-7,{s:12*k,w:700,c:PAL['rj'],a:'right'});
   if(stg===4){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;rr(ctx,Lx-4,y-14,Rx-Lx+8,22,6);ctx.stroke();}}
  if(curveOn&&D.length){ctx.strokeStyle='#e63946';ctx.lineWidth=3;ctx.beginPath();for(let m=X0;m<=X1;m+=3){const y=Y(lev(D,m,h));m===X0?ctx.moveTo(X(m),y):ctx.lineTo(X(m),y);}ctx.stroke();
   D.forEach(ti=>{if(ti>=X0){ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(X(ti)-7,B);ctx.lineTo(X(ti)+7,B);ctx.lineTo(X(ti),B-12);ctx.closePath();ctx.fill();}});
   if(showLine&&(stg>=5)&&QUIT(sim)===0){const hh=hrs(sim);if(hh>0){const tc=sim.p.last+60*hh;if(tc<=X1&&(stg!==5||cur>=tc)){ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(tc),Y(c),7,0,7);ctx.fill();txt(ctx,'Craving at '+clk(tc),X(tc)+(X(tc)>600?-10:10),Y(c)+22*k,{s:13*k,w:700,c:PAL['rj'],a:X(tc)>600?'right':'left'});}}}}
  if(!curveOn&&stg>=99&&D.length){pill(ctx,'Lock in your gut answer to see the curve',(Lx+Rx)/2,(T+B)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));}
  if(stg===9){const cues=[['After practice',.15],['In the car',.4],['Stress',.62],['Bad sleep',.84]];cues.forEach(([l,f],i)=>{const on=tau>i*1.2;if(on){ctx.globalAlpha=Math.min(1,(tau-i*1.2)*2);pill(ctx,l+' → craving',Lx+(Rx-Lx)*f,T+20+(i%2)*26,'#7b2cbf','#fff',12.5*Math.min(k,1.3));ctx.globalAlpha=1;}});}
  if(stg===8)pill(ctx,'Week '+Math.floor(q8)+' after quitting: no pouches',(Lx+Rx)/2,(T+B)/2-10,'#2a9d8f','#fff',14*Math.min(k,1.4));
  if(D.length===0&&stg>=99)txt(ctx,QUIT(sim)>0?'No pouches today: quitting.':'No pouches.',(Lx+Rx)/2,(T+B)/2-20,{s:14*k,c:PAL['cv-soft'],a:'center'});
  /* gut marker */
  const G=stg>=99?GS(sim):null;if(G&&c>1e-9){const tg=sim.p.last+60*G.guess;if(tg<=X1){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(tg),T);ctx.lineTo(X(tg),B);ctx.stroke();txt(ctx,(big?'Gut ':'Your gut: ')+clk(tg),X(tg)+(X(tg)>600?-6:6),T+16*k,{s:12*k,w:700,c:PAL['s4'],a:X(tg)>600?'right':'left'});}}
  /* cursor */
  ctx.strokeStyle=PAL['cv-ink'];ctx.globalAlpha=.65;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(cur),T);ctx.lineTo(X(cur),B);ctx.stroke();ctx.globalAlpha=1;
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(X(cur)-6,T-2);ctx.lineTo(X(cur)+6,T-2);ctx.lineTo(X(cur),T+6);ctx.closePath();ctx.fill();
  txt(ctx,clk(cur),clamp(X(cur),Lx+24,Rx-24),T-8,{s:12*k,w:700,a:'center'});
  if(sh&&!big&&sim.gutS&&sim.gutS.m&&stg>=99&&c>1e-9)txt(ctx,'The math: '+fLine(sim),Rx,446,{s:12*k,w:700,c:PAL['rj'],a:'right'});},
 narrate(sim){const c=C(sim),q=QUIT(sim),w=sim.p.weeks;
  if(q>0)return `${q} week${q>1?'s':''} after quitting, the extra receptors are fading: ${Math.round(100*Rnow(sim))}% of a never-user’s count, and the normal line is down to <b>${pc(c)}</b>. `+(q>=6?'Brain scans find most people back to normal by about now.':'Cravings are strongest early and fade as the receptors return to normal.');
  if(c<=1e-9)return 'This person has never used daily, so the brain has its usual number of receptors and <b>no nicotine “normal” to miss</b>. A pouch would feel like a buzz, not like relief.';
  if(!shown(sim))return `After ${w} weeks of daily use, the brain has ${Math.round(100*Rnow(sim))}% of its old receptor count and now treats ${pc(c)} of a pouch’s peak as normal. The last pouch is at ${clk(sim.p.last)}. <b>How many hours until the craving starts?</b>`;
  const hh=hrs(sim);return `The level falls by half every ${nn(HL(sim))} hours and drops below the normal line <b>${hm(hh)}</b> after the last pouch, at ${clk(sim.p.last+60*hh)}. The next pouch will feel like relief, but the relief is mostly the craving stopping.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: someone who has used one pouch a day for 12 weeks. Their last pouch is at 3 PM. Drag the slider to how many hours after that you think the craving starts, then lock it in.',
   honors:'Before the curve appears: drag the slider to how many hours after the last pouch the level drops below the brain’s normal line, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-hrs(sim)),guess:sim.p.guess,label:sim.p.guess+' h after the last pouch'};},
  solve(sim){const v=hrs(sim);return {v:0,guess:v,label:hm(v)+' after the last pouch'};},
  hint:{bio:'Lock in your gut answer. Then you will work it out by counting halvings.'},
  calc:{unit:'h',d:2,tol:a=>Math.max(0.1,0.03*a),
   prompt:{bio:sim=>{const c=C(sim);if(c<=1e-9||QUIT(sim)>0)return 'This scene has no craving line (no daily use, or quitting). Type 0.';
     return `Right after the last pouch at <b>${clk(sim.p.last)}</b>, the nicotine level is <b>${pc(L0(sim))}</b> of one pouch’s peak. The brain’s normal line is <b>${pc(c)}</b>. Half of the nicotine is cleared every <b>${nn(HL(sim))} hours</b>. How many hours until the level falls below the normal line?`;},
    ap:sim=>{const c=C(sim);if(c<=1e-9||QUIT(sim)>0)return 'This scene has no craving line. Type 0.';return `L₀ = ${pc(L0(sim))}, C = ${pc(c)}, h = ${nn(HL(sim))} h. Solve L₀(1/2)^(t/h) = C for t, in hours.`;}},
   answer:hrs,
   hint:'Count the halvings: 100% → 50% → 25% is two halvings. Each halving takes one half-life. If it is not a whole number of halvings, use log₂(L₀ ÷ C).',
   steps(sim){const c=C(sim),l=L0(sim),h=HL(sim);if(c<=1e-9||QUIT(sim)>0)return ['No craving line in this scene, so <b>0</b>.'];
    const n=Math.log2(l/c);return [`From ${pc(l)} down to ${pc(c)} is ${pc(l)} ÷ ${pc(c)} = ${nn(l/c)} times smaller.`,`Halvings needed: log₂(${nn(l/c)}) = ${nn(n)}${Math.abs(n-Math.round(n))<0.01?' (a whole number: '+Math.round(n)+' halvings)':''}.`,`Each halving takes ${nn(h)} h: ${nn(n)} × ${nn(h)} = <b>${nn(hrs(sim))} hours</b>, so the craving starts at ${clk(sim.p.last+60*hrs(sim))}.`];}},
  formula:fLine,
  how:{bio:'Count how many times the level has to halve to fall from the peak to the normal line. Multiply by 2 hours, the half-life.',ap:'t = h·log₂(L₀/C).'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(m.guess<=0)return 'In this scene there is no craving line, so there is nothing to wait for.';
   if(off<0.3)return `Your gut was right on. The craving starts about <b>${hm(m.guess)}</b> after the last pouch. That is why daily users often reach for the next one every few hours.`;
   return `Your gut was off by <b>${hm(off)}</b>. ${g.guess<m.guess?'You guessed early: it takes a few halvings to fall below the line.':'You guessed late: halving every 2 hours drops the level fast.'} The model says <b>${hm(m.guess)}</b>, at ${clk(sim.p.last+60*m.guess)}.`;},
  again(sim){sim.p.weeks=4+Math.floor(Math.random()*12);sim.p.last=600+30*Math.floor(Math.random()*20);sim.p.quit=0;if(atLeast('honors')){sim.p.n=1+Math.floor(Math.random()*5);sim.p.gap=[1.5,2,2.5,3][Math.floor(Math.random()*4)];}sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A daily user’s normal line is 25% of a pouch’s peak. The level is 100% right after a pouch, and the half-life is 2 hours. How many hours until the craving starts?',answer:4,tol:0.1,unit:'h',d:1,hint:'100% → 50% → 25%: how many halvings?',explain:'Two halvings, 2 hours each: 4 hours. That is why many daily users reach for another pouch every few hours.'},
  {lvl:'bio',instant:true,q:'Why does a pouch make a daily user feel “normal”?',choices:['It gives the body energy','It ends a craving the brain now expects to be fed','It repairs the receptors'],correct:1,explain:'After weeks of daily use, the brain has extra receptors and treats nicotine as normal. The pouch stops the craving it caused. Someone who never used does not feel that “relief,” because nothing is missing.'},
  {lvl:'bio',instant:true,q:'Someone has never used nicotine. Do they crave it in the afternoon?',choices:['Yes, everyone does','No: the craving comes from the brain changing with repeated use'],correct:1,explain:'With no daily use, there are no extra receptors and no new normal. The craving loop is built by the product itself.'},
  {lvl:'honors',instant:true,q:'Brain scans of people who quit smoking: how long until their nicotine receptor levels matched people who never smoked?',choices:['1 day','About 1 week','About 6 to 12 weeks','Never'],correct:2,explain:'Cosgrove and colleagues (2009) found receptor levels still high at 1 week and back to never-smoker levels by 6 to 12 weeks. The brain can recover; the first weeks are the hardest.'},
  {lvl:'honors',kind:'num',q:'Two pouches, 2 hours apart. Right after the second one, the level is 150% of one pouch’s peak (100% + the 50% left from the first). Normal line 25%, half-life 2 hours. How many hours until the craving starts?',answer:5.17,tol:0.15,unit:'h',d:2,hint:'150% ÷ 25% = 6. How many halvings shrink something 6 times?',explain:'log₂ 6 ≈ 2.58 halvings × 2 h ≈ 5.2 hours. Stacking pouches pushes the craving later, but the brain adapts to more nicotine over time.'},
  {lvl:'ap',instant:true,q:'L₀ = 125%, C = 25%, h = 2 h. When does the level cross the line?',choices:['2.5 h','4 h','4.64 h','10 h'],correct:2,explain:'t = 2·log₂(125/25) = 2·log₂ 5 ≈ 2 × 2.32 = 4.64 h.'},
  {lvl:'ap',instant:true,q:'Why is the total after the last dose a single exponential, even after several pouches?',choices:['Because the doses cancel','Because every dose decays with the same half-life, so their sum is (sum at the last dose) × (1/2)^(t/h)','It is not; it is linear'],correct:1,explain:'Σ aᵢ(1/2)^((t−tᵢ)/h) factors as [Σ aᵢ(1/2)^((t_last−tᵢ)/h)] × (1/2)^((t−t_last)/h): a constant times one exponential.'}
 ],
 tour:[
  {title:'One nerve cell',text:'This is a stretch of the membrane of one nerve cell in the brain’s reward circuit. The blue shapes are nicotine receptors. Here the person has never used nicotine: the receptors are empty, and nothing is missing.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;sim._sweep=null;sim._cur=600;BioLab.setValues(sim,{weeks:0,n:1,last:900,quit:0,half:2});}},
  {title:'A first pouch',text:'At 3 PM, nicotine (red) reaches the brain and fits the receptors. They make the cell release dopamine (orange), a “that was good, do it again” signal. The curve below shows the nicotine level: it peaks, then half is gone every 2 hours.',pause:true,setup:sim=>{sim.tst=2;sim._t0=null;sim._cur=930;sim._sweep=null;}},
  {title:'Weeks of daily use',text:'Watch the membrane: with nicotine there every day, the cell builds more receptors (purple, outlined). Brain scans of daily smokers find roughly a quarter to a third more of them.',pause:true,setup:sim=>{sim.tst=3;sim._t0=null;sim._cur=1000;sim._sweep=null;BioLab.setValues(sim,{weeks:12});}},
  {title:'A new normal',text:'With extra receptors, the brain now counts on nicotine. The red dashed line is the level this brain treats as normal: 25% of a pouch’s peak in this model. Before daily use, the line was at zero.',pause:true,setup:sim=>{sim.tst=4;sim._t0=null;sim._cur=1000;sim._sweep=null;}},
  {title:'The fall',text:'Watch the clock move from 3 PM. Every 2 hours the level halves: 100%, 50% by 5 PM, 25% by 7 PM. Below the line, the receptors sit empty and the brain signals a craving (the red zone).',pause:true,speed:0.3,setup:sim=>{sim.tst=5;sim._t0=null;sim._cur=null;sim._sweep=[900,1260,22];}},
  {lvl:'honors',title:'The loop',text:'Four pouches, every 2 hours. Each one lifts the level back over the line and feels like relief, but the relief is mostly the craving ending. Then the level falls again. That loop is what keeps people buying.',pause:true,setup:sim=>{sim.tst=6;sim._t0=null;sim._sweep=null;sim._cur=null;BioLab.setValues(sim,{n:4,gap:2,last:1080});}},
  {title:'More than receptors: cues, stress and sleep',text:'The brain also learns <b>when</b> nicotine comes: after practice, in the car, with certain friends, the mint taste. Those cues alone start a craving. Flavors work the same way, and in mice menthol even made nicotine more rewarding (Henderson et al., 2017). Withdrawal feels like stress, so a pouch seems to calm the stress it caused (Parrott, American Psychologist, 1999). And nicotine is a stimulant that disturbs sleep, which makes cravings and stress worse the next day.',pause:true,setup:sim=>{sim.tst=9;sim._t0=null;sim._cur=null;sim._sweep=null;BioLab.setValues(sim,{n:4,gap:2,last:1080});}},
  {lvl:'honors',title:'Why teen brains',text:'The brain keeps developing until about age 25. The Surgeon General’s 2016 report concluded that nicotine exposure during the teen years can harm the developing brain, and that people who start younger are more likely to become dependent.',pause:true,setup:sim=>{sim.tst=7;sim._t0=null;sim._cur=1080;}},
  {lvl:'honors',title:'Quitting: the receptors come back down',text:'Watch the extra receptors fade. After quitting, withdrawal is usually worst in the first week and fades over a few weeks. Brain scans found receptor levels back to never-user levels by 6 to 12 weeks. The brain recovers.',pause:true,setup:sim=>{sim.tst=8;sim._t0=null;sim._cur=600;BioLab.setValues(sim,{n:1,last:900});}}
 ],
 onTourExit(sim){sim._cur=null;sim._sweep=null;sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How does daily use change when the craving comes?</p><ol><li>Set weeks of daily use to 0, 1, 2, 4 and 12. Write down the normal line each time.</li><li>At 12 weeks, move the last pouch from 9 AM to 9 PM. Write down when the craving starts.</li></ol><p>Write one sentence: in this model, what builds the craving, the pouch or the brain’s change?</p>',
  honors:'<p><b>Question:</b> Does using more often make the craving loop weaker or stronger?</p><ol><li>Set 4 weeks of use. Try 2, 4 and 6 pouches a day, 2 hours apart. Record hours below the line.</li><li>Now set weeks since quitting to 1, 3, 6 and 9. Record the receptors and the normal line.</li></ol><p>Explain, using receptors, why the first weeks after quitting are the hardest and why it gets easier.</p>',
  ap:'<p><b>Question:</b> When does the level cross the normal line?</p><ol><li>Derive t = h·log₂(L₀/C) from L₀(1/2)^(t/h) = C.</li><li>For 3 pouches 2 h apart, compute L₀ by hand, then t. Check it against the tool.</li><li>Change the half-life to 1.5 h and 3 h. How does t change?</li></ol><p><b>CER:</b> Claim how half-life and spacing shape how often someone feels the need to use.</p>'},
 terms:[
  {t:'Receptor',d:'A protein on a cell that a specific molecule fits into, triggering a response.'},
  {t:'Dopamine',d:'A brain chemical that signals reward and teaches the brain to repeat what caused it.'},
  {t:'Dependence',d:'When the brain has adapted to a drug so that it feels normal only with it, and feels withdrawal without it.'},
  {t:'Half-life',d:'The time for half of a substance to be cleared from the body. For nicotine in the blood, about 2 hours.'},
  {t:'Upregulation',d:'A cell making more of a receptor. Daily nicotine use upregulates nicotinic receptors.',lvl:'honors'},
  {t:'Nicotinic acetylcholine receptor (nAChR)',d:'The receptor nicotine binds. Its normal job is to respond to acetylcholine, one of the brain’s own messengers.',lvl:'honors'},
  {t:'Withdrawal',d:'The symptoms when a dependent brain goes without the drug: craving, irritability, trouble focusing. For nicotine, usually worst in the first week.',lvl:'honors'}
 ],
 about:'<p><b>The model.</b> Each pouch adds a peak of 100% that halves every <i>h</i> hours (about 2 hours in the blood; Hukkanen, Jacob and Benowitz, <i>Pharmacological Reviews</i>, 2005). The model puts all of a pouch’s nicotine in at once; in reality it rises over 30 to 60 minutes. Receptors climb to 130% of a never-user’s count over 4 weeks of daily use and then level off. PET and SPECT studies find roughly a quarter to a third more β2-containing nicotinic receptors in daily smokers (Staley et al., <i>Journal of Neuroscience</i>, 2006); the 4-week timing is a simplification. After quitting, the extra receptors shrink by e<sup>−weeks/3</sup>, matching scans that found levels back to normal by 6 to 12 weeks (Cosgrove et al., <i>Archives of General Psychiatry</i>, 2009).</p><p><b>The normal line is a teaching idea.</b> The model sets it at 25% of a pouch’s peak times the share of extra receptors. Real craving and withdrawal also depend on habits, cues, stress and sleep, not just blood level. The point is the shape: daily use moves the brain’s “normal,” and the level falls below it within hours.</p><p><b>Cues and flavors.</b> Repeated pairing turns places, routines and tastes into cues that trigger craving. In mice, menthol plus nicotine produced more reward-related behavior and more receptor upregulation than nicotine alone (Henderson et al., <i>Neuropsychopharmacology</i>, 2017).</p><p><b>Teens.</b> The 2016 Surgeon General’s report on e-cigarettes concluded that nicotine exposure during adolescence can cause addiction and can harm the developing brain, which keeps maturing until about age 25.</p><p><b>Help.</b> Quitting works, and the brain recovers. Teens in Colorado can text <b>Start My Quit</b> to 36072 or call 1-855-891-9989 (My Life, My Quit, ages 13 to 17, free and confidential). Truth Initiative’s EX Program (text <b>EXPROGRAM</b> to 88709) now covers pouches. A school counselor, nurse or doctor can help too.</p>'
};
BioLab.register(SIM);
})();

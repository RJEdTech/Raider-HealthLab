(function(){
'use strict';
const {clamp,rng,randn,txt,pill,rr,PAL,axes,legend,atLeast}=BioLab.h;
/* One simulated night in bed, 11 PM to 7 AM: 960 epochs of 30 seconds.
   Stages: 0 awake, 1 REM, 2 N1, 3 N2, 4 N3. Each epoch also gets a movement count and a heart-rate change (bpm above sleeping level). */
const N=960,EP=0.5;
const NIGHT={good:{lat:12,wakes:3,wlen:[1,4],still:0.6,seed:18,l:'Good night'},typical:{lat:20,wakes:5,wlen:[2,10],still:0.75,seed:96,l:'Typical night'},restless:{lat:35,wakes:8,wlen:[4,22],still:0.85,seed:25,l:'Restless night'}};
function makeNight(type,seed){const r=rng(seed),P=NIGHT[type],S=new Array(N).fill(3);
 let i=0;const put=(st,min)=>{const n=Math.round(min*2);for(let j=0;j<n&&i<N;j++)S[i++]=st;};
 put(0,P.lat*(0.8+0.4*r()));
 /* about 90-minute cycles: N1, N2, deep N3 (mostly early in the night), N2, then REM (longer late in the night) */
 for(let c=0;i<N;c++){put(2,3+3*r());put(3,15+10*r());put(4,Math.max(0,(c<2?35:c<3?15:2)*(0.7+0.6*r())));put(3,8+8*r());put(1,(c===0?8:c<3?18:30)*(0.8+0.4*r()));}
 for(let w=0;w<P.wakes;w++){const at=Math.floor(80+r()*(N-120)),len=Math.round(2*(P.wlen[0]+r()*(P.wlen[1]-P.wlen[0])));for(let j=at;j<Math.min(N,at+len);j++)S[j]=0;}
 for(let j=N-Math.round(2*(3+4*r()));j<N;j++)S[j]=0;
 const A=new Array(N),H=new Array(N);let bout=false;
 for(let j=0;j<N;j++){const s=S[j];let a=0,h=randn(r)*2.5;
  if(s===0){if(j===0||S[j-1]!==0)bout=r()<P.still;const st=bout?(r()<0.93):(r()<0.3);a=st?r()*6:15+r()*60;h+=st?4:10;}
  else{const tw=s===2?0.25:s===1?0.12:s===3?0.07:0.04;a=r()<tw?r()*40:r()*3;h+=s===1?3:s===4?-2:0;}
  A[j]=a;H[j]=h;}
 return {S,A,H};}
/* The tracker's wake score: movement plus a heart-rate term, averaged over 5 epochs (2.5 minutes) around each one. Above the setting = awake. */
function wakeScores(n,hr){const raw=n.A.map((a,j)=>a+(hr?1.5*Math.max(0,n.H[j]-3):0)),W=new Array(N);for(let j=0;j<N;j++){let s=0,c=0;for(let q=j-2;q<=j+2;q++){if(q<0||q>=N)continue;s+=raw[q];c++;}W[j]=s/c;}return W;}
function night(sim){const key=sim.p.night+'|'+sim.st.n+'|'+!!sim.p.hr;if(sim.st.key!==key){const n=makeNight(sim.p.night,NIGHT[sim.p.night].seed+sim.st.n*101);n.W=wakeScores(n,!!sim.p.hr);sim.st.nt=n;sim.st.key=key;}return sim.st.nt;}
function scoreAt(n,thr){let TP=0,FN=0,FP=0,TN=0;for(let j=0;j<N;j++){const tw=n.W[j]>thr,sl=n.S[j]!==0;if(sl){if(!tw)TP++;else FN++;}else{if(tw)TN++;else FP++;}}
 return {TP,FN,FP,TN,sens:TP/(TP+FN),spec:(TN+FP)?TN/(TN+FP):1,acc:(TP+TN)/N,truth:(TP+FN)*EP,trk:(TP+FP)*EP,over:(FP-FN)*EP,wake:(TN+FP)*EP};}
const sc=sim=>scoreAt(night(sim),sim.p.thr);
const TH=[];for(let t=4;t<=30;t++)TH.push(t);
function bestThr(sim){const n=night(sim);let b=TH[0],bv=1e9;TH.forEach(t=>{const v=Math.abs(scoreAt(n,t).over);if(v<bv-1e-9){bv=v;b=t;}});return b;}
const GS=sim=>sim.gutS&&sim.gutS.g?sim.gutS.g:null;
/* While the student works out the over-report ("Your turn"), the sleep lab total and the over-report stay hidden.
   The two error counts (orange and purple) are the givens, so they show. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(GS(sim)&&!pend(sim))||(sim.tour&&sim.tour.on));
const d1=v=>(Math.round(v*10)/10).toString();
const errs=sim=>{const c=sc(sim);return {c,fp:c.FP*EP,fn:c.FN*EP,o:(c.FP-c.FN)*EP};};
function fLine(sim){const e=errs(sim),base=`Over-report = ${d1(e.fp)} min − ${d1(e.fn)} min = ${d1(e.o)} min`;return atLeast('honors')?`(${e.c.FP} − ${e.c.FN} epochs) × 0.5 min = ${d1(e.o)} min. `+base:base;}
const hid=(sim,v)=>shown(sim)?v:null;
const hm=m=>{const s=m<0?'−':'',t=Math.round(Math.abs(m)),H=Math.floor(t/60),M=t%60;return s+(H?H+' h'+(M?' ':''):'')+(M||!H?M+' min':'');};
const hmh=m=>{const s=m<0?'−':'',t=Math.round(Math.abs(m)*2)/2,H=Math.floor(t/60),M=t-60*H,ms=(M%1?Math.floor(M)+'½':String(M));return s+(H?H+' h'+(M?' ':''):'')+(M||!H?ms+' min':'');};
const mn=m=>(Math.round(m*2)/2).toString().replace('.5','½')+' min';
const pc=v=>Math.round(v*100)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const CLK=['11 PM','12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM'];

const SIM={
 id:'watchlie',hash:'watchlie',apUnit:1,order:2,tab:'Is your watch lying?',kind:'Simulation',prereq:[],next:['sleepdebt'],
 skills:{bio:'Counting the two kinds of error in a 2 × 2 table · Statistics (Chapter 5), Health (Unit 5)',honors:'Sensitivity and specificity from a confusion matrix · Statistics (Chapter 5), AP Statistics (Unit 4)',ap:'Errors that cancel: confusion matrices, accuracy and total error · AP Statistics (Unit 4)'},
 card:'Your wrist tracker says you slept 7 and a half hours. Compare it with a sleep lab, epoch by epoch, and find out where the extra sleep came from.',
 title:'Is your sleep tracker lying to you?',
 lede:{bio:'A wrist tracker cannot see your brain. It guesses from how much you move and how fast your heart beats. Lie awake but still, and it thinks you are asleep.',
  honors:'Score the tracker like a medical test. Sensitivity is the share of real sleep it calls sleep. Specificity is the share of real wake it calls wake. Studies find trackers catch over 90% of sleep but often less than half of wake.',
  ap:'Total sleep error = (wake scored as sleep − sleep scored as wake) × 0.5 min. A setting can make the total come out right while still scoring hundreds of epochs wrong, because the two kinds of error cancel.'},
 scale:'One simulated night in bed, 11 PM to 7 AM: 960 epochs of 30 seconds each. The night is made up for illustration; the scoring method is the one real studies use.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The night and the tracker',
 controls:[
  {id:'guess',label:'Your gut: minutes of sleep the tracker adds that did not happen',type:'range',min:-60,max:180,step:5,def:0,unit:' min',help:'A negative number means you think it under-reports.'},
  {id:'night',label:'What kind of night',type:'seg',def:'typical',noGut:true,onChange:clearGut,options:[{v:'good',l:'Good night'},{v:'typical',l:'Typical night'},{v:'restless',l:'Restless night'}]},
  {id:'thr',label:'Tracker setting: how restless you must look to count as awake',type:'range',min:4,max:30,step:1,def:12,unit:'',noGut:true,onChange:clearGut,help:'Lower settings call you awake more easily. Higher settings call almost everything sleep.'},
  {id:'hr',label:'Tracker also uses your heart rate',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut,help:'Heart rate rises a little when you are awake, even lying still. Turn this off to score on movement alone.'},
  {id:'reveal',label:'Show the scoring now',type:'toggle',def:false,noGut:true,help:'Normally the sleep lab’s total appears once you lock in your gut answer.'}
 ],
 actions:[
  {id:'newnight',label:'New night (same kind)',run(sim){sim.st.n=(sim.st.n||0)+1;clearGut(sim);}},
  {id:'best',label:'Find the setting with the smallest total error',lvl:'ap',run(sim){BioLab.setValues(sim,{thr:bestThr(sim)});}}
 ],
 init(){return {n:0};},step(){},
 metrics:[
  {id:'trk',label:'Tracker says you slept',unit:'min',d:0,min:0,max:480,get:sim=>sc(sim).trk},
  {id:'truth',label:'Sleep lab says you slept',unit:'min',d:0,min:0,max:480,get:sim=>hid(sim,sc(sim).truth)},
  {id:'over',label:'Tracker over-reports by',unit:'min',d:1,min:-120,max:150,get:sim=>hid(sim,sc(sim).over)},
  {id:'missed',label:'Awake minutes scored as sleep',unit:'min',d:1,min:0,max:200,get:sim=>hid(sim,sc(sim).FP*EP)},
  {id:'sens',label:'Sensitivity: real sleep scored as sleep',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>hid(sim,100*sc(sim).sens)},
  {id:'spec',label:'Specificity: real wake scored as wake',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>hid(sim,100*sc(sim).spec)},
  {id:'acc',label:'Epoch-by-epoch accuracy',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>hid(sim,100*sc(sim).acc)},
  {id:'wrong',label:'Epochs scored wrong',unit:'',d:0,lvl:'ap',min:0,max:null,get:sim=>{if(!shown(sim))return null;const c=sc(sim);return c.FP+c.FN;}}
 ],
 graphs:[{id:'err',label:'Total-sleep error vs. setting',custom:true},{id:'ss',label:'Sensitivity and specificity vs. setting',lvl:'honors',custom:true}],defaultGraph:'err',
 plot(sim,ctx,box,id){const n=night(sim),R=TH.map(t=>scoreAt(n,t));
  if(id==='ss'){const ax=axes(ctx,box,{xmin:4,xmax:30,ymin:0,ymax:100,xl:'Tracker setting',yl:'%'});
   if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
   [['sens',PAL['s2']],['spec',PAL['s1']]].forEach(([k,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();R.forEach((r,i)=>{const x=ax.X(TH[i]),y=ax.Y(100*r[k]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();});
   ctx.strokeStyle=PAL['rj'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ax.X(sim.p.thr),box.T);ctx.lineTo(ax.X(sim.p.thr),box.T+box.H);ctx.stroke();ctx.setLineDash([]);
   legend(ctx,box.L+12,box.T+box.H-30,[{label:'Sensitivity (sleep caught)',color:PAL['s2']},{label:'Specificity (wake caught)',color:PAL['s1']}]);return;}
  const lo=Math.min(-30,...R.map(r=>r.over)),hi=Math.max(30,...R.map(r=>r.over));
  const ax=axes(ctx,box,{xmin:4,xmax:30,ymin:Math.floor(lo/30)*30,ymax:Math.ceil(hi/30)*30,xl:'Tracker setting',yl:'Over-report (min)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(box.L,ax.Y(0));ctx.lineTo(box.L+box.W,ax.Y(0));ctx.stroke();
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();R.forEach((r,i)=>{const x=ax.X(TH[i]),y=ax.Y(r.over);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
  const c=sc(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.thr),ax.Y(c.over),6,0,7);ctx.fill();txt(ctx,'Now: '+mn(c.over),ax.X(sim.p.thr)+(sim.p.thr>22?-10:10),ax.Y(c.over)-10,{s:12,w:700,c:PAL['rj'],a:sim.p.thr>22?'right':'left'});},
 draw(sim,ctx,vdt,k){const n=night(sim),c=sc(sim),sh=shown(sim),G=GS(sim),hon=atLeast('honors'),big=k>1.3,giv=sh||pend(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=Math.round(44+26*k),R=786,X=j=>L+j/N*(R-L),ew=(R-L)/N;
  /* sleep lab hypnogram */
  const rows=hon?['Awake','REM','N1','N2','N3']:['Awake','REM','Light','Deep'];const rowOf=s=>hon?s:(s===0?0:s===1?1:s===4?3:2);
  const hT=Math.round(20+12*k),hB=big?150:156,rh=(hB-hT)/rows.length,ry=r=>hT+r*rh+rh/2;
  txt(ctx,big?'Sleep lab (brain waves)':'Sleep lab: brain waves, eye movement, muscle activity, heart rate',L,hT-7,{s:12*k,w:700,c:PAL['cv-ink']});
  rows.forEach((l,r)=>{txt(ctx,l,L-8,ry(r)+4*k,{s:12*k,w:r===0?700:400,c:r===0?PAL['s1']:PAL['cv-soft'],a:'right'});ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(L,ry(r));ctx.lineTo(R,ry(r));ctx.stroke();ctx.globalAlpha=1;});
  ctx.fillStyle=PAL['s1'];for(let j=0;j<N;j++)if(n.S[j]===0)ctx.fillRect(X(j),ry(0)-rh*0.38,ew+0.6,rh*0.76);
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();for(let j=0;j<N;j++){const y=ry(rowOf(n.S[j]));if(!j)ctx.moveTo(X(0),y);else{ctx.lineTo(X(j),ry(rowOf(n.S[j-1])));ctx.lineTo(X(j),y);}}ctx.lineTo(R,ry(rowOf(n.S[N-1])));ctx.stroke();
  /* tracker: wake score trace with the setting line */
  const tT=hB+(big?32:30),tB=tT+(big?40:48),cap=40,ty=v=>tB-Math.min(v,cap)/cap*(tB-tT);
  txt(ctx,big?'Wrist tracker':'Wrist tracker: movement'+(sim.p.hr?' and heart rate':' only'),L,tT-8,{s:12*k,w:700,c:PAL['cv-ink']});
  txt(ctx,big?'Score':'Restless',L-8,(tT+tB)/2+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.75;for(let j=0;j<N;j++){const y=ty(n.W[j]);ctx.fillRect(X(j),y,ew+0.4,tB-y);}ctx.globalAlpha=1;
  const yT=ty(sim.p.thr);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(L,yT);ctx.lineTo(R,yT);ctx.stroke();ctx.setLineDash([]);
  ctx.font='700 '+(12*k)+'px sans-serif';const sl='Setting '+sim.p.thr,sw=ctx.measureText(sl).width+10;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(R-sw,yT-14*k,sw,13*k);txt(ctx,sl,R-3,yT-4,{s:12*k,w:700,c:PAL['rj'],a:'right'});
  /* tracker verdict strip */
  const vT=tB+8,vH=big?16:18;txt(ctx,'Verdict',L-8,vT+vH/2+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  for(let j=0;j<N;j++){const tw=n.W[j]>sim.p.thr,sl2=n.S[j]!==0;let col=tw?PAL['s1']:PAL['s2'];if(giv){if(!tw&&!sl2)col=PAL['s4'];else if(tw&&sl2)col=PAL['s5'];}ctx.fillStyle=col;ctx.fillRect(X(j),vT,ew+0.6,vH);}
  /* time axis */
  const aY=vT+vH+16*k;CLK.forEach((l,i)=>{if(big&&i%2)return;txt(ctx,l,X(i*120),aY,{s:12*k,c:PAL['cv-soft'],a:i===0?'left':i===8?'right':'center'});});
  /* legend */
  const lgY=aY+18*k;let lx=L;const key=(col,l)=>{ctx.fillStyle=col;ctx.fillRect(lx,lgY-10*k,11*k,11*k);txt(ctx,l,lx+15*k,lgY,{s:12*k,c:PAL['cv-ink']});ctx.font=(12*k)+'px sans-serif';lx+=15*k+ctx.measureText(l).width+16;};
  key(PAL['s2'],'asleep');key(PAL['s1'],'awake');if(giv){key(PAL['s4'],big?'missed wake':'awake, scored asleep');if(!big)key(PAL['s5'],'asleep, scored awake');}
  /* bottom panel: totals and the confusion matrix */
  const pT=lgY+12*k;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,10,pT,780,446-pT,10);ctx.fill();
  const pH=446-pT,c1=pT+pH*0.34,c2=pT+pH*0.72,bx=big?150:160,bw=big?105:230,sc2=bw/480;
  txt(ctx,'Tracker says',bx-10,c1+4*k,{s:12*k,w:700,a:'right'});ctx.fillStyle=PAL['s2'];ctx.fillRect(bx,c1-8*k,c.trk*sc2,16*k);txt(ctx,hmh(c.trk),bx+c.trk*sc2+8,c1+4*k,{s:12*k,w:700});
  txt(ctx,'Sleep lab',bx-10,c2+4*k,{s:12*k,w:700,a:'right'});
  if(sh){ctx.fillStyle=PAL['s3'];ctx.fillRect(bx,c2-8*k,c.truth*sc2,16*k);txt(ctx,hmh(c.truth),bx+c.truth*sc2+8,c2+4*k,{s:12*k,w:700});}
  else txt(ctx,big?'Lock in your gut':'? Lock in your gut to see.',bx,c2+4*k,{s:12*k,c:PAL['cv-soft']});
  const solved=!big&&sim.gutS&&sim.gutS.m&&sh&&!(sim.tour&&sim.tour.on),gs=G?(G.guess>=0?'+':'')+G.guess+' min':'';
  if(solved){const e=errs(sim);txt(ctx,'The math: '+d1(e.fp)+' − '+d1(e.fn)+' = '+d1(e.o)+' min'+(G?'. Your gut: '+gs:''),20,pT+pH-8,{s:12*k,w:700,c:PAL['rj']});}
  else if(G&&!big){txt(ctx,'Your gut: '+gs,bx,pT+pH-8,{s:12*k,w:700,c:PAL['rj']});}
  /* matrix */
  const mx0=big?452:470,mw=(784-mx0-(big?84:108))/2,mL=mx0+(big?84:108),mh=(pH-26*k)/2,mT=pT+22*k;
  txt(ctx,big?'Asleep':'Lab: asleep',mL+mw/2,pT+16*k,{s:12*k,w:700,c:PAL['cv-ink'],a:'center'});txt(ctx,big?'Awake':'Lab: awake',mL+mw*1.5,pT+16*k,{s:12*k,w:700,c:PAL['s1'],a:'center'});
  txt(ctx,big?'Says asleep':'Tracker: asleep',mL-8,mT+mh/2+4*k,{s:12*k,w:700,a:'right'});txt(ctx,big?'Says awake':'Tracker: awake',mL-8,mT+mh*1.5+4*k,{s:12*k,w:700,a:'right'});
  const cell=(i,j,v,col,lab)=>{const x=mL+i*mw+2,y=mT+j*mh+2;rr(ctx,x,y,mw-4,mh-4,6);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
   const vis=sh||(pend(sim)&&i!==j);txt(ctx,vis?(big?mn(v*EP):hmh(v*EP)):'?',x+(mw-4)/2,y+(mh-4)/2+(hon&&vis&&!big?-1:5)*k,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});if(hon&&vis&&!big)txt(ctx,lab,x+(mw-4)/2,y+(mh-4)/2+14*k,{s:12*k,c:PAL['cv-soft'],a:'center'});};
  cell(0,0,c.TP,PAL['s2'],'correct');cell(1,0,c.FP,PAL['s4'],'missed wake');cell(0,1,c.FN,PAL['s5'],'false wake');cell(1,1,c.TN,PAL['s1'],'correct');},
 narrate(sim){const c=sc(sim),nt=NIGHT[sim.p.night].l.toLowerCase();
  if(!shown(sim))return `On this ${nt}, the tracker says you slept <b>${hm(c.trk)}</b>. The red blocks in the sleep lab’s chart are times you were really awake. <b>How much of the tracker’s total never happened?</b>`;
  if(c.over>0.5)return `The tracker adds <b>${mn(c.over)}</b> of sleep that did not happen. You were awake for ${mn(c.wake)}, and it scored ${mn(c.FP*EP)} of that as sleep, mostly the stretches where you lay still. ${atLeast('honors')?`Sensitivity ${pc(c.sens)}, specificity ${pc(c.spec)}.`:''}`;
  if(c.over<-0.5)return `At this setting the tracker <b>under-reports by ${mn(-c.over)}</b>: it calls ${mn(c.FN*EP)} of real sleep “awake” because of small movements. It still misses ${mn(c.FP*EP)} of real wake.`;
  return `The total comes out almost exactly right, but the tracker still scores <b>${c.FP+c.FN} epochs wrong</b>: ${mn(c.FP*EP)} of wake called sleep and ${mn(c.FN*EP)} of sleep called wake. <b>The two errors cancel.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The bottom of the picture shows how long the tracker says you slept. Compare its strip with the red “awake” blocks in the sleep lab’s chart. By feel, drag the slider here to how many of the tracker’s minutes never happened, then lock it in.',
   honors:'Before you see the scoring: drag the slider here to how many minutes the tracker over-reports this night’s sleep, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-sc(sim).over),guess:sim.p.guess,label:(sim.p.guess>=0?'+':'')+sim.p.guess+' min'};},
  solve(sim){const o=sc(sim).over;sim.p.guess=o;return {v:0,guess:o,label:(o>=0?'+':'−')+mn(Math.abs(o))+(o>=0?' (over-reported)':' (under-reported)')};},
  hint:{bio:'Lock in your gut answer. Then the two kinds of error appear, and you will work out the over-report yourself.'},
  calc:{unit:'min',d:1,tol:0.5,
   prompt:{bio:sim=>{const e=errs(sim);return `The tracker says you slept <b>${hm(e.c.trk)}</b>. Lined up with the sleep lab, you were <b>awake but scored asleep for ${d1(e.fp)} min</b> (orange) and <b>asleep but scored awake for ${d1(e.fn)} min</b> (purple). By how many minutes does the tracker over-report your sleep? (If it under-reports, give a negative number.)`;},
    honors:sim=>{const e=errs(sim);return `Each epoch is 30 seconds. The tracker scored <b>${e.c.FP} epochs</b> of real wake as sleep and <b>${e.c.FN} epochs</b> of real sleep as wake. By how many minutes does it over-report your total sleep? (Negative means it under-reports.)`;},
    ap:sim=>{const e=errs(sim);return `Missed wake: ${e.c.FP} epochs. False wake: ${e.c.FN} epochs. Use over-report = (missed wake − false wake) × 0.5 min. Then check it against the tracker’s ${d1(e.c.trk)} minutes.`;}},
   answer:sim=>errs(sim).o,
   hint:'Wake scored as sleep adds minutes to the total. Sleep scored as wake takes minutes away. Subtract the second from the first.',
   steps(sim){const e=errs(sim),out=[];
    if(atLeast('honors'))out.push(`Minutes: ${e.c.FP} × 0.5 = ${d1(e.fp)} min of wake scored as sleep, and ${e.c.FN} × 0.5 = ${d1(e.fn)} min of sleep scored as wake.`);
    out.push(`The ${d1(e.fp)} min of missed wake are added to your total. The ${d1(e.fn)} min of false wake are taken away.`);
    out.push(`Over-report = ${d1(e.fp)} − ${d1(e.fn)} = <b>${d1(e.o)} min</b>.`);
    out.push(`So the sleep lab total is ${d1(e.c.trk)} − ${d1(e.o)} = ${d1(e.c.truth)} min (${hm(e.c.truth)}).`);
    return out;}},
  formula:fLine,
  how:{bio:'Line the two charts up and compare them every 30 seconds. Count the minutes you were really awake but the tracker said asleep, then subtract the minutes you were asleep but it said awake. What is left is how much it over-reports.',
   honors:'Fill in the 2 × 2 table (lab vs. tracker) for all 960 epochs. Over-report = (missed wake − false wake) × 0.5 min.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),c=sc(sim),wk=7*m.guess;
   const tail=m.guess>0?` If every night were like this one, that is <b>${hm(wk)} a week</b> of sleep that exists only on your phone.`:'';
   if(off<5)return `Your gut was right on, within ${mn(off)}. The tracker said ${hm(c.trk)}; the sleep lab says ${hm(c.truth)}.`+tail;
   return `Your gut was off by <b>${mn(off)}</b>. The tracker said ${hm(c.trk)}; the sleep lab says <b>${hm(c.truth)}</b>. ${g.guess<m.guess?'You guessed low: the tracker cannot tell lying still from sleeping, so every still, awake stretch counts as sleep.':'You guessed high: the tracker catches the times you toss and turn, so only the still stretches slip through.'}`+tail;},
  again(sim){const t=['good','typical','restless'];sim.p.night=t[Math.floor(Math.random()*3)];sim.st.n=1+Math.floor(Math.random()*40);sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You were awake for 50 minutes after lights out, and your tracker caught only 15 of them. It also called 10 minutes of your real sleep “awake.” By how many minutes does it over-report your sleep?',answer:25,tol:0.5,unit:'min',d:0,hint:'First find the awake minutes it scored as sleep: 50 − 15. Then subtract the sleep it scored as awake.',explain:'Awake but scored asleep: 50 − 15 = 35 minutes. Asleep but scored awake: 10 minutes. Over-report = 35 − 10 = 25 minutes.'},
  {lvl:'bio',instant:true,q:'A tracker scores more than 93% of real sleep as sleep. Does that mean its total sleep time is close to right?',choices:['Yes: 93% accurate means the total is about right','No: it can still score most of your awake time as sleep, so the total comes out too high','No: it always under-counts sleep'],correct:1,explain:'Catching sleep is the easy part. The 2020 study of seven devices found they caught at least 93% of sleep but only 18% to 54% of wake. The missed wake gets added to your total.'},
  {lvl:'bio',instant:true,q:'On which night does the tracker add the most made-up sleep?',choices:['A good night with little time awake','A restless night with long stretches lying awake','Both the same'],correct:1,explain:'The tracker can only add sleep that is really wake. On the default nights here it over-reports about 4 minutes on the good night and about 71 minutes on the restless one. Real studies also found trackers did worse on nights of poor sleep.'},
  {lvl:'bio',instant:true,q:'Why does a wrist tracker call you asleep when you are lying awake in the dark?',choices:['Its clock is wrong','It infers sleep from movement and heart rate, and lying still looks like sleep','It reads your brain waves through your wrist'],correct:1,explain:'A sleep lab records brain waves (EEG), eye movement and muscle activity. A wrist tracker has only movement and heart rate, and still wakefulness looks a lot like sleep in both.'},
  {lvl:'honors',instant:true,q:'A night has 60 minutes awake after lights out. The tracker’s specificity is 30%. About how many of those minutes does it score as sleep?',choices:['18 minutes','30 minutes','42 minutes'],correct:2,explain:'Specificity 30% means it catches 30% of wake: 18 minutes. The other 70%, 42 minutes, gets scored as sleep.'},
  {lvl:'honors',instant:true,q:'You lower the tracker setting so it calls you awake more easily. What happens to sensitivity and specificity?',choices:['Both go up','Specificity goes up and sensitivity goes down','Sensitivity goes up and specificity goes down'],correct:1,explain:'A lower setting catches more real wake (specificity up) but also calls more small sleep movements “awake” (sensitivity down). On the typical night here, setting 12 gives 96.7% and 36.2%; setting 6 gives 77.1% and 61.2%.'},
  {lvl:'ap',instant:true,q:'A night has 420 minutes of real sleep and 60 of real wake. Sensitivity 95%, specificity 40%. What total sleep does the tracker report?',choices:['399 minutes','435 minutes','456 minutes','420 minutes'],correct:1,explain:'Sleep scored as sleep: 0.95 × 420 = 399. Wake scored as sleep: 0.60 × 60 = 36. Tracker total: 399 + 36 = 435 minutes, 15 more than the truth.'},
  {lvl:'ap',instant:true,q:'At some setting the tracker’s total sleep matches the sleep lab to the minute. Is it scoring each epoch correctly?',choices:['Yes: the totals match','Not necessarily: wake scored as sleep and sleep scored as wake can cancel out','No: matching totals are impossible'],correct:1,explain:'Over-report = (missed wake − false wake) × 0.5 min. If both are 40 epochs, the total is exactly right while 80 epochs are wrong. That is why studies score epoch by epoch.'}
 ],
 tour:[
  {title:'The sleep lab’s night',text:'The top chart is the truth: a sleep lab (polysomnography) recording brain waves, eye movement, muscle activity and heart rate. Red blocks are times you were really awake. You cycle through light sleep, deep sleep and REM about every 90 minutes.',pause:true,focus:[0,0,800,160],setup:sim=>BioLab.setValues(sim,{night:'typical',thr:12,hr:true})},
  {title:'What the tracker sees',text:'Your wrist tracker cannot see brain waves. It turns movement and heart rate into a restlessness score, every 30 seconds. Lying awake but still barely moves the score.',pause:true,focus:[0,160,800,90]},
  {title:'The tracker’s verdict',text:'Above the red dashed setting line, the tracker calls you awake. Below it, asleep. Here it says you slept 7 h 25 min.',pause:true},
  {title:'Where the extra sleep came from',text:'Orange marks times you were awake but the tracker said asleep: 37 minutes tonight. Purple marks the reverse: 14 minutes. 37 − 14 = 23 minutes of sleep that never happened. The sleep lab says 7 h 2 min.',pause:true},
  {title:'A restless night',text:'On a restless night with long, still stretches awake, the tracker adds about 71 minutes. Studies of real devices also found bigger errors on nights of poor sleep.',pause:true,setup:sim=>BioLab.setValues(sim,{night:'restless'})},
  {lvl:'honors',title:'Sensitivity and specificity',text:'Score it like a medical test. On the typical night the tracker calls 96.7% of real sleep “sleep” (sensitivity) but only 36.2% of real wake “wake” (specificity). Studies of real devices find the same pattern.',pause:true,setup:sim=>BioLab.setValues(sim,{night:'typical',thr:12})},
  {lvl:'ap',title:'Errors that cancel',text:'This is the setting with the smallest total error: 9. The total is off by only 7 minutes, but 144 epochs are scored wrong, more than the 102 at setting 12. Purple false wake grew to cancel the orange missed wake. A right total is not a right night.',pause:true,setup:sim=>BioLab.setValues(sim,{night:'typical',thr:9})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the kind of night change the tracker’s error?</p><ol><li>Turn on <b>Show the scoring now</b>.</li><li>For a good, a typical and a restless night, record a trial.</li><li>Press <b>New night</b> and repeat twice more for each kind.</li></ol><p>Write one sentence: when is a tracker’s total most and least trustworthy?</p>',
  honors:'<p><b>Question:</b> How does the tracker setting trade sensitivity against specificity?</p><ol><li>On the typical night, record trials at settings 4, 8, 12, 16, 20 and 30.</li><li>Open the sensitivity and specificity graph.</li><li>Turn off heart rate and repeat.</li></ol><p>Explain why no setting gets both above 90%, and what heart rate adds.</p>',
  ap:'<p><b>Question:</b> Is the setting with the best total also the most accurate one?</p><ol><li>Press <b>Find the setting with the smallest total error</b>. Record over-report, accuracy and epochs scored wrong.</li><li>Record the same at settings 6, 12 and 20.</li></ol><p><b>CER:</b> Use the 2 × 2 table to explain why total-sleep error and epoch accuracy can disagree, and which one a study should report.</p>'},
 terms:[
  {t:'Polysomnography',d:'The sleep-lab gold standard: overnight recording of brain waves (EEG), eye movement, muscle activity, heart rate, breathing and more.'},
  {t:'Epoch',d:'A 30-second slice of the night. Sleep is scored one epoch at a time.'},
  {t:'Hypnogram',d:'A chart of sleep stages across the night.'},
  {t:'Sleep stages',d:'Awake, REM (dreaming) sleep, and non-REM stages N1 and N2 (light) and N3 (deep).',lvl:'honors'},
  {t:'Sensitivity',d:'Here, the share of real sleep epochs the tracker scores as sleep.',lvl:'honors'},
  {t:'Specificity',d:'Here, the share of real wake epochs the tracker scores as wake.',lvl:'honors'},
  {t:'Confusion matrix',d:'A 2 × 2 table of true state vs. predicted state. Its two off-diagonal cells are the two kinds of error.',lvl:'honors'},
  {t:'Total sleep time (TST)',d:'Minutes asleep between lights out and final waking. Over-report = tracker TST − true TST.',lvl:'ap'}
 ],
 about:'<p><b>A simulated night.</b> The hypnogram is generated for illustration: about 90-minute cycles, more deep N3 sleep early and more REM late, plus awakenings. Awake stretches are mostly lying still, with some tossing and turning. Movement and heart rate for each 30-second epoch are made up to look like a wrist sensor’s, not taken from a real device.</p><p><b>The tracker.</b> Its restlessness score is movement plus 1.5 × (heart rate more than 3 bpm above the sleeping level), averaged over 5 epochs (2.5 minutes). Above the setting, it calls the epoch awake. Real devices use their own unpublished algorithms; this one is a simple stand-in that behaves like the published results.</p><p><b>Scoring.</b> Sensitivity = sleep scored as sleep ÷ all real sleep. Specificity = wake scored as wake ÷ all real wake. Over-report = (wake scored as sleep − sleep scored as wake) × 0.5 min.</p><p><b>Real studies.</b> Chinoy et al., <i>Sleep</i> (2020), tested seven consumer sleep trackers against polysomnography: epoch-by-epoch sensitivity for sleep was at least 0.93 for every device, but specificity for wake ranged from 0.18 to 0.54, and devices did worse on nights of poor sleep. A 2025 study in <i>Sleep</i> of six wearables (Fitbit Charge 5, Fitbit Sense, Withings Scanwatch, Garmin Vivosmart 4, Whoop 4.0 and Apple Watch Series 8) found all detected more than 90% of sleep epochs, with wake specificity from 29.39% to 52.15%. An under-mattress sensor study (medRxiv preprint, 2024, 183 participants) found 83% accuracy, 95% sensitivity and 37% specificity, and the sensor overestimated total sleep by about 48 minutes on average.</p><p><b>Not medical advice.</b> A tracker can still be useful for noticing patterns. A parent or your doctor can help with worries about sleep; sleep problems are diagnosed with real sleep studies, not a wristband.</p>'
};
BioLab.register(SIM);
})();

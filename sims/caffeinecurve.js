(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,legend,atLeast}=BioLab.h;
/* Clock times are minutes after midnight on the day you drink; the next morning runs past 1440 (6 AM next day = 1800). */
const clk=m=>{const t=((Math.round(m)%1440)+1440)%1440;let h=Math.floor(t/60),mi=t%60;const ap=h<12?'AM':'PM';h=h%12||12;return h+(mi?':'+String(mi).padStart(2,'0'):'')+' '+ap;};
const clk2=m=>{const t=((Math.round(m)%1440)+1440)%1440;let h=Math.floor(t/60),mi=t%60;const ap=h<12?'AM':'PM';h=h%12||12;return h+':'+String(mi).padStart(2,'0')+' '+ap;};
const topts=(a,b,s)=>{const o=[];for(let m=a;m<=b;m+=s)o.push({v:m,l:clk2(m)});return o;};
/* Round, commonly cited values. Real drinks vary by brand and size. */
const DRINK={none:{mg:0,l:'No drink',s:'none'},coffee:{mg:95,l:'8 oz brewed coffee (about 95 mg)',s:'Coffee'},espresso:{mg:63,l:'1 shot of espresso (about 63 mg)',s:'Espresso'},tea:{mg:47,l:'8 oz black tea (about 47 mg)',s:'Black tea'},cola:{mg:35,l:'12 oz cola (about 35 mg)',s:'Cola'},energy:{mg:160,l:'16 oz energy drink (about 160 mg)',s:'Energy drink'}};
const dopts=Object.keys(DRINK).map(k=>({v:k,l:DRINK[k].l}));
const COLA=35;
const hl=sim=>sim.p.half;
function drinks(sim){const L=[];[['d1','t1'],['d2','t2'],['d3','t3']].forEach(([d,t],i)=>{if(i===2&&!atLeast('honors'))return;const k=sim.p[d];if(k&&k!=='none'&&DRINK[k])L.push({mg:DRINK[k].mg,t:sim.p[t],k,i});});return L;}
const amtAt=(L,t,h)=>L.reduce((s,q)=>s+(t>=q.t?q.mg*Math.pow(0.5,(t-q.t)/(60*h)):0),0);
const atBed=sim=>amtAt(drinks(sim),sim.p.bed,hl(sim));
const total=sim=>drinks(sim).reduce((s,q)=>s+q.mg,0);
const latestOf=L=>L.length?L.reduce((a,b)=>b.t>a.t?b:a):null;
const latestD=sim=>latestOf(drinks(sim));
/* bedtime caffeine if the latest drink moved by dm minutes (negative = earlier) */
function shifted(sim,dm){const L=drinks(sim),q=latestOf(L);if(!q)return 0;return amtAt(L.map(x=>x===q?{mg:x.mg,t:x.t+dm}:x),sim.p.bed,hl(sim));}
/* how many hours before bedtime the latest drink must be, for bedtime caffeine <= target. null = no time works; 0 = any time works */
function lead(sim){const L=drinks(sim),q=latestOf(L),X=sim.p.limit,h=hl(sim);if(!q)return 0;const others=amtAt(L.filter(x=>x!==q),sim.p.bed,h);
 if(others>=X)return null;if(q.mg<=X-others)return 0;return h*Math.log2(q.mg/(X-others));}
const GS=sim=>sim.gutS&&sim.gutS.g?sim.gutS.g:null;
/* The curve and the bedtime amount stay hidden while the student works it out ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(GS(sim)&&!pend(sim))||(sim.tour&&sim.tour.on));
const nn=v=>(Math.round(v*100)/100).toString();
const pieces=sim=>{const h=hl(sim),bed=sim.p.bed;return drinks(sim).slice().sort((a,b)=>a.t-b.t).map(q=>{const hrs=(bed-q.t)/60,n=hrs/h;return {q,hrs,n,left:q.mg*Math.pow(0.5,n)};});};
function fLine(sim){const P=pieces(sim),h=hl(sim);if(!P.length)return 'No drinks, so 0 mg at bedtime';return P.map(p=>`${p.q.mg} × (1/2)^(${nn(p.hrs)} ÷ ${nn(h)})`).join(' + ')+` = ${mg(atBed(sim))}`;}
const hid=(sim,v)=>shown(sim)?v:null;
const mg=v=>Math.round(v)+' mg';
const hm=hh=>{const t=Math.round(hh*60),H=Math.floor(t/60),M=t%60;return (H?H+' h'+(M?' ':''):'')+(M||!H?M+' min':'');};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const X0=360,X1=1800;

const SIM={
 id:'caffeinecurve',hash:'caffeinecurve',apUnit:1,order:3,tab:'Caffeine Curve',kind:'Learning tool',next:['sleepdebt'],
 skills:{bio:'Half-life and exponential decay · Algebra 2 (Unit 5), Health (Unit 7)',honors:'Exponential decay with a half-life that varies · Algebra 2 (Unit 5), Health (Unit 7)',ap:'Exponential decay and logarithms: t = h·log₂(A₀/A) · Algebra 2 (Unit 5), AP Precalculus (Units 2A and 2B)'},
 card:'Add your own drinks and your bedtime, guess how much caffeine is still in you when you turn out the light, then see how much the timing changes it.',
 title:'How much caffeine is still in you at bedtime?',
 lede:{bio:'Your body clears caffeine a fraction at a time, not all at once. For many healthy adults, about half is gone after 5 hours, half of what is left after 5 more, and so on.',
  honors:'All day, a chemical called adenosine builds up in your brain and creates sleep pressure. Caffeine keeps you alert by blocking adenosine receptors, so caffeine still in you at bedtime is still pushing back against sleep. How fast it clears (the half-life) varies from person to person, roughly 3 to 7 hours.',
  ap:'Each drink decays exponentially: A(t) = A₀(1/2)^(t/h), and drinks simply add. Solving A₀(1/2)^(t/h) = A for t gives t = h·log₂(A₀/A): the time a drink needs before bed to fall to A.'},
 scale:'One day, from 6 AM to 6 AM the next morning, in milligrams (mg) of caffeine in your body. The drinks you enter stay on this page in memory only: nothing is saved or sent.',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'Your day (stays on this page, never saved or sent)',
 controls:[
  {id:'guess',label:'Your gut: caffeine still in you at bedtime',type:'range',min:0,max:500,step:5,def:0,unit:' mg'},
  {id:'d1',label:'Drink 1',type:'select',def:'energy',noGut:true,onChange:clearGut,options:dopts,help:'Caffeine varies a lot by brand and size; these are round, commonly cited values. Some energy drinks have 200 to 300 mg. The label gives the real number.'},
  {id:'t1',label:'Drink 1: when you drink it',type:'select',def:900,noGut:true,onChange:clearGut,options:topts(360,1260,30)},
  {id:'d2',label:'Drink 2',type:'select',def:'none',noGut:true,onChange:clearGut,options:dopts},
  {id:'t2',label:'Drink 2: when you drink it',type:'select',def:450,noGut:true,onChange:clearGut,options:topts(360,1260,30)},
  {id:'d3',label:'Drink 3',type:'select',def:'none',lvl:'honors',noGut:true,onChange:clearGut,options:dopts},
  {id:'t3',label:'Drink 3: when you drink it',type:'select',def:720,lvl:'honors',noGut:true,onChange:clearGut,options:topts(360,1260,30)},
  {id:'bed',label:'You go to sleep at',type:'select',def:1350,noGut:true,onChange:clearGut,options:topts(1260,1500,15)},
  {id:'half',label:'Your caffeine half-life (varies by person)',type:'range',min:3,max:7,step:0.5,def:5,unit:' h',lvl:'honors',noGut:true,onChange:clearGut,help:'About 5 hours for many healthy adults, roughly 3 to 7 hours from person to person. You cannot know yours without testing, so try both ends.'},
  {id:'limit',label:'Your bedtime target: at most this much caffeine left',type:'range',min:10,max:100,step:5,def:50,unit:' mg',lvl:'honors',noGut:true,help:'Your choice, for planning. It is not a medical safe level.'},
  {id:'reveal',label:'Show the curve now',type:'toggle',def:false,noGut:true,help:'Normally the curve appears once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'total',label:'Caffeine you drank today',unit:'mg',d:0,min:0,max:500,get:sim=>total(sim)},
  {id:'bedmg',label:'Still in you at bedtime',unit:'mg',d:0,min:0,max:null,get:sim=>hid(sim,atBed(sim))},
  {id:'cans',label:'Same as drinking this many 12 oz colas at bedtime',unit:'cans',d:1,min:0,max:null,get:sim=>hid(sim,atBed(sim)/COLA)},
  {id:'earlier',label:'At bedtime if your latest drink were 2 hours earlier',unit:'mg',d:0,min:0,max:null,get:sim=>hid(sim,shifted(sim,-120))},
  {id:'lead',label:'Your latest drink must be at least this long before bed to meet your target',unit:'h',d:2,lvl:'honors',min:0,max:null,get:sim=>{if(!shown(sim))return null;const v=lead(sim);return v===null?null:v;}},
  {id:'latest',label:'Latest time for your latest drink, to meet your target',text:true,lvl:'honors',get:sim=>{if(!shown(sim))return 'Lock in your gut answer to see this.';const q=latestD(sim);if(!q)return 'No drinks entered.';const v=lead(sim);if(v===null)return `No time works today: your other drinks already leave ${sim.p.limit} mg or more at bedtime.`;if(v===0)return `Any time before bed: the drink alone is under your ${sim.p.limit} mg target.`;const t=Math.floor(sim.p.bed-v*60);return t<X0?`Before 6 AM: this drink cannot get under ${sim.p.limit} mg by bedtime today.`:`${clk2(t)} (${hm(v)} before bed) for at most ${sim.p.limit} mg at ${clk(sim.p.bed)}.`;}},
  {id:'range',label:'At bedtime with a half-life of 3 h or 7 h',text:true,lvl:'honors',get:sim=>{if(!shown(sim))return 'Lock in your gut answer to see this.';const L=drinks(sim);return `${mg(amtAt(L,sim.p.bed,3))} (fast, 3 h) to ${mg(amtAt(L,sim.p.bed,7))} (slow, 7 h). People really do differ this much.`;}},
  {id:'perhour',label:'Share left after each hour',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>100*Math.pow(0.5,1/hl(sim))}
 ],
 graphs:[{id:'when',label:'Bedtime caffeine vs. when you have your latest drink',custom:true}],defaultGraph:'when',
 plot(sim,ctx,box){const L=drinks(sim),q=latestOf(L),h=hl(sim),bed=sim.p.bed;
  const f=t=>amtAt(L.map(x=>x===q?{mg:x.mg,t}:x),bed,h),top=Math.max(50,Math.ceil((q?f(Math.min(bed,1260)):50)*1.15/50)*50);
  const ax=axes(ctx,box,{xmin:6,xmax:21,ymin:0,ymax:top,xl:'Time of your latest drink (hour of the day)',yl:'mg at bedtime'});
  if(!shown(sim)||!q){txt(ctx,q?'Lock in your gut answer to see this graph.':'Add a drink to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=360;t<=1260;t+=10){const x=ax.X(t/60),y=ax.Y(f(t));t===360?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
  if(atLeast('honors')){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(box.L,ax.Y(sim.p.limit));ctx.lineTo(box.L+box.W,ax.Y(sim.p.limit));ctx.stroke();ctx.setLineDash([]);txt(ctx,'Your target: '+sim.p.limit+' mg',box.L+8,ax.Y(sim.p.limit)-6,{s:12,w:700,c:PAL['s4']});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(q.t/60),ax.Y(f(q.t)),6,0,7);ctx.fill();txt(ctx,'Now: '+mg(f(q.t)),ax.X(q.t/60)+(q.t>1000?-10:10),ax.Y(f(q.t))-10,{s:12,w:700,c:PAL['rj'],a:q.t>1000?'right':'left'});},
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim)&&stg>=2,G=stg>=99?GS(sim):null,L=drinks(sim),h=hl(sim),bed=sim.p.bed,big=k>1.3,hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  let peak=0;for(let t=X0;t<=X1;t+=5)peak=Math.max(peak,amtAt(L,t,h));
  const ymax=Math.max(100,Math.ceil(Math.max(peak,G?G.guess:0)*1.18/50)*50);
  const Lx=Math.round(40+26*k),R=784,T=Math.round(26+12*k),B=Math.round(392-14*k),X=t=>Lx+(t-X0)/(X1-X0)*(R-Lx),Y=v=>B-v/ymax*(B-T);
  /* night */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(bed),T,R-X(bed),B-T);txt(ctx,'Asleep',R-6,T+14*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const st=big?360:180;
  for(let t=X0;t<=X1;t+=st){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X(t),T);ctx.lineTo(X(t),B);ctx.stroke();ctx.globalAlpha=1;txt(ctx,clk(t),X(t),B+18*k,{s:12*k,c:PAL['cv-soft'],a:t===X0?'left':t===X1?'right':'center'});}
  const ys=ymax>300?100:ymax>150?50:25;for(let v=0;v<=ymax;v+=ys){const y=Y(v);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(Lx,y);ctx.lineTo(R,y);ctx.stroke();ctx.globalAlpha=1;if(y>T+8)txt(ctx,String(v),Lx-6,y+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'mg',Lx-6,T-4,{s:12*k,c:PAL['cv-soft'],a:'right'});
  /* bedtime */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(bed),T);ctx.lineTo(X(bed),B);ctx.stroke();
  txt(ctx,(big?'Bed ':'Bedtime, ')+clk(bed),X(bed)-6,T+14*k,{s:12*k,w:700,a:'right'});
  if(sh){/* the curve */
   const q0=latestD(sim),tE=stg===2&&q0?Math.min(X1,q0.t+h*60):stg===3?bed:X1;
   ctx.beginPath();ctx.moveTo(X(X0),Y(amtAt(L,X0,h)));for(let t=X0;t<=tE;t+=2)ctx.lineTo(X(t),Y(amtAt(L,t,h)));ctx.lineTo(X(tE),B);ctx.lineTo(X(X0),B);ctx.closePath();ctx.fillStyle=PAL['s6'];ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;
   if(stg===5){ctx.beginPath();ctx.moveTo(X(bed),B);for(let t=bed;t<=X1;t+=2)ctx.lineTo(X(t),Y(amtAt(L,t,h)));ctx.lineTo(X(X1),B);ctx.closePath();ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.28;ctx.fill();ctx.globalAlpha=1;txt(ctx,'Still in you while you sleep',(X(bed)+R)/2,B-24*k,{s:14*k,w:700,c:PAL['rj'],a:'center'});}
   ctx.strokeStyle=PAL['s6'];ctx.lineWidth=3;ctx.beginPath();for(let t=X0;t<=tE;t+=2){const y=Y(amtAt(L,t,h));t===X0?ctx.moveTo(X(t),y):ctx.lineTo(X(t),y);}ctx.stroke();
   /* half-life steps for the latest drink, when it is alone */
   const q=latestD(sim);if(stg===2&&q){const t=q.t+h*60,v=amtAt(L,t,h);ctx.strokeStyle=PAL['rj'];ctx.setLineDash([5,4]);ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(t),B);ctx.lineTo(X(t),Y(v));ctx.lineTo(X(q.t),Y(v));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(t),Y(v),6,0,7);ctx.fill();txt(ctx,'½ left: '+mg(v)+' at '+clk(t),X(t)+10,Y(v)-10,{s:14*k,w:700,c:PAL['rj']});}
   if(stg===4){const v=amtAt(L,X1,h);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(X1),Y(v),6,0,7);ctx.fill();txt(ctx,'Still about '+mg(v)+' at '+clk(X1),X(X1)-10,Y(v)-14,{s:14*k,w:700,c:PAL['rj'],a:'right'});}
   if(hon&&q&&L.length===1&&stg>=3){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,5]);ctx.lineWidth=1.2;for(let n=1;n<=3;n++){const t=q.t+n*h*60;if(t>X1)break;const v=q.mg/Math.pow(2,n);ctx.beginPath();ctx.moveTo(X(t),B);ctx.lineTo(X(t),Y(v));ctx.lineTo(X(q.t),Y(v));ctx.stroke();const vb0=atBed(sim),px0=Math.min(X(bed)+78,R-72),py0=Math.max(T+40*k,Y(vb0)-24*k),clash=Math.abs(Y(v)-6-py0)<24*k&&X(t)+56>px0-75&&X(t)<px0+75;
     if(!big&&!clash&&X(t)<R-56)txt(ctx,['½','¼','⅛'][n-1]+' left',X(t)+4,Y(v)-6,{s:12*k,c:PAL['cv-soft']});}ctx.setLineDash([]);}
   /* latest time for the target */
   if(atLeast('ap')&&q&&(stg>=99||stg===8)){const v=lead(sim);if(v!==null&&v>0){const t=bed-v*60;if(t>=X0){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(t),T+22*k);ctx.lineTo(X(t),B);ctx.stroke();ctx.setLineDash([]);txt(ctx,(big?'≤'+sim.p.limit+' mg: ':'Latest for ≤ '+sim.p.limit+' mg: ')+clk2(Math.floor(t)),X(t)+(X(t)>560?-6:6),T+34*k,{s:12*k,w:700,c:PAL['s4'],a:X(t)>560?'right':'left'});}}}
   /* bedtime amount */
   if(stg>=3){const vb=atBed(sim);if(stg===3){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(bed),Y(vb),14,0,7);ctx.stroke();}ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(bed),Y(vb),7,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
   pill(ctx,mg(vb)+' at bedtime',Math.min(X(bed)+(big?62:78),R-(big?62:72)),Math.max(T+40*k,Y(vb)-24*k),PAL['rj'],'#fff',13*Math.min(k,1.4));}}
  if(!sh||stg<3){pill(ctx,'? mg at bedtime',Math.min(X(bed)+(big?62:70),R-(big?62:70)),T+44*k,PAL['muted'],'#fff',13*Math.min(k,1.4));}
  if(G){const y=Y(G.guess);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(bed)-12,y);ctx.lineTo(X(bed)+12,y);ctx.stroke();txt(ctx,(big?'Gut ':'Your gut: ')+mg(G.guess),X(bed)-16,y+4*k,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  /* drinks: markers and labels (stacked so they never overlap) */
  const sorted=L.slice().sort((a,b)=>a.t-b.t);let lastX=-1e9,lane=0,maxLane=0;
  sorted.forEach(q=>{const x=X(q.t);ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(x-7,B);ctx.lineTo(x+7,B);ctx.lineTo(x,B-12);ctx.closePath();ctx.fill();
   const lab=big?q.mg+' mg':DRINK[q.k].s+', '+q.mg+' mg, '+clk(q.t);ctx.font='700 '+(12*k)+'px sans-serif';const w=ctx.measureText(lab).width;
   lane=(x-lastX<w+16)?lane+1:0;lastX=x;maxLane=Math.max(maxLane,lane);const ly=big?B-18*k-lane*16*k:B+(36+lane*16)*k;
   if(ly<446)txt(ctx,lab,clamp(x,Lx+w/2,R-w/2),ly,{s:12*k,w:700,c:PAL['s2'],a:'center'});});
  /* the math at the reveal, under the drink labels */
  if(sh&&!big&&maxLane<2&&L.length&&sim.gutS&&sim.gutS.m&&!(sim.tour&&sim.tour.on))txt(ctx,'The math: '+fLine(sim),R,444,{s:12*k,w:700,c:PAL['rj'],a:'right'});
  if(!L.length)txt(ctx,'No drinks entered. Pick a drink and a time.',(Lx+R)/2,(T+B)/2,{s:14*k,c:PAL['cv-soft'],a:'center'});},
 narrate(sim){const L=drinks(sim),bed=sim.p.bed;
  if(!L.length)return 'No caffeine today, so <b>none is left at bedtime</b>. Add a drink to see how long it stays with you.';
  const q=latestD(sim),hrs=(bed-q.t)/60;
  if(!shown(sim))return `Your latest drink is at ${clk(q.t)}, ${hm(hrs)} before you go to sleep at ${clk(bed)}. <b>How much of today’s ${total(sim)} mg do you think is still in you then?</b>`;
  const vb=atBed(sim),e=shifted(sim,-120);
  return `At ${clk(bed)} about <b>${mg(vb)}</b> is still in you, ${Math.round(vb/total(sim)*100)}% of what you drank today and about ${(vb/COLA).toFixed(1)} colas’ worth. `+(atLeast('honors')?`That caffeine is still blocking adenosine receptors as you try to fall asleep. `:'')+`Moving your latest drink 2 hours earlier would leave ${mg(e)}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a 16 oz energy drink (about 160 mg) at 3 PM, and asleep at 10:30 PM. By feel, drag the slider here to how many milligrams are still in your body at bedtime, then lock it in.',
   honors:'Before the curve appears: drag the slider here to how many milligrams are still in you at bedtime, then lock it in. (In the full lab, put in your own drinks and bedtime first.)'},
  lock(sim){return {v:Math.abs(sim.p.guess-atBed(sim)),guess:sim.p.guess,label:mg(sim.p.guess)+' at bedtime'};},
  solve(sim){const v=atBed(sim);sim.p.guess=v;return {v:0,guess:v,label:mg(v)+' at bedtime'};},
  hint:{bio:'Lock in your gut answer. Then you will work out the bedtime amount yourself with the half-life.'},
  calc:{unit:'mg',d:0,tol:a=>Math.max(2,0.03*a),
   prompt:{bio:sim=>{const P=pieces(sim);if(!P.length)return `No drinks are entered. How many mg of caffeine are in you at bedtime (${clk(sim.p.bed)})?`;
     return `Your drinks: ${P.map(p=>`<b>${p.q.mg} mg at ${clk(p.q.t)}</b>`).join(' and ')}. You fall asleep at <b>${clk(sim.p.bed)}</b>. Half of the caffeine is cleared every <b>${nn(hl(sim))} hours</b>. How many mg are still in you at bedtime?`;},
    ap:sim=>{const P=pieces(sim);if(!P.length)return 'No drinks are entered. What does A(t) = A₀(1/2)^(t/h) give at bedtime?';
     return `Drinks: ${P.map(p=>`${p.q.mg} mg at ${clk(p.q.t)}`).join(', ')}. Bedtime ${clk(sim.p.bed)}, half-life h = ${nn(hl(sim))} h. Use A = A₀(1/2)^(t/h) for each drink and add. How many mg at bedtime?`;}},
   answer:atBed,
   hint:'Hours from the drink to bedtime ÷ the half-life = the number of half-lives. Multiply the dose by (1/2) raised to that number. On a calculator, (0.5)^1.5 ≈ 0.354.',
   steps(sim){const P=pieces(sim),h=hl(sim);if(!P.length)return ['No drinks, so <b>0 mg</b> at bedtime.'];
    const out=P.map(p=>`${clk(p.q.t)} to ${clk(sim.p.bed)} is ${nn(p.hrs)} h, so ${nn(p.hrs)} ÷ ${nn(h)} = ${nn(p.n)} half-lives: ${p.q.mg} × (1/2)^${nn(p.n)} = ${nn(p.left)} mg.`);
    out.push(P.length>1?`Add them: ${P.map(p=>nn(p.left)).join(' + ')} = <b>${nn(atBed(sim))} mg</b>, about ${Math.round(atBed(sim))} mg.`:`About <b>${Math.round(atBed(sim))} mg</b> is still in you at bedtime.`);
    return out;}},
  formula:fLine,
  how:{bio:'Count the half-lives between each drink and bedtime: hours ÷ 5. Each half-life cuts what is left in half. Add up what is left from every drink.',
   ap:'Bedtime caffeine = Σ dose × (1/2)^(hours before bed ÷ h), with h the half-life.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),e=shifted(sim,-120),q=latestD(sim);
   if(!q)return off<5?'Your gut was right on: no drinks, no caffeine at bedtime.':`With no drinks entered, nothing is left at bedtime; your gut guessed ${mg(g.guess)}.`;
   const tail=` Having your latest drink 2 hours earlier would leave about <b>${mg(e)}</b>.`;
   if(off<5)return `Your gut was right on, within ${mg(off)}. About ${mg(m.guess)} is still in you at bedtime, roughly ${(m.guess/COLA).toFixed(1)} colas’ worth.`+tail;
   return `Your gut was off by <b>${mg(off)}</b>, about ${(off/COLA).toFixed(1)} cans of cola. ${g.guess<m.guess?'You guessed low: an afternoon drink is only partly cleared by bedtime.':'You guessed high: your body has cleared more of it by bedtime.'} The model says <b>${mg(m.guess)}</b> is still in you as you try to fall asleep.`+tail;},
  again(sim){const ks=['coffee','espresso','tea','cola','energy'],R=a=>a[Math.floor(Math.random()*a.length)];
   sim.p.d1=R(ks);sim.p.t1=720+30*Math.floor(Math.random()*15);sim.p.d2=Math.random()<0.5?R(ks):'none';sim.p.t2=390+30*Math.floor(Math.random()*6);sim.p.d3='none';sim.p.bed=1260+15*Math.floor(Math.random()*13);sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A 16 oz energy drink (about 160 mg) at 5:30 PM, after practice. You fall asleep at 10:30 PM. With a 5-hour half-life, how many mg are still in you at bedtime?',answer:80,tol:2,unit:'mg',d:0,hint:'5:30 PM to 10:30 PM is how many half-lives?',explain:'5:30 PM to 10:30 PM is 5 hours: exactly one half-life. 160 × 1/2 = 80 mg, more than two colas’ worth (about 35 mg each).'},
  {lvl:'bio',instant:true,q:'Coffee at 12:30 PM, bedtime 10:30 PM: that is two half-lives. How much of the coffee’s caffeine is left?',choices:['None: two half-lives is 100%','One quarter','One half'],correct:1,explain:'After one half-life, 1/2 is left. After two, half of a half: 1/4. For an 8 oz coffee (about 95 mg), that is about 24 mg. It never reaches zero in a fixed number of half-lives.'},
  {lvl:'bio',instant:true,q:'Which leaves more caffeine at a 10:30 PM bedtime: a coffee (about 95 mg) at 3 PM, or a cola (about 35 mg) at 8 PM?',choices:['The coffee at 3 PM','The cola at 8 PM','They are about the same'],correct:0,explain:'Coffee: 7.5 h before bed, 95 × (1/2)^1.5 ≈ 34 mg. Cola: 2.5 h before bed, 35 × (1/2)^0.5 ≈ 25 mg. A big afternoon coffee can outlast a small evening soda.'},
  {lvl:'honors',instant:true,q:'Caffeine keeps you alert by blocking adenosine receptors. What does adenosine normally do?',choices:['It builds up while you are awake and creates sleep pressure','It wakes you up in the morning','It digests caffeine'],correct:0,explain:'Adenosine builds up the longer you are awake, and binding to its receptors makes you feel sleepy. Caffeine sits in those receptors without triggering them, so the sleep pressure is still there, just masked.'},
  {lvl:'honors',instant:true,q:'Two friends drink the same energy drink at 3 PM and go to bed at 10:30 PM. One has a 3-hour half-life and the other 7 hours. How different are their bedtime amounts?',choices:['About the same','About 28 mg vs. about 76 mg','Both have none left'],correct:1,explain:'160 × (1/2)^(7.5/3) ≈ 28 mg and 160 × (1/2)^(7.5/7) ≈ 76 mg. The same drink at the same time can leave almost three times as much in one person.'},
  {lvl:'ap',instant:true,q:'With a 5-hour half-life, how long before bed must you finish a 160 mg drink for at most 40 mg to be left?',choices:['5 hours','7.5 hours','10 hours','15 hours'],correct:2,explain:'Solve 160(1/2)^(t/5) = 40: (1/2)^(t/5) = 1/4, so t/5 = 2 and t = 10 hours. In general t = h·log₂(A₀/A) = 5·log₂ 4.'},
  {lvl:'ap',instant:true,q:'Moving a drink 2 hours earlier multiplies its bedtime amount by (1/2)^(2/5). About what fraction is that?',choices:['0.40','0.76','0.60','0.87'],correct:1,explain:'(1/2)^0.4 ≈ 0.758. Two hours earlier removes only about 24% of that drink’s bedtime caffeine. Timing helps, but slowly.'}
 ],
 tour:[
  {title:'Your day',text:'The timeline runs from 6 AM to 6 AM the next morning. The blue triangle is a 16 oz energy drink (about 160 mg) at 3 PM. The black line is when you go to sleep: 10:30 PM.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{d1:'energy',t1:900,d2:'none',d3:'none',bed:1350,half:5,limit:50});}},
  {title:'Half every 5 hours',text:'Once you drink it, your liver clears the caffeine a fraction at a time. For many healthy adults, half is gone in about 5 hours: 160 mg falls to 80 mg by 8 PM.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'At bedtime',text:'By 10:30 PM, 7.5 hours have passed: one and a half half-lives. 160 × (1/2)^1.5 ≈ 57 mg is still in you, more than a 12 oz cola’s worth (about 35 mg).',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'It never quite hits zero',text:'Each half-life takes away half of what is left, not a fixed amount. At 6 AM, 15 hours later, about 20 mg remains.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Why it matters for sleep',text:'Adenosine builds up while you are awake and makes you sleepy. Caffeine blocks its receptors. Those 57 mg are still blocking some of them as you try to fall asleep.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'People differ',text:'Half-life varies by person, roughly 3 to 7 hours. With 7 hours, the same drink leaves about 76 mg at bedtime; with 3 hours, about 28 mg.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{half:7});}},
  {title:'Moving the drink',text:'Have the same drink at 1 PM instead and about 43 mg is left at bedtime. Two hours earlier cut it by only about a quarter. To be under 25 mg at 10:30 PM, you would need to drink it by about 9 AM.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{half:5,t1:780});}},
  {lvl:'ap',title:'Solving for the time',text:'For a target A at bedtime, a drink of A₀ needs t = h·log₂(A₀/A) hours. For 160 mg down to 50 mg: 5·log₂ 3.2 ≈ 8.4 hours, so drink it by 2:06 PM for a 10:30 PM bedtime.',pause:true,setup:sim=>{sim.tst=8;BioLab.setValues(sim,{half:5,t1:900,limit:50});}}
 ],
 lab:{bio:'<p><b>Question:</b> How much of your own caffeine is still with you at bedtime?</p><ol><li>Put in the drinks from one school day (yours, or a made-up day) and a bedtime. They stay on this page only.</li><li>Lock in your gut guess, then read the curve.</li><li>Move your latest drink 1, 2 and 3 hours earlier. Write down the bedtime amount each time.</li></ol><p>Write one sentence: in this model, which change cuts the bedtime amount the most?</p>',
  honors:'<p><b>Question:</b> How much does your own half-life matter?</p><ol><li>With your own drinks, record the bedtime amount at half-lives of 3, 4, 5, 6 and 7 hours.</li><li>Set a bedtime target and read the latest time for your latest drink at 3 and 7 hours.</li></ol><p>Explain, using adenosine, why the same drink can affect two friends’ sleep differently.</p>',
  ap:'<p><b>Question:</b> When must a drink be finished to meet a bedtime target?</p><ol><li>Derive t = h·log₂(A₀/A) from A₀(1/2)^(t/h) = A.</li><li>Check it against the tool’s latest-time readout for three drinks and two targets.</li><li>Explain why a second, earlier drink changes the answer.</li></ol><p><b>CER:</b> Claim a latest time for your own day, with evidence from the tool and reasoning from the formula.</p>'},
 terms:[
  {t:'Half-life',d:'The time it takes for half of the caffeine in your body to be cleared. About 5 hours for many healthy adults, roughly 3 to 7 hours from person to person.'},
  {t:'Milligram (mg)',d:'One thousandth of a gram. Caffeine on labels is listed in mg.'},
  {t:'Adenosine',d:'A chemical that builds up in the brain while you are awake and creates sleep pressure.',lvl:'honors'},
  {t:'Receptor',d:'A protein that a specific molecule fits into, triggering a response. Caffeine fits adenosine receptors without triggering them, so it blocks them.',lvl:'honors'},
  {t:'Exponential decay',d:'Losing the same fraction in each equal stretch of time: A(t) = A₀(1/2)^(t/h).',lvl:'ap'},
  {t:'Logarithm',d:'The inverse of an exponent. t = h·log₂(A₀/A) answers “how many half-lives until A₀ falls to A?”',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Each drink adds dose × (1/2)^(hours since the drink ÷ h), where h is the half-life; drinks simply add. The tool assumes all of a drink’s caffeine is in your body the moment you drink it. In reality it takes a while to absorb, so the real curve rises more gently at first. Half-life: about 5 hours for many healthy adults, roughly 3 to 7 hours depending on the person. That range is why Closer look lets you change it.</p><p><b>Caffeine amounts.</b> Round, commonly cited values: 8 oz brewed coffee about 95 mg, 1 shot of espresso about 63 mg, 8 oz black tea about 47 mg, 12 oz cola about 35 mg, 16 oz energy drink about 160 mg. Real drinks vary a lot by brand and size; some energy drinks have 200 to 300 mg. The label is the real number.</p><p><b>Guidelines.</b> The FDA says that for healthy adults, up to about 400 mg a day is not generally associated with negative effects. That figure is for adults, not teens. The American Academy of Pediatrics discourages caffeine for children and adolescents and has said energy drinks are not appropriate for them (clinical report, <i>Pediatrics</i>, 2011).</p><p><b>Your privacy.</b> The drinks and times you enter stay in this page’s memory. They are not saved, not recorded in a data table and not sent anywhere.</p><p><b>Not medical advice.</b> This is a simplified model. A parent or your doctor can answer questions about caffeine and your own health or sleep. Raider MathLab has a separate tool on the math of caffeine half-life; this one is about your own day and your sleep.</p>'
};
BioLab.register(SIM);
})();

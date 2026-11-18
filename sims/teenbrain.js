(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT}=BioLab.h;
/* Developing vs. developed: the same choice lands differently on a brain still under construction.
   Brain timeline (schematic): gray matter matures back to front, prefrontal last (Gogtay et al., PNAS 2004).
   Surgeon General 2016 (e-cigarettes): brain develops until about age 25; nicotine in adolescence can cause addiction and
   harm the developing brain (attention, learning, susceptibility to addiction). Mousley et al., Nature Communications 2025
   (about 4,200 people, ages 0–90): an "adolescent" wiring phase runs from about 9 to 32. No single finish line.
   Dual systems model (Steinberg; Casey): reward responsiveness peaks in adolescence while control matures slowly. Curves here are schematic.
   Alcohol: Grant & Dawson, J Substance Abuse 1997 (NLAES, 27,616 drinkers): dependence ~40% if first drink before 15, 24.5% at 17,
   ~10% at 21–22; risk fell ~14% per year of delay. Early drinking may also mark family or genetic risk (association, not proof of cause).
   Peers: Gardner & Steinberg, Dev Psych 2005 (306 people): early teens about twice as risky in a driving game with peers; adults no difference.
   Sleep: AASM 2016, 13–18 years 8–10 h; adults 7+ h. Melatonin onset shifts later at puberty (Carskadon).
   Caffeine: AAP ≤100 mg/day ages 12–18, none under 12; FDA ~400 mg/day for healthy adults.
   Concussion: Ledoux et al., JAMA Netw Open 2019 (2,716 ages 5–18): improvement mostly in first 4 weeks for ages 8–18;
   Kara et al., Clin J Sport Med 2020 (594 patients): 45% recovered by 14 days, 77% by 4 weeks, no significant age difference;
   Amsterdam consensus 2023 (pediatric): early light activity and less screen time help; extra care past 30 days. */
const START={early:{l:'before 15',r:40},mid:{l:'at 17',r:24.5}},LATE=10;
const RR=sim=>START[sim.p.start].r/LATE;
const ODDS=p=>p/(100-p);
const OR=sim=>ODDS(START[sim.p.start].r)/ODDS(LATE);
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;let line='',yy=y;s.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
const lerp=(a,b,u)=>Math.round(a+(b-a)*u);
const mix=u=>`rgb(${lerp(233,42,u)},${lerp(236,157,u)},${lerp(239,143,u)})`;
const mat=(a50,age)=>1/(1+Math.exp(-(age-a50)/2.2));
/* schematic maturity midpoints, back to front */
const REG={occ:{a:11,l:'Vision'},par:{a:13,l:'Touch'},tem:{a:16,l:'Hearing'},fro:{a:18.5,l:'Planning'},pfc:{a:22,l:'Self-control'}};
const rewardC=a=>0.2+0.8*Math.exp(-Math.pow((a-15.5)/4.5,2));
const controlC=a=>1/(1+Math.exp(-(a-19.5)/3));
const F={
 alcohol:{l:'Alcohol',sh:'Alcohol',reg:['pfc','rew'],teen:'Started drinking young (see the slider on the right)',adult:'Started at 21: about 10% later developed alcohol dependence.',ev:'Survey of 27,616 drinkers (1997). A link, not proof of cause.',go:null},
 nicotine:{l:'Nicotine',sh:'Nicotine',reg:['rew','pfc'],teen:'Can harm attention and learning, and makes addiction more likely (Surgeon General, 2016).',adult:'Still addictive, but the brain is no longer being built around it.',ev:'Government report; much of the brain evidence comes from animal studies.',go:['hooked','Hooked']},
 friends:{l:'Friends watching',sh:'Friends',reg:['rew','pfc'],teen:'Early teens scored about twice as high on risky driving in a game when friends watched.',adult:'Adults drove the same with or without friends watching.',ev:'Experiment with 306 people (Gardner and Steinberg, 2005).',go:['streaks','Likes and streaks']},
 sleep:{l:'Sleep',sh:'Sleep',reg:['clock'],teen:'Need 8 to 10 hours. At puberty the body clock shifts about 2 hours later.',adult:'Need 7 or more hours; the clock runs earlier.',ev:'Expert consensus (AASM, 2016) and lab studies (Carskadon).',go:['sleepdebt','Sleep debt']},
 caffeine:{l:'Caffeine',sh:'Caffeine',reg:['clock'],teen:'Pediatricians: at most 100 mg a day for ages 12 to 18, none under 12.',adult:'FDA: about 400 mg a day is fine for most healthy adults.',ev:'Expert guidance (AAP, FDA).',go:['caffeinecurve','Caffeine at bedtime']},
 concussion:{l:'Concussion',sh:'Concussion',reg:['all'],teen:'In 2,716 kids, symptoms improved mostly in the first 4 weeks. Light activity soon after and less screen time help.',adult:'Often said to heal faster, but a 2020 study of 594 patients found no clear age difference.',ev:'Mixed: studies disagree.',go:['https://rjedtech.github.io/Raider-SportsMedLab/#concussion','SportsMedLab: Concussion']}
};

const SIM={
 id:'teenbrain',hash:'teenbrain',apUnit:7,order:7.5,tab:'Developing vs. developed: why age changes the risk',kind:'Simulation',prereq:[],next:['hooked','betterthan','sleepdebt'],
 skills:{bio:'Ratios and relative risk; reading a model graph · Health (Units 4, 5, 7), Biology, Statistics',honors:'Relative risk as “percent more likely”; association vs. cause · Health, Statistics',ap:'Odds ratio vs. relative risk; confounding · AP Statistics (Unit 3), AP Psychology (Unit 1)'},
 card:'Slide from age 10 to 30 and watch a brain finish building, back to front. Then compare teens and adults on nicotine, alcohol, sleep, caffeine, friends and concussions.',
 title:'Developing vs. developed: why age changes the risk',
 lede:{bio:'The same choice can land differently on a brain that is still being built. Your brain matures from back to front, and the parts for planning and self-control finish last. That is not an insult; it is biology, and it is also why companies want customers young.',
  honors:'Development is gradual. The prefrontal cortex keeps maturing through the 20s, while the reward system is especially responsive in the teen years. Here you can compare what research finds for teens and adults, and how strong each piece of evidence is.',
  ap:'Relative risk compares rates; the odds ratio compares odds. Both describe an association. Whether early exposure causes later harm, or early starters already differ, is a confounding question you can test with study design.'},
 scale:'The brain colors and the two curves are schematic, drawn from published patterns. The teen and adult facts are real and cited.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Explore',
 controls:[
  {id:'guess',label:'Your gut: how many times as likely?',type:'range',min:1,max:8,step:0.5,def:2,unit:'×'},
  {id:'age',label:'Age',type:'range',min:10,max:30,step:1,def:16,unit:'',noGut:true},
  {id:'look',label:'Compare teens and adults on',type:'seg',def:'alcohol',noGut:true,options:Object.keys(F).map(v=>({v,l:F[v].sh}))},
  {id:'start',label:'Started drinking',type:'seg',def:'early',noGut:true,onChange:clearGut,options:[{v:'early',l:'Before 15'},{v:'mid',l:'At 17'}]},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'early',label:'Early starters with dependence',unit:'%',d:1,min:0,max:100,get:sim=>hid(sim,START[sim.p.start].r)},
  {id:'late',label:'Started at 21 with dependence',unit:'%',d:0,min:0,max:100,get:sim=>hid(sim,LATE)},
  {id:'rr',label:'Relative risk (early ÷ late)',unit:'×',d:2,min:0,max:null,get:sim=>hid(sim,RR(sim))},
  {id:'more',label:'Percent more likely',unit:'%',d:0,min:0,max:null,lvl:'honors',get:sim=>hid(sim,(RR(sim)-1)*100)},
  {id:'or',label:'Odds ratio',unit:'×',d:2,min:0,max:null,lvl:'ap',get:sim=>hid(sim,OR(sim))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3,K=Math.min(k,1.6);
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const age=stg===1?10+Math.min(20,tau*2.2):sim.p.age;
  const look=stg===3?'friends':stg===4?'alcohol':stg===5?'nicotine':stg===6?'sleep':stg===7?'concussion':sim.p.look;const FF=F[look];
  /* ---------- brain, side view, front on the left ---------- */
  const cx=bg?222:235,cy=bg?112:118,rx=bg?178:168,ry=bg?84:86;
  const lit=r=>stg===1||stg===2?false:(FF.reg.includes(r)||FF.reg.includes('all'));
  txt(ctx,'Age '+Math.round(age),12,28,{s:16*K,w:800});
  /* cerebellum and brainstem */
  ctx.fillStyle=mix(mat(9,age));ctx.beginPath();ctx.ellipse(cx+rx*0.62,cy+ry*0.82,rx*0.26,ry*0.3,0,0,7);ctx.fill();
  ctx.fillStyle='#ced4da';rr(ctx,cx+rx*0.25,cy+ry*0.7,22,ry*0.55,8);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.clip();
  const band=(x0,x1,key)=>{ctx.fillStyle=mix(mat(REG[key].a,age));ctx.fillRect(x0,cy-ry-2,x1-x0,2*ry+4);};
  band(cx-rx-2,cx-rx*0.62,'pfc');band(cx-rx*0.62,cx-rx*0.15,'fro');band(cx-rx*0.15,cx+rx*0.42,'par');band(cx+rx*0.42,cx+rx+2,'occ');
  ctx.fillStyle=mix(mat(REG.tem.a,age));ctx.beginPath();ctx.moveTo(cx-rx*0.6,cy+ry*0.25);ctx.quadraticCurveTo(cx,cy+ry*0.05,cx+rx*0.42,cy+ry*0.3);ctx.lineTo(cx+rx*0.42,cy+ry+4);ctx.lineTo(cx-rx*0.6,cy+ry+4);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.85)';ctx.lineWidth=2;[[-0.62,-1],[-0.15,-1],[0.42,-1]].forEach(([u])=>{ctx.beginPath();ctx.moveTo(cx+rx*u,cy-ry);ctx.lineTo(cx+rx*u,cy+ry*0.25);ctx.stroke();});
  ctx.beginPath();ctx.moveTo(cx-rx*0.6,cy+ry*0.25);ctx.quadraticCurveTo(cx,cy+ry*0.05,cx+rx*0.42,cy+ry*0.3);ctx.stroke();
  ctx.restore();
  ctx.strokeStyle=look==='concussion'&&stg!==1&&stg!==2?'#d00000':PAL['cv-ink'];ctx.lineWidth=look==='concussion'&&stg!==1&&stg!==2?4:2;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.stroke();
  if(lit('pfc')){ctx.strokeStyle='#d00000';ctx.lineWidth=3;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(cx-rx*0.78,cy-ry*0.15,rx*0.2,ry*0.55,0,0,7);ctx.stroke();ctx.setLineDash([]);}
  /* reward hub (deep) and body clock (deep) */
  const rw={x:cx-rx*0.28,y:cy+ry*0.15},ck={x:cx-rx*0.05,y:cy+ry*0.42};
  ctx.fillStyle=lit('rew')?'#7b2cbf':'rgba(123,44,191,0.45)';ctx.beginPath();ctx.arc(rw.x,rw.y,lit('rew')?11:8,0,7);ctx.fill();
  ctx.fillStyle=lit('clock')?'#f4a261':'rgba(244,162,97,0.5)';ctx.beginPath();ctx.arc(ck.x,ck.y,lit('clock')?10:7,0,7);ctx.fill();
  if(!bg){[['pfc',cx-rx*0.8,cy-ry*0.2],['fro',cx-rx*0.385,cy-ry*0.35],['par',cx+rx*0.135,cy-ry*0.35],['occ',cx+rx*0.71,cy-ry*0.05],['tem',cx+rx*0.25,cy+ry*0.72]].forEach(([key,x,y])=>{const m=mat(REG[key].a,age);txt(ctx,REG[key].l,x,y,{s:11.5*K,w:700,a:'center',c:m>0.55?'#fff':PAL['cv-ink']});});
   txt(ctx,'Reward hub',rw.x-14,rw.y+24,{s:11.5*K,w:700,c:'#7b2cbf',a:'center'});txt(ctx,'Body clock',ck.x-14,ck.y+24,{s:11.5*K,w:700,c:'#c2410c',a:'right'});}
  else{txt(ctx,'Self-control',cx-rx*0.82,cy-ry*0.4,{s:11.5*K,w:700,a:'center',c:mat(22,age)>0.55?'#fff':PAL['cv-ink']});}
  /* legend */
  const lgY=bg?226:228;rr(ctx,12,lgY-10,70,12,6);const g=ctx.createLinearGradient(12,0,82,0);g.addColorStop(0,mix(0));g.addColorStop(1,mix(1));ctx.fillStyle=g;ctx.fill();
  txt(ctx,bg?'building → mature; front is left':'still building → mature (schematic; front of head on the left)',90,lgY,{s:11.5*K,c:PAL['cv-soft']});
  /* ---------- the two curves ---------- */
  const L=50,R=bg?452:470,T=bg?262:268,B=bg?400:412;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  [10,15,20,25,30].forEach(a=>{const x=L+(R-L)*(a-10)/20;txt(ctx,String(a),x,B+15*K,{s:11.5*K,c:PAL['cv-soft'],a:'center'});});
  const curve=(fn,col)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(let a=10;a<=30.01;a+=0.25){const x=L+(R-L)*(a-10)/20,y=B-(B-T)*fn(a);a===10?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();};
  curve(rewardC,'#7b2cbf');curve(controlC,'#2a9d8f');
  const xa=L+(R-L)*(age-10)/20;ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([3,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xa,T-4);ctx.lineTo(xa,B);ctx.stroke();ctx.setLineDash([]);
  [[rewardC,'#7b2cbf'],[controlC,'#2a9d8f']].forEach(([fn,c])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(xa,B-(B-T)*fn(age),5,0,7);ctx.fill();});
  txt(ctx,bg?'Reward pull':'Reward pull (gas pedal)',L+4,T-6,{s:11.5*K,w:800,c:'#7b2cbf'});
  txt(ctx,bg?'Self-control':'Self-control (brakes)',R,T-6,{s:11.5*K,w:800,c:'#2a9d8f',a:'right'});
  if(!bg)txt(ctx,'Schematic, from the dual systems model: a model, not measured data',L,B+31*K,{s:11.5*K,c:PAL['cv-soft']});
  /* ---------- right: teen vs adult ---------- */
  const X=bg?470:494,W=bg?318:294;
  if(stg===1||stg===2){rr(ctx,X,16,W,418,14);ctx.fillStyle=PAL['card'];ctx.fill();
   txt(ctx,stg===1?'Built back to front':'Gas pedal and brakes',X+14,44,{s:15*K,w:800});
   wrap(ctx,stg===1?'Areas for vision and touch mature first. Areas for planning and self-control mature last, through the 20s. There is no single finish line.':'In the teen years the reward system responds strongly, while self-control is still building. The gap is widest in the mid-teens.',X+14,72,W-28,18*K,{s:12.5*K});
   return;}
  rr(ctx,X,16,W,418,14);ctx.fillStyle=PAL['card'];ctx.fill();
  txt(ctx,FF.l+': teen vs. adult',X+14,42,{s:15*K,w:800});
  let y=70;
  txt(ctx,'TEEN',X+14,y,{s:11.5*K,w:800,c:'#7b2cbf'});
  if(look==='alcohol'){const r=START[sim.p.start].r;y=wrap(ctx,'First drink '+START[sim.p.start].l+':',X+14,y+18*K,W-28,16*K,{s:12.5*K})+8;
   const bw=W-28;rr(ctx,X+14,y,bw,16,8);ctx.fillStyle=PAL['line'];ctx.fill();
   if(sh){rr(ctx,X+14,y,bw*r/100,16,8);ctx.fillStyle='#7b2cbf';ctx.fill();txt(ctx,f1(r)+'% later dependent',X+14,y+34*Math.min(K,1.2),{s:12.5*K,w:800,c:'#7b2cbf'});}
   else txt(ctx,'? Lock in your gut answer',X+14,y+34*Math.min(K,1.2),{s:12.5*K,w:700,c:PAL['cv-soft']});
   y+=58*Math.min(K,1.2);txt(ctx,'ADULT',X+14,y,{s:11.5*K,w:800,c:'#2a9d8f'});y=wrap(ctx,'First drink at 21:',X+14,y+18*K,W-28,16*K,{s:12.5*K})+8;
   rr(ctx,X+14,y,bw,16,8);ctx.fillStyle=PAL['line'];ctx.fill();if(sh){rr(ctx,X+14,y,bw*LATE/100,16,8);ctx.fillStyle='#2a9d8f';ctx.fill();txt(ctx,'10% later dependent',X+14,y+34*Math.min(K,1.2),{s:12.5*K,w:800,c:'#2a9d8f'});}
   y+=52*Math.min(K,1.2);
   if(sh){const G=stg>=99?GS(sim):null;txt(ctx,f1(RR(sim))+' times as likely'+(G?' (your gut: '+G.guess+'×)':''),X+14,y,{s:13*K,w:800});y+=8;}}
  else{y=wrap(ctx,FF.teen,X+14,y+18*K,W-28,16*K,{s:12.5*K})+22*K;
   txt(ctx,'ADULT',X+14,y,{s:11.5*K,w:800,c:'#2a9d8f'});y=wrap(ctx,FF.adult,X+14,y+18*K,W-28,16*K,{s:12.5*K})+8;}
  y+=16*K;ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(X+14,y-10);ctx.lineTo(X+W-14,y-10);ctx.stroke();
  y=wrap(ctx,'Evidence: '+FF.ev,X+14,y+6,W-28,15*K,{s:11.5*K,c:PAL['cv-soft']});
  if(FF.go)txt(ctx,'Explore: '+FF.go[1]+' →',X+14,Math.min(y+24*K,424),{s:12*K,w:800,c:PAL['rj']});
 },
 narrate(sim){const FF=F[sim.p.look];
  if(!shown(sim))return `A national survey asked 27,616 adults when they first drank and whether they later developed alcohol dependence. <b>How many times as likely were people who started ${START[sim.p.start].l}, compared with those who waited until 21?</b>`;
  return `Started ${START[sim.p.start].l}: <b>${f1(START[sim.p.start].r)}%</b>. Started at 21: <b>10%</b>. That is <b>${f1(RR(sim))} times</b> as likely. It is a strong link, but not proof that the alcohol caused it: early starters may also differ in family and genes. Age ${sim.p.age}: the self-control areas are ${sim.p.age<20?'still building':sim.p.age<26?'nearly mature':'mature, though the brain keeps changing'}. Now looking at: ${FF.l}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a national survey of adults who drink. Some had their first drink young; others waited until 21. Drag the slider to how many times as likely the young starters were to develop alcohol dependence later in life, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-RR(sim)),guess:sim.p.guess,label:sim.p.guess+'×'};},
  solve(sim){const v=RR(sim);return {v:0,guess:Math.round(v*10)/10,label:f1(v)+'×'};},
  hint:{bio:'Lock in your gut answer. Then you will work out the ratio.'},
  calc:{unit:'×',d:2,tol:a=>0.06,
   prompt:{bio:sim=>`Of people whose first drink was <b>${START[sim.p.start].l}</b>, <b>${f1(START[sim.p.start].r)}%</b> later developed alcohol dependence. Of people who started at <b>21</b>, <b>10%</b> did. How many times as likely is the early group?`},
   answer:RR,
   hint:'Divide the early group’s percent by the later group’s percent.',
   steps(sim){return [`Relative risk = early rate ÷ late rate.`,`${f1(START[sim.p.start].r)} ÷ 10 = <b>${f1(RR(sim))}</b>.`,`So the early group was ${f1(RR(sim))} times as likely, or ${Math.round((RR(sim)-1)*100)}% more likely.`];}},
  formula:sim=>`${f1(START[sim.p.start].r)}% ÷ 10% = ${f1(RR(sim))}×`,
  how:{bio:'Divide the two rates.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<0.6)return `Your gut was close: <b>${f1(m.guess)}×</b>.`;
   return `Your gut was off by <b>${f1(off)}</b>. The survey says <b>${f1(m.guess)}×</b>. Before you decide what it means: a link this strong still is not proof that alcohol alone caused it. Early starters can differ in family and genes too.`;},
  again(sim){sim.p.start=sim.p.start==='early'?'mid':'early';sim.p.guess=2;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Pediatricians advise at most 100 mg of caffeine a day for ages 12 to 18. The FDA says about 400 mg is fine for most healthy adults. How many times larger is the adult figure?',answer:4,tol:0.05,unit:'×',d:1,hint:'400 ÷ 100',explain:'400 ÷ 100 = 4. One 16 oz energy drink with 200 mg is twice the teen limit.'},
  {lvl:'bio',instant:true,q:'Which part of the brain finishes maturing last?',choices:['The areas for vision','The prefrontal cortex, for planning and self-control','The cerebellum'],correct:1,explain:'Brain scans show maturation running from back to front, with the prefrontal cortex last, through the 20s.'},
  {lvl:'bio',instant:true,q:'In the driving-game experiment, what changed for early teens but not adults?',choices:['They drove riskier when friends were watching','They drove slower at night','They crashed less with friends'],correct:0,explain:'Early teens scored about twice as high on risky driving with friends watching; adults did not change.'},
  {lvl:'honors',instant:true,q:'People who start drinking before 15 are about 4 times as likely to develop dependence. Why might alcohol not be the whole cause?',choices:['Early starters may also differ in family, stress or genes that raise risk on their own','Surveys are always wrong','Alcohol has no effect on teens'],correct:0,explain:'That is confounding. Researchers find that part of the link is shared family and genetic risk, and part is likely the early drinking itself.'},
  {lvl:'ap',kind:'num',q:'Early starters: 40% dependent. Started at 21: 10%. What is the odds ratio? (Odds = p ÷ (1 − p).)',answer:6,tol:0.05,unit:'×',d:1,hint:'(0.40/0.60) ÷ (0.10/0.90)',explain:'0.667 ÷ 0.111 = 6.0. The odds ratio (6) is bigger than the relative risk (4) because the outcome is common; reporters often mix them up.'}
 ],
 tour:[
  {title:'Built back to front',text:'Watch the age run from 10 to 30. The brain matures gradually, from back to front: areas for vision and touch first, areas for planning and self-control last. The Surgeon General’s report says development continues until about age 25; a 2025 Cambridge study of about 4,200 people found brain wiring keeps changing into the early 30s. There is no single finish line.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;}},
  {title:'Gas pedal and brakes',text:'One widely used model: in the teen years the reward system responds strongly to new and exciting things, while self-control is still building. The curves are a sketch of that idea, not measurements, and scientists still debate the details. The point is not that teens are bad at decisions: alone and calm, teens often decide as well as adults.',pause:true,setup:sim=>{sim.tst=2;BioLab.setValues(sim,{age:16});}},
  {title:'Friends in the car',text:'In a 2005 experiment, 306 people played a driving game, alone or with friends watching. Early teens scored about twice as high on risky driving when friends watched. Adults drove the same either way. This is one reason likes, streaks and group chats pull so hard in the teen years.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Starting young',text:'A survey of 27,616 drinkers found that about 40% of people whose first drink came before 15 later developed alcohol dependence, compared with about 10% of those who waited until 21. Risk fell with each year people waited. Part of that link may be family and genes, not only the alcohol.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{start:'early'});}},
  {title:'Nicotine on a developing brain',text:'The Surgeon General’s 2016 report concluded that nicotine during adolescence can cause addiction and can harm the developing brain, including attention and learning. That is why the same pouch is a different question for a teen than for an adult who already smokes. See Hooked and Better than smoking.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Sleep and caffeine',text:'Teens need 8 to 10 hours of sleep, and at puberty the body clock shifts about 2 hours later, so early school starts collide with biology. Pediatricians advise at most 100 mg of caffeine a day for ages 12 to 18; the adult figure is about 400 mg.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Concussions',text:'Doctors are extra careful with young athletes: in a study of 2,716 kids, symptoms improved mostly in the first 4 weeks, and light activity and less screen time help. Are teens slower than adults? Some studies say yes; a 2020 study of 594 patients found no clear age difference. When evidence is mixed, say so.',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'honors',title:'The good news',text:'A brain that is still building is also a brain that learns fast. The same flexibility that lets a habit stick also lets a skill, a language or a good routine stick. That is why the choices of these years matter, and why companies want customers young.',pause:true,setup:sim=>{sim.tst=99;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> What changes between 15 and 25?</p><ol><li>Set the age to 13, 16, 20 and 25. Describe which brain areas look mature each time.</li><li>Switch the comparison between all six topics. For each, write the teen fact and the adult fact.</li><li>Rank the six by strength of evidence.</li></ol><p>Write one sentence: why might a company care how old its new customers are?</p>',
  honors:'<p><b>Question:</b> How much more likely?</p><ol><li>Compute the relative risk and the “percent more likely” for starting before 15 and at 17.</li><li>List two things other than alcohol that might explain part of the difference.</li></ol><p>Design a study that could separate the effect of early drinking from family risk (hint: compare siblings or twins).</p>',
  ap:'<p><b>Question:</b> Relative risk or odds ratio?</p><ol><li>Compute both for each starting age.</li><li>Explain why the odds ratio is larger, and when the two are nearly equal.</li></ol><p><b>CER:</b> Is the 1997 survey good evidence that early drinking <i>causes</i> later dependence? Use the idea of confounding.</p>'},
 terms:[
  {t:'Prefrontal cortex',d:'The front of the brain’s outer layer, used for planning, weighing consequences and self-control. It matures last.'},
  {t:'Reward system',d:'Brain circuits, including the nucleus accumbens, that respond to rewards and drive you to seek them again.'},
  {t:'Relative risk',d:'One group’s rate divided by another’s. 40% ÷ 10% = 4 times as likely.'},
  {t:'Confounding',d:'When a third factor (like family history) affects both the exposure and the outcome, so the link may not be cause and effect.',lvl:'honors'},
  {t:'Odds ratio',d:'The odds in one group divided by the odds in another. Odds = p ÷ (1 − p).',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The brain colors use a simple S-curve for each region, ordered back to front as brain-imaging studies found; the ages are a sketch, and real people vary. The reward and self-control curves sketch the dual systems model; they are not data. The teen and adult facts on the right are cited below.</p><p><b>Sources.</b> Gogtay et al., <i>PNAS</i>, 2004 (back-to-front maturation). U.S. Surgeon General, <i>E-Cigarette Use Among Youth and Young Adults</i>, 2016. Mousley et al., <i>Nature Communications</i>, 2025 (brain wiring phases across about 4,200 people, ages 0 to 90). Steinberg, “A dual systems model of adolescent risk-taking,” <i>Developmental Psychobiology</i>, 2010. Gardner and Steinberg, <i>Developmental Psychology</i>, 2005 (306 people). Grant and Dawson, <i>Journal of Substance Abuse</i>, 1997 (27,616 drinkers; NIAAA news release, Jan. 14, 1998). American Academy of Sleep Medicine, 2016 (8 to 10 hours for ages 13 to 18) and Carskadon (later melatonin timing at puberty). American Academy of Pediatrics (caffeine ≤100 mg a day for ages 12 to 18); FDA (about 400 mg for healthy adults). Ledoux et al., <i>JAMA Network Open</i>, 2019 (2,716 children); Kara et al., <i>Clinical Journal of Sport Medicine</i>, 2020 (594 patients); Amsterdam Consensus, pediatric recommendations, <i>Pediatrics</i>, 2024.</p><p><b>Related:</b> <a href="#hooked">Hooked</a>, <a href="#betterthan">Better than smoking?</a>, <a href="#sleepdebt">Sleep debt</a>, <a href="#caffeinecurve">Caffeine at bedtime</a>, <a href="#streaks">Likes and streaks</a>, and <a href="https://rjedtech.github.io/Raider-SportsMedLab/#concussion" target="_blank" rel="noopener">Concussion: sideline to return</a> in Raider SportsMedLab.</p>'
};
BioLab.register(SIM);
})();

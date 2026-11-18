(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Likes and streaks: two design moves that bring you back.
   Streak survival: both people must snap every day, so P(streak lasts n days) = (p·q)ⁿ.
   Mean streak length (days kept before the first miss) = pq ÷ (1 − pq). Days to a 50% chance of losing it = ln 0.5 ÷ ln(pq).
   Snapstreaks: added April 2015 with Snapchat's friend emojis. Restore: one free, then $0.99 each in the US (TechCrunch, March 2023).
   Bits of Freedom (Netherlands, March 2026, 300 people aged 13–21): 86% keep Snapstreaks; of those, 25% have paid to restore one; 51% would feel bad if a friend broke one.
   Likes: Facebook's Like button, 2009. Sherman et al., Psychological Science 27(7), 2016: 32 teens 13–18 in an fMRI scanner viewing a simulated Instagram;
   like counts were assigned by the researchers. Teens were more likely to like photos shown with many likes; their own photos with many likes drew more
   activity in the nucleus accumbens, a hub of the brain's reward circuitry. Sean Parker (Axios, Nov 2017): "a social-validation feedback loop."
   Instagram and Facebook let everyone hide like counts from May 26, 2021. TikTok: 60-minute default daily limit for under-18 accounts (March 2023), passcode to continue.
   Courts: Los Angeles jury, March 25, 2026: Meta and YouTube negligent in design; $3M + $3M punitive; companies disagree and may appeal.
   Meta settlement with 48 states and DC, Aug 26, 2026: up to $18 billion; limits on like counts, no push notifications in weekday school hours; no admission of wrongdoing.
   Snap trial, Los Angeles, opening statements Nov 4, 2026: claims that Snap Streaks, Snap Scores and notifications drove compulsive use (allegations, trial ongoing). */
const pq=sim=>(sim.p.me/100)*(sim.p.fr/100);
const alive=sim=>100*Math.pow(pq(sim),sim.p.days);
const mean=sim=>pq(sim)/(1-pq(sim));
const half=sim=>Math.log(0.5)/Math.log(pq(sim));
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* repeatable "random" day draws, so the animation is the same every time */
const U=j=>{const x=Math.sin(j*12.9898+78.233)*43758.5453;return x-Math.floor(x);};
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;let line='',yy=y;s.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
function flame(ctx,x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-s);ctx.bezierCurveTo(x+s*0.9,y-s*0.3,x+s*0.7,y+s*0.6,x,y+s*0.6);ctx.bezierCurveTo(x-s*0.7,y+s*0.6,x-s*0.9,y-s*0.1,x-s*0.15,y-s*0.55);ctx.bezierCurveTo(x-s*0.1,y-s*0.2,x+s*0.1,y-s*0.5,x,y-s);ctx.fill();}
const LIKES={few:{n:'4 likes',bar:0.3,tap:'Less likely to tap like too'},many:{n:'1,204 likes',bar:0.85,tap:'More likely to tap like too'},hidden:{n:'Likes hidden',bar:null,tap:'No count to compare'}};

const SIM={
 id:'streaks',hash:'streaks',apUnit:7,order:3.5,tab:'Likes and streaks: built to bring you back',kind:'Simulation',prereq:['scroll'],next:['companion','feedbuilder'],
 skills:{bio:'Probability of independent events: multiply; exponents · Algebra 1, Statistics, Health (Unit 6)',honors:'Repeated multiplication, (pq)ⁿ, and the average run before a miss · Algebra 2, Statistics, Health',ap:'Geometric distribution and logarithms: solve (pq)ⁿ = 0.5 · AP Statistics (Unit 4), AP Precalculus (Unit 2)'},
 card:'Keep a made-up Snapstreak alive and see why “every day” is so hard on purpose. Then see what a like count does to a teenage brain, and what courts and states have done about it.',
 title:'Likes and streaks: built to bring you back',
 lede:{bio:'A like count and a streak counter are small numbers on a screen. Both were designed to bring you back. Likes reward you with attention; streaks threaten to take away something you built. Here you will find the math of a streak and the science of a like.',
  honors:'Companies measure success by daily active users. A streak turns “open the app today” into a rule, and the math shows how hard that rule is to keep. A like count turns approval into a number you can compare.',
  ap:'If two people each snap on a given day with probabilities p and q, and days are independent, the streak lasts n days with probability (pq)ⁿ. That is a geometric model, and logarithms tell you when it is more likely gone than alive.'},
 scale:'A made-up streak between two friends. The study numbers and dates are real; the 99% chances are what you set.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Your streak (made up)',
 controls:[
  {id:'guess',label:'Your gut: chance the streak reaches the goal',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'me',label:'Your chance of snapping on a given day',type:'range',min:90,max:100,step:0.5,def:99,unit:'%',noGut:true,onChange:clearGut,help:'99% means you miss about 3 or 4 days a year.'},
  {id:'fr',label:'Your friend’s chance',type:'range',min:90,max:100,step:0.5,def:99,unit:'%',noGut:true,onChange:clearGut},
  {id:'days',label:'Streak goal',type:'range',min:10,max:365,step:5,def:100,unit:' days',noGut:true,onChange:clearGut},
  {id:'likes',label:'Like count on your post',type:'seg',def:'many',noGut:true,options:[{v:'few',l:'Few'},{v:'many',l:'Many'},{v:'hidden',l:'Hidden'}]},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'alive',label:'Chance the streak reaches the goal',unit:'%',d:1,min:0,max:100,get:sim=>hid(sim,alive(sim))},
  {id:'day',label:'Chance you both snap on one day',unit:'%',d:2,min:0,max:100,get:sim=>hid(sim,100*pq(sim))},
  {id:'mean',label:'Average streak before the first miss',unit:'days',d:0,min:0,max:null,lvl:'honors',get:sim=>hid(sim,pq(sim)>=1?null:mean(sim))},
  {id:'half',label:'Days until it is more likely lost than alive',unit:'days',d:1,min:0,max:null,lvl:'ap',get:sim=>hid(sim,pq(sim)>=1?null:half(sim))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3,K=Math.min(k,1.6);
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const P=pq(sim),N=sim.p.days;
  /* ---------- left: the streak ---------- */
  const L=56,R=470,T=58,B=bg?250:268;
  txt(ctx,(stg===1||stg===2||stg===6||stg===7)?'How the design changed':bg?'Will the streak last?':'Will the streak last? Chance it is still alive',L-40,26,{s:14*K,w:800});
  const TL=[[2009,'Facebook adds the Like button',[1]],[2015,'Snapchat adds streaks',[3]],[2016,'UCLA study: likes and the teen brain',[2]],[2021,'Instagram lets you hide like counts',[7]],[2023,'TikTok: 60-minute default for teens',[7]],[2026,'Jury verdict; Meta settles with states',[6]]];
  if(stg===1||stg===2||stg===6||stg===7){TL.forEach((e,j)=>{const y=T+8+j*(bg?33:36),on=e[2].includes(stg);ctx.fillStyle=on?PAL['rj']:PAL['line'];ctx.beginPath();ctx.arc(L-24,y-5,on?8:6,0,7);ctx.fill();if(j<TL.length-1){ctx.strokeStyle=PAL['line'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L-24,y+4);ctx.lineTo(L-24,y+(bg?24:27));ctx.stroke();}
    txt(ctx,String(e[0]),L-6,y,{s:13*K,w:800,c:on?PAL['rj']:PAL['cv-soft']});txt(ctx,bg?e[1].split(':')[0].split(';')[0]:e[1],L+42*K,y,{s:(bg?11.5:13)*K,w:on?800:400,c:on?PAL['cv-ink']:PAL['cv-soft']});});}
  else{
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
   [0,25,50,75,100].forEach(v=>{const y=B-(B-T)*v/100;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();txt(ctx,v+'%',L-6,y+4,{s:11.5*K,c:PAL['cv-soft'],a:'right'});});
   [0,100,200,300,365].forEach(d=>{const x=L+(R-L)*d/365;txt(ctx,String(d),x,B+16*K,{s:11.5*K,c:PAL['cv-soft'],a:'center'});});
   txt(ctx,'days in a row',(L+R)/2,B+31*K,{s:11.5*K,c:PAL['cv-soft'],a:'center'});
   if(sh){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();for(let d=0;d<=365;d+=1){const x=L+(R-L)*d/365,y=B-(B-T)*Math.pow(P,d);d?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    const xn=L+(R-L)*N/365,yn=B-(B-T)*alive(sim)/100;ctx.strokeStyle=PAL['s4'];ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xn,B);ctx.lineTo(xn,yn);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(xn,yn,6,0,7);ctx.fill();
    const lab=f1(alive(sim))+'% at day '+N;ctx.font='800 '+(13*K)+'px '+FONT;const tw=ctx.measureText(lab).width;const lx=clamp(xn+10,L+4,R-tw-6),ly=clamp(yn-12,T+14,B-8);
    rr(ctx,lx-5,ly-14*K,tw+10,19*K,5);ctx.fillStyle=PAL['card'];ctx.fill();txt(ctx,lab,lx,ly,{s:13*K,w:800,c:PAL['s4']});
    const G=stg>=99?GS(sim):null;if(G){const yg=B-(B-T)*G.guess/100;ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(L,yg);ctx.lineTo(R,yg);ctx.stroke();ctx.setLineDash([]);txt(ctx,'your gut: '+G.guess+'%',R-4,yg-5,{s:11.5*K,c:PAL['cv-soft'],a:'right'});}}
   else pill(ctx,'Lock in your gut answer to see the curve',(L+R)/2,(T+B)/2,PAL['muted'],'#fff',12.5*K);}
  /* the streak counter: days tick by; a miss (draw > p·q) resets it */
  const run=stg>=99?sh:(stg>=3&&stg<=5);
  const sy=bg?316:330;
  if(run||stg<3){const d=run?Math.floor(tau/0.22)%420:0;let s=0,lastMiss=-99;for(let j=0;j<=d;j++){if(stg===5&&j===12){s=0;lastMiss=j;continue;}if(stg!==5&&U(j)>P){s=0;lastMiss=j;}else s++;}
   const broke=run&&d-lastMiss<9&&lastMiss>=0;
   flame(ctx,L-14,sy+6,17,broke?'#9aa0a6':'#ff7b00');txt(ctx,String(run?(broke?0:Math.max(0,lastMiss>=0?s-8:s)):0),L+8,sy+14,{s:24*K,w:800,c:broke?PAL['cv-soft']:'#c2410c'});
   const cw=bg?11:13.5,cx0=L+70*K;const NC=bg?14:18;for(let j=0;j<NC;j++){const day=d-NC+1+j;if(day<0)continue;const miss=stg===5?day===12:U(day)>P;rr(ctx,cx0+j*(cw+3),sy-6,cw,22,3);ctx.fillStyle=miss?'#d00000':'#ffb066';ctx.fill();}
   if(broke)pill(ctx,stg===5||stg>=99?'Streak lost. Restore for $0.99?':'Streak lost',(L+R)/2,sy+52*Math.min(K,1.3),'#d00000','#fff',12.5*K);
   else txt(ctx,bg?'Each square: a day you both snapped':'Each square is a day you both snapped; red is a miss',L-40,sy+46*Math.min(K,1.3),{s:11.5*K,c:PAL['cv-soft']});}
  /* ---------- right: the like count ---------- */
  const X=500,W=286,lk=stg===1||stg===2?'many':stg===7?'hidden':sim.p.likes,Lk=LIKES[lk];
  rr(ctx,X,16,W,bg?236:250,14);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#8ecae6';rr(ctx,X+14,30,W-28,bg?92:110,10);ctx.fill();ctx.fillStyle='#219ebc';ctx.beginPath();ctx.moveTo(X+30,bg?118:136);ctx.lineTo(X+110,bg?68:72);ctx.lineTo(X+170,bg?104:118);ctx.lineTo(X+210,bg?84:92);ctx.lineTo(X+W-30,bg?118:136);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(X+W-60,bg?56:60,14,0,7);ctx.fill();
  const hy=bg?146:168;ctx.fillStyle=lk==='hidden'?'#9aa0a6':'#e63946';ctx.beginPath();const hx=X+26;ctx.moveTo(hx,hy+6);ctx.bezierCurveTo(hx-14,hy-4,hx-6,hy-16,hx,hy-7);ctx.bezierCurveTo(hx+6,hy-16,hx+14,hy-4,hx,hy+6);ctx.fill();
  txt(ctx,Lk.n,X+44,hy+4,{s:14*K,w:800});
  const by=hy+(bg?30:34);txt(ctx,'Reward-hub response',X+14,by,{s:11.5*K,c:PAL['cv-soft']});if(Lk.bar!=null)txt(ctx,Lk.bar>0.5?'higher':'lower',X+W-16,by,{s:11.5*K,w:700,c:'#7b2cbf',a:'right'});
  rr(ctx,X+14,by+8,W-28,14,7);ctx.fillStyle=PAL['line'];ctx.fill();
  if(Lk.bar!=null){rr(ctx,X+14,by+8,(W-28)*Lk.bar,14,7);ctx.fillStyle='#7b2cbf';ctx.fill();}
  txt(ctx,Lk.tap,X+14,by+42*Math.min(K,1.2),{s:11.5*K,c:PAL['cv-ink']});
  /* ---------- right, below: what changed ---------- */
  const ny=bg?300:296,nw=W;let note='';
  if(stg===1)note='Facebook’s Like button turned approval into a number. A Facebook founder later called it “a social-validation feedback loop.”';
  else if(stg===2)note='UCLA, 2016: teens in a brain scanner saw a fake Instagram. Their own photos with many likes lit up a reward hub more.';
  else if(stg===3||stg===4)note='Snapchat added streaks in 2015. Miss one day, either of you, and the count goes back to zero.';
  else if(stg===5)note='One restore is free; after that, $0.99 each. In a 2026 Dutch survey, 25% of teens with streaks had paid to restore one.';
  else if(stg===6)note=bg?'2026: a jury found Meta and YouTube negligent; Meta settled with 48 states.':'2026: an LA jury found Meta and YouTube negligent in design. Meta settled with 48 states and DC, agreeing to limit like counts. Snap is on trial now over streaks.';
  else if(stg===7)note='You can hide like counts, mute streak alerts and set a daily limit. TikTok sets 60 minutes for under-18s by default.';
  else note=lk==='hidden'?'Instagram has let everyone hide like counts since 2021. It said this helped some people and annoyed others.':'Pattern from a brain-scan study of 32 teens (Sherman, 2016), not a measure of you.';
  wrap(ctx,note,X,ny,nw,(bg?15:16)*K,{s:(bg?12:12.5)*K,c:PAL['cv-ink']});
 },
 narrate(sim){if(!shown(sim))return `You and a friend each snap on ${sim.p.me}% and ${sim.p.fr}% of days. <b>What is the chance your streak makes it to ${sim.p.days} days?</b>`;
  const a=alive(sim);return `Both of you have to snap <b>every</b> day, so each day survives with chance ${f1(100*pq(sim))}%, and the streak reaches day ${sim.p.days} with chance <b>${f1(a)}%</b>. `+(a<50?'A streak that long is more likely lost than kept, unless opening the app becomes a daily rule. That is the design.':'Push the goal out and watch the chance fall.');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a made-up Snapstreak. You and a friend each remember to snap 99% of days, missing only 3 or 4 days a year. Drag the slider to the chance your streak makes it to 100 days, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-alive(sim)),guess:sim.p.guess,label:sim.p.guess+'%'};},
  solve(sim){const v=alive(sim);return {v:0,guess:Math.round(v*10)/10,label:f1(v)+'%'};},
  hint:{bio:'Lock in your gut answer. Then you will work out the chance.'},
  calc:{unit:'%',d:1,tol:a=>0.6,
   prompt:{bio:sim=>`You snap on <b>${sim.p.me}%</b> of days and your friend on <b>${sim.p.fr}%</b>. The streak needs both of you every day. What is the chance it lasts <b>${sim.p.days}</b> days? Give a percent.`},
   answer:alive,
   hint:'Chance both snap on one day = your decimal × your friend’s decimal. Then raise it to the number of days.',
   steps(sim){const a=sim.p.me/100,b=sim.p.fr/100;return [`One day: ${a} × ${b} = ${pq(sim).toFixed(4)}.`,`${sim.p.days} days in a row: ${pq(sim).toFixed(4)}<sup>${sim.p.days}</sup> = ${(alive(sim)/100).toFixed(4)}.`,`As a percent: <b>${f1(alive(sim))}%</b>.`];}},
  formula:sim=>`(${sim.p.me/100} × ${sim.p.fr/100})<sup>${sim.p.days}</sup> = ${f1(alive(sim))}%`,
  how:{bio:'Multiply the two daily chances, then raise to the number of days.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<5)return `Your gut was close: <b>${f1(m.guess)}%</b>.`;
   return `Your gut was off by <b>${f1(off)}</b> points. The math says <b>${f1(m.guess)}%</b>. Missing 1 day in 100 sounds safe, but the streak needs two people every single day, and small risks multiply.`;},
  again(sim){sim.p.me=[97,98,98.5,99,99.5][Math.floor(Math.random()*5)];sim.p.fr=[97,98,98.5,99,99.5][Math.floor(Math.random()*5)];sim.p.days=[30,50,100,150,200,365][Math.floor(Math.random()*6)];sim.p.guess=50;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You and a friend each snap 98% of days. What is the chance the streak lasts 30 days? Give a percent.',answer:29.78,tol:0.4,unit:'%',d:1,hint:'(0.98 × 0.98)³⁰',explain:'0.9604³⁰ ≈ 0.298, about 30%. Seven times out of ten, it breaks within a month.'},
  {lvl:'bio',instant:true,q:'In the UCLA brain-scan study, what made teens more likely to like a photo?',choices:['Who posted it','How many likes it already showed','How bright it was'],correct:1,explain:'The researchers assigned the like counts at random. The same photo got more likes from teens when it already showed many.'},
  {lvl:'bio',instant:true,q:'Why might people pay $0.99 to restore a lost streak?',choices:['Losing something you built can feel worse than never having it','Streaks earn money','It is required'],correct:0,explain:'Psychologists call this loss aversion. A streak turns a habit into something you can lose, and the restore button sells relief from that loss.'},
  {lvl:'honors',kind:'num',q:'Each of you snaps 99% of days. On average, how many days does a streak last before the first miss? Use pq ÷ (1 − pq).',answer:49.25,tol:0.6,unit:'days',d:0,hint:'pq = 0.9801',explain:'0.9801 ÷ 0.0199 ≈ 49 days. A 100-day streak is about twice the average.'},
  {lvl:'ap',kind:'num',q:'With pq = 0.9801, after how many days is the streak more likely lost than alive? Solve 0.9801ⁿ = 0.5.',answer:34.48,tol:0.3,unit:'days',d:1,hint:'n = ln 0.5 ÷ ln 0.9801',explain:'ln 0.5 ÷ ln 0.9801 ≈ −0.6931 ÷ −0.0201 ≈ 34.5 days.'}
 ],
 tour:[
  {title:'2009: the Like button',text:'Facebook added the Like button in 2009 and turned approval into a number you can count and compare. In 2017, Facebook’s first president, Sean Parker, called likes and comments “a social-validation feedback loop” and said the founders knew it.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{me:99,fr:99,days:100});}},
  {title:'Likes in the brain',text:'In a 2016 UCLA study, 32 teens aged 13 to 18 lay in a brain scanner looking at a made-up Instagram. The researchers assigned the like counts at random. When their own photos showed many likes, a reward hub called the nucleus accumbens was more active. Teens were also more likely to like a photo that already had many likes.',pause:true,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'2015: the streak',text:'Snapchat added Snapstreaks in 2015: a fire and a number for how many days in a row two friends have both sent a snap. Miss one day, either of you, and it goes back to zero. Watch the counter on the left.',pause:true,setup:sim=>{sim.tst=3;sim._t0=null;}},
  {title:'Small risks multiply',text:'If each of you snaps 99% of days, a day survives with chance 0.99 × 0.99 = 0.9801. A 100-day streak needs that 100 times in a row: 0.9801¹⁰⁰ ≈ 13%. The only way to keep it is to treat opening the app as a daily rule.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Selling the fix',text:'When a streak breaks, Snapchat offers a restore: one free, then $0.99 each in the US (2023). In a 2026 survey of 300 Dutch young people aged 13 to 21, 25% of those with streaks had paid to restore one, and 51% said they would feel bad if a friend broke one.',pause:true,setup:sim=>{sim.tst=5;sim._t0=null;}},
  {title:'Courts and states',text:'In March 2026 a Los Angeles jury found Meta and YouTube negligent in how they designed their apps; the companies disagree and may appeal. In August, Meta settled with 48 states and DC for up to $18 billion, agreeing to limit like counts and stop push notifications during school hours, without admitting wrongdoing. This month a jury is hearing claims that Snap’s streaks drove compulsive use; Snap says its app opens to a camera, not a feed.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'What you control',text:'Likes and streaks are design choices, and you can change your settings too. Instagram and Facebook let you hide like counts. You can mute streak alerts or tell friends you are dropping streaks. TikTok sets a 60-minute daily limit for under-18 accounts by default; you need a passcode to keep going.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How hard is a long streak?</p><ol><li>Keep both chances at 99%. Record the chance at 30, 100 and 365 days.</li><li>Raise both to 99.5%. What happens to the 365-day chance?</li><li>Switch the like count between Few, Many and Hidden and read what changes.</li></ol><p>Write one sentence: what does a streak ask you to do every day?</p>',
  honors:'<p><b>Question:</b> What does the average streak look like?</p><ol><li>Compute pq ÷ (1 − pq) for daily chances of 97%, 98%, 99% and 99.5% each.</li><li>Graph average streak length against the daily chance. Why does it shoot up near 100%?</li></ol><p>Explain why an app might want streaks to be hard but not impossible.</p>',
  ap:'<p><b>Question:</b> When is the streak more likely gone?</p><ol><li>Solve (pq)ⁿ = 0.5 for pq = 0.95, 0.98, 0.99.</li><li>The model assumes each day is independent. Name one reason real days are not, and say which way it pushes the answer.</li></ol><p><b>CER:</b> Claim whether the 2026 jury verdict or the Sherman study is stronger evidence that likes and streaks are designed to bring teens back, and why.</p>'},
 terms:[
  {t:'Streak',d:'A count of days in a row you did something. In Snapchat, both friends must send a snap every day.'},
  {t:'Independent events',d:'Events where one does not change the chance of the other. To get the chance of all of them, multiply.'},
  {t:'Nucleus accumbens',d:'A small region deep in the brain that is a hub of the reward circuit. It responds to food, money and, in the UCLA study, likes.'},
  {t:'Loss aversion',d:'Losing something tends to feel worse than gaining the same thing feels good.'},
  {t:'Daily active users',d:'How many people open an app on a given day. Many apps are judged by it.',lvl:'honors'},
  {t:'Geometric model',d:'The chance of n successes in a row before a first failure: (success chance)ⁿ.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Each day, you snap with chance p and your friend with chance q, independent of each other and of other days. The streak lasts n days with chance (pq)ⁿ; the average run before a miss is pq ÷ (1 − pq). Real days are not independent (busy weeks, reminders, friends who remind you), so treat this as a first model. The like panel shows the direction of a study result, not a measurement.</p><p><b>Sources.</b> Sherman, Payton, Hernandez, Greenfield and Dapretto, “The Power of the Like in Adolescence,” <i>Psychological Science</i> 27(7), 2016 (32 teens, 13 to 18; like counts assigned by researchers). Sean Parker, interview with Axios, November 2017. Snapchat friend emojis and Snapstreaks, April 2015; Streak Restore, March 2023 (one free, then $0.99 in the US, per TechCrunch). Bits of Freedom, <i>The influence of Snapchat’s gamification features on young people</i>, March 2026 (Netherlands, 300 respondents aged 13 to 21). Instagram and Facebook, “Giving People More Control,” May 26, 2021. TikTok, March 1, 2023 (60-minute default for under-18 accounts). Associated Press: Los Angeles jury verdict against Meta and YouTube, March 25, 2026 ($3 million plus $3 million punitive; Meta 70%, YouTube 30%); Meta settlement with 48 states and DC, August 26, 2026; Snap and Meta trial, jury selection October 28, 2026.</p><p><b>Kinds of evidence.</b> The UCLA study is research. The jury verdict is a court finding that the companies may appeal. The state settlement ended a case without a verdict. The Snap trial is ongoing: its claims are allegations until a jury decides.</p><p><b>Related:</b> <a href="#scroll">Why can’t I stop scrolling?</a> (variable rewards) and <a href="#feedbuilder">Feed Builder</a> (ranking algorithms).</p><p><b>Teen vs. adult brain:</b> <a href="#teenbrain">Developing vs. developed: why age changes the risk</a> compares teens and adults on nicotine, alcohol, sleep, caffeine, friends and concussions.</p>'
};
BioLab.register(SIM);
})();

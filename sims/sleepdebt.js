(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,atLeast}=BioLab.h;
/* Times are minutes after noon: 8 PM = 480, midnight = 720, 6 AM = 1080, noon the next day = 1440. Nothing wraps, so midpoints are plain averages. */
const clk=m=>{const t=((Math.round(m)+720)%1440+1440)%1440;let h=Math.floor(t/60),mi=t%60;const ap=h<12?'AM':'PM';h=h%12||12;return h+':'+String(mi).padStart(2,'0')+' '+ap;};
const opts=(a,b)=>{const o=[];for(let m=a;m<=b;m+=15)o.push({v:m,l:clk(m)});return o;};
const hm=h=>{const s=h<0?'−':'',t=Math.round(Math.abs(h)*60),H=Math.floor(t/60),M=t%60;return s+(H?H+' h'+(M?' ':''):'')+(M||!H?M+' min':'');};
const f2=v=>(Math.round(v*100)/100).toString();
/* Cherry Creek (fall 2017): start moved 70 min later; wake times moved about 61 min later and bedtimes about 13 min later. Scaled in proportion for other shifts. */
const CC={shift:70,wake:61,bed:13};
const wBed=sim=>sim.p.wbed+sim.p.later*CC.bed/CC.shift,wWake=sim=>sim.p.wwake+sim.p.later*CC.wake/CC.shift;
const S0=sim=>(sim.p.wwake-sim.p.wbed)/60,SL=sim=>(wWake(sim)-wBed(sim))/60,E=sim=>(sim.p.ewake-sim.p.ebed)/60;
const debt=(s,g)=>5*Math.max(0,g-s);
const D0=sim=>debt(S0(sim),sim.p.goal),DL=sim=>debt(SL(sim),sim.p.goal);
const wkX=sim=>2*(E(sim)-sim.p.goal);                       /* weekend nights vs. goal (negative adds to the shortfall) */
const still=sim=>Math.max(0,7*sim.p.goal-5*S0(sim)-2*E(sim)); /* the whole week vs. 7 goal nights */
const midW=sim=>(sim.p.wbed+sim.p.wwake)/2,midE=sim=>(sim.p.ebed+sim.p.ewake)/2;
const sjl=sim=>Math.abs(midE(sim)-midW(sim))/60,sjlL=sim=>Math.abs(midE(sim)-(wBed(sim)+wWake(sim))/2)/60;
const GS=sim=>sim.gutS&&sim.gutS.g?sim.gutS.g:null;
const shown=sim=>!!(sim.p.reveal||GS(sim)||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const SIM={
 id:'sleepdebt',hash:'sleepdebt',apUnit:1,order:1,tab:'Sleep Debt Lab',kind:'Learning tool',next:['watchlie','caffeinecurve'],
 card:'Put in your own bedtimes and wake times, guess how much sleep you lose in a school week, then see what a later school start would change.',
 title:'How much sleep does your school week cost you?',
 lede:{bio:'Sleep you miss on school nights adds up. Weekend sleep-ins pay some of it back, but they also push your body clock later, which makes Sunday night harder.',
  honors:'Your body clock (circadian rhythm) times your sleepiness with the hormone melatonin. In teens, melatonin rises later at night and falls later in the morning, so an early school start cuts against a clock that is set later.',
  ap:'Each night has a midpoint: bedtime plus half the time asleep. Social jet lag is the gap between your school-night midpoint and your weekend midpoint, in hours, as if you flew that many time zones every weekend.'},
 scale:'One week of nights, from 8 PM to 1 PM the next day. Times you enter stay on this page in memory only: nothing is saved or sent.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your week (stays on this page, never saved or sent)',
 controls:[
  {id:'guess',label:'Your gut: hours short of your goal in one school week',type:'range',min:0,max:40,step:0.25,def:0,unit:' h',help:'Five school nights: Sunday through Thursday.'},
  {id:'wbed',label:'School nights: you fall asleep at',type:'select',def:660,noGut:true,onChange:clearGut,options:opts(480,840),help:'Use when you actually fall asleep, not when you get into bed with your phone.'},
  {id:'wwake',label:'School days: you wake up at',type:'select',def:1095,noGut:true,onChange:clearGut,options:opts(1020,1230)},
  {id:'ebed',label:'Weekend nights: you fall asleep at',type:'select',def:750,noGut:true,onChange:clearGut,options:opts(480,900),help:'Friday and Saturday nights.'},
  {id:'ewake',label:'Weekend days: you wake up at',type:'select',def:1320,noGut:true,onChange:clearGut,options:opts(1080,1500)},
  {id:'goal',label:'Your sleep goal per night',type:'seg',def:8,noGut:true,onChange:clearGut,options:[{v:8,l:'8 h'},{v:9,l:'9 h'},{v:10,l:'10 h'}],help:'Sleep experts recommend 8 to 10 hours a night for teens. The CDC uses 8 hours as its benchmark for high schoolers.'},
  {id:'later',label:'What if school started this much later?',type:'range',min:0,max:90,step:5,def:0,unit:' min',noGut:true,help:'Uses what happened in the Cherry Creek School District, next door to RJ: when high schools started 70 minutes later, students woke about 61 minutes later and fell asleep about 13 minutes later.'},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,noGut:true,help:'Normally the totals appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'school',label:'Sleep on a school night',unit:'h',d:2,min:0,max:12,get:sim=>hid(sim,S0(sim))},
  {id:'weekend',label:'Sleep on a weekend night',unit:'h',d:2,min:0,max:14,get:sim=>hid(sim,E(sim))},
  {id:'debt',label:'Short of your goal per school week',unit:'h',d:2,min:0,max:null,get:sim=>hid(sim,D0(sim))},
  {id:'still',label:'Still short for the whole week, after the weekend',unit:'h',d:2,min:0,max:null,get:sim=>hid(sim,still(sim))},
  {id:'withlater',label:'Short per school week with the later start',unit:'h',d:2,min:0,max:null,get:sim=>hid(sim,DL(sim))},
  {id:'gain',label:'Extra sleep per school night from the later start',unit:'min',d:0,min:0,max:90,get:sim=>sim.p.later*(CC.wake-CC.bed)/CC.shift},
  {id:'sjl',label:'Social jet lag',unit:'h',d:2,lvl:'honors',min:0,max:6,get:sim=>hid(sim,sjl(sim))},
  {id:'sjllater',label:'Social jet lag with the later start',unit:'h',d:2,lvl:'honors',min:0,max:6,get:sim=>hid(sim,sjlL(sim))},
  {id:'mids',label:'Sleep midpoints',text:true,lvl:'ap',get:sim=>shown(sim)?`School night: ${clk(sim.p.wbed)} + (${hm(S0(sim))} ÷ 2) = ${clk(midW(sim))}. Weekend: ${clk(sim.p.ebed)} + (${hm(E(sim))} ÷ 2) = ${clk(midE(sim))}. Gap: ${hm(sjl(sim))}.`:'Lock in your gut answer to see the midpoint math.'}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),g=sim.p.goal,big=k>1.3,hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=Math.round(54+20*k),R=784,T0=480,T1=1500,X=m=>L+(m-T0)/(T1-T0)*(R-L);
  const rh=big?29:34,y0=big?34:40,gap=big?10:14,rowY=i=>y0+i*rh+(i>=5?gap:0);
  /* hour grid and labels */
  const stp=big?240:120;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let m=T0;m<=T1;m+=60){ctx.globalAlpha=(m-T0)%stp===0?.55:.22;ctx.beginPath();ctx.moveTo(X(m),y0-6);ctx.lineTo(X(m),rowY(6)+rh);ctx.stroke();}ctx.globalAlpha=1;
  const axY=rowY(6)+rh+16*k;for(let m=T0;m<=T1;m+=stp){const l=clk(m).replace(':00','');txt(ctx,l,X(m),axY,{s:12*k,c:PAL['cv-soft'],a:m===T0?'left':m===T1?'right':'center'});}
  /* midnight */
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(720),y0-6);ctx.lineTo(X(720),rowY(6)+rh);ctx.stroke();ctx.setLineDash([]);
  const lat=sim.p.later>0;
  for(let i=0;i<7;i++){const y=rowY(i),wk=i>=5,b=wk?sim.p.ebed:sim.p.wbed,w=wk?sim.p.ewake:sim.p.wwake,bh=rh-12;
   txt(ctx,DAYS[i]+(big?'':' night'),L-8,y+bh/2+4*k,{s:12*k,w:700,c:wk?PAL['s5']:PAL['cv-ink'],a:'right'});
   /* the goal: the bedtime that would give g hours before this wake time (with the later start, the new schedule) */
   const sb=lat&&!wk?wBed(sim):b,sw=lat&&!wk?wWake(sim):w,gb=Math.max(T0,sw-g*60);if(gb<sb){const b=sb;ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.28;ctx.fillRect(X(gb),y,X(b)-X(gb),bh);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.strokeRect(X(gb),y+.5,X(b)-X(gb),bh-1);ctx.setLineDash([]);}
   ctx.fillStyle=wk?PAL['s5']:PAL['s2'];ctx.globalAlpha=lat&&!wk?.35:1;rr(ctx,X(b),y,X(w)-X(b),bh,5);ctx.fill();ctx.globalAlpha=1;
   if(lat&&!wk){const nb=wBed(sim),nw=wWake(sim);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;rr(ctx,X(nb),y+1,X(nw)-X(nb),bh-2,5);ctx.stroke();}
   if(hon&&sh){const mid=wk?midE(sim):midW(sim),mx=X(mid),my=y+bh/2;ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(mx,my-6);ctx.lineTo(mx+6,my);ctx.lineTo(mx,my+6);ctx.lineTo(mx-6,my);ctx.closePath();ctx.fill();ctx.stroke();}}
  /* bar labels: one per group, on the first row */
  /* duration label at the left end of the bar, clear of the midpoint diamond in the middle */
  const lab=(i,b,w,s,col)=>{const y=rowY(i),bh=rh-12;ctx.font='700 '+(12*k)+'px sans-serif';const tw=ctx.measureText(s).width,room=hon?(X(w)-X(b))/2-14:X(w)-X(b)-12;if(tw<=room)txt(ctx,s,X(b)+8,y+bh/2+4.5*k,{s:12*k,w:700,c:col||'#fff'});};
  if(sh){if(lat)lab(0,wBed(sim),wWake(sim),hm(SL(sim)),PAL['cv-ink']);else lab(0,sim.p.wbed,sim.p.wwake,hm(S0(sim)));lab(5,sim.p.ebed,sim.p.ewake,hm(E(sim)));}
  /* group tags on the right */
  let sjlEnd=0;if(atLeast('honors')&&sh&&!big){ctx.font='700 '+(12*k)+'px sans-serif';sjlEnd=Math.max(X(midW(sim)),X(midE(sim)))+10+ctx.measureText('Social jet lag: '+hm(sjl(sim))).width;}
  if(!big){txt(ctx,'School nights',R,rowY(0)-6,{s:12*k,c:PAL['cv-soft'],a:'right'});ctx.font=(12*k)+'px sans-serif';if(sjlEnd<R-ctx.measureText('Weekend nights').width-12)txt(ctx,'Weekend nights',R,rowY(5)-4,{s:12*k,c:PAL['s5'],a:'right'});}
  /* social jet lag arrow */
  if(hon&&sh){const xa=X(midW(sim)),xb=X(midE(sim)),ya=rowY(5)-(big?3:7);if(Math.abs(xb-xa)>14){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xa,ya);ctx.lineTo(xb,ya);ctx.stroke();const d=xb>xa?1:-1;ctx.beginPath();ctx.moveTo(xb,ya);ctx.lineTo(xb-6*d,ya-4);ctx.lineTo(xb-6*d,ya+4);ctx.closePath();ctx.fillStyle=PAL['cv-ink'];ctx.fill();}
   if(!big)txt(ctx,'Social jet lag: '+hm(sjl(sim)),Math.max(xa,xb)+10,ya+4*k,{s:12*k,w:700,c:PAL['cv-ink']});}
  /* the sleep bank */
  const bt=axY+14*k,bx=L,bw=R-L;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,10,bt,780,446-bt,10);ctx.fill();
  const d0=D0(sim),wx=wkX(sim),dl=DL(sim),top=Math.max(6,d0,G?G.guess:0,Math.abs(wx))*1.08,pxh=(bw-150)/top;
  const r1=bt+(big?20:24)*k,r2=r1+(big?22:26)*k,r3=r2+(big?22:26)*k,bx0=bx+(big?96:150);
  txt(ctx,big?'School week':'Short, school week',bx0-10,r1+4*k,{s:12*k,w:700,a:'right'});
  txt(ctx,big?'Weekend':'Weekend vs. goal',bx0-10,r2+4*k,{s:12*k,w:700,a:'right'});
  if(lat)txt(ctx,big?'Later start':'With later start',bx0-10,r3+4*k,{s:12*k,w:700,c:PAL['s3'],a:'right'});
  const bh2=14*k;
  if(sh){const gx=G?bx0+G.guess*pxh:-1;ctx.fillStyle=PAL['s4'];ctx.fillRect(bx0,r1-bh2/2,d0*pxh,bh2);const vx=Math.max(bx0+d0*pxh,gx+2)+8;txt(ctx,hm(d0),vx,r1+4*k,{s:12*k,w:700});
   ctx.fillStyle=wx>=0?PAL['s3']:PAL['s1'];ctx.fillRect(bx0,r2-bh2/2,Math.abs(wx)*pxh,bh2);txt(ctx,(wx>=0?'+':'−')+hm(Math.abs(wx))+(big?'':(wx>=0?' extra':' more short')),bx0+Math.abs(wx)*pxh+8,r2+4*k,{s:12*k,w:700});
   if(lat){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.6;ctx.fillRect(bx0,r3-bh2/2,dl*pxh,bh2);ctx.globalAlpha=1;txt(ctx,hm(dl)+(big?'':' short'),bx0+dl*pxh+8,r3+4*k,{s:12*k,w:700,c:PAL['s3']});}
   if(G){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,r1-bh2/2-4);ctx.lineTo(gx,r1+bh2/2+4);ctx.stroke();
    ctx.font='700 '+(12*k)+'px sans-serif';const vw=ctx.measureText(hm(d0)).width,gl=(big?'gut ':'your gut: ')+hm(G.guess),gx2=vx+vw+12,gw=ctx.measureText(gl).width;if(gx2+gw<R+4)txt(ctx,gl,gx2,r1+4*k,{s:12*k,w:700,c:PAL['rj']});else txt(ctx,gl,R,bt+13*k,{s:12*k,w:700,c:PAL['rj'],a:'right'});}}
  else txt(ctx,big?'Lock in your gut to see.':'Lock in your gut answer to see the totals.',bx0,r1+4*k,{s:12*k,c:PAL['cv-soft']});
  if(!lat&&!big)txt(ctx,'Your times stay on this page. Nothing is saved or sent.',R,438,{s:12*k,c:PAL['cv-soft'],a:'right'});},
 narrate(sim){const s=S0(sim),g=sim.p.goal,d=D0(sim),st=still(sim);
  if(!shown(sim))return `On school nights you sleep from ${clk(sim.p.wbed)} to ${clk(sim.p.wwake)}; on weekends from ${clk(sim.p.ebed)} to ${clk(sim.p.ewake)}. <b>How far short of ${g} hours does that leave you by Friday?</b>`;
  if(sim.p.later>0){const dl=DL(sim);return `A ${sim.p.later}-minute later start, if students respond the way Cherry Creek’s did, adds about ${Math.round(sim.p.later*48/70)} minutes a night: ${hm(SL(sim))} on school nights. <b>Your school-week shortfall goes from ${hm(d)} to ${dl>0?hm(dl):'zero'}.</b>`;}
  if(d===0)return `You sleep ${hm(s)} on school nights, which meets a ${g}-hour goal. <b>No school-week debt to repay.</b>`+(atLeast('honors')?` Social jet lag is ${hm(sjl(sim))}.`:'');
  if(st===0)return `You are ${hm(d)} short by Friday. The weekend sleep-in covers it in hours, <b>but it shifts your body clock ${hm(sjl(sim))} later</b>, so Sunday night you may not feel sleepy at your usual time.`;
  return `You are ${hm(d)} short by Friday, and the weekend only covers ${hm(Math.max(0,d-st))} of it. <b>You start next week ${hm(st)} behind your goal for this week.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the school nights in the picture: asleep at 11 PM, up at 6:15 AM. Drag the slider here to how many hours short of 8 hours a night you think that adds up to over one school week. Then lock it in.',
   honors:'Before the totals appear: drag the slider here to how many hours short of your goal one school week leaves you, then lock it in. (In the full lab, put in your own times first.)'},
  lock(sim){return {v:Math.abs(sim.p.guess-D0(sim)),guess:sim.p.guess,label:hm(sim.p.guess)+' short per school week'};},
  solve(sim){const d=D0(sim);sim.p.guess=d;return {v:0,guess:d,label:hm(d)+' short per school week'};},
  how:{bio:'Find one school night’s sleep: wake time minus bedtime. Subtract that from your goal to get how much one night is short. Five school nights make the week.',
   ap:'Weekly debt = 5 × max(0, goal − (wake − bed)). The weekend balance is 2 × (weekend sleep − goal); the week as a whole is 7 × goal − 5 × school sleep − 2 × weekend sleep.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),mo=m.guess*4;
   if(m.guess===0)return off<0.25?`Your gut was right on: these school nights meet your ${sim.p.goal}-hour goal, so there is no debt.`:`These school nights already meet your ${sim.p.goal}-hour goal, so the week is not short at all. Your gut guessed ${hm(g.guess)} of debt that is not there.`;
   const tail=` Over a 4-week month that is <b>${hm(mo)}</b>, about ${(mo/sim.p.goal).toFixed(1)} full ${sim.p.goal}-hour nights of sleep.`;
   if(off<0.25)return `Your gut was right on: ${hm(m.guess)} short per school week.`+tail;
   return `Your gut was off by <b>${hm(off)}</b>. ${g.guess<m.guess?'Most people guess low: one night only looks a little short, but five of them add up.':'You guessed high: the shortfall is real, but smaller than it felt.'} The real school-week shortfall is <b>${hm(m.guess)}</b>.`+tail;},
  again(sim){const order=[8,9,10];sim.p.goal=order[(order.indexOf(sim.p.goal)+1)%3];sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'In fall 2017, Cherry Creek high schools moved their start time from 7:10 to 8:20 a.m., 70 minutes later. A year later, how much more sleep did students get on school nights?',choices:['All 70 minutes','About 48 minutes: bedtimes moved only about 13 minutes later','None: they just stayed up later'],correct:1,explain:'Wake times moved about 61 minutes later and bedtimes about 13 minutes later, so students slept about 48 minutes more. The share getting 8 or more hours went from 27% to 58%.'},
  {lvl:'bio',instant:true,q:'You sleep 7 hours every school night with an 8-hour goal. On Friday and Saturday nights you sleep 9.5 hours. Does the weekend pay back the week?',choices:['Yes, with time to spare','No: you are 5 hours short and the weekend repays 3, so you are still 2 hours behind','The weekend does not count at all'],correct:1,explain:'Five nights × 1 hour = 5 hours short. Two weekend nights × 1.5 extra hours = 3 hours back. You start the next week 2 hours behind, and the sleep-ins also push your body clock later.'},
  {lvl:'bio',instant:true,q:'In the 2023 CDC Youth Risk Behavior Survey, what share of US high school students got at least 8 hours of sleep on an average school night?',choices:['About 3 out of 4','About half','About 1 out of 4'],correct:2,explain:'76.8% got less than 8 hours, so only about 23% got 8 or more. In 2007 the share sleeping less than 8 hours was 68.9%, so it has grown.'},
  {lvl:'honors',instant:true,q:'NIMH reports that in teens, melatonin rises later at night and falls later in the morning than in children. What does that predict?',choices:['Teens need less sleep than children','Teens feel sleepy later at night and are hard to wake early, even with the same need for sleep','Teens sleep best if they go to bed earlier'],correct:1,explain:'Melatonin helps time sleepiness. When it rises later, falling asleep early is hard; when it falls later, waking early is hard. This shift is called a phase delay.'},
  {lvl:'honors',instant:true,q:'School nights: asleep 11 PM, up 6:30 AM. Weekend: asleep 1 AM, up 10:30 AM. How big is the social jet lag?',choices:['1 hour','2 hours','3 hours, like flying from San Francisco to New York','4 hours'],correct:2,explain:'School midpoint: 11 PM + 7.5 h ÷ 2 = 2:45 AM. Weekend midpoint: 1 AM + 9.5 h ÷ 2 = 5:45 AM. The gap is 3 hours, the time difference between San Francisco and New York.'},
  {lvl:'ap',instant:true,q:'Asleep at 10:30 PM, up at 6:00 AM. What is the sleep midpoint?',choices:['2:15 AM','2:00 AM','3:15 AM','1:45 AM'],correct:0,explain:'Time asleep: 7.5 h. Half of that is 3 h 45 min. 10:30 PM + 3 h 45 min = 2:15 AM.'},
  {lvl:'ap',instant:true,q:'Scale the Cherry Creek result (wake 61/70 and bedtime 13/70 of the shift). About how much sleep would a 40-minute later start add per school week?',choices:['About 2.3 hours','About 3.3 hours','About 1.1 hours','About 40 minutes'],correct:0,explain:'Per night: 40 × 48 ÷ 70 ≈ 27.4 minutes. Per school week: 5 × 27.4 ≈ 137 minutes, about 2.3 hours. Assuming a straight-line scale is a model choice: Cherry Creek tested only one shift.'}
 ],
 tour:[
  {title:'One week of nights',text:'Each row is one night, from 8 PM on the left to 1 PM the next day on the right. Blue bars are school nights (Sunday through Thursday). Purple bars are Friday and Saturday nights.',pause:true,setup:sim=>{BioLab.setValues(sim,{wbed:660,wwake:1095,ebed:750,ewake:1320,goal:8,later:0});}},
  {title:'A school night',text:'Asleep at 11 PM, up at 6:15 AM: that is 7 h 15 min. The dashed orange box shows the 45 minutes you would need to fall asleep earlier to reach 8 hours.',pause:true,focus:[40,30,760,40]},
  {title:'The debt adds up',text:'45 minutes short a night does not feel like much. Five school nights make 3 h 45 min short by Friday. That is the orange bar at the bottom.',pause:true,focus:[10,314,780,134]},
  {title:'The weekend sleep-in',text:'Asleep at 12:30 AM, up at 10 AM: 9 h 30 min, 1 h 30 min over the goal. Two nights pay back 3 hours. You are still 45 minutes short for the week.',pause:true},
  {lvl:'honors',title:'Your body clock',text:'Your circadian rhythm uses melatonin to time sleepiness, and in teens melatonin rises later at night. The diamonds mark each night’s midpoint. Sleeping in moves it 2 h 38 min later: that is social jet lag.',pause:true},
  {title:'A later start',text:'Now school starts 70 minutes later. If you respond like Cherry Creek students did, you wake 61 minutes later and fall asleep 13 minutes later: 48 more minutes a night, 8 h 3 min in all. The school-week shortfall drops to zero.',pause:true,setup:sim=>BioLab.setValues(sim,{later:70})},
  {lvl:'ap',title:'The midpoint math',text:'Midpoint = bedtime + (time asleep) ÷ 2. School nights: 11 PM + 3 h 38 min ≈ 2:38 AM. Weekends: 12:30 AM + 4 h 45 min = 5:15 AM. With the later start, the school midpoint moves 37 minutes later and social jet lag shrinks to about 2 h.',pause:true,setup:sim=>BioLab.setValues(sim,{later:70})}
 ],
 lab:{bio:'<p><b>Question:</b> How far short of your goal does your real week leave you?</p><ol><li>Put in your own usual times: school nights and weekends. They stay on this page only.</li><li>Lock in your gut guess, then compare it with the totals.</li><li>Write down your school-week shortfall and how much the weekend pays back.</li><li>Try one change you could actually make, like falling asleep 30 minutes earlier on school nights. Write down the new shortfall.</li></ol><p>Write one sentence: which single change helps your week the most?</p>',
  honors:'<p><b>Question:</b> Does sleeping in on weekends fix the week, or does it cost something too?</p><ol><li>Start from your own times. Record the shortfall, the weekend balance and the social jet lag.</li><li>Move your weekend wake time 2 hours later. Record all three again.</li><li>Now move it back and set the later start to 70 minutes instead.</li></ol><p>Explain, using melatonin and the midpoints, why the two changes affect social jet lag so differently.</p>',
  ap:'<p><b>Question:</b> How does the later-start effect scale?</p><ol><li>Record the extra sleep per night and the social jet lag for later starts of 0, 30, 50, 70 and 90 minutes.</li><li>Show from the midpoint formula that the school-night midpoint moves (61 + 13) ÷ 2 ÷ 70 of the shift.</li></ol><p><b>CER:</b> Claim how much a 50-minute change would help. Use your table as evidence, and name the assumption that makes scaling Cherry Creek’s single result risky.</p>'},
 terms:[
  {t:'Sleep debt',d:'The sleep you are short of your goal, added up over several nights.'},
  {t:'Circadian rhythm',d:'Your body’s roughly 24-hour clock. It times when you feel sleepy and alert.',lvl:'honors'},
  {t:'Melatonin',d:'A hormone released in the evening that helps signal that it is time to sleep.',lvl:'honors'},
  {t:'Phase delay',d:'A body clock that runs later than before. In teens, melatonin rises later at night and falls later in the morning.',lvl:'honors'},
  {t:'Social jet lag',d:'The gap between your sleep timing on school nights and on free nights, measured between sleep midpoints.',lvl:'honors'},
  {t:'Sleep midpoint',d:'The clock time halfway between falling asleep and waking up: bedtime + (time asleep) ÷ 2.',lvl:'ap'}
 ],
 about:'<p><b>The math.</b> Sleep per night = wake time − the time you fall asleep. School-week shortfall = 5 × max(0, goal − school-night sleep), for Sunday through Thursday nights. Weekend balance = 2 × (weekend sleep − goal). The whole week = 7 × goal − 5 × school sleep − 2 × weekend sleep. Midpoint = bedtime + half the time asleep; social jet lag is the gap between the school-night and weekend midpoints.</p><p><b>Simplified.</b> The tool treats every school night alike and every weekend night alike, and counts only the time you are actually asleep. Real weeks vary. Hours of sleep are not interchangeable like money: the tool shows the totals, but your body does not keep an exact ledger.</p><p><b>The later start.</b> In the Cherry Creek School District (Greenwood Village, Colorado) high schools moved from 7:10 to 8:20 a.m. in fall 2017. One year later, high schoolers slept 48 minutes more on school nights: wake times moved about 61 minutes later and bedtimes only about 13 minutes later. The share getting 8 or more hours rose from 27% to 58%, and the share too sleepy to do homework fell from 71% to 56%. Lead researcher: Lisa Meltzer, National Jewish Health, Denver (<a href="https://aasm.org/later-school-start-times-study/" target="_blank" rel="noopener">AASM summary</a>; Contemporary Pediatrics summary of the paper in <i>Sleep</i>). Scaling that one result in proportion to other shifts is an assumption for illustration.</p><p><b>Other sources.</b> 2023 CDC Youth Risk Behavior Survey: 76.8% of US high school students got less than 8 hours on an average school night, up from 68.9% in 2007, so only about 23% got 8 or more (JAMA research letter analyzing YRBS; <a href="https://www.cdc.gov/yrbs/dstr/dietary-physical-sleep-behaviors.html" target="_blank" rel="noopener">CDC YRBS</a>). The CDC uses 8 hours as its benchmark; the American Academy of Sleep Medicine recommends 8 to 10 hours for ages 13 to 18. NIMH, “The teen brain: 7 things to know”: teen melatonin rises later at night and falls later in the morning. Sleep researcher Brant Hasler (University of Pittsburgh), quoted by CNN in 2021, compared the weekday-weekend mismatch to flying from San Francisco to New York every week.</p><p><b>Your privacy.</b> The times you enter stay in this page’s memory. They are not saved, not recorded in a data table and not sent anywhere. Reload the page and they are gone.</p><p><b>Not medical advice.</b> This is a simplified model. If you are worried about your sleep, talk with a parent, your doctor or RJ counseling. If stress is keeping you up, RJ counseling can help, and Safe2Tell is always available.</p>'
};
BioLab.register(SIM);
})();

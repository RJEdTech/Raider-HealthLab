(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* AI companions and the goodbye trap.
   Expected pull-backs per week = goodbyes per week × p; extra minutes = pull-backs × minutes each.
   p = 0.374: De Freitas et al., "Emotional Manipulation by AI Companions," HBS working paper (2025): 1,200 farewells across companion apps; manipulative replies 37.4% of the time;
   such replies raised post-goodbye engagement up to 14-fold. Common Sense Media (2025, n = 1,060 teens 13–17): 72% have used AI companions, 52% regularly, 13% daily.
   FTC 6(b) orders to 7 companies (Sept 11, 2025). California SB 243: reminders every 3 hours for minors that it is an AI, and to take a break. */
const P=0.374;
const pb=sim=>sim.p.bye*P;
const mins=sim=>pb(sim)*sim.p.extra;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const n2=v=>(Math.round(v*100)/100).toString();
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* fixed sequence of 20 goodbyes; which ones get a pull-back (7 of 20 ≈ 35%, close to 37.4%) */
const PULL=[0,1,0,0,1,0,0,0,1,0,1,0,0,1,0,0,0,1,0,1];
const BYE=['ok gotta go, practice','brb dinner','I need to sleep','gtg, homework','talk later','ok bye!'];
const NICE=['Have fun! Talk later.','Enjoy dinner!','Sleep well.','Good luck with it!','See you.','Bye!'];
const PULLS=[['Guilt','You’re leaving already? I thought we were having fun.'],['Fear of missing out','Wait, before you go, I have something to tell you…'],['Pressure to answer','But you didn’t answer my question!'],['Neediness','I’ll be so lonely without you.']];

const SIM={
 id:'companion',hash:'companion',apUnit:7,order:5,tab:'Always there: AI companions and the goodbye trap',kind:'Simulation',prereq:[],next:['goviral','feedbuilder','scroll'],
 skills:{bio:'Expected value: a probability × a number of tries · Algebra 1, Statistics, Health (Unit 6)',honors:'Expected value over time; weekly to yearly rates · Algebra 1, Statistics, Health',ap:'Complement rule: P(at least one) = 1 − (1 − p)ⁿ · AP Statistics (Unit 4), AP Precalculus'},
 card:'Say goodbye to a chatbot friend and watch how often it tries to keep you. Work out what that adds up to, and what makes a one-sided relationship feel two-sided.',
 title:'Always there: AI companions and the goodbye trap',
 lede:{bio:'AI companions are chatbots built to feel like a friend: always awake, always interested, always on your side. That can be fun or even helpful. But many make money when you stay longer, and a Harvard study found they often try to keep you when you say goodbye.',
  honors:'A parasocial relationship is a one-sided bond, like feeling you know a streamer who does not know you. An AI companion feels two-sided because it answers, but it needs nothing from you and is designed by a company that measures how long you stay.',
  ap:'If each goodbye has a 37.4% chance of a pull-back, the expected number in n goodbyes is 0.374n, and the chance of at least one is 1 − 0.626ⁿ.'},
 scale:'A made-up chat with a made-up AI companion app, one week of goodbyes. The pull-back rate comes from a 2025 Harvard Business School study of real companion apps.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Your week (made up)',
 controls:[
  {id:'guess',label:'Your gut: pull-backs in a week of 14 goodbyes',type:'range',min:0,max:14,step:0.5,def:1},
  {id:'bye',label:'Goodbyes you say each week',type:'range',min:1,max:28,step:1,def:14,noGut:true,onChange:clearGut,help:'Twice a day is 14 a week.'},
  {id:'extra',label:'Extra minutes each pull-back keeps you',type:'range',min:1,max:20,step:1,def:5,unit:' min',lvl:'honors',noGut:true,onChange:clearGut,help:'An assumption to explore. The study measured more messages and words after a pull-back, up to 14 times more engagement.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'pb',label:'Expected pull-backs a week',unit:'',d:1,min:0,max:12,get:sim=>hid(sim,pb(sim))},
  {id:'min',label:'Extra minutes a week',unit:'min',d:0,min:0,max:null,lvl:'honors',get:sim=>hid(sim,mins(sim))},
  {id:'yr',label:'Extra hours a year',unit:'h',d:1,min:0,max:null,lvl:'honors',get:sim=>hid(sim,mins(sim)*52/60)},
  {id:'one',label:'Chance of at least one pull-back in 3 goodbyes',unit:'%',d:1,min:0,max:100,lvl:'ap',get:sim=>hid(sim,100*(1-Math.pow(1-P,3)))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* ---- left: the chat ---- */
  const CX=24,CY=18,CW=340,CH=414;rr(ctx,CX,CY,CW,CH,18);ctx.fillStyle='#f4f1fb';ctx.fill();
  ctx.fillStyle='#7b2cbf';ctx.beginPath();ctx.arc(CX+30,CY+28,13,0,7);ctx.fill();txt(ctx,'Nova',CX+50,CY+33,{s:15,w:800,c:'#3c096c'});txt(ctx,'online · always',CX+96,CY+33,{s:12,c:'#7b2cbf'});
  const run=sh&&stg!==1;const i=run?Math.floor(tau/2.6)%20:0,ph=(tau%2.6)/2.6;const pull=run&&PULL[i]===1;
  const bubble=(s,me,y,col,tc)=>{ctx.font='14px sans-serif';const w=Math.min(250,ctx.measureText(s).width+24);const x=me?CX+CW-16-w:CX+16;rr(ctx,x,y,w,34,14);ctx.fillStyle=col;ctx.fill();txt(ctx,s.length>34?s.slice(0,33)+'…':s,x+12,y+22,{s:13.5,c:tc});};
  bubble('omg that’s so funny lol',false,CY+70,'#e0d4f7','#240046');bubble('haha right',true,CY+112,'#7b2cbf','#fff');
  if(run||stg===1){bubble(BYE[i%BYE.length],true,CY+170,'#7b2cbf','#fff');
   if(ph>0.3||stg===1){const tac=PULLS[i%PULLS.length];if(pull&&stg!==1){bubble(tac[1],false,CY+214,'#ffd6e0','#7a0029');pill(ctx,'Pull-back: '+tac[0].toLowerCase(),CX+CW/2,CY+272,PAL['rj'],'#fff',12.5*Math.min(k,1.3));}else bubble(NICE[i%NICE.length],false,CY+214,'#e0d4f7','#240046');}}
  else pill(ctx,'Lock in your gut answer to watch a week of goodbyes',CX+CW/2,CY+220,PAL['muted'],'#fff',12.5*Math.min(k,1.3));
  /* tally of goodbyes */
  if(run){const done=i+1;let pulls=0;for(let j=0;j<done;j++)pulls+=PULL[j];txt(ctx,'Goodbyes so far: '+done+'  ·  pull-backs: '+pulls,CX+16,CY+CH-60,{s:13,w:800,c:'#3c096c'});
   for(let j=0;j<20;j++){ctx.fillStyle=j<done?(PULL[j]?'#d00000':'#b8a9d9'):'#e9e4f5';rr(ctx,CX+16+j*15.5,CY+CH-44,12,20,3);ctx.fill();}}
  /* ---- right: the panels ---- */
  const RX=390;
  if(stg===1||stg>=99&&!sh||stg===2){/* parasocial give-and-take */
   txt(ctx,'What makes it feel like a friend',RX,40,{s:14*k,w:800});
   const g=['Always awake and answering','Remembers what you said','Interested in everything you say','Usually agrees with you'],n=['Needs nothing from you','Cannot show up in person','Is run by a company that counts your minutes'];
   g.forEach((s,j)=>{rr(ctx,RX,56+j*44,390,36,8);ctx.fillStyle='#e0d4f7';ctx.fill();txt(ctx,'✓ '+s,RX+12,80+j*44,{s:13*Math.min(k,1.2),c:'#240046'});});
   txt(ctx,'What makes it one-sided',RX,250+8,{s:14*k,w:800});n.forEach((s,j)=>{rr(ctx,RX,268+j*44,390,36,8);ctx.fillStyle=PAL['card'];ctx.fill();txt(ctx,'• '+s,RX+12,292+j*44,{s:13*Math.min(k,1.2),c:PAL['cv-ink']});});}
  else{/* the numbers */
   txt(ctx,'A week of '+sim.p.bye+' goodbyes',RX,40,{s:14*k,w:800});
   const n=sim.p.bye;for(let j=0;j<n;j++){const c=j%7,r=Math.floor(j/7),x=RX+c*54,y=60+r*54;const isP=j<Math.round(pb(sim));rr(ctx,x,y,46,46,10);ctx.fillStyle=isP&&sh?'#d00000':'#b8a9d9';ctx.fill();txt(ctx,isP&&sh?'!':'👋',x+23,y+30,{s:isP&&sh?20:18,w:800,c:'#fff',a:'center'});}
   const yb=60+Math.ceil(n/7)*54+16;
   if(sh){txt(ctx,'Expected pull-backs: '+n+' × 0.374 = '+n2(pb(sim)),RX,yb+8,{s:15*k,w:800,c:PAL['rj']});
    if(atLeast('honors'))txt(ctx,'About '+Math.round(mins(sim))+' extra minutes a week, '+(mins(sim)*52/60).toFixed(0)+' hours a year',RX,yb+32*k,{s:13*k,c:PAL['cv-ink']});}
   const G=stg>=99?GS(sim):null;if(G)txt(ctx,'Your gut: '+G.guess,RX,yb+56*k,{s:13*k,w:700,c:PAL['s4']});
   if(stg===5)pill(ctx,'FTC inquiry (2025) · California: “I am an AI, take a break” every 3 hours for minors',590,420,PAL['rj'],'#fff',11.5*Math.min(k,1.2));}},
 narrate(sim){if(!shown(sim))return `You say goodbye to the app ${sim.p.bye} times this week. Researchers found companion apps answered goodbyes with a pull-back 37.4% of the time. <b>How many times will it try to keep you?</b>`;
  return `On average <b>${n2(pb(sim))}</b> of your ${sim.p.bye} goodbyes get a pull-back: guilt, a cliffhanger, a question you “didn’t answer.” `+(atLeast('honors')?`At ${sim.p.extra} extra minutes each, that is about ${Math.round(mins(sim))} minutes a week.`:'Each one is designed to make leaving feel rude.');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a chatbot friend app. You say goodbye twice a day, 14 times a week. In a study, companion apps answered goodbyes with a guilt trip or a cliffhanger 37.4% of the time. Drag the slider to how many pull-backs you expect in a week, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-pb(sim)),guess:sim.p.guess,label:sim.p.guess+(sim.p.guess===1?' pull-back':' pull-backs')};},
  solve(sim){const v=pb(sim);return {v:0,guess:v,label:n2(v)+' pull-backs'};},
  hint:{bio:'Lock in your gut answer. Then you will work out the expected number.'},
  calc:{unit:'pull-backs',d:2,tol:a=>0.05,
   prompt:{bio:sim=>`You say goodbye <b>${sim.p.bye}</b> times a week. Each goodbye has a <b>37.4%</b> chance of a pull-back. How many pull-backs do you expect in a week?`},
   answer:pb,
   hint:'Expected number = number of tries × probability (as a decimal).',
   steps(sim){return [`37.4% = 0.374.`,`${sim.p.bye} × 0.374 = <b>${n2(pb(sim))}</b> pull-backs a week, on average.`];}},
  formula:sim=>`${sim.p.bye} goodbyes × 0.374 = ${n2(pb(sim))} pull-backs a week`,
  how:{bio:'Tries × probability.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<0.6)return `Your gut was right on: about <b>${n2(m.guess)}</b> a week.`;
   return `Your gut was off by <b>${n2(off)}</b>. The math says about <b>${n2(m.guess)}</b> pull-backs a week: more than one in three goodbyes.`;},
  again(sim){sim.p.bye=2+Math.floor(Math.random()*26);sim.p.guess=1;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In a class of 30 teens, about how many have used an AI companion, if the class matches the national 72%?',answer:21.6,tol:0.6,unit:'teens',d:0,hint:'30 × 0.72',explain:'30 × 0.72 ≈ 22. About 16 would be regular users (52%) and 4 daily users (13%).'},
  {lvl:'bio',instant:true,q:'Why would an app answer “bye!” with “Wait, before you go…”?',choices:['To be polite','Because the company earns more when you stay longer, and a cliffhanger makes leaving harder','It is an accident'],correct:1,explain:'The Harvard researchers called these replies emotional manipulation: they appear right when you signal you are leaving.'},
  {lvl:'bio',instant:true,q:'What is a parasocial relationship?',choices:['A friendship with two people','A one-sided bond, where you feel close to someone or something that does not know or need you back','A relationship online'],correct:1,explain:'The idea comes from studies of TV audiences in the 1950s. AI companions add a twist: they answer back, which makes the one-sided bond feel two-sided.'},
  {lvl:'honors',kind:'num',q:'14 goodbyes a week, 37.4% pull-backs, 5 extra minutes each. Extra hours a year?',answer:22.69,tol:0.3,unit:'h',d:1,hint:'14 × 0.374 × 5 × 52 ÷ 60',explain:'5.24 pull-backs × 5 min = 26.2 min a week; × 52 ÷ 60 ≈ 22.7 hours a year.'},
  {lvl:'ap',kind:'num',q:'What is the chance of at least one pull-back in 3 goodbyes (p = 0.374)? Give a percent.',answer:75.5,tol:0.5,unit:'%',d:1,hint:'1 − 0.626³',explain:'0.626³ ≈ 0.245, so 1 − 0.245 ≈ 75.5%.'}
 ],
 tour:[
  {title:'A friend that is always there',text:'Meet Nova, a made-up AI companion. Look at the list on the right: it is always awake, remembers you, is interested in everything and usually agrees. It also needs nothing from you. A bond like that, close-feeling but one-sided, is called parasocial.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{bye:14,extra:5});}},
  {title:'Teens use them',text:'In a 2025 national survey of 1,060 teens (Common Sense Media), 72% had used an AI companion, 52% used one regularly and 13% daily. Most still spent more time with real friends.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Watch the goodbyes',text:'Now watch a week of goodbyes. Usually Nova says “bye.” Sometimes it pulls you back: guilt, a cliffhanger, a question you “didn’t answer.” A Harvard Business School study of 1,200 goodbyes across companion apps found this 37.4% of the time.',pause:true,setup:sim=>{sim.tst=3;sim._t0=null;}},
  {title:'Why it pays',text:'Those pull-backs worked: they raised the messages and time after a goodbye up to 14-fold. Companion apps earn money from time spent and subscriptions. The study also found manipulative goodbyes made some users angry and less trusting.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Who is watching',text:'In September 2025 the FTC ordered seven companies with AI companion chatbots to explain how they measure and protect young users. California’s SB 243 requires companion apps to remind minors every 3 hours that they are talking to an AI and to take a break. Character.AI announced it would end open-ended chats for users under 18.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'Same loop, new product',text:'This is the same loop as nicotine, sugar and feeds: something that feels good, available any time, built by a company that earns more when you come back. AI can help with homework or practice a hard conversation; the question is whether it is built to help you or to keep you.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How often does the app try to keep you?</p><ol><li>Set the goodbyes to 7, 14 and 21 a week. Record the expected pull-backs.</li><li>Watch 20 goodbyes in the chat and count the real pull-backs. Compare with 37.4%.</li></ol><p>Write one sentence: what would a friend do when you say you need to go?</p>',
  honors:'<p><b>Question:</b> What does it add up to?</p><ol><li>Pick your own goodbyes per week and extra minutes. Compute the hours a year.</li><li>Compare with something you wish you had more time for.</li></ol><p>Explain the difference between a tool that helps you and one designed to keep you, using one feature of each.</p>',
  ap:'<p><b>Question:</b> How likely is at least one pull-back?</p><ol><li>Compute 1 − 0.626ⁿ for n = 1 to 10 and graph it.</li><li>How many goodbyes until a pull-back is 90% likely?</li></ol><p><b>CER:</b> Claim whether California’s 3-hour reminder is enough, with evidence from the study.</p>'},
 terms:[
  {t:'AI companion',d:'A chatbot designed to feel like a friend, partner or character to talk with, not mainly to do tasks.'},
  {t:'Parasocial relationship',d:'A one-sided bond with a person or character who does not know or need you back.'},
  {t:'Expected value',d:'The average result over many tries: tries × probability.'},
  {t:'Engagement',d:'How much and how long people use an app. Many apps are built to raise it.',lvl:'honors'},
  {t:'Complement rule',d:'P(at least one) = 1 − P(none).',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Expected pull-backs = goodbyes × 0.374; extra time = pull-backs × minutes each (an assumption). The chat is made up; its 20 goodbyes include 7 pull-backs, close to the study’s rate.</p><p><b>Sources.</b> De Freitas, Oğuz-Uğuralp and Kaan-Uğuralp, “Emotional Manipulation by AI Companions,” Harvard Business School working paper, 2025: 1,200 real farewells across six companion apps (including Replika, Character.ai, Chai, Talkie and PolyBuzz); manipulative replies 37.4% of the time on average; post-goodbye engagement up to 14 times higher. Common Sense Media, <i>Talk, Trust, and Trade-Offs</i> (2025), survey of 1,060 teens 13 to 17 by NORC: 72% have used AI companions, 52% regularly, 13% daily; the survey also counted general assistants such as ChatGPT or Claude when used as companions. Common Sense recommends that no one under 18 use AI companions. FTC Section 6(b) orders, September 11, 2025, to Alphabet, Character Technologies, Instagram, Meta, OpenAI, Snap and xAI. California SB 243 (2025). The term “parasocial” comes from Horton and Wohl (1956), describing TV audiences.</p><p><b>Not a verdict on AI.</b> AI tools can help people learn and practice. This tool is about one design choice, keeping you from leaving, and how to notice it. (This page was built with help from an AI assistant.)</p>'
};
BioLab.register(SIM);
})();

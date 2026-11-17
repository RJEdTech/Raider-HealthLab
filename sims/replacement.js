(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* Replacement customers: a stock-and-flow ("bathtub") model.
   Each year a share q of customers leave (they quit or die) and S new customers start. N(t+1) = N(t)(1 − q) + S.
   To stay the same size: S = qN. Long run: N → S/q. Closed form: N(t) = S/q + (N₀ − S/q)(1 − q)^t.
   Where starters come from (Surgeon General 2012, adult daily smokers): 88% first smoked by 18; 99% by 26. So: under 18: 88%, 18 to 25: 11%, 26 and up: 1%. */
const N0=1e6;
const Q=sim=>sim.p.q/100;
const SH=[0.88,0.11,0.01];
const keep=sim=>[sim.p.u18?0:1,sim.p.u26?0:1,1];
const S=sim=>{const k=keep(sim);return Q(sim)*N0*(SH[0]*k[0]+SH[1]*k[1]+SH[2]*k[2]);};
const N=(sim,t)=>{const q=Q(sim),s=S(sim),eq=s/q;return eq+(N0-eq)*Math.pow(1-q,t);};
const need=sim=>Q(sim)*N0;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const n0=v=>Math.round(v).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const calcAns=sim=>atLeast('honors')?need(sim)*0.88:need(sim);
const YRS=30;

const SIM={
 id:'replacement',hash:'replacement',apUnit:7,order:6,tab:'Replacement customers',kind:'Simulation',prereq:['lifetime'],next:['playbook'],
 skills:{bio:'Percent of a number and a running total · Algebra 1, Health (Unit 7)',honors:'Rates in and out; equilibrium N = S ÷ q · Algebra 1 (Units 3 and 5), Biology (population models), Economics',ap:'Recursive and closed-form models: N(t) = S/q + (N₀ − S/q)(1 − q)ᵗ · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), AP Macroeconomics'},
 card:'Fill a tank of customers, drain it with people who quit or die, and find out where a nicotine company’s new customers have to come from.',
 title:'Replacement customers: where does a nicotine company’s future come from?',
 lede:{bio:'Every year, some customers of an addictive product quit and some die. To keep sales from shrinking, a company has to find new customers to replace them. Since almost everyone who uses nicotine started as a teenager, the replacements have historically been teens.',
  honors:'Think of customers as water in a tank: new users flow in, people who quit or die flow out. The tank holds steady only when inflow equals outflow. Close the teen inflow pipe and the long-run level drops to S ÷ q.',
  ap:'The recursion N(t+1) = N(t)(1 − q) + S has the closed form N(t) = S/q + (N₀ − S/q)(1 − q)ᵗ: exponential decay toward the equilibrium S/q.'},
 scale:'A made-up company with 1,000,000 customers. The share who started at each age comes from the 2012 Surgeon General’s report on adult daily smokers.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'The company (made up)',
 controls:[
  {id:'guess',label:'Your gut: new customers needed each year to stay the same size',type:'range',min:0,max:300000,step:5000,def:10000},
  {id:'q',label:'Customers lost each year (quit or die)',type:'range',min:3,max:15,step:1,def:8,unit:'%',noGut:true,onChange:clearGut,help:'An illustrative rate. The real rate depends on how many people quit and on age.'},
  {id:'u18',label:'What if no one under 18 starts?',type:'toggle',def:false,noGut:true},
  {id:'u26',label:'What if no one 18 to 25 starts either?',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'need',label:'New customers needed each year to stay the same size',unit:'',d:0,min:0,max:null,get:sim=>hid(sim,need(sim))},
  {id:'teen',label:'Of those, how many would be under 18 (88%)',unit:'',d:0,min:0,max:null,get:sim=>hid(sim,need(sim)*0.88)},
  {id:'n30',label:'Customers after 30 years with these starters',unit:'',d:0,min:0,max:null,get:sim=>hid(sim,N(sim,YRS))},
  {id:'eq',label:'Long-run customers: S ÷ q',unit:'',d:0,min:0,max:null,lvl:'honors',get:sim=>hid(sim,S(sim)/Q(sim))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim)||stg<99,bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* ---- left: the tank ---- */
  const TX=150,TY=140,TW=160,TH=200;const yr=stg>=99?YRS:Math.min(YRS,tau*3);const lev=N(sim,sh?yr:0)/N0;
  /* inflow pipes */
  const k3=keep(sim),labs=['Under 18: 88%','18 to 25: 11%','26 and up: 1%'],wid=[20,7,2];
  for(let i=0;i<3;i++){const y=TY-96+i*34,open=k3[i]&&(stg>=3||i===0||stg>=99);ctx.fillStyle=PAL['line'];ctx.fillRect(TX-120,y,120+40,10);
   if(open&&sh){const ph=(t*2)%1;ctx.fillStyle='#4f8fd1';ctx.fillRect(TX-120,y+5-wid[i]/4,160,Math.max(2,wid[i]/2));for(let d=0;d<5;d++){const x=TX-120+((ph+d/5)%1)*160;ctx.beginPath();ctx.arc(x,y+5,Math.max(2,wid[i]/4),0,7);ctx.fill();}}
   if(!open||(i===0&&sim.p.u18)||(i===1&&sim.p.u26)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(TX-60,y-6);ctx.lineTo(TX-44,y+16);ctx.moveTo(TX-44,y-6);ctx.lineTo(TX-60,y+16);ctx.stroke();}
   txt(ctx,labs[i],TX-124,y-5,{s:12*k,w:700,c:k3[i]?PAL['cv-ink']:PAL['rj']});}
  ctx.fillStyle=PAL['cv-soft'];txt(ctx,'New customers start',TX-124,TY-118,{s:12*k,c:PAL['cv-soft']});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.strokeRect(TX,TY,TW,TH);
  const wh=TH*clamp(lev,0,1.2)/1.2;ctx.fillStyle='#4f8fd1';ctx.globalAlpha=.75;ctx.fillRect(TX+2,TY+TH-wh,TW-4,wh-2);ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(TX-8,TY+TH-TH/1.2);ctx.lineTo(TX+TW+8,TY+TH-TH/1.2);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Today: 1,000,000',TX+TW+12,TY+TH-TH/1.2+4,{s:12*k,c:PAL['cv-soft']});
  txt(ctx,sh?n0(N(sim,yr))+' customers':'? customers',TX+TW/2,TY+TH+22*k,{s:14*k,w:800,a:'center'});
  if(stg<99||sh)txt(ctx,'Year '+Math.round(yr),TX+TW/2,TY+TH+40*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* outflow */
  const ox=TX+TW/2;ctx.fillStyle=PAL['line'];ctx.fillRect(ox-6,TY+TH,12,0);
  if(sh){for(let d=0;d<4;d++){const ph=((t*1.5+d/4)%1);ctx.fillStyle='#8d99ae';ctx.beginPath();ctx.arc(TX+TW+20+ph*60,TY+TH-20+ph*30,4,0,7);ctx.fill();}
   txt(ctx,'Quit or die: '+sim.p.q+'% a year',TX+TW+20,TY+TH-34,{s:12*k,w:700,c:'#6c757d'});}
  /* ---- right: 30-year graph ---- */
  const L=470,R=784,T=60,B=Math.round(330-6*k),X=y=>L+y/YRS*(R-L),Yv=v=>B-v/1.2e6*(B-T);
  txt(ctx,'Customers over 30 years',L,T-14,{s:13*k,w:700});
  [0,5e5,1e6].forEach(v=>txt(ctx,v?(v/1e6)+'M':'0',L-6,Yv(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'}));
  [0,10,20,30].forEach(y=>txt(ctx,String(y),X(y),B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));txt(ctx,'Years from now',(L+R)/2,B+32*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.stroke();
  if(sh){ctx.strokeStyle='#4f8fd1';ctx.lineWidth=3;ctx.beginPath();for(let y=0;y<=yr;y+=0.25){const p=[X(y),Yv(N(sim,y))];y===0?ctx.moveTo(...p):ctx.lineTo(...p);}ctx.stroke();
   if(sim.p.u18||sim.p.u26){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(0),Yv(N0));ctx.lineTo(X(YRS),Yv(N0));ctx.stroke();ctx.setLineDash([]);txt(ctx,'With teen starters: flat',X(YRS)-4,Yv(N0)-6,{s:12*k,c:PAL['cv-soft'],a:'right'});}}
  const Gs=stg>=99?GS(sim):null;if(Gs)pill(ctx,'Your gut: '+n0(Gs.guess)+' a year',(L+R)/2,B+58*k,PAL['s4'],'#fff',13*Math.min(k,1.4));
  if(stg===5)pill(ctx,'“Today’s teenager is tomorrow’s potential regular customer” (Philip Morris, 1981)',400,420,'#7b2cbf','#fff',12.5*Math.min(k,1.3));
  if(stg===6)pill(ctx,'Federal court, 2006: companies marketed to youth to recruit “replacement smokers”',400,420,PAL['rj'],'#fff',12.5*Math.min(k,1.3));},
 narrate(sim){if(!shown(sim))return `The company has 1,000,000 customers and loses ${sim.p.q}% of them each year. <b>How many new customers does it need every year just to stay the same size?</b>`;
  const s=S(sim);return `It needs <b>${n0(need(sim))}</b> new customers a year, and about ${n0(need(sim)*0.88)} of them would historically be under 18. `+(sim.p.u18||sim.p.u26?`With the young starters gone, only ${n0(s)} start each year, and the company shrinks toward ${n0(s/Q(sim))} customers.`:'With the usual mix of starters, the tank stays full.');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a company with 1,000,000 customers. Each year 8% of them quit or die. Drag the slider to how many new customers you think it needs every year just to stay the same size, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-need(sim)),guess:sim.p.guess,label:n0(sim.p.guess)+' a year'};},
  solve(sim){return {v:0,guess:need(sim),label:n0(need(sim))+' a year'};},
  hint:{bio:'Lock in your gut answer. Then you will work it out with a percent.'},
  calc:{unit:'customers',d:0,tol:a=>Math.max(1,0.005*a),
   prompt:{bio:sim=>`<b>1,000,000</b> customers. <b>${sim.p.q}%</b> quit or die each year. How many new customers are needed each year to stay at 1,000,000?`,
    honors:sim=>`1,000,000 customers, ${sim.p.q}% lost each year. If 88% of new customers start before 18 (as with cigarettes), how many under-18 starters does staying the same size depend on each year?`},
   answer:calcAns,
   hint:'Outflow = percent lost × customers. Inflow must match it. For the under-18 part, take 88% of that.',
   steps(sim){const o=need(sim);const out=[`Lost each year: ${sim.p.q}% × 1,000,000 = ${n0(o)}.`,`To stay the same size, the same number must start: <b>${n0(o)}</b>.`];if(atLeast('honors'))out.push(`Under 18: 0.88 × ${n0(o)} = <b>${n0(o*0.88)}</b>.`);return out;}},
  formula:sim=>atLeast('honors')?`0.${String(sim.p.q).padStart(2,'0')} × 1,000,000 × 0.88 = ${n0(calcAns(sim))} under-18 starters a year`:`0.${String(sim.p.q).padStart(2,'0')} × 1,000,000 = ${n0(need(sim))} new customers a year`,
  how:{bio:'In = out: the percent lost times the number of customers.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<=2000)return `Your gut was right on: <b>${n0(m.guess)}</b> a year, and about ${n0(m.guess*0.88)} of them would historically be teenagers.`;
   return `Your gut was off by <b>${n0(off)}</b>. The math says <b>${n0(m.guess)}</b> a year, about ${n0(m.guess*0.88)} of them under 18 if the pattern matches cigarettes.`;},
  again(sim){sim.p.q=3+Math.floor(Math.random()*13);sim.p.u18=false;sim.p.u26=false;sim.p.guess=10000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'2,000,000 customers, 6% lost each year. How many new customers a year to stay the same size?',answer:120000,tol:1,unit:'customers',d:0,hint:'0.06 × 2,000,000',explain:'0.06 × 2,000,000 = 120,000 a year.'},
  {lvl:'bio',instant:true,q:'If no one under 18 ever started, what would happen to the company’s customers over time?',choices:['They would stay the same','They would shrink a lot, because 88% of starters are under 18','They would grow'],correct:1,explain:'Only 12% of the usual new customers would still come in, so outflow beats inflow every year until the tank settles much lower.'},
  {lvl:'honors',kind:'num',q:'Starters: 12,000 a year. Lost: 8% a year. What size does the company settle at in the long run?',answer:150000,tol:1,unit:'customers',d:0,hint:'In = out at equilibrium: 0.08 × N = 12,000',explain:'N = 12,000 ÷ 0.08 = 150,000.'},
  {lvl:'honors',instant:true,q:'A 1981 Philip Morris research report said “Today’s teenager is tomorrow’s potential regular customer.” What kind of evidence is that?',choices:['A rumor','The company’s own internal document, later made public through lawsuits','An advertisement'],correct:1,explain:'Internal documents released through litigation show what companies said to themselves, not just what they told the public. A federal court relied on documents like these in 2006.'},
  {lvl:'ap',instant:true,q:'N(t+1) = 0.92N(t) + 12,000, N(0) = 1,000,000. Which is N(t)?',choices:['150,000 + 850,000(0.92)ᵗ','1,000,000(0.92)ᵗ','150,000(0.92)ᵗ'],correct:0,explain:'Equilibrium S/q = 150,000; the gap 850,000 decays by 0.92 each year.'}
 ],
 tour:[
  {title:'A tank of customers',text:'Think of a company’s customers as water in a tank. The dashed line is today: 1,000,000 customers.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{q:8,u18:false,u26:false});}},
  {title:'The drain',text:'Every year some customers quit and some die: 8% in this model. That is 80,000 a year draining out.',pause:true,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'The inflow',text:'To stay level, 80,000 new customers must start each year. Look at the pipes: for cigarettes, 88% of adults who smoke daily started before 18, 11% from 18 to 25, and only 1% at 26 or older.',pause:true,setup:sim=>{sim.tst=3;sim._t0=null;}},
  {title:'Close the teen pipe',text:'What if no one under 18 started? Watch the tank over 30 years: inflow drops to 12% of what is needed, and the company shrinks toward 120,000 customers.',pause:true,speed:0.5,setup:sim=>{sim.tst=4;sim._t0=null;BioLab.setValues(sim,{u18:true});}},
  {title:'The companies knew',text:'A 1981 Philip Morris research report, made public through lawsuits, said “Today’s teenager is tomorrow’s potential regular customer” and noted that most smokers start as teens.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'A court found it',text:'In 2006, in United States v. Philip Morris, a federal judge found that the major cigarette companies had for decades intentionally marketed to people under 21 to recruit “replacement smokers.”',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'Does this fit pouches?',text:'Zyn’s maker says its growth comes from adults switching away from cigarettes and dip, and many pouch users do also use other tobacco. But a 2025 British study found 1 in 6 pouch users had never regularly smoked, and US high school pouch use rose from 2022 to 2025. Which story fits best is an open question: watch the data.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{u18:false});}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How much does a company depend on teens starting?</p><ol><li>Set the loss rate to 5%, 8% and 12%. Record the new customers needed.</li><li>Turn on “no one under 18 starts.” Record the customers after 30 years.</li></ol><p>Write one sentence: why would a company care so much about teen use, even if it says it only sells to adults?</p>',
  honors:'<p><b>Question:</b> Where does the tank settle?</p><ol><li>For each loss rate, compute S ÷ q with and without under-18 starters. Check with the tool.</li><li>Turn off starters under 26 too. What is left?</li></ol><p>Explain, with inflow and outflow, why 99% of starts by age 26 matters to an industry.</p>',
  ap:'<p><b>Question:</b> How fast does the tank drain?</p><ol><li>Derive N(t) = S/q + (N₀ − S/q)(1 − q)ᵗ from the recursion.</li><li>Find the half-life of the gap for q = 8%.</li></ol><p><b>CER:</b> Claim whether a company could stay the same size on adult switchers alone, using the model and real data you can find.</p>'},
 terms:[
  {t:'Replacement customers',d:'New customers who take the place of those who quit or die. The industry’s own term was “replacement smokers.”'},
  {t:'Inflow and outflow',d:'What comes in and what goes out each year. A stock stays level when they are equal.'},
  {t:'Equilibrium',d:'The level where inflow equals outflow, so the number stops changing: N = S ÷ q.',lvl:'honors'},
  {t:'Internal document',d:'A company’s private memo or report. Lawsuits made millions of tobacco industry documents public (UCSF Industry Documents Library).',lvl:'honors'}
 ],
 about:'<p><b>The model.</b> N(t+1) = N(t)(1 − q) + S, where q is the share lost each year and S the starters each year. The 8% loss rate is illustrative. Starter ages come from the 2012 Surgeon General’s report (<i>Preventing Tobacco Use Among Youth and Young Adults</i>): of adult daily smokers, 88% first smoked by 18 and 99% by 26. That is cigarette data; pouches are too new to know their pattern.</p><p><b>Documents and findings.</b> Myron Johnston, “Young Smokers: Prevalence, Trends, Implications, and Related Demographic Trends,” Philip Morris, March 31, 1981 (UCSF Industry Documents Library). <i>United States v. Philip Morris</i>, Judge Gladys Kessler’s 2006 final opinion, found that the companies “intentionally marketed to young people under the age of twenty-one in order to recruit ‘replacement smokers’.”</p><p><b>The pouch question.</b> Philip Morris International says it wants adults who smoke to switch. A 2025 study in <i>Lancet Public Health</i> found that in Great Britain 69% of pouch users also used other nicotine products, while 16% had never regularly smoked. US high school pouch use increased from 2022 to 2025 (NYTS). The model shows why a company’s long-term size depends on who starts; it does not prove what any one company intends.</p>'
};
BioLab.register(SIM);
})();

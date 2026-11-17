(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* A success story: high school cigarette smoking, 1991–2025.
   YRBS: 1991 27.5%, 1997 36.4%, 2001 28.5%, 2003 21.9%, 2009 19.5%, 2019 6.0%, 2021 3.8%. NYTS: 2023 1.9%, 2025 1.8%.
   Price: a 10% price increase cuts the number of kids who smoke by about 6–7% (consensus summarized by the Campaign for Tobacco-Free Kids from Surgeon General reports).
   truth campaign: about 22% of the 1999–2002 decline, about 300,000 fewer youth smokers (Farrelly et al., AJPH 2005). */
const PTS=[[1991,27.5],[1997,36.4],[2001,28.5],[2003,21.9],[2009,19.5],[2019,6.0],[2021,3.8],[2023,1.9],[2025,1.8]];
const EV=[{y:1997.5,l:'Joe Camel retired'},{y:1998.9,l:'Master Settlement'},{y:2000.2,l:'truth campaign'},{y:2009.3,l:'FDA can regulate tobacco'},{y:2019.95,l:'Tobacco 21'}];
const rate=y=>{for(let i=0;i<PTS.length-1;i++){const[a,va]=PTS[i],[b,vb]=PTS[i+1];if(y>=a&&y<=b)return va+(vb-va)*(y-a)/(b-a);}return y<1991?27.5:1.8;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const SCH=sim=>atLeast('honors')?sim.p.school:1600;
const drop=()=>100*(36.4-1.8)/36.4;
/* what-if: pouch use with a price increase, IF teens respond the way they do to cigarette prices (6.5% fewer per 10%) */
const whatIf=sim=>2.3*Math.pow(1-0.065,sim.p.price/10);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'quitworks',hash:'quitworks',apUnit:7,order:10,tab:'Success story: how teen smoking fell 95%',kind:'Learning tool',prereq:['vapegraph'],next:['hooked'],
 skills:{bio:'Percent decrease and percent of a number · Algebra 1 (Unit 1), Health (Unit 7)',honors:'Percent decrease; elasticity as a rate (6–7% fewer per 10% price) · Algebra 1, Economics, Health',ap:'Compounding a percent effect: (1 − 0.065)^(p/10); evaluating a dose-response study · Algebra 2 (Unit 5), AP Macroeconomics, AP Statistics'},
 card:'Teen smoking fell from more than 1 in 3 to under 2 in 100. See it in a school of 1,600, find what worked, and test what it could mean for pouches.',
 title:'A success story: how teen smoking fell 95%',
 lede:{bio:'In 1997, more than a third of US high schoolers smoked cigarettes. By 2025, fewer than 2 in 100 did. It was not luck: higher prices, limits on ads aimed at kids, honest youth-made campaigns and raising the buying age to 21 all helped. The same tools can work on new products.',
  honors:'Economists measure how much use drops when price rises. For cigarettes, a 10% price increase cuts the number of kids who smoke by about 6 to 7%. Teens are more sensitive to price than adults, which is one reason taxes protect them most.',
  ap:'The truth campaign was studied with a dose-response design: teens in media markets that saw more ads smoked less, which made the causal case stronger than a simple before-and-after.'},
 scale:'A school of 1,600 high school students; each dot is one student. The line is the share of US high schoolers who smoked cigarettes in the past 30 days.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Explore',
 controls:[
  {id:'guess',label:'Your gut: by what percent did high school smoking fall from 1997 to 2025?',type:'range',min:0,max:100,step:1,def:30,unit:'%'},
  {id:'year',label:'Year shown in the school',type:'range',min:1991,max:2025,step:1,def:1997,noGut:true},
  {id:'school',label:'Students in the school',type:'range',min:400,max:3000,step:100,def:1600,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'price',label:'What if pouch prices rose this much?',type:'range',min:0,max:100,step:10,def:0,unit:'%',lvl:'honors',noGut:true,help:'Assumes teens respond to pouch prices the way they do to cigarette prices: about 6.5% fewer users for each 10% price rise. Pouches are new, so this is an assumption to test, not a finding.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'r',label:'High schoolers who smoked, in the year shown',unit:'%',d:1,min:0,max:40,get:sim=>rate(sim.p.year)},
  {id:'n',label:'Students in this school who would smoke',unit:'',d:0,min:0,max:null,get:sim=>SCH(sim)*rate(sim.p.year)/100},
  {id:'drop',label:'Fall from 1997 to 2025',unit:'%',d:1,min:0,max:100,get:sim=>hid(sim,drop())},
  {id:'wi',label:'High school pouch use if prices rose (from 2.3%, an assumption)',unit:'%',d:2,min:0,max:3,lvl:'honors',get:sim=>whatIf(sim)}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  let yr=sim.p.year;if(stg===1)yr=1997;if(stg===2)yr=Math.min(2025,1997+tau*5);
  /* ---- left: the school ---- */
  const n=SCH(sim),cols=40,rows=Math.ceil(n/cols),cell=Math.min(9,Math.floor(300/rows)),gx=14,gy=60;const sm=Math.round(n*rate(yr)/100);
  txt(ctx,'A school of '+n.toLocaleString('en-US')+' in '+Math.round(yr),gx,30,{s:14*k,w:800});
  for(let i=0;i<n;i++){const r=Math.floor(i/cols),c=i%cols;ctx.fillStyle=i<sm?'#6c757d':'#90be6d';ctx.fillRect(gx+c*cell,gy+r*cell,cell-2,cell-2);}
  txt(ctx,sm+' smoke',gx,gy+rows*cell+20*k,{s:16*k,w:800,c:'#495057'});
  /* ---- right: the line ---- */
  const L=gx+cols*cell+Math.round(46+10*k),R=786,T=60,B=Math.round(372-8*k),X=y=>L+(y-1991)/34*(R-L),Y=v=>B-v/40*(B-T);
  txt(ctx,'High schoolers who smoke',L,30,{s:14*k,w:800});
  [0,20,40].forEach(v=>txt(ctx,v+'%',L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'}));
  [1991,2000,2010,2025].forEach(y=>txt(ctx,String(y),X(y),B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  const end=stg===2?yr:2025;ctx.strokeStyle='#495057';ctx.lineWidth=3;ctx.beginPath();for(let y=1991;y<=end;y+=0.25){const p=[X(y),Y(rate(y))];y===1991?ctx.moveTo(...p):ctx.lineTo(...p);}ctx.stroke();
  PTS.forEach(([y,v])=>{if(y<=end){ctx.fillStyle='#495057';ctx.beginPath();ctx.arc(X(y),Y(v),3.5,0,7);ctx.fill();}});
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(yr),T);ctx.lineTo(X(yr),B);ctx.stroke();
  if(stg>=3||stg>=99)EV.forEach((e,i)=>{if(stg===3&&i>2)return;const x=X(e.y);ctx.fillStyle='#2a9d8f';ctx.beginPath();ctx.arc(x,Y(rate(e.y)),6,0,7);ctx.fill();if(!bg){const rt=x>620;txt(ctx,e.l,x+(rt?-10:10),Y(rate(e.y))-6+(i<3?(i-1)*15:0),{s:11.5*k,w:700,c:'#2a9d8f',a:rt?'right':'left'});}});
  if(stg===4)pill(ctx,'10% higher price → about 6–7% fewer kids who smoke',(L+R)/2,T+14,'#2a9d8f','#fff',12.5*Math.min(k,1.3));
  if(stg===5)pill(ctx,'truth ads: about 300,000 fewer youth smokers by 2002',(L+R)/2,T+14,'#2a9d8f','#fff',12.5*Math.min(k,1.3));
  if(sh&&stg>=99){txt(ctx,'−'+f1(drop())+'% since 1997',R,T+20,{s:15*k,w:800,c:PAL['rj'],a:'right'});}
  const G=stg>=99?GS(sim):null;if(G)txt(ctx,'Your gut: −'+G.guess+'%',R,T+40*k,{s:13*k,w:700,c:PAL['s4'],a:'right'});
  if(stg===7||(stg>=99&&atLeast('honors')&&sim.p.price>0)){const w=whatIf(sim);pill(ctx,'Pouches, if prices rose '+sim.p.price+'%: 2.3% → '+w.toFixed(2)+'% (assumption)',(L+R)/2,B-22,'#7b2cbf','#fff',12.5*Math.min(k,1.3));}},
 narrate(sim){const y=sim.p.year,r=rate(y);const base=`In ${y}, about ${f1(r)}% of high schoolers smoked: <b>${Math.round(SCH(sim)*r/100)}</b> students in a school of ${SCH(sim).toLocaleString('en-US')}. `;
  if(!shown(sim))return base+'<b>By what percent did teen smoking fall from 1997 to 2025?</b>';
  return base+`From 36.4% to 1.8% is a <b>${f1(drop())}% drop</b>: about 582 students down to 29 in a school this size.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: in 1997, 36.4% of US high schoolers smoked cigarettes. In 2025 it was 1.8%. Drag the slider to the percent drop you think that is, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-drop()),guess:sim.p.guess,label:sim.p.guess+'% drop'};},
  solve(sim){return {v:0,guess:drop(),label:f1(drop())+'% drop'};},
  hint:{bio:'Lock in your gut answer. Then you will compute the percent decrease.'},
  calc:{unit:'%',d:1,tol:a=>0.6,
   prompt:{bio:'High school smoking was <b>36.4%</b> in 1997 and <b>1.8%</b> in 2025. What is the percent decrease?'},
   answer:()=>drop(),
   hint:'Percent decrease = (old − new) ÷ old × 100.',
   steps(){return ['Change: 36.4 − 1.8 = 34.6 percentage points.','Divide by the start: 34.6 ÷ 36.4 = 0.951.',`× 100 = <b>${f1(drop())}%</b> lower.`];}},
  formula:()=>`(36.4 − 1.8) ÷ 36.4 × 100 = ${f1(drop())}%`,
  how:{bio:'(old − new) ÷ old × 100.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<4)return `Your gut was right on: <b>${f1(m.guess)}%</b> lower. One of the biggest public health wins of your parents’ lifetime.`;
   return `Your gut was off by <b>${f1(off)} points</b>. Teen smoking fell <b>${f1(m.guess)}%</b>, from more than 1 in 3 to under 1 in 50.`;},
  again(sim){sim.p.guess=30;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In a school of 1,600, how many students would smoke at 1997’s rate of 36.4%?',answer:582.4,tol:1,unit:'students',d:0,hint:'1,600 × 0.364',explain:'1,600 × 0.364 ≈ 582 students. At 2025’s 1.8%, it would be about 29.'},
  {lvl:'bio',instant:true,q:'Which of these helped cut teen smoking?',choices:['Higher prices, limits on ads aimed at kids, honest youth campaigns and raising the buying age','Only scaring teens with warnings','Nothing: it fell by itself'],correct:0,explain:'Many policies worked together. Research ties price increases, the truth campaign and marketing limits to the decline.'},
  {lvl:'honors',kind:'num',q:'A tax raises the price 20%. If kids respond as they do to cigarettes (about 6.5% fewer per 10%), about what percent fewer kids use?',answer:12.6,tol:0.6,unit:'%',d:1,hint:'1 − 0.935²',explain:'0.935 × 0.935 ≈ 0.874, so about 12.6% fewer. (Simply doubling 6.5% gives 13%: close for small changes.)'},
  {lvl:'honors',instant:true,q:'The truth campaign is credited with about 22% of the 1999–2002 decline. Why were researchers fairly confident it was a cause?',choices:['Smoking went down after it started','Teens in places that saw more truth ads smoked less: a dose-response pattern','The ads were popular'],correct:1,explain:'Dose-response, more exposure going with more effect, is stronger evidence than a before-and-after change alone.'},
  {lvl:'ap',instant:true,q:'Why is applying the cigarette price effect to pouches only an assumption?',choices:['Pouches have no price','Pouches are a different product with a different market; their price effect has not been measured as well','Prices never matter'],correct:1,explain:'Elasticities come from data on a specific product and time. Borrowing one is a reasonable starting guess that must be tested.'}
 ],
 tour:[
  {title:'1997: more than 1 in 3',text:'In 1997, 36.4% of US high schoolers smoked cigarettes. In a school of 1,600, that is about 582 students: the gray squares.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;}},
  {title:'Watch it fall',text:'Watch the school and the line from 1997 to 2025. Gray squares turn green as smoking falls to 1.8%: about 29 students.',pause:true,speed:0.5,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'Limits on marketing to kids',text:'Joe Camel was retired in 1997. The 1998 Master Settlement Agreement banned cartoon characters and most billboard ads, and funded a national youth campaign.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Price',text:'Higher tobacco taxes raised prices. The research consensus: each 10% price increase cuts the number of kids who smoke by about 6 to 7%. Teens, with less money, respond most.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Teens telling the truth',text:'The truth campaign, made with teens, exposed industry tactics instead of lecturing. A 2005 study credited it with about 22% of the 1999–2002 drop, about 300,000 fewer young smokers.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Buying age 21, and help to quit',text:'In 2019 Tobacco 21 raised the buying age for all tobacco, including pouches. And quitting help works: in a 2024 trial, teens in Truth Initiative’s text program were 35% more likely to quit vaping.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'What could work for pouches?',text:'If teens responded to pouch prices the way they did to cigarette prices, a 50% price rise would cut high school pouch use from 2.3% to about 1.6%. That is an assumption to test, not a finding.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{price:50});}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How big was the change in a school like ours?</p><ol><li>Move the year from 1991 to 2025 in 5-year steps. Record the students who would smoke.</li><li>Which 5 years had the biggest drop?</li></ol><p>Write one sentence: which policy do you think mattered most, and why?</p>',
  honors:'<p><b>Question:</b> What could a price change do for pouches?</p><ol><li>Set the pouch price rise to 10%, 30%, 50% and 100%. Record the what-if rate.</li><li>Compute the 30% case by hand with (0.935)³.</li></ol><p>Explain why this is an assumption, and what data would test it.</p>',
  ap:'<p><b>Question:</b> How do we know what worked?</p><ol><li>Read about the truth campaign’s dose-response study (Farrelly et al., 2005).</li><li>Design a study to test whether a pouch tax reduces teen use.</li></ol><p><b>CER:</b> Claim which two policies would most reduce teen pouch use, with evidence from the cigarette story.</p>'},
 terms:[
  {t:'Percent decrease',d:'(old − new) ÷ old × 100.'},
  {t:'Master Settlement Agreement',d:'The 1998 deal between 46 states and the big cigarette companies: payments to states, limits on youth marketing and funding for prevention.'},
  {t:'Tobacco 21',d:'The 2019 federal law raising the minimum age to buy any tobacco product, including e-cigarettes and pouches, to 21.'},
  {t:'Price elasticity',d:'How much use changes when price changes, in percent terms.',lvl:'honors'},
  {t:'Dose-response',d:'More exposure going with more effect. It strengthens a causal claim.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> Current cigarette smoking among US high school students, Youth Risk Behavior Survey: 27.5% (1991), 36.4% (1997), 28.5% (2001), 21.9% (2003), 19.5% (2009), 6.0% (2019), 3.8% (2021). National Youth Tobacco Survey: 1.9% (2023), 1.8% (2025). The two surveys are measured differently; the line joins them for a picture of the trend, and years between points are drawn as straight lines.</p><p><b>What worked.</b> Price: the consensus summarized by the Campaign for Tobacco-Free Kids and the 2014 Surgeon General’s report is that a 10% price increase cuts the number of kids who smoke by about 6 to 7%. truth: Farrelly et al., <i>American Journal of Public Health</i>, 2005 (about 22% of the 1999–2002 decline; about 300,000 fewer youth smokers). Quitting: Truth Initiative’s This is Quitting text program, randomized trial published in 2024 (teens 35% more likely to quit vaping). The pouch what-if borrows the cigarette price effect; it is an assumption.</p><p><b>Get help.</b> Teens in Colorado: text <b>Start My Quit</b> to 36072 or call 1-855-891-9989 (My Life, My Quit). Truth Initiative’s EX Program: text <b>EXPROGRAM</b> to 88709 (now covers pouches). Or talk to a counselor, nurse, coach or doctor.</p>'
};
BioLab.register(SIM);
})();

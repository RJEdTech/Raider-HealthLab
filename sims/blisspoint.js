(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* The bliss point: the sugar level a taste test likes best.
   Made-up taste-test model: liking L(s) = 7.9 − 0.065(s − 11)², s = grams of sugar per 100 mL. (Real colas: about 11 g per 100 mL; Coca-Cola: 39 g per 12 oz can.)
   Howard Moskowitz coined "bliss point"; for Dr Pepper he tested 59 sweetness variations in about 3,000 taste tests (Michael Moss, NPR 2015).
   Drinks: Coca-Cola 20 oz 65 g; Monster Energy 16 oz 54 g; Gatorade 20 oz 34 g. 4 g = 1 teaspoon.
   American Heart Association (2016): ages 2–18 should have no more than 6 teaspoons (25 g) of added sugar a day. */
const S0=11,A=7.9,B=0.065;
const like=s=>A-B*(s-S0)*(s-S0);
const TESTS=[4,6,8,10,12,14,16,18];
const noise=[0.25,-0.2,0.15,-0.1,0.12,-0.18,0.2,-0.15];
const DR={coke20:{l:'Cola, 20 oz bottle',g:65},monster:{l:'Energy drink, 16 oz can',g:54},gatorade:{l:'Sports drink, 20 oz',g:34},coke12:{l:'Cola, 12 oz can',g:39}};
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const n2=v=>(Math.round(v*100)/100).toString();
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* standard form: L = −0.065s² + 1.43s − 0.165 */
const a2=-B,b2=2*B*S0,c2=A-B*S0*S0;

const SIM={
 id:'blisspoint',hash:'blisspoint',apUnit:7,order:4,tab:'The bliss point: engineered to want more',kind:'Learning tool',prereq:[],next:['playbook','caffeinecurve','checkclaim'],
 skills:{bio:'Reading a curve’s peak; grams to teaspoons · Algebra 1 (Unit 1), Health (Unit 2)',honors:'The vertex of a parabola: the peak is halfway between two equal points · Algebra 1 (Unit 7: quadratics), Health',ap:'Vertex form and s = −b ÷ 2a; fitting a quadratic to data · Algebra 2 (Unit 2), AP Precalculus (Unit 1)'},
 card:'Run a taste test, find the sugar level people like most, and see how food scientists hunt for that “bliss point,” then count the teaspoons in drinks you know.',
 title:'The bliss point: how much sugar makes you want more?',
 lede:{bio:'Too little sugar and a drink tastes flat; too much and it is sickly sweet. In between is the level people like most. Food companies run thousands of taste tests to find it, a level called the bliss point, so their products are as hard to stop as possible.',
  honors:'Liking scores in a taste test rise and then fall as sugar goes up, so a parabola fits them well. The bliss point is the vertex. Because a parabola is symmetric, the peak sits exactly halfway between any two sugar levels that score the same.',
  ap:'In standard form L = as² + bs + c with a < 0, the vertex is at s = −b ÷ 2a. Sweet taste activates the brain’s reward system; whether sugar is addictive the way drugs are is still debated by scientists.'},
 scale:'A made-up taste test of a lemon soda at 8 sugar levels, in grams of sugar per 100 mL (about 3.4 oz). Real colas have about 11 g per 100 mL.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'The taste test',
 controls:[
  {id:'guess',label:'Your gut: the sugar level people like most',type:'range',min:4,max:18,step:0.5,def:16,unit:' g per 100 mL'},
  {id:'drink',label:'A real drink to compare',type:'select',def:'coke20',noGut:true,options:Object.keys(DR).map(k=>({v:k,l:DR[k].l+' ('+DR[k].g+' g)'}))},
  {id:'reveal',label:'Show the curve now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'bp',label:'Bliss point',unit:'g per 100 mL',d:1,min:0,max:20,get:sim=>hid(sim,S0)},
  {id:'tsp',label:'Teaspoons of sugar in the drink you picked (4 g each)',unit:'tsp',d:1,min:0,max:20,get:sim=>DR[sim.p.drink].g/4},
  {id:'days',label:'Compared with the AHA limit for ages 2–18 (6 tsp, 25 g a day)',unit:'× the limit',d:1,min:0,max:4,get:sim=>DR[sim.p.drink].g/25}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* ---- left: taste test ---- */
  const L=Math.round(54+14*k),R=470,T=40,B0=Math.round(380-8*k),X=s=>L+(s-3)/16*(R-L),Y=v=>B0-v/9*(B0-T);
  txt(ctx,'How much tasters like it (0 to 9)',L,T-14,{s:13*k,w:700});
  [0,3,6,9].forEach(v=>txt(ctx,String(v),L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'}));
  [4,8,12,16].forEach(s=>txt(ctx,String(s),X(s),B0+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  txt(ctx,'Grams of sugar per 100 mL',(L+R)/2,B0+32*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,B0);ctx.lineTo(R,B0);ctx.moveTo(L,T);ctx.lineTo(L,B0);ctx.stroke();
  const nShow=stg===1?2:stg===2?TESTS.length:TESTS.length;const reveal=stg<99?Math.min(nShow,Math.floor(tau*2.2)+1):TESTS.length;
  TESTS.forEach((s,i)=>{if(i>=reveal)return;const v=like(s)+noise[i];ctx.fillStyle='#4f8fd1';ctx.beginPath();ctx.arc(X(s),Y(v),6,0,7);ctx.fill();
   if(!bg&&stg===2)txt(ctx,v.toFixed(1),X(s),Y(v)-10,{s:12*k,c:PAL['cv-ink'],a:'center'});});
  const curve=(sh&&stg>=3)||(stg>=99&&sh);
  if(curve){ctx.strokeStyle='#e76f51';ctx.lineWidth=3;ctx.beginPath();for(let s=3.5;s<=18.5;s+=0.1){const p=[X(s),Y(like(s))];s===3.5?ctx.moveTo(...p):ctx.lineTo(...p);}ctx.stroke();
   if(stg===4||stg>=99&&atLeast('honors')){const y=Y(like(8));ctx.strokeStyle=PAL['s5'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(8),y);ctx.lineTo(X(14),y);ctx.stroke();ctx.setLineDash([]);[8,14].forEach(s=>{ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(s),y,5,0,7);ctx.fill();});if(!bg)txt(ctx,'Same score at 8 and 14 → peak at 11',X(11),y+18*k,{s:12*k,w:700,c:PAL['s5'],a:'center'});}
   ctx.strokeStyle=PAL['rj'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(X(S0),Y(A));ctx.lineTo(X(S0),B0);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(S0),Y(A),8,0,7);ctx.fill();
   txt(ctx,'Bliss point: '+S0+' g',X(S0)+12,Y(A)-6,{s:14*k,w:800,c:PAL['rj']});}
  else if(stg>=99)pill(ctx,'Lock in your gut answer to fit the curve',(L+R)/2,(T+B0)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));
  if(stg===5){ctx.fillStyle='#2a9d8f';ctx.beginPath();ctx.arc(X(11),B0-6,7,0,7);ctx.fill();txt(ctx,'Real colas: about 11 g',X(11),B0-18,{s:12.5*k,w:800,c:'#2a9d8f',a:'center'});}
  const G=stg>=99?GS(sim):null;if(G){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(G.guess),T+10);ctx.lineTo(X(G.guess),B0);ctx.stroke();txt(ctx,'Your gut',X(G.guess)+4,T+20,{s:12*k,w:700,c:PAL['s4']});}
  /* ---- right: teaspoons in a real drink ---- */
  const d=stg===6?DR.coke20:DR[sim.p.drink],tsp=d.g/4,RX=505;
  txt(ctx,d.l,RX,T-14,{s:13*k,w:700});txt(ctx,d.g+' g = '+n2(tsp)+' teaspoons',RX,T+6,{s:13*k,c:PAL['cv-soft']});
  const cols=4,cw=30,rowH=cw+2;for(let i=0;i<Math.ceil(tsp);i++){const r=Math.floor(i/cols),c=i%cols,x=RX+10+c*(cw+8),y=B0-28-r*rowH;const part=Math.min(1,tsp-i);ctx.fillStyle='#ffffff';ctx.strokeStyle='#6c757d';ctx.lineWidth=1.5;rr(ctx,x,y,cw*part,cw-4,5);ctx.fill();ctx.stroke();ctx.fillStyle='#dee2e6';ctx.fillRect(x+3,y+cw-10,cw*part-6,3);}
  /* AHA line at 6 tsp */
  const yA=B0-28-1*rowH-4;ctx.strokeStyle=PAL['rj'];ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(RX,yA);ctx.lineTo(RX+170,yA);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'AHA daily',RX+176,yA-4,{s:12*k,w:700,c:PAL['rj']});txt(ctx,'max: 6 tsp',RX+176,yA+12*k,{s:12*k,w:700,c:PAL['rj']});if(!bg)txt(ctx,'(ages 2–18)',RX+176,yA+26*k,{s:11*k,c:PAL['rj']});
  txt(ctx,'Each cube = 1 teaspoon (4 g)',RX,B0+16*k,{s:12*k,c:PAL['cv-soft']});},
 narrate(sim){if(!shown(sim))return 'Eight cups of lemon soda, each with a different amount of sugar. Tasters rate each one. <b>Which sugar level do you think they like most?</b>';
  const d=DR[sim.p.drink];return `The scores rise, peak at <b>${S0} g per 100 mL</b>, then fall: that peak is the bliss point, about where real colas sit. A ${d.l.toLowerCase()} has ${d.g} g of sugar, ${n2(d.g/4)} teaspoons, ${(d.g/25).toFixed(1)} times the American Heart Association’s daily limit for kids and teens.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a taste test of a lemon soda at 8 sugar levels, from 4 to 18 grams per 100 mL. Drag the slider to the sugar level you think tasters like most, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-S0),guess:sim.p.guess,label:sim.p.guess+' g per 100 mL'};},
  solve(sim){return {v:0,guess:S0,label:S0+' g per 100 mL'};},
  hint:{bio:'Lock in your gut answer. Then you will find the peak from two equal scores.'},
  calc:{unit:'g',d:1,tol:a=>0.15,
   prompt:{bio:'The fitted curve gives the <b>same liking score at 8 g and at 14 g</b> per 100 mL. A parabola is symmetric. At what sugar level is the peak?',
    ap:`The fitted curve is L = ${a2.toFixed(3)}s² + ${b2.toFixed(2)}s ${c2<0?'− '+Math.abs(c2).toFixed(3):'+ '+c2.toFixed(3)}. At what sugar level s is the vertex?`},
   answer:()=>S0,
   hint:'Halfway between two points with the same height: add them and divide by 2. Or use s = −b ÷ 2a.',
   steps(){return atLeast('ap')?[`s = −b ÷ 2a = −${b2.toFixed(2)} ÷ (2 × ${a2.toFixed(3)}) = ${n2(-b2/(2*a2))}.`,'The bliss point is <b>11 g per 100 mL</b>.']:['Equal scores at 8 and 14, so the peak is halfway between them.','(8 + 14) ÷ 2 = <b>11 g per 100 mL</b>.'];}},
  formula:()=>atLeast('ap')?`s = −b ÷ 2a = −${b2.toFixed(2)} ÷ (2 × ${a2.toFixed(3)}) = 11`:'(8 + 14) ÷ 2 = 11 g per 100 mL',
  how:{bio:'Find two sugar levels with the same score; the peak is halfway between them.'},
  compare(sim,g,m){const off=Math.abs(g.guess-S0);if(off<=1)return 'Your gut was right on: about <b>11 g per 100 mL</b>, right where real colas sit.';
   return `Your gut was off by <b>${off} g</b>. ${g.guess>S0?'More is not always better: past the peak, people like it less.':'You guessed low.'} The peak is <b>11 g per 100 mL</b>, about where real colas sit.`;},
  again(sim){sim.p.guess=16;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A 20 oz cola has 65 g of sugar. How many teaspoons is that (4 g each)?',answer:16.25,tol:0.1,unit:'tsp',d:2,hint:'65 ÷ 4',explain:'65 ÷ 4 = 16.25 teaspoons, almost 3 times the American Heart Association’s 6-teaspoon daily limit for ages 2 to 18.'},
  {lvl:'bio',instant:true,q:'In the taste test, what happens after the bliss point as sugar keeps going up?',choices:['People like it more and more','People like it less','Nothing changes'],correct:1,explain:'Too sweet tastes worse. That is why companies test to find the peak, not the maximum.'},
  {lvl:'honors',kind:'num',q:'A taste test gives the same score at 6 g and 13 g per 100 mL. Where is the peak?',answer:9.5,tol:0.05,unit:'g',d:1,hint:'(6 + 13) ÷ 2',explain:'A parabola is symmetric, so the vertex is halfway: 9.5 g per 100 mL.'},
  {lvl:'honors',instant:true,q:'For one soda, a researcher tested 59 sweetness levels in about 3,000 taste tests. What was the company trying to find?',choices:['The cheapest recipe','The sweetness level people like most, so they buy more','The least sugar allowed'],correct:1,explain:'Howard Moskowitz did this for Dr Pepper and called the peak the bliss point (Michael Moss, Salt Sugar Fat).'},
  {lvl:'ap',instant:true,q:'L = −0.05s² + 1.2s + 1. Where is the vertex?',choices:['s = 6','s = 12','s = 24'],correct:1,explain:'s = −1.2 ÷ (2 × −0.05) = 12.'}
 ],
 tour:[
  {title:'A taste test',text:'Eight cups of the same lemon soda, each with a different amount of sugar. Tasters score each from 0 to 9. Watch the first two scores come in.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;}},
  {title:'Up, then down',text:'Watch all eight scores. Too little sugar tastes flat, so scores rise at first. Too much tastes sickly, so they fall again.',pause:true,speed:0.5,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'The bliss point',text:'A parabola fits the scores. Its peak, the vertex, is the sugar level people like most: 11 grams per 100 mL here. Food scientists call it the bliss point.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Finding the peak',text:'A parabola is symmetric. The curve gives the same score at 8 g and 14 g, so the peak is halfway: (8 + 14) ÷ 2 = 11.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'It is a real job',text:'Researcher Howard Moskowitz coined the term. For Dr Pepper he tested 59 sweetness levels in about 3,000 taste tests to find the peak. Real colas sit near 11 g of sugar per 100 mL.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Count the teaspoons',text:'A 20 oz cola has 65 g of sugar: 16 teaspoons. The American Heart Association says kids and teens should have no more than 6 teaspoons of added sugar a whole day.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{drink:'coke20'});}},
  {lvl:'honors',title:'Who pays for the science?',text:'In 1967 a sugar trade group paid Harvard scientists for a review that played down sugar’s role in heart disease; the funding came out in 2016 from internal documents. See it in “The playbook through time.”',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'ap',title:'Reward, not just taste',text:'Sweet taste activates the brain’s reward system and its dopamine signals, which teaches us to come back. Whether sugar is addictive in the way nicotine is remains debated among scientists. The bliss point does not need it to be: it only needs you to want one more.',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How sweet are the drinks you know?</p><ol><li>Pick each real drink. Record its grams and teaspoons.</li><li>Find a drink at home or school and read its label. Convert its sugar to teaspoons.</li></ol><p>Write one sentence: why would a company aim for the bliss point instead of the most sugar possible?</p>',
  honors:'<p><b>Question:</b> Where is the peak?</p><ol><li>Read two test points with about the same score and average their sugar levels.</li><li>Compare with the fitted bliss point.</li></ol><p>Explain why taste-test data fits a parabola better than a straight line.</p>',
  ap:'<p><b>Question:</b> How well does a quadratic fit?</p><ol><li>Write the 8 test points from the picture. Fit a quadratic with your calculator.</li><li>Find the vertex with −b ÷ 2a and compare with 11.</li></ol><p><b>CER:</b> Claim whether a company should be allowed to keep its taste-test research secret when its products are sold to kids.</p>'},
 terms:[
  {t:'Bliss point',d:'The amount of sugar (or salt or fat) that people like most in a food or drink.'},
  {t:'Added sugar',d:'Sugar put into foods and drinks, not sugar that is naturally in fruit or milk.'},
  {t:'Vertex',d:'The highest or lowest point of a parabola.',lvl:'honors'},
  {t:'Reward system',d:'Brain circuits, using dopamine, that make us want to repeat what felt good.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> A made-up taste test: liking = 7.9 − 0.065(s − 11)², with small made-up scatter in the points. Real taste tests use many more tasters and products.</p><p><b>Sources.</b> Howard Moskowitz and the bliss point; his Dr Pepper work testing 59 sweetness variations in about 3,000 taste tests is described by Michael Moss in <i>Salt Sugar Fat</i> (2013) and on NPR (2015). Sugar contents: Coca-Cola 20 oz, 65 g; 12 oz, 39 g (Coca-Cola); Monster Energy 16 oz, 54 g (CSPI); Gatorade 20 oz, 34 g. The American Heart Association (2016) recommends that children and teens ages 2 to 18 have no more than 6 teaspoons (25 g) of added sugar a day. Sugar industry review: Kearns, Schmidt and Glantz, <i>JAMA Internal Medicine</i>, 2016.</p><p><b>What this tool is not.</b> It does not count calories or say anything about body size. It is about how products are designed and how to read a label.</p>'
};
BioLab.register(SIM);
})();

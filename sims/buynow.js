(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* "Only 2 left!": how stores and apps push you to buy.
   Checkout math: total = price × (1 + tax) + fee + shipping; pay-in-4 = total ÷ 4.
   FTC staff report "Bringing Dark Patterns to Light" (Sept 2022): fake countdown timers, false low-stock and "people viewing" messages, drip pricing (fees shown late).
   CRS (2022): dark patterns found on 11% of popular shopping sites (2019 study) and 95% of free Android apps (2020 study).
   CFPB: buy now, pay later is 28% of unsecured debt for borrowers 18–24 vs. 17% overall. Federal Reserve: 24% of BNPL users made a late payment.
   Stores: Roschk et al., Journal of Retailing 2016, meta-analysis of 66 studies (15,621 shoppers): music, scent and color all affect shoppers. */
const TAX=sim=>sim.p.tax/100;
const FEE=sim=>sim.p.fee,SHIP=sim=>sim.p.ship;
const total=sim=>sim.p.price*(1+TAX(sim))+FEE(sim)+SHIP(sim);
const over=sim=>100*(total(sim)-sim.p.price)/sim.p.price;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const $=v=>'$'+v.toFixed(2);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fLine(sim){return `${$(sim.p.price)} × ${(1+TAX(sim)).toFixed(3)} + ${$(FEE(sim))} fee + ${$(SHIP(sim))} shipping = ${$(total(sim))}`;}

const SIM={
 id:'buynow',hash:'buynow',apUnit:7,order:1,tab:'Only 2 left! Stores and apps built to make you buy',kind:'Simulation',prereq:[],next:['lifetime','goviral','whosad'],
 skills:{bio:'Sales tax, fees and percent increase · Algebra 1 (Unit 1), Personal Finance, Health (Unit 6)',honors:'Percent increase and splitting a total; reading the real price · Algebra 1, Personal Finance',ap:'Effective cost of late fees as an annual rate · Algebra 2, Personal Finance'},
 card:'Check out a $39.99 hoodie on a shopping app full of countdown timers, “only 2 left” badges and pay-in-4 buttons. Guess what you really pay, then see the tricks a mall store uses too.',
 title:'Only 2 left! How stores and apps are built to make you buy',
 lede:{bio:'Shopping apps and stores are designed by people whose job is to get you to buy faster and spend more. Some designs are just good service. Others, like fake countdown timers, false “only 2 left” messages and fees that show up only at checkout, are what the Federal Trade Commission calls dark patterns.',
  honors:'The FTC sorts these designs into types: urgency (timers), scarcity (low stock), social proof (“28 people are viewing”), drip pricing (fees added late) and more. A true message is fine; a false one is a deceptive practice. Together they push you to decide before you have done the math.',
  ap:'Pay-in-4 makes a total look four times smaller. Pay-in-4 plans usually charge no interest, but late fees can work out to a very high annual rate on a small balance.'},
 scale:'A made-up shopping app on a phone, and a made-up mall store. The prices and fees are examples you can change.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Your cart (made up)',
 controls:[
  {id:'guess',label:'Your gut: what you really pay for the $39.99 hoodie',type:'range',min:30,max:80,step:0.5,def:39.99,unit:' $'},
  {id:'where',label:'Where you shop',type:'seg',def:'app',noGut:true,options:[{v:'app',l:'Shopping app'},{v:'mall',l:'Mall store'}]},
  {id:'price',label:'Sticker price',type:'range',min:10,max:120,step:0.01,def:39.99,unit:' $',noGut:true,onChange:clearGut},
  {id:'fee',label:'“Service fee” added at checkout',type:'range',min:0,max:10,step:0.01,def:4.99,unit:' $',noGut:true,onChange:clearGut,help:'The FTC’s report shows a $4.99 fee that appears only at the last step. That is called drip pricing.'},
  {id:'ship',label:'Shipping',type:'range',min:0,max:12,step:0.01,def:5.99,unit:' $',noGut:true,onChange:clearGut},
  {id:'tax',label:'Sales tax',type:'range',min:0,max:10,step:0.1,def:8,unit:'%',noGut:true,onChange:clearGut,help:'Sales tax in the Denver area is around 8%, depending on the city. Here it applies to the item only.'},
  {id:'reveal',label:'Show the checkout total now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'tot',label:'What you really pay',unit:'$',d:2,min:0,max:null,get:sim=>hid(sim,total(sim))},
  {id:'over',label:'Above the sticker price',unit:'%',d:1,min:0,max:null,get:sim=>hid(sim,over(sim))},
  {id:'p4',label:'Each pay-in-4 payment',unit:'$',d:2,min:0,max:null,get:sim=>hid(sim,total(sim)/4)},
  {id:'late',lvl:'ap',label:'A $7 late fee on one payment, as a 2-week rate',unit:'%',d:1,min:0,max:null,get:sim=>hid(sim,100*7/(total(sim)/4))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const mall=(stg===7)||(stg>=99&&sim.p.where==='mall');
  if(!mall){/* ---- the phone ---- */
   const PX=40,PY=14,PW=250,PH=422;rr(ctx,PX,PY,PW,PH,26);ctx.fillStyle='#1f2430';ctx.fill();rr(ctx,PX+10,PY+12,PW-20,PH-24,18);ctx.fillStyle='#ffffff';ctx.fill();
   const cx=PX+PW/2;let y=PY+40;
   ctx.fillStyle='#d9dde3';rr(ctx,PX+30,y,PW-60,110,10);ctx.fill();txt(ctx,'Hoodie',cx,y+60,{s:16,w:800,c:'#444',a:'center'});y+=126;
   txt(ctx,$(sim.p.price),PX+28,y,{s:20,w:800,c:'#111'});
   const on=n=>stg>=99||stg>=n;
   if(on(2)){const left=Math.max(0,599-Math.floor(tau*3)%600),mm=Math.floor(left/60),ss=String(left%60).padStart(2,'0');rr(ctx,PX+118,y-18,108,26,8);ctx.fillStyle='#e63946';ctx.fill();txt(ctx,'Ends in 0'+mm+':'+ss,PX+172,y,{s:13,w:800,c:'#fff',a:'center'});}
   y+=26;
   if(on(3)){rr(ctx,PX+24,y-14,96,22,6);ctx.fillStyle='#ffb703';ctx.fill();txt(ctx,'Only 2 left!',PX+72,y+2,{s:12.5,w:800,c:'#111',a:'center'});
    txt(ctx,(26+Math.floor(tau*0.7)%5)+' people viewing',PX+130,y+2,{s:12,c:'#666'});}
   y+=26;
   if(on(6)){const ang=tau*2.2;ctx.save();ctx.translate(PX+PW-50,PY+92);ctx.rotate(ang);for(let i=0;i<8;i++){ctx.fillStyle=['#e63946','#ffb703','#2a9d8f','#4f8fd1'][i%4];ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,28,i*Math.PI/4,(i+1)*Math.PI/4);ctx.closePath();ctx.fill();}ctx.restore();txt(ctx,'Spin to win!',PX+PW-50,PY+136,{s:12,w:800,c:'#e63946',a:'center'});}
   /* checkout */
   const showFees=sh&&(stg>=99||stg>=4);
   const lines=[['Hoodie',sim.p.price],['Tax',sim.p.price*TAX(sim)]];if(showFees){lines.push(['Service fee',FEE(sim)]);lines.push(['Shipping',SHIP(sim)]);}
   ctx.strokeStyle='#ddd';ctx.beginPath();ctx.moveTo(PX+24,y);ctx.lineTo(PX+PW-24,y);ctx.stroke();y+=20;
   lines.forEach(([l,v],i)=>{const isNew=i>=2&&stg===4;txt(ctx,l,PX+28,y,{s:13,w:isNew?800:400,c:isNew?'#e63946':'#333'});txt(ctx,$(v),PX+PW-28,y,{s:13,w:isNew?800:400,c:isNew?'#e63946':'#333',a:'right'});y+=20;});
   txt(ctx,'Total',PX+28,y+4,{s:15,w:800,c:'#111'});txt(ctx,showFees?$(total(sim)):'?',PX+PW-28,y+4,{s:15,w:800,c:'#111',a:'right'});y+=24;
   rr(ctx,PX+24,y,PW-48,34,10);ctx.fillStyle='#111';ctx.fill();txt(ctx,'Buy now',cx,y+22,{s:14,w:800,c:'#fff',a:'center'});y+=42;
   if(on(5)){rr(ctx,PX+24,y,PW-48,30,10);ctx.fillStyle='#ffc8dd';ctx.fill();txt(ctx,showFees?'or 4 payments of '+$(total(sim)/4):'or 4 easy payments',cx,y+20,{s:12.5,w:800,c:'#5a189a',a:'center'});}
   /* labels on the right */
   const LX=320,tags=[[2,'Urgency: a countdown timer','The FTC calls fake timers a dark pattern.'],[3,'Scarcity and social proof','They rush you. When false, they are deceptive.'],[4,'Drip pricing','Fees appear only at the last step.'],[5,'Pay in 4','The total looks 4 times smaller. Late fees can apply.'],[6,'Games','Spin wheels and points: winning, not needing.']];
   let ty=40;tags.forEach(([n,h,d])=>{if(stg<99&&stg<n)return;if(stg>=99&&!sh)return;const hi=stg===n;rr(ctx,LX,ty,460,66,10);ctx.fillStyle=hi?PAL['rj']:PAL['card'];ctx.fill();txt(ctx,h,LX+14,ty+24,{s:14*Math.min(k,1.2),w:800,c:hi?'#fff':PAL['cv-ink']});if(!bg)txt(ctx,d,LX+14,ty+46,{s:12,c:hi?'#fff':PAL['cv-soft']});ty+=74;});
   if(stg>=99&&!sh)pill(ctx,'Lock in your gut answer to see the full checkout',550,220,PAL['muted'],'#fff',13*Math.min(k,1.4));
   const G=stg>=99?GS(sim):null;if(G)pill(ctx,'Your gut: '+$(G.guess)+'  ·  Real total: '+(sh?$(total(sim)):'?'),550,420,PAL['s4'],'#fff',13*Math.min(k,1.4));}
  else{/* ---- the mall store ---- */
   const dim=.55+.1*Math.sin(t*1.5);ctx.fillStyle='#14110f';ctx.fillRect(0,0,800,450);
   ctx.fillStyle='rgba(255,214,140,'+(0.18*dim)+')';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(110+i*150,40,60,0,Math.PI);ctx.fill();}
   for(let i=0;i<6;i++){ctx.fillStyle='#3d342c';ctx.fillRect(60+i*120,250,80,140);ctx.fillStyle='#5c5146';ctx.fillRect(66+i*120,240,68,14);}
   /* music notes */for(let i=0;i<7;i++){const ph=((t*0.4+i/7)%1);ctx.globalAlpha=1-ph;txt(ctx,'♪',80+i*100,200-ph*120,{s:26,c:'#ffd166',a:'center'});ctx.globalAlpha=1;}
   /* scent */for(let i=0;i<5;i++){const ph=((t*0.25+i/5)%1);ctx.strokeStyle='rgba(200,180,255,'+(0.6*(1-ph))+')';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<60;x+=4)ctx.lineTo(620+i*25+x,330-ph*160+Math.sin(x/8+t*3)*6);ctx.stroke();}
   const tags=[['Dim lights','Hard to see prices; feels like a club'],['Loud music','Fast, loud music changes your mood and pace'],['A signature scent','Scent changed every response in a 66-study review'],['Attractive models at the door','The look of the brand, in person']];
   tags.forEach(([h,d],i)=>{rr(ctx,20+(i%2)*390,300+Math.floor(i/2)*70,370,60,10);ctx.fillStyle='rgba(255,255,255,0.9)';ctx.fill();txt(ctx,h,34+(i%2)*390,324+Math.floor(i/2)*70,{s:14,w:800,c:'#111'});if(!bg)txt(ctx,d,34+(i%2)*390,344+Math.floor(i/2)*70,{s:12,c:'#444'});});
   txt(ctx,'A mall store built for teens',20,30,{s:16,w:800,c:'#fff'});}},
 narrate(sim){if(sim.p.where==='mall')return 'Teen clothing stores have been known for dim lights, loud music and a signature scent. A review of 66 studies found music, scent and color all change how shoppers feel and what they intend to buy. <b>None of it is about the clothes.</b>';
  if(!shown(sim))return `The sticker says ${$(sim.p.price)}, a timer is counting down and only 2 are left. <b>What will you actually pay at checkout?</b>`;
  return `The real total is <b>${$(total(sim))}</b>, ${over(sim).toFixed(1)}% above the sticker, and pay-in-4 shows it as ${$(total(sim)/4)}. The timer and the “only 2 left” badge did nothing to the price; they only changed how fast you decided.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a $39.99 hoodie, a countdown timer and “Only 2 left!” Drag the slider to what you think you will really pay at checkout, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-total(sim)),guess:sim.p.guess,label:$(sim.p.guess)};},
  solve(sim){const v=total(sim);return {v:0,guess:v,label:$(v)};},
  hint:{bio:'Lock in your gut answer. Then you will add it up yourself.'},
  calc:{unit:'$',d:2,tol:a=>0.05,
   prompt:{bio:sim=>`Hoodie <b>${$(sim.p.price)}</b>, sales tax <b>${sim.p.tax}%</b> on the hoodie, a <b>${$(FEE(sim))}</b> service fee and <b>${$(SHIP(sim))}</b> shipping. What is the total?`},
   answer:total,
   hint:'Tax = price × the tax rate as a decimal. Then add the price, the tax, the fee and the shipping.',
   steps(sim){const tx=sim.p.price*TAX(sim);return [`Tax: ${$(sim.p.price)} × ${TAX(sim).toFixed(3)} = ${$(tx)}.`,`Add: ${$(sim.p.price)} + ${$(tx)} + ${$(FEE(sim))} + ${$(SHIP(sim))} = <b>${$(total(sim))}</b>.`,`That is ${over(sim).toFixed(1)}% more than the sticker.`];}},
  formula:fLine,
  how:{bio:'Price + tax + every fee. Then compare with the sticker.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<1)return `Your gut was right on: <b>${$(m.guess)}</b>.`;
   return `Your gut was off by <b>${$(off)}</b>. ${g.guess<m.guess?'The fees showed up late, which is the point of drip pricing.':'You guessed high.'} The real total is <b>${$(m.guess)}</b>, ${over(sim).toFixed(1)}% above the sticker.`;},
  again(sim){sim.p.price=[19.99,24.99,39.99,49.99,64.99][Math.floor(Math.random()*5)];sim.p.fee=[0,2.99,3.99,4.99][Math.floor(Math.random()*4)];sim.p.ship=[0,4.99,5.99,7.99][Math.floor(Math.random()*4)];sim.p.guess=sim.p.price;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'$24.99 shirt, 8% tax on the shirt, a $3.99 fee and $4.99 shipping. Total?',answer:35.97,tol:0.03,unit:'$',d:2,hint:'24.99 × 1.08, then add 3.99 and 4.99',explain:'24.99 × 1.08 = 26.99; + 3.99 + 4.99 = $35.97, about 44% above the sticker.'},
  {lvl:'bio',instant:true,q:'A site says “Only 2 left!” when it has hundreds. What is that called?',choices:['Good customer service','A false scarcity claim, which the FTC treats as a dark pattern','A sale'],correct:1,explain:'True low-stock messages are fine. False ones push you to decide fast and are deceptive.'},
  {lvl:'bio',instant:true,q:'Why does pay-in-4 make you more likely to buy?',choices:['It lowers the price','It shows a number four times smaller, even though the total is the same','It adds a discount'],correct:1,explain:'The total does not change. Seeing $13.54 instead of $54.17 changes how it feels.'},
  {lvl:'honors',kind:'num',q:'A $54.17 total paid in 4. One payment is late, with a $7 fee. What did the hoodie end up costing?',answer:61.17,tol:0.02,unit:'$',d:2,hint:'54.17 + 7',explain:'$61.17, about 53% above the $39.99 sticker. Buy now, pay later plans make up 28% of unsecured debt for 18- to 24-year-olds (CFPB).'},
  {lvl:'ap',instant:true,q:'A $7 late fee on a $13.54 payment that is 2 weeks late is about 52% for 2 weeks. As a simple yearly rate (26 two-week periods), about:',choices:['52%','100%','1,340%'],correct:2,explain:'52% × 26 ≈ 1,340% a year: far higher than any credit card, though it applies only when you are late.'}
 ],
 tour:[
  {title:'A $39.99 hoodie',text:'Here is a shopping app. The hoodie says $39.99. Watch what gets added around it.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{where:'app',price:39.99,fee:4.99,ship:5.99,tax:8});}},
  {title:'Urgency',text:'A countdown timer. The FTC’s 2022 report on dark patterns calls out timers on offers that are not really time-limited: when the clock hits zero, the deal is still there.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Scarcity and social proof',text:'“Only 2 left!” and “28 people viewing.” When they are true, that is information. When they are false, they are deceptive, and they work by rushing your decision.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Drip pricing',text:'At the last step, a $4.99 service fee and $5.99 shipping appear. With tax, the $39.99 hoodie is $54.17: 35% more. Showing fees late is called drip pricing.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Pay in 4',text:'“Or 4 payments of $13.54.” Same total, smaller-looking number. Most plans need you to be 18, but they are popular with young adults: buy now, pay later is 28% of unsecured debt for borrowers 18 to 24 (CFPB), and about 1 in 4 users has paid late.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Shopping as a game',text:'Spin wheels, points and “free gifts” that need more orders turn shopping into a game, so you think about winning instead of whether you need anything. A 2020 study found dark patterns in 95% of free Android apps.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'The mall does it too',text:'Some teen clothing stores became known for dim lights, loud music and a signature scent sprayed through the store. A review of 66 studies with 15,621 shoppers found music, scent and color all change shoppers’ mood and plans.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How far from the sticker is the real price?</p><ol><li>Set the fee and shipping to 0 and record the total. Then put them back.</li><li>Try three sticker prices: $19.99, $39.99 and $79.99. Record the percent above the sticker each time.</li></ol><p>Write one sentence: why does the same $10.98 in fees feel different on a cheap item and an expensive one?</p>',
  honors:'<p><b>Question:</b> Which trick changes the price, and which only changes your decision?</p><ol><li>Sort the five app tactics into “changes what you pay” and “changes how fast you decide.”</li><li>Find one real example on an app or site you use (screenshot it) and name the tactic.</li></ol><p>Explain when a scarcity message is honest and when it is a dark pattern.</p>',
  ap:'<p><b>Question:</b> What does a late fee cost as a rate?</p><ol><li>Compute a $7 late fee on each payment of carts from $20 to $200, as a 2-week rate and a yearly rate.</li><li>Compare with a credit card at 25% a year.</li></ol><p><b>CER:</b> Claim when pay-in-4 is a fair deal and when it is not.</p>'},
 terms:[
  {t:'Dark pattern',d:'A design that tricks or pressures you into choices you might not make otherwise. The FTC treats deceptive ones as illegal.'},
  {t:'Drip pricing',d:'Showing a low price first and adding required fees later in checkout.'},
  {t:'Scarcity claim',d:'A message that something is running out, like “Only 2 left.” Fine if true; deceptive if false.'},
  {t:'Social proof',d:'Showing what other people are doing (“28 people viewing”) so you follow along.'},
  {t:'Buy now, pay later',d:'A loan that splits a purchase into payments, often 4 payments over 6 weeks. Usually no interest, but late fees can apply.',lvl:'honors'},
  {t:'Sensory marketing',d:'Using lights, music, scent and color in a store to change how shoppers feel.',lvl:'honors'}
 ],
 about:'<p><b>The math.</b> Total = price × (1 + tax rate) + fee + shipping, with tax on the item only. Pay-in-4 = total ÷ 4. The prices are examples; real fees, shipping and taxes vary.</p><p><b>Sources.</b> FTC staff report, “Bringing Dark Patterns to Light” (September 2022): fake countdown timers, false scarcity and activity messages, and drip pricing, including a $4.99 fee shown only before checkout. Congressional Research Service, “What Hides in the Shadows: Deceptive Design of Dark Patterns” (2022): dark patterns on 11% of popular shopping sites (2019 study) and 95% of free Android apps (2020 study). CFPB: buy now, pay later is 28% of unsecured consumer debt for borrowers 18 to 24 vs. 17% overall; Federal Reserve data (via Motley Fool Money, 2025): 24% of users made a late payment. Spin wheels and “free gift” ladders are used by apps such as Temu. Roschk, Loureiro and Breitsohl, “Calibrating 30 Years of Experimental Research: A Meta-Analysis of the Atmospheric Effects of Music, Scent, and Color,” <i>Journal of Retailing</i>, 2016 (66 studies, 15,621 shoppers). Teen chains such as Abercrombie &amp; Fitch and Hollister became known for dim lighting, loud music and signature scents.</p><p><b>Not every design is a trick.</b> A true “low stock” note, a real sale end date and a clear total up front are good service. The question is whether a design helps you decide or decides for you.</p>'
};
BioLab.register(SIM);
})();

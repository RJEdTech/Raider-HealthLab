(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* Customer lifetime value of a nicotine pouch user.
   Spend per year = cans per week × 52 × price. Lifetime = spend per year × years of use (AP: price rises g per year → geometric series).
   Price: Zyn's suggested retail price $5.69 a 15-pouch can (Tobacco Insider); store prices about $4 to $7, more with state taxes.
   Zyn's maker: $1.88 billion US net revenue on 581.4 million cans in 2024, about $3.23 a can (Tobacco Insider, from PMI results).
   Surgeon General 2012: 88% of adult daily smokers first smoked by 18 and 99% by 26. */
const PER=1.88e9/581.4e6;
/* Products: typical 2026 store prices (approximate; students set their own). Pouch price: Zyn’s suggested retail price. */
const PROD={energy:{l:'Energy drink (16 oz can)',u:'cans',one:'can',p:3.29},soda:{l:'Soda (20 oz bottle)',u:'bottles',one:'bottle',p:2.49},pouch:{l:'Nicotine pouches (15-pouch can)',u:'cans',one:'can',p:5.69}};
const PR=sim=>PROD[sim.p.prod]||PROD.energy;
const isP=sim=>sim.p.prod==='pouch';
const yrs=sim=>Math.max(0,sim.p.stop-sim.p.start);
const yr=sim=>sim.p.cans*52*sim.p.price;
const G=sim=>atLeast('ap')?sim.p.grow/100:0;
function life(sim,start){const n=Math.max(0,sim.p.stop-(start===undefined?sim.p.start:start)),g=G(sim),a=yr(sim);if(g===0)return a*n;return a*(Math.pow(1+g,n)-1)/g;}
function invest(sim){const n=yrs(sim),r=0.07,a=yr(sim);return n?a*(Math.pow(1+r,n)-1)/r:0;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toFixed(2);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fLine(sim){if(G(sim)>0)return `${$(yr(sim))} × (1.0${Math.round(G(sim)*100)}^${yrs(sim)} − 1) ÷ ${G(sim)} = ${$(life(sim))}`;return `${sim.p.cans} cans × 52 weeks × ${$2(sim.p.price)} × ${yrs(sim)} years = ${$(life(sim))}`;}

const SIM={
 id:'lifetime',hash:'lifetime',apUnit:7,order:5,tab:'What is a teen customer worth?',kind:'Learning tool',prereq:[],next:['goviral','buynow','hooked'],
 skills:{bio:'Rates and multiplying units: cans/week × weeks × $/can · Algebra 1 (Unit 1), Personal Finance, Health (Unit 7)',honors:'Linear functions: spending as a function of the age you start · Algebra 1 (Unit 3), Personal Finance',ap:'Geometric series and future value: a((1 + r)ⁿ − 1)/r · Algebra 2 (Unit 6), AP Precalculus (Unit 2A), Personal Finance'},
 card:'Pick a product: energy drinks, soda or nicotine pouches. Work out what one teen customer is worth over the years, and why the age a habit starts matters so much to a company.',
 title:'What is a teen customer worth?',
 lede:{bio:'Businesses measure a customer’s lifetime value: how much one person will spend with them over the years. A habit that starts young, like a daily energy drink, can last decades, and for an addictive product like nicotine it often does. The math shows why the age a habit starts matters so much to a company.',
  honors:'Lifetime spending is a linear function of the starting age: every year earlier adds one more year of sales. For nicotine, almost nobody starts after their mid-20s, so a nicotine company’s future customers are mostly today’s teenagers.',
  ap:'If the price rises by a rate g each year, lifetime spending is a geometric series: a((1 + g)ⁿ − 1)/g. The same formula, with an investment return, tells you what that money could have become.'},
 scale:'One made-up person who uses pouches from the age they start until the age they stop. Money in today’s dollars unless a price increase is set.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'The customer (made up)',
 controls:[
  {id:'prod',label:'Product',type:'seg',def:'energy',noGut:true,onChange:sim=>{BioLab.setValues(sim,{price:PR(sim).p});clearGut(sim);},options:[{v:'energy',l:'Energy drink'},{v:'soda',l:'Soda'},{v:'pouch',l:'Nicotine pouches'}]},
  {id:'guess',label:'Your gut: total spent from age 15 to 40',type:'range',min:0,max:60000,step:500,def:5000,unit:' $'},
  {id:'start',label:'Age they start',type:'range',min:13,max:35,step:1,def:15,noGut:true,onChange:clearGut},
  {id:'stop',label:'Age they stop',type:'range',min:20,max:70,step:1,def:40,noGut:true,onChange:clearGut},
  {id:'cans',label:'How many a week',type:'range',min:1,max:14,step:0.5,def:3.5,noGut:true,onChange:clearGut,help:'3.5 a week is one every two days.'},
  {id:'price',label:'Price each',type:'range',min:1,max:12,step:0.01,def:3.29,unit:' $',noGut:true,onChange:clearGut,help:'Defaults are approximate store prices: energy drink about $3.29 a can, soda about $2.49 a bottle, Zyn’s suggested $5.69 a can. Put in what you see at your store.'},
  {id:'grow',label:'Price rise per year',type:'range',min:0,max:6,step:0.5,def:0,unit:'%',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'year',label:'Spent per year',unit:'$',d:0,min:0,max:null,get:sim=>yr(sim)},
  {id:'life',label:'Spent in a lifetime of use',unit:'$',d:0,min:0,max:null,get:sim=>hid(sim,life(sim))},
  {id:'late',label:'Same person, but starting at 25',unit:'$',d:0,min:0,max:null,get:sim=>hid(sim,life(sim,25))},
  {id:'maker',label:'Of the lifetime total, to Zyn’s maker (about $3.23 a can in 2024)',unit:'$',d:0,min:0,max:null,lvl:'honors',get:sim=>isP(sim)?hid(sim,life(sim)*PER/sim.p.price):null},
  {id:'inv',label:'The yearly money invested instead at 7% a year, by the stop age',unit:'$',d:0,min:0,max:null,lvl:'ap',get:sim=>hid(sim,invest(sim))}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const A0=10,A1=70,L=Math.round(60+20*k),R=780,T=60,B=Math.round(372-8*k);
  const X=a=>L+(a-A0)/(A1-A0)*(R-L);
  /* age ruler */
  txt(ctx,'Age',L-10,B+18*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  for(let a=10;a<=70;a+=bg?20:10)txt(ctx,String(a),X(a),B+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* years of use band */
  const s0=sim.p.start,s1=sim.p.stop;ctx.fillStyle='#ff006e';ctx.globalAlpha=.14;ctx.fillRect(X(s0),T,X(s1)-X(s0),B-T);ctx.globalAlpha=1;
  txt(ctx,(bg?'':'Years as a customer: ')+yrs(sim),(X(s0)+X(s1))/2,T-10,{s:13*k,w:700,c:'#c9184a',a:'center'});
  /* the 26 line */
  if(isP(sim)&&(stg>=5&&stg<99||stg>=99&&atLeast('honors'))){ctx.strokeStyle=PAL['s5'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(26),T);ctx.lineTo(X(26),B);ctx.stroke();ctx.setLineDash([]);txt(ctx,bg?'99% start by 26':'99% of adults who smoke started by 26',X(26)+6,T+16*k,{s:12*k,w:700,c:PAL['s5']});}
  /* cumulative spending */
  const top=Math.max(1000,life(sim,13)*1.08,(GS(sim)?GS(sim).guess*1.1:0));const Y=v=>B-v/top*(B-T-24);
  (()=>{const st=top>40000?20000:top>16000?10000:5000;for(let v=0;v<=top;v+=st)txt(ctx,v?'$'+(v/1000)+'k':'$0',L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});})();
  const curve=(start,col,dash,lw)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash);ctx.beginPath();for(let a=A0;a<=A1;a+=0.25){const n=clamp(a-start,0,Math.max(0,s1-start)),g=G(sim),v=g?yr(sim)*(Math.pow(1+g,n)-1)/g:yr(sim)*n;a===A0?ctx.moveTo(X(a),Y(v)):ctx.lineTo(X(a),Y(v));}ctx.stroke();ctx.setLineDash([]);};
  const showMain=sh&&(stg>=2);
  if(showMain){const aE=stg===2?s0+1:A1;ctx.save();ctx.beginPath();ctx.rect(0,0,X(aE)+1,450);ctx.clip();curve(s0,'#ff006e',[],3.5);ctx.restore();
   if(stg===6)pill(ctx,'“Today’s teenager is tomorrow’s potential regular customer” (Philip Morris, 1981)',(L+R)/2,T+46,'#7b2cbf','#fff',12.5*Math.min(k,1.3));
   if(stg>=4){curve(25,PAL['s2'],[7,5],2.5);const v25=life(sim,25);if(s1>25)txt(ctx,(bg?'From 25: ':'Starting at 25: ')+$(v25),X(s1)+(X(s1)>620?-10:10),Y(v25)+18*k,{s:13*k,w:700,c:PAL['s2'],a:X(s1)>620?'right':'left'});}
   if(stg>=3){const v=life(sim);ctx.fillStyle='#ff006e';ctx.beginPath();ctx.arc(X(s1),Y(v),7,0,7);ctx.fill();txt(ctx,(bg?'':'Starting at '+s0+': ')+$(v),X(s1)+(X(s1)>620?-10:10),Y(v)-10,{s:14*k,w:800,c:'#c9184a',a:X(s1)>620?'right':'left'});}
   if(stg===2){pill(ctx,'One year: '+$(yr(sim)),X(s0+1)+70,Y(yr(sim))-20,'#ff006e','#fff',13*Math.min(k,1.4));}}
  else if(stg>=99)pill(ctx,'Lock in your gut answer to see the money',(L+R)/2,(T+B)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));
  if(stg===1){pill(ctx,sim.p.cans+' '+PR(sim).u+' a week × '+$2(sim.p.price)+' = '+$2(sim.p.cans*sim.p.price)+' a week',(L+R)/2,(T+B)/2,'#ff006e','#fff',14*Math.min(k,1.4));}
  if(stg===7){pill(ctx,'About $3.23 of each can goes to Zyn’s maker (2024)',(L+R)/2,T+46,'#7b2cbf','#fff',13*Math.min(k,1.4));}
  const Gs=stg>=99?GS(sim):null;if(Gs){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(s1)-14,Y(Gs.guess));ctx.lineTo(X(s1)+14,Y(Gs.guess));ctx.stroke();txt(ctx,'Your gut: '+$(Gs.guess),X(s1)-18,Y(Gs.guess)+4,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  if(sh&&!bg&&stg>=99&&sim.gutS&&sim.gutS.m)txt(ctx,'The math: '+fLine(sim),R,444,{s:12*k,w:700,c:PAL['rj'],a:'right'});},
 narrate(sim){if(!shown(sim))return `This customer starts at ${sim.p.start}, buys ${sim.p.cans} ${PR(sim).u} a week (${PR(sim).l.toLowerCase()}) at ${$2(sim.p.price)}, and stops at ${sim.p.stop}. <b>How much do they spend in all?</b>`;
  return `<b>${$(life(sim))}</b> over ${yrs(sim)} years, about ${$(yr(sim))} a year. Starting at 25 instead would bring in ${$(life(sim,25))}. `+(sim.p.start<25?`The ${25-sim.p.start} extra years from starting young are worth ${$(life(sim)-life(sim,25))} to the business.`:'');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a 15-year-old who buys an energy drink every two days (3.5 a week, about $3.29 each) until age 40. Drag the slider to how much money you think that adds up to, then lock it in. (In the full lab, you can switch to soda or nicotine pouches.)',
   honors:'Before the totals appear: drag the slider to this customer’s lifetime spending, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-life(sim)),guess:sim.p.guess,label:$(sim.p.guess)};},
  solve(sim){const v=life(sim);return {v:0,guess:v,label:$(v)};},
  hint:{bio:'Lock in your gut answer. Then you will multiply it out yourself.'},
  calc:{unit:'$',d:0,tol:a=>Math.max(5,0.01*a),
   prompt:{bio:sim=>`<b>${sim.p.cans}</b> ${PR(sim).u} a week, <b>52</b> weeks a year, <b>${$2(sim.p.price)}</b> a can, from age <b>${sim.p.start}</b> to <b>${sim.p.stop}</b>. How much money in all?`,
    ap:sim=>G(sim)>0?`First year: ${sim.p.cans} × 52 × ${$2(sim.p.price)}. The price rises ${sim.p.grow}% a year for ${yrs(sim)} years. Total spent?`:`${sim.p.cans} cans/week × 52 × ${$2(sim.p.price)}, ages ${sim.p.start} to ${sim.p.stop}. Total spent?`},
   answer:sim=>life(sim),
   hint:'Number a week × 52 = number a year. × price = dollars a year. × years = total. Years = stop age − start age.',
   steps(sim){const c=sim.p.cans*52,a=yr(sim),n=yrs(sim);const out=[`${PR(sim).u[0].toUpperCase()+PR(sim).u.slice(1)} a year: ${sim.p.cans} × 52 = ${c}.`,`Dollars a year: ${c} × ${$2(sim.p.price)} = ${$2(a)}.`];
    if(G(sim)>0)out.push(`Rising ${sim.p.grow}% a year for ${n} years: ${$2(a)} × (1.0${Math.round(G(sim)*100)}^${n} − 1) ÷ ${G(sim)} = <b>${$(life(sim))}</b>.`);else out.push(`Years: ${sim.p.stop} − ${sim.p.start} = ${n}. Total: ${$2(a)} × ${n} = <b>${$(life(sim))}</b>.`);return out;}},
  formula:fLine,
  how:{bio:'Number a week × 52 × price × years.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);const tail=` If the same person started at 25, it would be ${$(life(sim,25))}.`;
   if(off<0.05*m.guess)return `Your gut was right on: about <b>${$(m.guess)}</b>.`+tail;
   return `Your gut was off by <b>${$(off)}</b>. ${g.guess<m.guess?'Small amounts a week add up over decades.':'You guessed high.'} The math says <b>${$(m.guess)}</b>.`+tail;},
  again(sim){sim.p.start=13+Math.floor(Math.random()*8);sim.p.stop=30+Math.floor(Math.random()*30);sim.p.cans=[2,3,3.5,5,7][Math.floor(Math.random()*5)];sim.p.price=Math.round(PR(sim).p*(0.85+Math.random()*0.4)*100)/100;sim.p.guess=5000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'One energy drink a day at $3.29. How much is that in a year (365 days)?',answer:1200.85,tol:2,unit:'$',d:2,hint:'365 × 3.29',explain:'365 × $3.29 ≈ $1,201 a year, before tax.'},
  {lvl:'bio',instant:true,q:'Why does a customer who starts at 15 matter more to a company than one who starts at 30?',choices:['Teens pay more per can','They can stay a customer 15 more years','Teens use less'],correct:1,explain:'Same spending per year, more years. For nicotine it is even sharper: most people who never start by their mid-20s never start at all.'},
  {lvl:'honors',instant:true,q:'The Surgeon General (2012) found 99% of adults who smoke daily first smoked by age 26. What does that mean for a company that needs new customers?',choices:['It can wait for adults to start','Almost all of its future customers will come from people who start young','Age does not matter'],correct:1,explain:'If almost no one starts after 26, a company that loses customers to quitting and death has to replace them with people who start young.'},
  {lvl:'honors',kind:'num',q:'In 2024, Zyn’s maker earned $1.88 billion in US net revenue on 581.4 million cans. About how much per can?',answer:3.23,tol:0.03,unit:'$',d:2,hint:'1,880,000,000 ÷ 581,400,000',explain:'About $3.23 a can. The rest of a $5.69 retail price goes to stores, distributors and taxes.'},
  {lvl:'ap',instant:true,q:'$598.78 a year, invested at 7% for 25 years. Which formula gives the total?',choices:['598.78 × 25 × 1.07','598.78 × (1.07²⁵ − 1) ÷ 0.07','598.78 × 1.07²⁵'],correct:1,explain:'A yearly deposit growing at r is a geometric series: a((1 + r)ⁿ − 1)/r ≈ $37,900.'}
 ],
 tour:[
  {title:'One week',text:'An energy drink every two days is 3.5 cans a week. At about $3.29 a can, that is about $11.50 a week.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{prod:'energy',start:15,stop:40,cans:3.5,price:3.29,grow:0});}},
  {title:'One year',text:'52 weeks × 3.5 cans × $3.29 = $598.78 a year. Watch the first year of the line.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'From 15 to 40',text:'25 years of that is about $14,970. The line climbs the same amount every year: spending is a linear function of time.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'If the habit started at 25',text:'The dashed line is the same person starting at 25: about $8,980. Ten extra years of habit are worth about $5,990 to the business. That is why brands want to be the one you pick first.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Nicotine: age is the whole game',text:'Switch to nicotine pouches, $5.69 a can: from 15 to 40 that is about $25,890. For nicotine, starting age matters even more: the Surgeon General found 88% of adults who smoke daily started by 18 and 99% by 26. Someone who reaches their mid-20s without nicotine almost never starts.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{prod:'pouch',price:5.69});}},
  {title:'The companies knew',text:'A 1981 Philip Morris research report, made public by lawsuits, called today’s teenager “tomorrow’s potential regular customer.” In 2006 a federal judge ruled that cigarette companies had intentionally marketed to people under 21 to recruit “replacement smokers.”',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'Who gets the money',text:'Not all of a $5.69 can goes to the maker. In 2024 Zyn’s maker earned $1.88 billion in US net revenue on 581.4 million cans, about $3.23 a can. Stores, distributors and taxes take the rest.',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'ap',title:'What it could have become',text:'Invest the energy-drink money, $598.78 a year, at 7% instead, and by 40 it grows to about $37,900. That is a geometric series: a((1 + r)ⁿ − 1)/r.',pause:true,setup:sim=>{sim.tst=8;BioLab.setValues(sim,{prod:'energy',price:3.29});}}
 ],
 lab:{bio:'<p><b>Question:</b> How much does starting age change the money?</p><ol><li>Keep the stop age at 40. Set the start age to 14, 16, 18, 21 and 25. Record the lifetime total.</li><li>How much does each year earlier add?</li></ol><p>Write one sentence: why would a business care what age its customers start?</p>',
  honors:'<p><b>Question:</b> Is lifetime spending a linear function of the starting age?</p><ol><li>Record the total for start ages 13 to 25 (stop at 40).</li><li>Find the slope. What does it mean in words?</li><li>Change the price to $12 (a high-tax state). How does the slope change?</li></ol><p>Explain how a tax changes a company’s and a customer’s side of this math.</p>',
  ap:'<p><b>Question:</b> What does a price increase do to lifetime value?</p><ol><li>Set the price rise to 0%, 3% and 5%. Record the totals.</li><li>Derive the geometric series formula.</li><li>Compare the lifetime cost with the 7% investment value.</li></ol><p><b>CER:</b> Claim how much one teen starting is worth to the industry, with evidence from your numbers.</p>'},
 terms:[
  {t:'Customer lifetime value',d:'How much money one customer brings a business over all the years they buy from it.'},
  {t:'Rate',d:'A quantity per unit of another, like cans per week or dollars per can. Multiplying rates cancels units.'},
  {t:'Net revenue',d:'What a company takes in from sales after discounts and certain taxes, before its own costs.',lvl:'honors'},
  {t:'Geometric series',d:'A sum where each term is the last times the same ratio.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Spending per year = number per week × 52 × price; lifetime = per year × years (or a geometric series if the price rises). It ignores quitting, changes in use over time and inflation.</p><p><b>Prices.</b> Energy drink ($3.29 a 16 oz can) and soda ($2.49 a 20 oz bottle) are approximate convenience-store prices; check your own store. Zyn’s suggested retail price is $5.69 per 15-pouch can (Tobacco Insider); real prices vary with state taxes. In 2024, Philip Morris International shipped 581.4 million Zyn cans in the US for $1.88 billion in net revenue.</p><p><b>Nicotine and age.</b> The 2012 Surgeon General’s report found that 88% of adult daily smokers first smoked by 18 and 99% by 26 (cigarette data; pouches are too new to know). Myron Johnston, “Young Smokers: Prevalence, Trends, Implications, and Related Demographic Trends,” Philip Morris, 1981 (UCSF Industry Documents Library). <i>United States v. Philip Morris</i> (2006) found the companies marketed to people under 21 to recruit “replacement smokers.”</p><p><b>Habits are not all the same.</b> Caffeine can cause dependence and withdrawal headaches; nicotine is far more addictive. The money math is the same; the hold is not. The 7% return is an illustrative long-run average.</p>'
};
BioLab.register(SIM);
})();

(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* High school current (past 30-day) e-cigarette use, National Youth Tobacco Survey (CDC/FDA), 2011–2025.
   2020: data collection stopped early (COVID-19); 2021 on: mostly online, so not directly comparable with earlier years.
   High school current nicotine pouch use: 2024 2.4%, 2025 2.3%. */
const D={2011:1.5,2012:2.8,2013:4.5,2014:13.4,2015:16.0,2016:11.3,2017:11.7,2018:20.8,2019:27.5,2020:19.6,2021:11.3,2022:14.1,2023:10.0,2024:7.8,2025:7.1};
const P={2024:2.4,2025:2.3};
const EVTS=[{y:2015.45,l:'JUUL launches (June)',s:1},{y:2018.7,l:'FDA calls youth vaping an “epidemic”',s:2},{y:2018.95,l:'Altria buys 35% of JUUL ($12.8 billion)',s:2,lvl:'honors'},{y:2019.95,l:'Tobacco 21 law',s:3},{y:2020.1,l:'FDA limits flavored cartridges',s:3},{y:2020.25,l:'COVID: survey cut short',s:4},{y:2022.7,l:'JUUL settles with 33 states',s:5},{y:2025.05,l:'FDA authorizes Zyn',s:6}];
const YRS=Object.keys(D).map(Number);
const pc=(a,b)=>100*(D[b]-D[a])/D[a];
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const y0=sim=>+sim.p.from,y1=sim=>+sim.p.to;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const yopts=YRS.map(y=>({v:y,l:String(y)}));
function fLine(sim){const a=y0(sim),b=y1(sim);return `(${D[b]} − ${D[a]}) ÷ ${D[a]} × 100 = ${f1(pc(a,b))}%`;}

const SIM={
 id:'vapegraph',hash:'vapegraph',apUnit:7,order:8,tab:'Did JUUL cause the vaping wave?',kind:'Learning tool',prereq:['playbook'],next:['betterthan'],
 skills:{bio:'Percent change vs. percentage points; reading a line graph · Algebra 1 (Unit 1), Health (Unit 7)',honors:'Percent change and percent of a percent; correlation vs. cause · Algebra 1, Statistics, Health',ap:'Causal inference from time series: timing, confounders and changes in measurement · AP Statistics (Units 3 and 4)'},
 card:'Read 15 years of national survey data on high school vaping, measure the jump when JUUL took off, and decide what the graph can and cannot prove.',
 title:'Did JUUL cause the vaping wave?',
 lede:{bio:'From 2017 to 2019, vaping among US high schoolers more than doubled, the same years JUUL took over the market. A graph like this is strong evidence that something big happened. Whether one company caused it takes more than a graph.',
  honors:'Two different numbers describe a change. Percentage points subtract: 27.5% − 11.7% = 15.8 points. Percent change divides by the start: 15.8 ÷ 11.7 = 135%. Both are true; mixing them up is a common way numbers mislead.',
  ap:'Timing lines up, and in 2019 most high schoolers who vaped named JUUL as their usual brand. But other things changed too: flavors, prices, disposables, laws and even how the survey was given. A causal claim has to deal with each.'},
 scale:'Share of all US high school students who used an e-cigarette on at least 1 of the past 30 days, from the National Youth Tobacco Survey, 2011 to 2025.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'Measure a change',
 controls:[
  {id:'guess',label:'Your gut: percent change in high school vaping, 2017 to 2019',type:'range',min:0,max:300,step:5,def:20,unit:'%'},
  {id:'from',label:'From',type:'select',def:2017,noGut:true,onChange:clearGut,options:yopts},
  {id:'to',label:'To',type:'select',def:2019,noGut:true,onChange:clearGut,options:yopts},
  {id:'events',label:'Show events',type:'toggle',def:true,noGut:true},
  {id:'pouch',label:'Show high school pouch use (2024, 2025)',type:'toggle',def:false,noGut:true},
  {id:'reveal',label:'Show the change now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'a',label:'Start year',unit:'%',d:1,min:0,max:30,get:sim=>D[y0(sim)]},
  {id:'b',label:'End year',unit:'%',d:1,min:0,max:30,get:sim=>D[y1(sim)]},
  {id:'pts',label:'Change in percentage points',unit:'points',d:1,min:null,max:null,get:sim=>hid(sim,D[y1(sim)]-D[y0(sim)])},
  {id:'pct',label:'Percent change',unit:'%',d:1,min:null,max:null,get:sim=>hid(sim,pc(y0(sim),y1(sim)))},
  {id:'juul',label:'2019: high schoolers who used JUUL (27.5% × 59.1%)',unit:'%',d:1,min:0,max:30,lvl:'honors',get:sim=>hid(sim,27.5*0.591)}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=Math.round(54+16*k),R=784,T=40,B=Math.round(396-10*k),X=y=>L+(y-2011)/14*(R-L),Y=v=>B-v/30*(B-T);
  for(let v=0;v<=30;v+=10){ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+'%',L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  YRS.forEach(y=>{if(!bg||y%2===1)txt(ctx,String(y),X(y),B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});
  /* the 2020+ survey change */
  const showM=stg===4||stg>=99&&atLeast('honors');if(showM){ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.10;ctx.fillRect(X(2019.5),T,R-X(2019.5),B-T);ctx.globalAlpha=1;txt(ctx,bg?'Survey changed':'Survey changed (COVID, then online)',R-4,B-8,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  /* line, drawn up to the reveal year */
  const upto=stg===1?2014:stg===2?2019:stg===3?2020.5:2025;const anim=stg<99?Math.min(upto,2011+tau*5):2025;
  ctx.strokeStyle='#ff006e';ctx.lineWidth=3;ctx.beginPath();let first=true;YRS.forEach(y=>{if(y<=anim){const p=[X(y),Y(D[y])];if(y===2020||y===2021){ctx.stroke();ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(X(y-1),Y(D[y-1]));}first?ctx.moveTo(...p):ctx.lineTo(...p);first=false;}});ctx.stroke();ctx.setLineDash([]);
  YRS.forEach(y=>{if(y<=anim){ctx.fillStyle='#ff006e';ctx.beginPath();ctx.arc(X(y),Y(D[y]),4,0,7);ctx.fill();}});
  if(sim.p.pouch||stg===6){Object.keys(P).forEach(y=>{ctx.fillStyle='#2a9d8f';ctx.beginPath();ctx.arc(X(+y),Y(P[y]),5,0,7);ctx.fill();});txt(ctx,'Pouches',X(2024),Y(2.4)-10,{s:12*k,w:700,c:'#2a9d8f',a:'center'});}
  /* events */
  if(sim.p.events||stg<99)EVTS.forEach((e,i)=>{if(e.lvl&&!atLeast(e.lvl))return;if(stg<99&&e.s>stg)return;const x=X(e.y);ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x,T+24);ctx.lineTo(x,B);ctx.stroke();ctx.setLineDash([]);
   const yy=T+32+i*15*Math.min(k,1.3);ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.8;const lab=bg?e.l.split(' (')[0].split(':')[0]:e.l;ctx.font=(11.5*k)+'px sans-serif';const tw=ctx.measureText(lab).width,ax=x>560?x-4-tw:x+4;ctx.fillRect(ax-2,yy-11*k,tw+4,14*k);ctx.globalAlpha=1;txt(ctx,lab,x+(x>560?-4:4),yy,{s:11.5*k,c:PAL['cv-ink'],a:x>560?'right':'left'});});
  /* the measured change */
  const a=y0(sim),b=y1(sim);if(stg>=99||stg===2){const A=stg===2?2017:a,Bv=stg===2?2019:b;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(A),Y(D[A]));ctx.lineTo(X(Bv),Y(D[A]));ctx.lineTo(X(Bv),Y(D[Bv]));ctx.stroke();
   if(sh){const lab=(D[Bv]-D[A]>=0?'+':'')+f1(D[Bv]-D[A])+' points = '+(pc(A,Bv)>=0?'+':'')+f1(pc(A,Bv))+'%';ctx.font='800 '+(13*k)+'px sans-serif';const tw=ctx.measureText(lab).width,lx=clamp(Math.min(X(A),X(Bv)),L+4,R-tw-4),ly=Math.max(Y(D[A]),Y(D[Bv]))+22*k;rr(ctx,lx-4,ly-14*k,tw+8,19*k,5);ctx.fillStyle=PAL['card'];ctx.fill();txt(ctx,lab,lx,ly,{s:13*k,w:800,c:PAL['s4']});}
   else pill(ctx,'Lock in your gut answer to measure the change',(L+R)/2,(T+B)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));}
  const G=stg>=99?GS(sim):null;if(G)txt(ctx,'Your gut: '+G.guess+'%',R,T-12,{s:13*k,w:700,c:PAL['s4'],a:'right'});
  if(sh&&!bg&&stg>=99&&sim.gutS&&sim.gutS.m)txt(ctx,'The math: '+fLine(sim),R,444,{s:12*k,w:700,c:PAL['rj'],a:'right'});},
 narrate(sim){const a=y0(sim),b=y1(sim);if(!shown(sim))return `High school vaping was ${D[a]}% in ${a} and ${D[b]}% in ${b}. <b>By what percent did it change?</b>`;
  return `From ${a} to ${b}: ${f1(D[b]-D[a])} percentage points, a <b>${f1(pc(a,b))}% change</b>. `+(a<=2017&&b>=2019?'Those are the years JUUL took over the market; in 2019, 59% of high schoolers who vaped named JUUL as their usual brand.':'Remember the survey changed in 2020 and 2021, so compare across that line with care.');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: high school vaping was 11.7% in 2017 and 27.5% in 2019. Drag the slider to the percent change you think that is, then lock it in.'},
  lock(sim){const a=pc(y0(sim),y1(sim));return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:sim.p.guess+'%'};},
  solve(sim){const a=pc(y0(sim),y1(sim));return {v:0,guess:a,label:f1(a)+'%'};},
  hint:{bio:'Lock in your gut answer. Then you will compute it: change ÷ start.'},
  calc:{unit:'%',d:1,tol:a=>1,
   prompt:{bio:sim=>`High school vaping was <b>${D[y0(sim)]}%</b> in ${y0(sim)} and <b>${D[y1(sim)]}%</b> in ${y1(sim)}. What is the percent change?`},
   answer:sim=>pc(y0(sim),y1(sim)),
   hint:'Percent change = (new − old) ÷ old × 100. Divide by the starting year, not the ending one.',
   steps(sim){const a=y0(sim),b=y1(sim),d=D[b]-D[a];return [`Change: ${D[b]} − ${D[a]} = ${f1(d)} percentage points.`,`Divide by the start: ${f1(d)} ÷ ${D[a]} = ${(d/D[a]).toFixed(3)}.`,`× 100 = <b>${f1(pc(a,b))}%</b>.`];}},
  formula:fLine,
  how:{bio:'(new − old) ÷ old × 100.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<8)return `Your gut was right on: about <b>${f1(m.guess)}%</b>.`;
   return `Your gut was off by <b>${f1(off)} points</b>. ${g.guess<m.guess&&g.guess<=20?'You may have used percentage points (27.5 − 11.7 = 15.8) instead of percent change.':''} The math says <b>${f1(m.guess)}%</b>.`;},
  again(sim){const i=Math.floor(Math.random()*13);sim.p.from=YRS[i];sim.p.to=YRS[Math.min(14,i+2+Math.floor(Math.random()*3))];sim.p.guess=20;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Vaping went from 11.7% to 27.5%. A headline says it rose “15.8%.” What is wrong?',choices:['Nothing','It rose 15.8 percentage points, which is a 135% increase','It should say 27.5%'],correct:1,explain:'Subtracting gives percentage points. Percent change divides by the start: 15.8 ÷ 11.7 ≈ 135%.'},
  {lvl:'bio',kind:'num',q:'High school vaping fell from 27.5% (2019) to 7.8% (2024). What is the percent change?',answer:-71.6,tol:1,unit:'%',d:1,hint:'(7.8 − 27.5) ÷ 27.5 × 100',explain:'−19.7 ÷ 27.5 ≈ −71.6%. A big drop, though the survey method changed in between.'},
  {lvl:'honors',kind:'num',q:'In 2019, 27.5% of high schoolers vaped, and 59.1% of them named JUUL their usual brand. What percent of all high schoolers is that?',answer:16.3,tol:0.3,unit:'%',d:1,hint:'27.5 × 0.591',explain:'27.5 × 0.591 ≈ 16.3% of all high schoolers, about 1 in 6.'},
  {lvl:'honors',instant:true,q:'Vaping jumped from 4.5% to 13.4% between 2013 and 2014, before JUUL launched in 2015. What does that tell you?',choices:['JUUL caused it anyway','Other products and causes were driving vaping before JUUL, so JUUL cannot explain the whole story','The data is wrong'],correct:1,explain:'Timing matters. An earlier rise means something else was at work too, even if JUUL drove the 2018–2019 surge.'},
  {lvl:'ap',instant:true,q:'Vaping fell from 19.6% in 2020 to 11.3% in 2021. Why be careful with that drop?',choices:['It is too small','The survey moved mostly online during COVID, so the two years are not directly comparable','Teens stopped answering'],correct:1,explain:'When the way you measure changes, part of a change in the numbers can come from the measuring, not the behavior.'}
 ],
 tour:[
  {title:'Before JUUL',text:'Watch the line. In 2011, 1.5% of high schoolers vaped. By 2014 it was 13.4%, and JUUL did not exist yet. Something else was already pushing vaping up.',pause:true,speed:0.5,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{events:true,pouch:false});}},
  {title:'The JUUL years',text:'JUUL launched in June 2015 and took over the market. From 2017 to 2019, vaping went from 11.7% to 27.5%: 15.8 percentage points, a 135% increase. In 2019, 59% of high schoolers who vaped named JUUL as their usual brand.',pause:true,speed:0.5,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'The response',text:'Late 2019: Tobacco 21 raised the buying age to 21. Early 2020: the FDA limited flavored cartridges like JUUL’s. Both came as the line peaked.',pause:true,setup:sim=>{sim.tst=3;sim._t0=null;}},
  {title:'The measuring changed',text:'In 2020, COVID cut the survey short; from 2021 it was mostly taken online. The dashed part crosses that change, so the drop from 2020 to 2021 is partly about how the survey was given.',pause:true,setup:sim=>{sim.tst=4;sim._t0=null;}},
  {title:'Still falling',text:'By 2025, 7.1% of high schoolers vaped. JUUL settled with 33 states in 2022 for $438.5 million over youth marketing.',pause:true,setup:sim=>{sim.tst=5;sim._t0=null;}},
  {title:'Pouches now',text:'The green dots are high school pouch use: 2.4% in 2024 and 2.3% in 2025. Small next to vaping’s peak, but it rose from 2022 to 2025, and national numbers can lag behind what schools see.',pause:true,setup:sim=>{sim.tst=6;sim._t0=null;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How big were the biggest changes?</p><ol><li>Use From and To to find the biggest one-year rise and the biggest one-year drop.</li><li>For each, write the change in percentage points and in percent.</li></ol><p>Write one sentence on why a headline might choose one number over the other.</p>',
  honors:'<p><b>Question:</b> How much of the 2017–2019 rise can be tied to JUUL?</p><ol><li>Compute JUUL users as a percent of all high schoolers in 2019.</li><li>Compare with the 2017 vaping rate.</li></ol><p>Explain what the numbers support, and what else could have caused the rise.</p>',
  ap:'<p><b>Question:</b> What would a convincing causal argument need?</p><ol><li>List three other changes between 2015 and 2021 that could affect the line.</li><li>For each, describe data that would test it.</li></ol><p><b>CER:</b> Claim how much of the vaping wave JUUL caused, with the strength of your claim matched to your evidence.</p>'},
 terms:[
  {t:'Percentage points',d:'The difference between two percents: 27.5% − 11.7% = 15.8 points.'},
  {t:'Percent change',d:'The change divided by the starting value, times 100.'},
  {t:'Current use',d:'In these surveys, using at least once in the past 30 days.'},
  {t:'Confounder',d:'Something else that changed at the same time and could explain the pattern.',lvl:'honors'},
  {t:'Comparability',d:'Whether two measurements were taken the same way, so differences reflect real change.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> National Youth Tobacco Survey (CDC and FDA), current e-cigarette use among high school students: 2011 1.5%, 2012 2.8%, 2013 4.5%, 2014 13.4%, 2015 16.0%, 2016 11.3%, 2017 11.7%, 2018 20.8%, 2019 27.5%, 2020 19.6%, 2021 11.3%, 2022 14.1%, 2023 10.0%, 2024 7.8%, 2025 7.1%. In 2020 data collection stopped early because of COVID-19, and from 2021 the survey was given mostly online, so CDC cautions against direct comparison with earlier years. High school nicotine pouch use: 2.4% (2024) and 2.3% (2025). JUUL as usual brand: Cullen et al., <i>JAMA</i>, 2019.</p><p><b>Events.</b> JUUL launch (June 2015); FDA Commissioner calls youth vaping an epidemic (September 2018); Altria’s $12.8 billion investment for 35% of JUUL (December 2018); federal Tobacco 21 (December 2019); FDA enforcement against flavored cartridge e-cigarettes other than tobacco and menthol (February 2020); multistate JUUL settlement (September 2022); FDA authorization of 20 Zyn products (January 2025).</p>'
};
BioLab.register(SIM);
})();

(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Herd immunity for measles in one community.
   Protected share p = coverage × effectiveness. Effective reproduction number Re = R0 × (1 − p).
   Threshold: p > 1 − 1/R0, so coverage needed = (1 − 1/R0) ÷ effectiveness.
   One case arrives. Deterministic SIR (Reed–Frost chain) final size: ln(s0/s∞) = R0 (s0 + i0 − s∞), with i0 = 1/N. */
const COMM={school:{N:1000,who:'students',one:'student',name:'Your school',per:1},town:{N:10000,who:'people',one:'person',name:'Your town',per:10}};
const CM=sim=>COMM[sim.p.comm]||COMM.school;
const NN=sim=>CM(sim).N;
const R0=sim=>atLeast('honors')?sim.p.r0:15;
const VE=sim=>(atLeast('honors')?sim.p.ve:97)/100;
const CANT=sim=>sim.p.cant/100;
const cap=sim=>100-sim.p.cant;
const COV=sim=>Math.min(sim.p.cov,cap(sim));
const need=sim=>100*(1-1/R0(sim))/VE(sim);
function size(N,r0,ve,cov){const p=cov/100*ve,s0=1-p,i0=1/N;let lo=1e-14,hi=s0;
 for(let i=0;i<120;i++){const m=(lo+hi)/2;if(Math.log(s0/m)-r0*(s0+i0-m)>0)lo=m;else hi=m;}
 return N*(s0-(lo+hi)/2);}
const sick=(sim,cov)=>size(NN(sim),R0(sim),VE(sim),cov===undefined?COV(sim):cov);
const susc=(sim,cov)=>NN(sim)*(1-(cov===undefined?COV(sim):cov)/100*VE(sim));
const attack=(sim,cov)=>sick(sim,cov)/susc(sim,cov);
const Re=(sim,cov)=>R0(sim)*(1-(cov===undefined?COV(sim):cov)/100*VE(sim));
function gens(sim){const N=NN(sim),r0=R0(sim);let S=susc(sim),I=1;const out=[1];for(let g=0;g<6;g++){const S2=S*Math.exp(-r0*I/N);I=S-S2;S=S2;out.push(I);}return out;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const n0=v=>Math.round(v).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* a fixed shuffle of the 1,000 dots, and each dot's distance from the center, where the first case arrives */
const COLS=40,ROWS=25,CELL=10;
const ORDER=(()=>{let s=20261107;const r=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};const a=[...Array(1000).keys()];for(let i=999;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;})();
const DIST=[...Array(1000).keys()].map(i=>{const c=i%COLS,r=Math.floor(i/COLS);return Math.hypot(c-19.5,(r-12)*1.0)+((i*7919)%13)/13*0.9;});
/* classes: 0 protected, 1 vaccinated not immune, 2 not vaccinated, 3 cannot be vaccinated; sick flag */
function classes(sim){const cant=Math.round(1000*CANT(sim)),vax=Math.round(1000*COV(sim)/100),prot=Math.round(vax*VE(sim));const cls=new Array(1000);
 ORDER.forEach((cell,i)=>{cls[cell]=i<cant?3:i<cant+prot?0:i<cant+vax?1:2;});
 const ill=new Array(1000).fill(false);if(shown(sim)){const a=attack(sim);[1,2,3].forEach(k=>{const idx=[];for(let i=0;i<1000;i++)if(cls[i]===k)idx.push(i);idx.sort((x,y)=>DIST[x]-DIST[y]);const m=Math.round(idx.length*a);for(let j=0;j<m;j++)ill[idx[j]]=true;});}
 return {cls,ill,cant,vax,prot};}

const SIM={
 id:'herd',hash:'herd',apUnit:5,order:2,tab:'Measles and the herd',kind:'Simulation',prereq:[],
 card:'Guess how many people in your school need the measles vaccine so one case cannot spread, then watch the tipping point.',
 title:'Measles and the herd: how many is enough?',
 lede:{bio:'Measles is one of the most contagious diseases there is. When enough people around you are immune, a case that walks in has nowhere to go. That protects everyone, including people who cannot be vaccinated. Below a certain share, one case can spread to dozens.',
  honors:'R₀ is how many people one case infects where no one is immune: commonly given as 12 to 18 for measles. If a share p is immune, each case infects R₀(1 − p) on average. Spread dies out when that is below 1, so p must be above 1 − 1/R₀, the herd immunity threshold.',
  ap:'Because two doses protect about 97% of people, coverage must reach (1 − 1/R₀) ÷ 0.97. Outbreak size comes from an SIR model: after one case arrives, the share still susceptible at the end, s∞, solves ln(s₀/s∞) = R₀(s₀ + i₀ − s∞).'},
 scale:'One community: 1,000 students (each dot is one student) or a town of 10,000 people (each dot is 10 people). One case of measles arrives from outside.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your community',
 controls:[
  {id:'cov',label:'Share of the community with two doses of MMR vaccine',type:'range',min:50,max:100,step:0.5,def:80,unit:'%'},
  {id:'comm',label:'Community',type:'seg',def:'school',noGut:true,onChange:clearGut,options:[{v:'school',l:'Your school (1,000)'},{v:'town',l:'Your town (10,000)'}]},
  {id:'cant',label:'People here who cannot be vaccinated',type:'range',min:0,max:5,step:0.5,def:1,unit:'%',noGut:true,onChange:clearGut,lvl:'honors',help:'Babies too young for the vaccine, and people whose immune systems are weakened by some illnesses or treatments. 1% is an assumption for illustration.'},
  {id:'r0',label:'How contagious: R₀ (people one case infects if no one is immune)',type:'range',min:12,max:18,step:1,def:15,noGut:true,onChange:clearGut,lvl:'honors',help:'12 to 18 is the commonly cited textbook range for measles.'},
  {id:'ve',label:'How well two doses protect (vaccine effectiveness)',type:'range',min:85,max:100,step:1,def:97,unit:'%',noGut:true,onChange:clearGut,lvl:'honors',help:'About 97% is the commonly cited figure for two doses of MMR. Other values are what-ifs.'},
  {id:'reveal',label:'Show the outbreak now',type:'toggle',def:false,noGut:true,help:'Normally the outbreak appears once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'sick',label:'Catch measles after one case arrives',unit:'',d:0,min:0,max:null,get:sim=>hid(sim,sick(sim))},
  {id:'need',label:'Coverage needed to stop spread',unit:'%',d:1,min:0,max:100,get:sim=>hid(sim,need(sim))},
  {id:'vax',label:'Vaccinated with two doses',unit:'',d:0,min:0,max:null,get:sim=>NN(sim)*COV(sim)/100},
  {id:'cantsick',label:'Of those who cannot be vaccinated, catch measles',unit:'',d:1,min:0,max:null,get:sim=>hid(sim,NN(sim)*CANT(sim)*attack(sim))},
  {id:'re',label:'Each case infects, on average (Rₑ)',unit:'people',d:2,lvl:'honors',min:0,max:18,get:sim=>hid(sim,Re(sim))},
  {id:'hit',label:'Herd immunity threshold, 1 − 1/R₀',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>hid(sim,100*(1-1/R0(sim)))},
  {id:'attack',label:'Share of unprotected people who catch it',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>hid(sim,100*attack(sim))},
  {id:'chain',label:'Cases in each generation (chain of transmission)',text:true,lvl:'ap',get:sim=>shown(sim)?gens(sim).map(v=>v<10?f1(v):n0(v)).join(' → ')+' …':'Lock in your gut answer to see the chain.'}
 ],
 draw(sim,ctx,vdt,k){const big=k>1.3,sh=shown(sim),G=GS(sim),c=CM(sim),C=classes(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(440,0,360,450);
  /* left: the community */
  txt(ctx,c.name+': '+n0(c.N)+' '+c.who,20,24*k,{s:13*k,w:700});
  txt(ctx,big?(c.per===1?'1 dot = 1 student':'1 dot = 10 people'):(c.per===1?'Each dot is one student. One case arrives in the middle.':'Each dot is 10 people. One case arrives in the middle.'),20,44*k,{s:12*k,c:PAL['cv-soft']});
  const gx=20,gy=40+24*k,COL=[PAL['s2'],PAL['s2'],PAL['cv-soft'],PAL['s5']];
  for(let i=0;i<1000;i++){const x=gx+(i%COLS)*CELL+CELL/2,y=gy+Math.floor(i/COLS)*CELL+CELL/2,cl=C.cls[i];
   if(C.ill[i]){ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();continue;}
   if(cl===0){ctx.fillStyle=COL[0];ctx.beginPath();ctx.arc(x,y,3.6,0,7);ctx.fill();}
   else if(cl===3){ctx.fillStyle=COL[3];ctx.beginPath();ctx.arc(x,y,3.6,0,7);ctx.fill();}
   else{ctx.strokeStyle=COL[cl];ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.stroke();}}
  /* the arriving case */
  const cx=gx+20*CELL,cy=gy+12*CELL+CELL/2;ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(cx,cy,7,0,7);ctx.stroke();ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(cx,cy,4,0,7);ctx.fill();
  /* legend */
  const ly=gy+ROWS*CELL+20*k,cw=200,item=(j,draw,lab)=>{const x=gx+(j%2)*cw+6,y=ly+Math.floor(j/2)*18*k;draw(x,y-4*k);txt(ctx,lab,x+12,y,{s:12*k,w:700});};
  const dot=col=>(x,y)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill();},ring=col=>(x,y)=>{ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,3.4,0,7);ctx.stroke();};
  const L1=[[dot(PAL['s2']),big?'Protected':'Vaccinated and protected'],[ring(PAL['s2']),big?'Shots, not immune':'Vaccinated, not immune'],[ring(PAL['cv-soft']),'Not vaccinated'],[dot(PAL['s5']),big?'Can’t be vaccinated':'Cannot be vaccinated']];
  if(sh)L1.push([dot(PAL['s1']),'Caught measles']);
  L1.forEach((e,j)=>item(j,e[0],e[1]));
  /* right: catch measles vs. coverage */
  const G0=GS(sim),xm=Math.min(70,Math.floor(Math.min(COV(sim),G0?G0.cov:100)/10)*10),L=478+20*k,R=782,T=40+34*k,B=446-36*k,N=c.N,ymax=Math.ceil(size(N,R0(sim),VE(sim),xm)/(N/10))*(N/10),X=v=>L+(v-xm)/(100-xm)*(R-L),Y=v=>B-v/ymax*(B-T);
  txt(ctx,big?'Catch measles':'One case arrives: how many catch it?',620,24*k,{s:13*k,w:700,a:'center'});
  txt(ctx,big?'vs. coverage':'Sick vs. share vaccinated',620,44*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const yst=ymax/(big?2:4);
  for(let v=0;v<=ymax+1e-9;v+=yst){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,n0(v),L-5,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  (xm===70?(big?[70,85,100]:[70,75,80,85,90,95,100]):(big?[xm,(xm+100)/2,100]:[50,60,70,80,90,100].filter(v=>v>=xm))).forEach(v=>txt(ctx,v+'%',X(v),B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,T-4);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  txt(ctx,big?'Vaccinated':'Share vaccinated (two doses)',(L+R)/2,B+33*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  if(sh){const nd=need(sim);
   if(nd<=100){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(nd),T);ctx.lineTo(X(nd),B);ctx.stroke();ctx.setLineDash([]);
    txt(ctx,(big?'Need ':'Threshold ')+f1(nd)+'%',X(nd)-5,T+10*k,{s:12*k,w:700,c:PAL['s3'],a:'right'});}
   else txt(ctx,big?'Need over 100%':'Threshold over 100%: not reachable',R,T+10*k,{s:12*k,w:700,c:PAL['s3'],a:'right'});
   ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.beginPath();for(let v=xm;v<=100.001;v+=0.25){const px=X(v),py=Y(size(N,R0(sim),VE(sim),v));v<xm+0.1?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
   if(sim.p.cant>0){ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.18;ctx.fillRect(X(cap(sim)),T,R-X(cap(sim)),B-T);ctx.globalAlpha=1;}
   const cv=COV(sim),sv=sick(sim),px0=X(cv),py0=Y(sv);
   if(G){const gs=size(N,R0(sim),VE(sim),G.cov);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(X(G.cov),Y(gs),7,0,7);ctx.stroke();}
   ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(px0,py0,6,0,7);ctx.fill();
   const pt=n0(sv)+' catch it',ps=13*Math.min(k,1.4);ctx.font='700 '+ps+'px '+FONT;const pw=ctx.measureText(pt).width+16;
   const gY=G?Y(size(N,R0(sim),VE(sim),G.cov)):Infinity,py=Math.max(T+30*k,Math.min(py0,gY)-20*k),pxc=clamp(px0+pw/2+6,L+pw/2+2,R-pw/2-2);
   pill(ctx,pt,pxc,py,PAL['rj'],'#fff',ps);
   if(G&&Math.abs(G.cov-cv)>=1){const gl=(big?'Gut ':'Your gut ')+f1(G.cov)+'%';txt(ctx,gl,Math.min(X(G.cov)+10,R-4),Math.min(B-6,gY+18*k),{s:12*k,w:700,c:PAL['s4'],a:X(G.cov)+10>R-60*k?'right':'left'});}}
  else{txt(ctx,'?',(L+R)/2,(T+B)/2+10*k,{s:40*k,w:700,c:PAL['cv-soft'],a:'center'});txt(ctx,big?'Lock in your gut.':'Lock in your gut answer to see the outbreak.',(L+R)/2,(T+B)/2+40*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}},
 narrate(sim){const c=CM(sim),cv=COV(sim),r=Re(sim),s=sick(sim),nd=need(sim),cant=Math.round(NN(sim)*CANT(sim));
  if(!shown(sim))return `${c.name}: ${f1(cv)}% of ${c.who} have two doses of the vaccine. One case of measles arrives. <b>Is that enough to stop it from spreading?</b>`;
  const cantTxt=cant>0?` Of the ${n0(cant)} ${cant===1?c.one:c.who} who cannot be vaccinated, about ${f1(cant*attack(sim))} catch it.`:'';
  if(nd>cap(sim))return `Even if everyone who can be vaccinated is, each case still passes measles to ${r.toFixed(2)} others. <b>The threshold, ${f1(nd)}%, is out of reach</b>, so about ${n0(s)} ${c.who} catch it.`+cantTxt;
  if(Math.abs(r-1)<0.03)return `Each case passes measles to about 1 other on average: <b>right at the tipping point.</b> About ${n0(s)} ${c.who} catch it. A little more coverage makes every chain shrink.`+cantTxt;
  if(r<1)return `Each case passes measles to ${r.toFixed(2)} others on average, fewer than 1, so chains die out. <b>Only about ${n0(s)} ${c.who} catch it.</b>`+cantTxt;
  if(cv>=nd-1.5)return `Each case passes it to ${r.toFixed(2)} others: just over 1, close to the tipping point. <b>About ${n0(s)} ${c.who} catch it.</b> A little more coverage tips it into shrinking chains.`+cantTxt;
  return `Each case passes measles to ${r.toFixed(2)} others on average, so it grows. <b>About ${n0(s)} ${c.who} catch it</b>, and the threshold is ${f1(nd)}%.`+cantTxt;},
 gut:{better:'lower',controls:['cov'],
  ask:{bio:'Your school has 1,000 students, and one student comes back from a trip with measles. Drag the slider here to the lowest share of students who need two doses of the vaccine so that measles cannot spread through the school. Then lock it in.',
   honors:'Before the curve appears: set the coverage you think is the lowest that stops measles from spreading here, then lock it in.'},
  lock(sim){const cv=COV(sim);return {v:Math.abs(cv-need(sim)),cov:cv,label:`${f1(cv)}% vaccinated`};},
  solve(sim){const nd=need(sim),cv=Math.min(nd,cap(sim));sim.p.cov=Math.round(cv*1000)/1000;return {v:Math.abs(COV(sim)-nd),cov:COV(sim),label:nd<=cap(sim)?`${f1(nd)}% vaccinated`:`${f1(nd)}% would be needed, but only ${f1(cap(sim))}% can be vaccinated`};},
  how:{bio:'Each case of measles would infect about 15 people if no one were immune. To stop it, each case must infect fewer than 1 on average, so at least 14 of every 15 people (93.3%) must be immune. Two doses protect about 97 of every 100 people who get them, so coverage must be 93.3% ÷ 0.97 = 96.2%.',
   ap:'Spread stops when Rₑ = R₀(1 − p) < 1, so p > 1 − 1/R₀. With p = coverage × effectiveness, coverage needed = (1 − 1/R₀) ÷ effectiveness.'},
  compare(sim,g,m){const c=CM(sim),N=NN(sim),gs=size(N,R0(sim),VE(sim),g.cov),ms=size(N,R0(sim),VE(sim),m.cov),cant=Math.round(N*CANT(sim));
   const cantG=cant*gs/susc(sim,g.cov),cantM=cant*ms/susc(sim,m.cov);
   const tail=cant>0?` For the ${n0(cant)} ${c.who} who cannot be vaccinated, that is about ${f1(cantG)} sick at your number and ${f1(cantM)} at ${need(sim)>cap(sim)?f1(m.cov)+'%':'the threshold'}.`:'';
   const nd=need(sim);if(nd>cap(sim))return `With R₀ = ${R0(sim)} and a vaccine that protects ${Math.round(VE(sim)*100)}% of people, the coverage needed is ${f1(nd)}%: more than the ${f1(cap(sim))}% who can be vaccinated. At your ${f1(g.cov)}%, about <b>${n0(gs)} ${c.who}</b> catch measles; at ${f1(m.cov)}%, about <b>${n0(ms)}</b>. When the threshold is out of reach, every extra point of coverage still shrinks the outbreak, and better vaccines matter.`+tail;
   if(Math.abs(g.cov-m.cov)<0.75)return `Your gut was right on: about ${f1(m.cov)}%. At that level one case leads to about ${n0(ms)} ${c.who} catching measles, and chains stop growing.`+tail;
   if(g.cov<m.cov)return `Your gut said ${f1(g.cov)}%. At that level one case would spread to about <b>${n0(gs)} ${c.who}</b> out of ${n0(N)}. At the threshold of ${f1(m.cov)}%, about ${n0(ms)}. That gap of ${f1(m.cov-g.cov)} points is the tipping point: <b>about ${n0(gs-ms)} fewer ${c.who} sick</b>.`+tail;
   return `Your gut said ${f1(g.cov)}%, above the threshold of ${f1(m.cov)}%. That is safer: about ${n0(gs)} ${Math.round(gs)===1?c.one:c.who} catch${Math.round(gs)===1?'es':''} it instead of ${n0(ms)}. The threshold is a floor, not a comfortable margin, because real coverage is never spread perfectly evenly.`+tail;},
  again(sim){sim.p.comm=Math.random()<0.5?'school':'town';sim.p.cov=80;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Where no one is immune, one case of measles infects about 15 people. What share of a community must be immune so that each case infects fewer than 1 person on average?',choices:['About half','About three quarters','About 93%: 14 of every 15'],correct:2,explain:'Each case must infect fewer than 1 of its 15 contacts, so at least 14 of 15 must be immune: 1 − 1/15 ≈ 93.3%. That is why measles needs much higher coverage than most diseases.'},
  {lvl:'bio',instant:true,q:'A school of 1,000 has 96% of students fully vaccinated. Coverage slips to 90%. One case arrives. What happens to the number who catch measles in this model?',choices:['It goes up a little, from about 13 to about 20','It jumps from about 13 to about 98','Nothing changes: 90% is still most people'],correct:1,explain:'At 96%, each case infects just over 1 person and about 13 catch it. At 90%, each case infects about 1.9 and about 98 catch it. A 6-point drop makes the outbreak about 7 times bigger: that is a tipping point.'},
  {lvl:'bio',instant:true,q:'Who is protected only by the people around them?',choices:['No one: everyone can just get vaccinated','Babies too young for the vaccine and people whose immune systems are weakened by some illnesses or treatments','Only people who already had measles'],correct:1,explain:'Some people cannot get the MMR vaccine. Their protection depends on how many people around them are immune, which is why each person’s vaccination is part of a community outcome.'},
  {lvl:'honors',instant:true,q:'R₀ = 15 and two doses protect 97% of people. What coverage is needed?',choices:['93.3%','95.0%','96.2%','100%'],correct:2,explain:'Threshold: 1 − 1/15 = 93.3% must be immune. Only 97% of vaccinated people are, so coverage must be 93.3% ÷ 0.97 ≈ 96.2%. WHO’s target of at least 95% with two doses is a floor, not a comfortable margin.'},
  {lvl:'honors',instant:true,q:'At 90% coverage, with R₀ = 15 and 97% effectiveness, how many people does each case infect on average?',choices:['About 0.9','About 1.5','About 1.9','About 13.5'],correct:2,explain:'Protected share: 0.90 × 0.97 = 0.873. Rₑ = 15 × (1 − 0.873) = 15 × 0.127 ≈ 1.9. Above 1, so each generation of cases is bigger than the last until susceptible people run low.'},
  {lvl:'ap',instant:true,q:'Below the threshold, each case infects Rₑ < 1 others on average. A chain starts with 1 case: 1 + Rₑ + Rₑ² + … cases in all. With Rₑ = 0.5, how many cases on average?',choices:['1.5','2','5','The chain never ends'],correct:1,explain:'A geometric series: 1 ÷ (1 − Rₑ) = 1 ÷ 0.5 = 2. As Rₑ gets close to 1, 1 ÷ (1 − Rₑ) blows up, which is why outbreaks near the threshold can still be large.'},
  {lvl:'ap',instant:true,q:'Worldwide measles deaths fell from 777,000 in 2000 to 95,000 in 2024. If that were a steady exponential decline, about what percent per year is it?',choices:['About 3.6% a year','About 8.4% a year','About 28% a year','About 88% a year'],correct:1,explain:'(95,000 ÷ 777,000)^(1/24) ≈ 0.916, so about 8.4% fewer each year. The 88% is the total drop over all 24 years, not the yearly rate.'}
 ],
 tour:[
  {title:'Your school',text:'Each dot is one of 1,000 students. Filled blue dots are vaccinated and protected. Open rings are not protected. Purple dots are students who cannot be vaccinated. One case of measles arrives in the middle.',pause:true,setup:sim=>BioLab.setValues(sim,{comm:'school',cov:80,r0:15,ve:97,cant:1})},
  {title:'At 80% coverage',text:'With 80% vaccinated, each case infects about 3.4 others on average. Measles spreads through the open rings: about 215 students catch it, nearly all of the unprotected ones.',pause:true},
  {title:'Raise coverage',text:'At 90%, each case infects about 1.9 others. Still above 1, so it grows: about 98 students catch it.',pause:true,setup:sim=>BioLab.setValues(sim,{cov:90})},
  {title:'The tipping point',text:'At about 96.2%, each case infects about 1 other on average. Chains stop growing. Only about 11 students catch it, and the curve on the right has flattened out.',pause:true,setup:sim=>BioLab.setValues(sim,{cov:96.2}),focus:[440,0,360,450]},
  {lvl:'honors',title:'Where 96.2% comes from',text:'R₀ = 15, so 1 − 1/15 = 93.3% must be immune. Two doses protect about 97% of people, so coverage must be 93.3% ÷ 0.97 ≈ 96.2%.',pause:true},
  {lvl:'ap',title:'The chain of transmission',text:'Each generation is the cases from the one before. At 90% coverage: 1, then about 1.9, then about 3.5, then about 6.2. Below the threshold each generation is smaller, and the total is about 1 ÷ (1 − Rₑ).',pause:true,setup:sim=>BioLab.setValues(sim,{cov:90})},
  {title:'Part of the herd',text:'The purple dots cannot be vaccinated. Whether they get sick depends on everyone else. Your two doses are part of the number that protects them.',pause:true,setup:sim=>BioLab.setValues(sim,{cov:97})}
 ],
 lab:{bio:'<p><b>Question:</b> How does outbreak size change as coverage rises?</p><ol><li>Turn on <b>Show the outbreak now</b>.</li><li>Record a trial at 70%, 80%, 90%, 94%, 96% and 98% coverage.</li><li>Graph <b>Trials</b> with coverage on x and <b>Catch measles</b> on y.</li></ol><p>Write one sentence: where does the curve bend, and what does that mean for your school?</p>',
  honors:'<p><b>Question:</b> How does R₀ change the coverage a community needs?</p><ol><li>For R₀ = 12, 15 and 18, record <b>Herd immunity threshold</b> and <b>Coverage needed</b>.</li><li>Set the coverage to 95% and record <b>Catch measles</b> for each R₀.</li><li>Try a vaccine effectiveness of 90%.</li></ol><p>Explain why “95% vaccinated” is a floor, not a safety margin, for measles.</p>',
  ap:'<p><b>Question:</b> Does the SIR final size match the chain of transmission?</p><ol><li>At 90% coverage, record the first five generations from <b>Cases in each generation</b> and add them.</li><li>Below the threshold (98%), compare the total with 1 ÷ (1 − Rₑ).</li><li>Switch to the town and compare the share who catch it.</li></ol><p><b>CER:</b> Claim where the tipping point is, with evidence from your table and reasoning from Rₑ = R₀(1 − p).</p>'},
 terms:[
  {t:'Herd immunity',d:'When enough people are immune that a disease cannot keep spreading, which also protects people who are not immune.'},
  {t:'MMR vaccine',d:'The vaccine against measles, mumps and rubella. The full series is two doses.'},
  {t:'Vaccination coverage',d:'The share of people in a group who have been vaccinated.'},
  {t:'Elimination',d:'No continuous spread of a disease inside a country. Cases can still arrive from outside.'},
  {t:'R₀ (basic reproduction number)',d:'How many people one case infects on average where no one is immune.',lvl:'honors'},
  {t:'Rₑ (effective reproduction number)',d:'How many people one case infects on average given the immunity actually present: R₀ × (1 − share immune).',lvl:'honors'},
  {t:'Herd immunity threshold',d:'The share that must be immune for Rₑ to fall below 1: 1 − 1/R₀.',lvl:'honors'},
  {t:'Vaccine effectiveness',d:'The share of vaccinated people the vaccine protects.',lvl:'honors'},
  {t:'SIR model',d:'A model that splits people into Susceptible, Infected and Recovered groups and tracks how they move between them.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Protected share p = coverage × vaccine effectiveness. Each case infects Rₑ = R₀(1 − p) others on average. Spread stops when Rₑ < 1, so the herd immunity threshold is 1 − 1/R₀ and the coverage needed is (1 − 1/R₀) ÷ effectiveness. Outbreak size: one case arrives, and the deterministic SIR final-size equation ln(s₀/s∞) = R₀(s₀ + i₀ − s∞), with i₀ = 1/N, gives how many catch it. The chain of transmission (each generation: new cases = S × (1 − e^(−R₀·I/N))) adds up to the same total.</p><p><b>Assumptions.</b> Measles R₀ of 12 to 18 is the commonly cited textbook range (15 by default); two-dose MMR effectiveness of about 97% is the commonly cited figure. Neither was re-verified for this tool. Everyone mixes evenly; no one is immune from an earlier infection; protection is all or nothing and does not fade; the 1% who cannot be vaccinated is an assumption for illustration, and the shaded strip at the right of the chart is coverage that cannot be reached because of them. Real outbreaks are random: one case sometimes fizzles and sometimes spreads further than this average. Real communities are not evenly mixed, and where unvaccinated people are clustered together, outbreaks can happen even when the overall coverage looks high.</p><p><b>Sources.</b> About 154 million lives saved by immunization over 50 years, 101 million of them infants, with measles vaccination accounting for 60% (modeled; WHO, 24 Apr 2024, on Shattock et al., <i>The Lancet</i>, 2024: <a href="https://www.who.int/news/item/24-04-2024-global-immunization-efforts-have-saved-at-least-154-million-lives-over-the-past-50-years" target="_blank" rel="noopener">WHO</a>). Worldwide, measles deaths fell from 777,000 in 2000 to 95,000 in 2024, and second-dose coverage rose from 17% to 76%; WHO says interrupting transmission takes at least 95% coverage with two doses (<a href="https://www.gavi.org/news/media-room/measles-vaccines-have-contributed-dramatic-reduction-cases-and-deaths-2000" target="_blank" rel="noopener">Gavi on the WHO report, 28 Nov 2025</a>). In the U.S., where CDC says measles was eliminated in 2000, there were 285 cases in 2024 (89% of them in people who were unvaccinated or whose vaccination status was unknown, and 114, or 40%, hospitalized), 2,289 in 2025, and 5,182 confirmed cases and 4 deaths in 2026 as of November 5; CDC says the death count is subject to change (<a href="https://www.cdc.gov/measles/data-research/index.html" target="_blank" rel="noopener">CDC Measles Cases and Outbreaks</a>). Canada lost its measles elimination status in November 2025 (<a href="https://www.statnews.com/2026/08/06/measles-elimination-status-2026-paho/" target="_blank" rel="noopener">STAT, 6 Aug 2026</a>).</p><p><b>Go further.</b> How do researchers turn a model like this into a headline such as 154 million lives saved? Try <a href="https://rjedtech.github.io/Raider-MathLab/#livessaved" target="_blank" rel="noopener">Lives saved: an estimate, not a count</a> in MathLab.</p><p><b>Not medical advice.</b> This is a simplified model. For questions about your own vaccines or health, talk with a parent, your doctor or the school nurse.</p>'
};
BioLab.register(SIM);
})();

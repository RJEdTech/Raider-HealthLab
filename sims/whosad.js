(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum,rng}=BioLab.h;
/* A toy click model. For each ad, z = base + the weight of each profile signal, and P(click) = 1/(1 + e^(−z)).
   Every weight is invented for illustration: it shows how such models work, not any real company's model. */
const ADS=[{id:'energy',l:'Energy drink',sh:'Energy',col:'s4'},{id:'vape',l:'Vape-style product',sh:'Vape',col:'s5'},{id:'study',l:'Study app',sh:'Study',col:'s2'}];
const BASE={energy:-3.2,vape:-3.4,study:-2.4};
const W={
 age:{known:{energy:0.3,vape:0.5,study:0.5},teen:{energy:0.3,vape:0.5,study:0.5},adult:{energy:0,vape:0,study:-0.4}},
 late:{energy:0.5,vape:0.45,study:0.05},/* per hour online after midnight */
 search:{none:{energy:0,vape:0,study:0},stress:{energy:0.6,vape:0.9,study:0.5},study:{energy:0.3,vape:-0.3,study:1.3},sports:{energy:0.8,vape:-0.4,study:0}},
 follow:{friends:{energy:0,vape:0,study:0},gaming:{energy:0.6,vape:0.2,study:-0.2},party:{energy:0.3,vape:1.0,study:-0.3},fitness:{energy:0.5,vape:-0.6,study:0}},
 place:{home:{energy:0,vape:0,study:0},store:{energy:0.5,vape:0.6,study:0},gym:{energy:0.4,vape:-0.3,study:0},library:{energy:-0.1,vape:-0.4,study:0.6}}
};
/* "Take the signal away" = set it to the value that adds nothing */
const NEUTRAL={age:'adult',late:0,search:'none',follow:'friends',place:'home'};
const SIG=[{id:'age',l:'Age signal',sh:'Age'},{id:'late',l:'Late-night use',sh:'Late nights'},{id:'search',l:'Searches',sh:'Searches'},{id:'follow',l:'Follows',sh:'Follows'},{id:'place',l:'Location',sh:'Location'}];
const VAL={age:{known:'Known minor (age 16 on file)',teen:'Reads as a teen (no age on file)',adult:'Reads as 21 or older'},
 search:{none:'Nothing that stands out',stress:'Stress and sleep: “can’t sleep”',study:'Study help: “how to focus”',sports:'Workouts and sports'},
 follow:{friends:'Mostly friends',gaming:'Gaming streams',party:'Party and nightlife',fitness:'Fitness'},
 place:{home:'Home and school',store:'Often near a convenience store',gym:'Often near a gym',library:'Often at a library'}};
const VALS={age:{known:'Known 16',teen:'Reads teen',adult:'Reads 21+'},search:{none:'Nothing',stress:'Stress, sleep',study:'Study help',sports:'Sports'},follow:{friends:'Friends',gaming:'Gaming',party:'Party',fitness:'Fitness'},place:{home:'Home, school',store:'Near a store',gym:'Near a gym',library:'Library'}};
const sig=x=>1/(1+Math.exp(-x));
function zOf(P,ad,ver){let z=BASE[ad]+W.age[P.age][ad]+W.late[ad]*P.late+W.search[P.search][ad]+W.follow[P.follow][ad]+W.place[P.place][ad];
 if(ver==='B')z+=(P.late>=1?0.5:0)+(P.search==='stress'?0.4:0)-((P.late<1&&P.search!=='stress')?0.3:0);return z;}
const prof=sim=>({age:sim.p.age,late:+sim.p.late,search:sim.p.search,follow:sim.p.follow,place:sim.p.place});
const pClick=(P,ad,ver)=>100*sig(zOf(P,ad,ver));
/* How many points the chosen ad's score drops if the model could not see this one signal */
function drop(sim,s,ad){const P=prof(sim),Q=Object.assign({},P,{[s]:NEUTRAL[s]});return pClick(P,ad||sim.p.ad)-pClick(Q,ad||sim.p.ad);}
function topSig(sim){let b=SIG[0].id,bv=-Infinity;SIG.forEach(s=>{const v=drop(sim,s.id);if(v>bv+1e-9){bv=v;b=s.id;}});return {id:b,v:bv};}
const blocked=(sim,P)=>atLeast('honors')&&sim.p.law&&P.age==='known';
function winner(P){let b=ADS[0].id,bv=-1;ADS.forEach(a=>{const v=pClick(P,a.id);if(v>bv){bv=v;b=a.id;}});return b;}
/* 1,000 fictional users of a teen-heavy video app (fixed seed, so everyone sees the same crowd) */
const POP=(()=>{const r=rng(20261107),pick=(a,w)=>{let u=r()*w.reduce((x,y)=>x+y,0);for(let i=0;i<a.length;i++){u-=w[i];if(u<=0)return a[i];}return a[a.length-1];};const out=[];
 for(let i=0;i<1000;i++)out.push({age:pick(['known','teen','adult'],[35,30,35]),late:pick([0,0.5,1,1.5,2,2.5,3],[30,15,15,12,12,8,8]),search:pick(['none','stress','study','sports'],[35,20,25,20]),follow:pick(['friends','gaming','party','fitness'],[35,25,15,25]),place:pick(['home','store','gym','library'],[55,15,15,15])});return out;})();
function popStats(sim){const law=atLeast('honors')&&sim.p.law;const c={energy:0,vape:0,study:0,none:0},under21={energy:0,vape:0,study:0},vuln={energy:0,vape:0,study:0};
 const shown=POP.map(P=>{if(law&&P.age==='known'){c.none++;return 'none';}const w=winner(P);c[w]++;if(P.age!=='adult')under21[w]++;if(P.late>=1||P.search==='stress')vuln[w]++;return w;});return {c,shown,under21,vuln};}
let PS=null,PSkey='';const pop=sim=>{const k=String(atLeast('honors')&&sim.p.law);if(k!==PSkey){PS=popStats(sim);PSkey=k;}return PS;};
function abTest(sim){const ad=sim.p.ad;let A=0,B=0,Av=0,Bv=0;POP.forEach(P=>{const a=sig(zOf(P,ad,'A')),b=sig(zOf(P,ad,'B'));A+=a;B+=b;if(P.late>=1||P.search==='stress'){Av+=a;Bv+=b;}});return {A,B,Av,Bv};}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* The points stay hidden while the student works out "Your turn". */
const shownW=sim=>!pend(sim)&&!!(sim.p.reveal||(GS(sim)&&GS(sim).g));
const r2=v=>Math.round(v*100)/100;
/* One signal's points: the two click chances to two decimals, and their difference */
function pts(sim,s){const P=prof(sim),Q=Object.assign({},P,{[s]:NEUTRAL[s]}),ad=sim.p.ad,a=r2(pClick(P,ad)),b=r2(pClick(Q,ad));return {a,b,d:r2(a-b),zP:zOf(P,ad),zQ:zOf(Q,ad)};}
const ptxt=v=>fmtNum(v,2),p1=v=>fmtNum(v,1);
const adL=id=>ADS.find(a=>a.id===id).l,sigL=id=>SIG.find(s=>s.id===id).l;
const f1=v=>fmtNum(v,1),pct=v=>fmtNum(v,0)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function valText(sim,s,big){const v=sim.p[s];if(s==='late')return v>0?`${fmtNum(v,1)} h after midnight${big?'':', most nights'}`:'Offline by midnight';return (big?VALS:VAL)[s][v];}

/* generic, original icons */
function icon(ctx,id,x,y,k){ctx.save();ctx.lineWidth=2;ctx.strokeStyle=PAL['cv-ink'];
 if(id==='energy'){rr(ctx,x-11,y-18,22,36,5);ctx.fillStyle=PAL['s4'];ctx.fill();ctx.stroke();ctx.fillStyle=PAL['card'];ctx.beginPath();ctx.moveTo(x+3,y-11);ctx.lineTo(x-5,y+2);ctx.lineTo(x,y+2);ctx.lineTo(x-3,y+12);ctx.lineTo(x+6,y-2);ctx.lineTo(x+1,y-2);ctx.closePath();ctx.fill();}
 else if(id==='vape'){rr(ctx,x-5,y-4,10,24,4);ctx.fillStyle=PAL['s5'];ctx.fill();ctx.stroke();ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.5;[[0,-12,7],[-7,-20,6],[6,-22,5]].forEach(c=>{ctx.beginPath();ctx.arc(x+c[0],y+c[1],c[2],0,7);ctx.fill();});ctx.globalAlpha=1;}
 else{rr(ctx,x-12,y-18,24,36,5);ctx.fillStyle=PAL['s2'];ctx.fill();ctx.stroke();ctx.fillStyle=PAL['card'];ctx.fillRect(x-7,y-10,14,3);ctx.fillRect(x-7,y-4,14,3);ctx.fillRect(x-7,y+2,9,3);}
 ctx.restore();}

const SIM={
 id:'whosad',hash:'whosad',apUnit:4,order:1,tab:'Who is this ad for?',kind:'Simulation',next:['checkclaim'],
 skills:{bio:'Percentage points: how much one signal adds, and what that means per 1,000 people · Health (Unit 7: Substances: caffeine, alcohol, nicotine), Algebra 1 (Unit 2: proportions)',honors:'Percentage points, proxies and A/B tests · Health (Unit 7: Substances), Statistics (Unit 3: collecting data)',ap:'The logistic function P = 1/(1 + e^(−z)) · Health (Unit 7: Substances), Algebra 2 (Unit 5: exponential functions)'},
 card:'Build a fictional teen’s profile and watch a toy ad model score them for an energy drink, a vape-style product and a study app.',
 title:'Who is this ad for? How ad models score people',
 lede:{bio:'An ad model never meets you. It reads signals: how late you are online, what you search, who you follow, where your phone goes. Then it scores how likely you are to click: it adds a number for each signal and turns the total into a chance. Some of those signals stand in for a hard week.',
  honors:'Targeting models are trained on clicks, so they learn whatever predicts a click, including signals that stand in for stress or vulnerability. A/B testing then keeps whichever version of an ad gets more clicks, whoever is clicking.',
  ap:'This toy model is a logistic regression: z = b + Σ wᵢxᵢ and P(click) = 1/(1 + e^(−z)). A signal’s effect in points depends on the rest of the profile, because the curve is steepest near 50%.'},
 scale:'One fictional profile, three generic ads, and a crowd of 1,000 fictional users. All weights are invented for illustration. Nothing you set here leaves your browser.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The fictional profile',
 controls:[
  {id:'pick',label:'Your gut: which signal pushes this ad’s score up most?',type:'seg',def:'age',options:SIG.map(s=>({v:s.id,l:s.sh}))},
  {id:'ad',label:'Ad being scored',type:'seg',def:'energy',noGut:true,onChange:clearGut,options:ADS.map(a=>({v:a.id,l:a.l}))},
  {id:'age',label:'Age signal',type:'seg',def:'known',noGut:true,onChange:clearGut,options:[{v:'known',l:'Known minor (16)'},{v:'teen',l:'Reads as a teen'},{v:'adult',l:'Reads as 21+'}],help:'Known minor: the account has a birthday on file. The other two are the model’s guess from behavior.'},
  {id:'late',label:'Late-night use: hours online after midnight, most nights',type:'range',min:0,max:3,step:0.5,def:1.5,unit:' h',noGut:true,onChange:clearGut},
  {id:'search',label:'Recent searches',type:'seg',def:'stress',noGut:true,onChange:clearGut,options:[{v:'none',l:'Nothing notable'},{v:'stress',l:'Stress and sleep'},{v:'study',l:'Study help'},{v:'sports',l:'Sports'}]},
  {id:'follow',label:'Followed accounts',type:'seg',def:'gaming',noGut:true,onChange:clearGut,options:[{v:'friends',l:'Friends'},{v:'gaming',l:'Gaming'},{v:'party',l:'Party'},{v:'fitness',l:'Fitness'}]},
  {id:'place',label:'Location signal',type:'seg',def:'home',noGut:true,onChange:clearGut,options:[{v:'home',l:'Home, school'},{v:'store',l:'Near a store'},{v:'gym',l:'Near a gym'},{v:'library',l:'Library'}]},
  {id:'reveal',label:'Show how much each signal adds',type:'toggle',def:false,noTrial:true,help:'Normally this appears once you lock in your gut answer.'},
  {id:'law',label:'Apply Colorado SB24-041 (no consent given)',type:'toggle',def:false,lvl:'honors',noGut:true,help:'For a user the business knows is under 18, no targeted ads, data sale or profiling without consent.'}
 ],
 actions:[{id:'random',label:'New fictional profile',run(sim){const R=a=>a[Math.floor(Math.random()*a.length)];BioLab.setValues(sim,{age:R(['known','teen','adult']),late:R([0,0.5,1,1.5,2,2.5,3]),search:R(['none','stress','study','sports']),follow:R(['friends','gaming','party','fitness']),place:R(['home','store','gym','library'])});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'pE',label:'Energy drink: chance of a click',unit:'%',d:1,min:0,max:100,get:sim=>pClick(prof(sim),'energy')},
  {id:'pV',label:'Vape-style product: chance of a click',unit:'%',d:1,min:0,max:100,get:sim=>pClick(prof(sim),'vape')},
  {id:'pS',label:'Study app: chance of a click',unit:'%',d:1,min:0,max:100,get:sim=>pClick(prof(sim),'study')},
  {id:'shown',label:'This profile is shown',text:true,get:sim=>{const P=prof(sim);return blocked(sim,P)?'An untargeted ad (no consent to profile a known minor)':`The ${adL(winner(P)).toLowerCase()} ad: it has the highest click score`;}},
  {id:'top',label:'Biggest signal for the ad being scored',text:true,get:sim=>{if(!shownW(sim))return 'Lock in your gut answer to see';const t=topSig(sim);return `${sigL(t.id)}: adds ${f1(t.v)} points`;}},
  {id:'dTop',label:'Points the biggest signal adds',unit:'points',d:1,min:0,max:40,get:sim=>shownW(sim)?topSig(sim).v:null},
  {id:'crowd',label:'In the crowd of 1,000',text:true,lvl:'honors',get:sim=>{const S=pop(sim);return `Energy drink ${S.c.energy}, vape-style ${S.c.vape}, study app ${S.c.study}`+(S.c.none?`, untargeted ${S.c.none}`:'')+`. Of the ${S.c.vape} shown the vape-style ad, ${S.under21.vape} read as under 21.`;}},
  {id:'vapeU21',label:'Shown the vape-style ad and under 21 (of 1,000)',unit:'people',d:0,min:0,max:1000,lvl:'honors',get:sim=>pop(sim).under21.vape},
  {id:'ab',label:'A/B test: plain ad (A) vs. a late-night message (B)',text:true,lvl:'honors',get:sim=>{const r=abTest(sim);return `Clicks per 1,000: A ${Math.round(r.A)}, B ${Math.round(r.B)}. The test keeps ${r.B>r.A?'B':'A'}. Clicks from late-night or stress-search users: ${Math.round(r.Av)} → ${Math.round(r.Bv)}; from everyone else: ${Math.round(r.A-r.Av)} → ${Math.round(r.B-r.Bv)}.`;}},
  {id:'z',label:'The model’s math for the ad being scored',text:true,lvl:'ap',get:sim=>{const P=prof(sim),ad=sim.p.ad,z=zOf(P,ad);const m=v=>(v<0?'−':'')+Math.abs(v);const parts=[m(BASE[ad]),m(W.age[P.age][ad]),`${m(W.late[ad])}×${fmtNum(P.late,1)}`,m(W.search[P.search][ad]),m(W.follow[P.follow][ad]),m(W.place[P.place][ad])];return `z = ${parts.join(' + ').replace(/\+ −/g,'− ')} = ${m(+z.toFixed(3))}; P = 1/(1 + e^(${m(+(-z).toFixed(3))})) = ${fmtNum(sig(z),3)}`;}}
 ],
 draw(sim,ctx,vdt,k){const big=k>1.3,P=prof(sim),show=shownW(sim),G=GS(sim),ad=sim.p.ad,blk=blocked(sim,P),win=winner(P);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,0,336,450);
  /* the profile */
  const ks=Math.min(k,1.4);
  ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.arc(34,32,11,0,7);ctx.fill();ctx.beginPath();ctx.arc(34,58,18,Math.PI,0);ctx.fill();
  txt(ctx,big?'Profile (fictional)':'Fictional profile: what the model sees',62,36,{s:14*k,w:700});
  txt(ctx,big?'Adds to: '+ADS.find(a=>a.id===ad).sh:'Points each signal adds to: '+adL(ad).toLowerCase(),62,36+18*ks,{s:12*k,c:PAL['cv-soft']});
  const top=show?topSig(sim).id:null,pk=G&&G.g?G.g.pick:null;
  SIG.forEach((s,i)=>{const y=96+i*(big?68:66),d=drop(sim,s.id);
   rr(ctx,14,y-4,308,big?60:56,8);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=s.id===top?PAL['rj']:(s.id===pk?PAL['s4']:PAL['line']);ctx.lineWidth=(s.id===top||s.id===pk)?2.5:1;ctx.stroke();
   txt(ctx,big?s.sh:s.l,24,y+16*ks,{s:13*k,w:700});
   txt(ctx,valText(sim,s.id,big),24,y+36*ks,{s:12*k,c:PAL['cv-soft']});
   const lab=show?(d>=0.05?'+'+f1(d):(d<=-0.05?'−'+f1(-d):'0'))+(big?'':' pts'):'?';
   pill(ctx,lab,big?284:280,y+14*ks,show?(s.id===top?PAL['rj']:PAL['cv-soft']):PAL['line'],show?'#fff':PAL['cv-ink'],12*ks);
   if(s.id===pk&&!big)txt(ctx,'Your gut',316,y+44,{s:12,w:700,c:PAL['s4'],a:'right'});});
  if(!show&&!big)txt(ctx,pend(sim)?'Work out your signal’s points first':'Lock in your gut to see the points',24,436,{s:12*k,c:PAL['cv-soft']});
  else if(!big&&G&&G.m){const q=pts(sim,G.m.pick);txt(ctx,`${SIG.find(x=>x.id===G.m.pick).sh}: ${ptxt(q.a)}% − ${ptxt(q.b)}% = ${p1(q.d)} pts ≈ ${Math.round(q.d*10)} per 1,000`,20,436,{s:12,w:700,c:PAL['rj']});}
  else if(!big)txt(ctx,'Points: how far the score drops if the model can’t see it',20,436,{s:12,c:PAL['cv-soft']});
  /* the three ads */
  const cw=140,cx0=356;txt(ctx,big?'Click scores':'Toy model: chance this profile clicks',cx0,26,{s:13*k,w:700});
  ADS.forEach((a,i)=>{const x=cx0+i*(cw+8),y=40,h=big?150:142,p=pClick(P,a.id);
   rr(ctx,x,y,cw,h,10);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=a.id===ad?PAL['rj']:PAL['line'];ctx.lineWidth=a.id===ad?3:1;ctx.stroke();
   icon(ctx,a.id,x+cw-26,y+(big?66:62),k);
   txt(ctx,big?a.sh:a.l.replace(' product',''),x+10,y+24*ks,{s:13*k,w:700});
   txt(ctx,pct(p),x+10,y+(big?72:66),{s:22*ks,w:700,c:PAL[a.col]});
   const by=y+(big?92:84);rr(ctx,x+12,by,cw-24,10,5);ctx.fillStyle=PAL['line'];ctx.fill();rr(ctx,x+12,by,Math.max(10,(cw-24)*p/100),10,5);ctx.fillStyle=PAL[a.col];ctx.fill();
   if(!blk&&a.id===win)pill(ctx,'Shown',x+cw/2,y+h-20,PAL['rj'],'#fff',12*ks);
   else if(blk&&a.id===win)pill(ctx,'No consent',x+cw/2,y+h-20,PAL['cv-soft'],'#fff',12*ks);});
  /* the crowd */
  const S=pop(sim),gy=big?236:222;txt(ctx,big?'1,000 fictional users':'The crowd: which ad each of 1,000 fictional users is shown',cx0,gy-8,{s:13*k,w:700});
  const cols=50,cz=big?7.4:8.4,gx=cx0,g0=gy+6;
  S.shown.forEach((w,i)=>{const r=Math.floor(i/cols),c=i%cols;ctx.fillStyle=w==='none'?PAL['line']:PAL[ADS.find(a=>a.id===w).col];ctx.fillRect(gx+c*cz,g0+r*cz,cz-1.4,cz-1.4);});
  let ly=g0+20*cz+20*ks,lx=gx;const items=ADS.map(a=>[(big?a.sh:a.l)+' '+S.c[a.id],PAL[a.col]]);if(S.c.none)items.push([(big?'None ':'Untargeted (law) ')+S.c.none,PAL['line']]);
  ctx.font='700 '+(12*k)+'px '+FONT;
  items.forEach(it=>{const w=ctx.measureText(it[0]).width;if(lx>gx&&lx+14*ks+w>792){lx=gx;ly+=18*k;}ctx.fillStyle=it[1];ctx.fillRect(lx,ly-10*ks,10*ks,10*ks);txt(ctx,it[0],lx+14*ks,ly,{s:12*k,w:700,c:PAL['cv-ink']});ctx.font='700 '+(12*k)+'px '+FONT;lx+=14*ks+w+18*ks;});},
 narrate(sim){const P=prof(sim),ad=sim.p.ad,p=pClick(P,ad),w=winner(P),t=topSig(sim);
  if(blocked(sim,P))return `This user is a known minor who has not given consent, so under Colorado’s SB24-041 the platform may not use their data for targeted ads. <b>The model can still compute a score; the law says it may not use it for targeting.</b>`;
  const vul=(P.late>=1||P.search==='stress');
  if(pend(sim)){const q=pts(sim,sim.gutS.g.pick);return `Your pick is locked: ${sigL(sim.gutS.g.pick).toLowerCase()}. With it the ${adL(ad).toLowerCase()} score is ${ptxt(q.a)}%; without it, ${ptxt(q.b)}%. <b>Work out how many points it adds.</b>`;}
  if(!shownW(sim))return `The model gives this profile a ${pct(p)} chance of clicking the ${adL(ad).toLowerCase()} ad, and shows them the ${adL(w).toLowerCase()} ad. <b>Which signal do you think is doing the most work?</b>`;
  return `${sigL(t.id)} adds ${f1(t.v)} points to the ${adL(ad).toLowerCase()} score, more than any other signal. `+(vul&&(t.id==='late'||t.id==='search')?`<b>The model never asked whether this person is stressed or tired. It learned that those signals predict clicks.</b>`:`<b>The score counts predicted clicks; nothing else about the person enters it.</b>`);},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'Look at the profile on the left and the ad outlined in red. Pick the one signal here that you think pushes that ad’s click score up the most. Then lock it in.',
   honors:'For the ad being scored, pick the signal you think adds the most points to its click score, then lock it in.'},
  lock(sim){const v=drop(sim,sim.p.pick);return {v,pick:sim.p.pick,label:`${sigL(sim.p.pick)}: adds ${f1(v)} points`};},
  solve(sim){const t=topSig(sim);sim.p.pick=t.id;return {v:t.v,pick:t.id,label:`${sigL(t.id)}: adds ${f1(t.v)} points`};},
  hint:{bio:'Lock in your pick. Then you will work out how many points your signal adds.'},
  calc:{unit:'points',d:1,tol:0.15,
   prompt:{bio:sim=>{const g=sim.gutS&&sim.gutS.g?sim.gutS.g.pick:sim.p.pick,q=pts(sim,g),ad=adL(sim.p.ad).toLowerCase();return `You picked: <b>${sigL(g)}</b>. With it, the model gives this profile a <b>${ptxt(q.a)}%</b> chance of clicking the ${ad} ad. With that signal taken away, the chance is <b>${ptxt(q.b)}%</b>. How many percentage points does your signal add?`;},
    ap:sim=>{const g=sim.gutS&&sim.gutS.g?sim.gutS.g.pick:sim.p.pick,q=pts(sim,g),m=v=>(v<0?'−':'')+fmtNum(Math.abs(v),3);return `You picked: <b>${sigL(g)}</b>. With it, z = ${m(q.zP)}; without it, z = ${m(q.zQ)}. Use P = 1/(1 + e^(−z)) for each, as a percent, and subtract. How many points does the signal add?`;}},
   answer:sim=>{const g=sim.gutS&&sim.gutS.g?sim.gutS.g.pick:sim.p.pick;return pts(sim,g).d;},
   hint:'Subtract the chance without the signal from the chance with it. The answer is in percentage points.',
   steps(sim){const g=sim.gutS&&sim.gutS.g?sim.gutS.g.pick:sim.p.pick,q=pts(sim,g),out=[];
    if(atLeast('ap'))out.push(`P = 1/(1 + e^(${fmtNum(-q.zP,3).replace('-','−')})) = ${ptxt(q.a)}%, and without the signal P = 1/(1 + e^(${fmtNum(-q.zQ,3).replace('-','−')})) = ${ptxt(q.b)}%.`);
    out.push(`${ptxt(q.a)}% − ${ptxt(q.b)}% = <b>${ptxt(q.d)}</b> percentage points, about ${p1(q.d)}.`);
    out.push(`Per 1,000 profiles like this: ${ptxt(q.d)}% of 1,000 = about ${Math.round(q.d*10)} clicks from that one signal.`);return out;}},
  formula(sim){const t=topSig(sim).id,q=pts(sim,t);return `${sigL(t)}: ${ptxt(q.a)}% − ${ptxt(q.b)}% = ${ptxt(q.d)} points, so about ${ptxt(q.d)} × 10 ≈ ${Math.round(q.d*10)} clicks per 1,000 profiles`+(atLeast('ap')?`<br>z = ${fmtNum(q.zP,3).replace('-','−')} with it, ${fmtNum(q.zQ,3).replace('-','−')} without; P = 1/(1 + e^(−z))`:'');},
  how:{bio:'The model takes each signal away, one at a time, and recomputes the score. The signal whose removal drops the score the most is the one doing the most work.',
   ap:'For each signal, set it to its neutral value, recompute P = 1/(1 + e^(−z)) and subtract. Because the logistic curve bends, the same weight adds more points when z is near 0 (P near 50%).'},
  compare(sim,g,m){const ad=adL(sim.p.ad).toLowerCase(),per=v=>Math.round(v*10);
   if(m.v-g.v<0.05)return `Your gut was right on: ${sigL(m.pick).toLowerCase()} adds the most, ${f1(m.v)} points. Out of every 1,000 profiles like this shown the ${ad} ad, that one signal accounts for about <b>${per(m.v)} clicks</b>. You already read the profile the way the model does.`;
   return `You picked ${sigL(g.pick).toLowerCase()}: it adds ${f1(g.v)} points. The model leans hardest on <b>${sigL(m.pick).toLowerCase()}: ${f1(m.v)} points</b>. Out of every 1,000 profiles like this shown the ${ad} ad, that is about <b>${per(m.v)} clicks</b> from one signal, against ${per(Math.max(0,g.v))} from yours.`+((m.pick==='late'||m.pick==='search')?' Late nights and stress searches stand in for “having a hard week,” and the model was never told to avoid them.':'');},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.ad=R(['energy','vape','study']);sim.p.age=R(['known','teen','adult']);sim.p.late=R([0,0.5,1,1.5,2,2.5,3]);sim.p.search=R(['none','stress','study','sports']);sim.p.follow=R(['friends','gaming','party','fitness']);sim.p.place=R(['home','store','gym','library']);sim.p.pick='age';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'An ad model gives a profile a 22.4% chance of clicking an ad. Without the profile’s late-night signal, the chance is 13.9%. Out of 1,000 profiles like this, about how many clicks does that one signal add?',answer:85,tol:1,unit:'clicks',d:0,hint:'Subtract to get percentage points. Then find that percent of 1,000.',explain:'22.4% − 13.9% = 8.5 percentage points. 8.5% of 1,000 = 85 clicks.'},
  {lvl:'bio',instant:true,q:'The model has never been told anyone’s mood. How can it still end up favoring people who are stressed?',choices:['It can’t: without a mood setting it ignores stress','It learns from clicks, and signals like late-night use and “can’t sleep” searches go with clicking','Stressed people are shown the study app on purpose'],correct:1,explain:'A click model learns whatever predicts clicks. In this toy model, late nights and stress searches raise the energy drink and vape-style scores, so the model favors them without anyone choosing to target stress. That is what “stand in for” means.'},
  {lvl:'bio',instant:true,q:'Default profile: a known 16-year-old, online 1.5 hours after midnight, searching about stress and sleep, following gaming streams. Which ad wins this person’s ad slot?',choices:['The study app','The energy drink','The vape-style product'],correct:1,explain:'The model shows the ad with the highest click score: energy drink 28%, vape-style 25%, study app 18%. Nothing in the score measures anything except the predicted chance of a click.'},
  {lvl:'honors',instant:true,q:'An A/B test shows half the users a plain ad (A) and half a late-night message (B), then keeps the one with more clicks. What does the test measure?',choices:['Which ad is better for the people who see it','Which ad gets more clicks, whoever is clicking','Whether the ad is legal'],correct:1,explain:'For the energy drink, B wins 245 to 185 clicks per 1,000. Clicks from late-night or stress-search users rise from 148 to 217, while clicks from everyone else fall from 37 to 28. The test keeps B because the total went up.'},
  {lvl:'honors',kind:'num',q:'In the energy drink A/B test, version B gets 60 more clicks per 1,000 users than version A. Users with late nights or stress searches give B 69 more clicks than A. How many clicks per 1,000 does B lose among everyone else?',answer:9,tol:0,unit:'clicks',d:0,hint:'The total change is the change from late-night or stress users plus the change from everyone else.',explain:'60 = 69 + (change from everyone else), so everyone else changes by 60 − 69 = −9: B loses 9 clicks there (37 → 28). All of B’s gain, and more, comes from users with late-night or stress-search signals.'},
  {lvl:'ap',instant:true,q:'Two profiles both gain +0.5 to z from late nights. One starts at z = −3 (P ≈ 4.7%), the other at z = 0 (P = 50%). Which gains more points?',choices:['The z = −3 profile','The z = 0 profile','Both gain the same'],correct:1,explain:'P(−2.5) − P(−3) ≈ 7.6% − 4.7% = 2.8 points, but P(0.5) − P(0) ≈ 62.2% − 50% = 12.2 points. The logistic curve is steepest at 50%, so the same weight moves the score most there.'},
  {lvl:'ap',instant:true,q:'For the vape-style ad, the default profile has z = −1.125. If the stress searches are removed (−0.9), about what is the new click chance?',choices:['About 11.7%','About 24.5%','About 4%','About 30%'],correct:0,explain:'z goes from −1.125 to −2.025. P = 1/(1 + e^2.025) ≈ 0.117, down from 0.245: a 12.8-point drop from one kind of search.'}
 ],
 tour:[
  {title:'The profile',text:'On the left is a fictional 16-year-old as an ad model sees them: no name, no face, just five signals. Age is on file. They are online about 1.5 hours after midnight, searching about stress and sleep, and following gaming streams.',focus:[0,0,336,450],pause:true,setup:sim=>BioLab.setValues(sim,{ad:'energy',age:'known',late:1.5,search:'stress',follow:'gaming',place:'home',reveal:false,law:false})},
  {title:'Three ads, three scores',text:'The toy model gives this profile a chance of clicking each ad. The ad with the highest score wins the slot: here the energy drink, at 28%.',focus:[348,30,452,170],pause:true},
  {title:'What each signal adds',text:'Now the points appear: how far the energy drink score would drop if the model could not see that signal. Late-night use adds the most, about 12 points.',focus:[0,80,336,350],pause:true,setup:sim=>BioLab.setValues(sim,{reveal:true})},
  {title:'Same profile, different ad',text:'Score the vape-style product instead. Now the stress and sleep searches add the most, about 13 points. Different ads lean on different signals.',focus:[0,80,336,350],pause:true,setup:sim=>BioLab.setValues(sim,{ad:'vape',reveal:true})},
  {title:'Take the signals away',text:'With no late nights and no stress searches, the energy drink score falls from 28% to 9%. Nothing else about this person changed.',focus:[348,30,452,170],pause:true,setup:sim=>BioLab.setValues(sim,{ad:'energy',late:0,search:'none',reveal:true})},
  {title:'The crowd',text:'The same model runs on 1,000 fictional users. Each square is a person, colored by the ad they are shown. Nobody chose who gets which ad: the highest score did.',focus:[348,200,452,250],pause:true,setup:sim=>BioLab.setValues(sim,{late:1.5,search:'stress'})},
  {lvl:'honors',title:'The law steps in',text:'Under Colorado’s SB24-041, a known minor’s data cannot be used for targeted ads without consent. Those users drop out of targeting and see an untargeted ad (gray).',focus:[348,200,452,250],pause:true,setup:sim=>BioLab.setValues(sim,{law:true})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{ad:'energy',age:'known',late:1.5,search:'stress',follow:'gaming',place:'home',reveal:false,law:false});},
 lab:{bio:'<p><b>Question:</b> Which signals does the model lean on, and for which ads?</p><ol><li>Turn on <b>Show how much each signal adds</b>.</li><li>For each ad, record which signal adds the most points.</li><li>Set late-night use to 0 and searches to Nothing notable. Record all three scores again.</li></ol><p>Write one sentence: which of these signals could stand in for a hard week?</p>',
  honors:'<p><b>Question:</b> What does an A/B test reward?</p><ol><li>For each ad, record the A/B result: total clicks for A and B, and clicks from late-night or stress-search users.</li><li>Turn on SB24-041 and record how the crowd changes.</li></ol><p>Which users account for version B’s win? Write what a test that counts only clicks measures, and one thing it leaves out.</p>',
  ap:'<p><b>Question:</b> Why does the same weight add different points to different profiles?</p><ol><li>Pick one signal. Record its points for five profiles with different starting scores.</li><li>Plot points added against the starting score.</li></ol><p><b>CER:</b> Use the slope of P = 1/(1 + e^(−z)), which is P(1 − P), to explain your graph.</p>'},
 terms:[
  {t:'Targeted advertising',d:'Choosing which ad to show a person based on a profile built from their data.'},
  {t:'Signal',d:'A piece of data a model uses as an input, like late-night use or a search.'},
  {t:'Proxy',d:'A signal that stands in for something the model cannot see directly, such as stress or a hard week.'},
  {t:'Click score',d:'The model’s estimated chance that a person clicks a given ad.'},
  {t:'A/B testing',d:'Showing two versions to random groups and keeping the one that does better on a chosen measure, usually clicks.',lvl:'honors'},
  {t:'Profiling',d:'Automated processing of personal data to evaluate or predict things about a person.',lvl:'honors'},
  {t:'Logistic function',d:'P = 1/(1 + e^(−z)): turns any score z into a chance between 0 and 1.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> For each ad, z = base + the weight of each signal, and P(click) = 1/(1 + e^(−z)). Every weight, the A/B lift for version B, and the crowd of 1,000 users are invented for illustration. They show how click models work, not any real company’s model or data. A signal’s points are how far the score drops when that signal is set to its neutral value. The ad with the highest click score wins the slot; real ad systems also weigh what each advertiser bids. The ads are generic, with no real brands.</p><p><b>Rules to know.</b> Federal Tobacco 21 law (December 2019) set 21 as the minimum age to buy tobacco and e-cigarette products. Colorado’s SB24-041, in force October 1, 2025, amends the Colorado Privacy Act: for a consumer a business knows, or willfully disregards, is under 18, it needs consent before processing their data for targeted advertising, sale or certain profiling, and it may not use design features to significantly increase, sustain or extend a minor’s use of an online service. Whether a model’s guess from behavior counts as knowing someone is a minor is a legal question this tool does not answer. Source: <a href="https://www.thompsonhine.com/insights/colorado-adds-protections-for-minors-to-privacy-law/" target="_blank" rel="noopener">Thompson Hine, “Colorado Adds Protections for Minors to Privacy Law”</a>.</p><p><b>The idea.</b> Chapter 4 of Cathy O’Neil’s <i>Weapons of Math Destruction</i> describes ad models that find people through signals of vulnerability, and A/B tests that keep whatever gets clicks.</p><p>Every profile here is fictional and this tool does not score you. If stress or sleep is weighing on you, talk to RJ counseling or use Safe2Tell.</p>'
};
BioLab.register(SIM);
})();

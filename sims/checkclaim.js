(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum,rng,randn}=BioLab.h;
/* Every product, claim and study here is fictional. */
const CLAIMS={
 metab:{l:'Metabolism',claim:'Boosts metabolism for all-day energy',story:'The maker gave it to 10 people for two weeks, and their energy ratings went up.',who:'seller',n:10,design:'none',paid:'seller'},
 focus:{l:'Focus',claim:'Clinically proven to sharpen focus',story:'The maker ran one trial: 40 students, randomly given the gummy or a look-alike placebo.',who:'seller',n:40,design:'rct',paid:'seller'},
 immune:{l:'Immune',claim:'Doctor recommended immune support',story:'A doctor appears in the ad. No study is listed.',who:'nobody',n:10,design:'none',paid:'unknown'},
 detox:{l:'Detox',claim:'Detox tea flushes out toxins',story:'Thousands of 5-star reviews. No study is listed.',who:'nobody',n:10,design:'none',paid:'unknown'},
 muscle:{l:'Muscle',claim:'FDA registered. Builds muscle faster.',story:'University researchers compared 120 lifters who chose to take it with lifters who chose not to. The maker paid.',who:'indep',n:120,design:'compare',paid:'seller'},
 hydrate:{l:'Hydration',claim:'Helps you stay hydrated in long practices',story:'Independent researchers randomly gave 600 athletes the drink or a look-alike placebo, paid for by a public grant.',who:'indep',n:600,design:'rct',paid:'indep'}
};
const BANDS=[{id:'none',l:'Not supported',lo:0,hi:2},{id:'weak',l:'Weak',lo:3,hi:5},{id:'mod',l:'Moderate',lo:6,hi:8},{id:'strong',l:'Strong',lo:9,hi:10}];
const WHO={nobody:'No study at all',seller:'The seller’s own study',indep:'Independent researchers'};
const DES={none:'No control group',compare:'Control group, not randomized',rct:'Randomized, with a placebo group'};
const PAID={seller:'The seller',indep:'An independent funder',unknown:'Not stated'};
/* The transparent rubric (0 to 10) */
function rubric(p){const no=p.who==='nobody';const n=+p.n;
 const L=[{k:'Who ran it',v:WHO[p.who],pts:no?0:(p.who==='indep'?2:0),max:2},
  {k:'How many people',v:no?'no study':(n+' people'),pts:no?0:(n>=500?3:n>=100?2:n>=30?1:0),max:3},
  {k:'Control group?',v:no?'no study':(p.design==='none'?'No':'Yes'),pts:no?0:(p.design!=='none'?2:0),max:2},
  {k:'Randomized?',v:no?'no study':(p.design==='rct'?'Yes':'No'),pts:no?0:(p.design==='rct'?2:0),max:2},
  {k:'Who paid',v:no?'no study':PAID[p.paid],pts:no?0:(p.paid==='indep'?1:0),max:1}];
 return {L,total:L.reduce((a,b)=>a+b.pts,0)};}
const bandOf=t=>BANDS.findIndex(b=>t>=b.lo&&t<=b.hi);
const gIdx=id=>BANDS.findIndex(b=>b.id===id);
/* The study simulation. A person's usual rating (out of 100) is T ~ N(60, 10); each day adds noise N(0, 10).
   People try a product on a bad day: they sign up only if today's rating is under 50. */
const CUT=50;
function person(r,cut){let T,B;do{T=60+10*randn(r);B=T+10*randn(r);}while(cut!=null&&B>=cut);return {T,B};}
const CUT2=60;/* people who chose not to buy were less often on a bad day: they enter below 60 instead of 50 */
function study(design,n,eff,seed){const r=rng(seed),half=Math.max(1,Math.floor(n/2));const A=[],C=[];
 if(design==='none'){for(let i=0;i<n;i++){const q=person(r,CUT);A.push({b:q.B,a:q.T+10*randn(r)+eff});}}
 else if(design==='compare'){for(let i=0;i<n-half;i++){const q=person(r,CUT);A.push({b:q.B,a:q.T+10*randn(r)+eff});}for(let i=0;i<half;i++){const q=person(r,CUT2);C.push({b:q.B,a:q.T+10*randn(r)});}}
 else{const all=[];for(let i=0;i<n;i++)all.push(person(r,CUT));for(let i=all.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
  all.forEach((q,i)=>{if(i<n-half)A.push({b:q.B,a:q.T+10*randn(r)+eff});else C.push({b:q.B,a:q.T+10*randn(r)});});}
 const ch=g=>g.map(x=>x.a-x.b),mean=a=>a.reduce((s,x)=>s+x,0)/a.length,vr=a=>{const m=mean(a);return a.reduce((s,x)=>s+(x-m)*(x-m),0)/Math.max(1,a.length-1);};
 const cA=ch(A),mA=mean(cA);let est=mA,se=Math.sqrt(vr(cA)/cA.length),mC=null;
 if(C.length){const cC=ch(C);mC=mean(cC);est=mA-mC;se=Math.sqrt(vr(cA)/cA.length+vr(cC)/cC.length);}
 return {A,C,mA,mC,est,se};}
const SIMC=new Map();
function cur(sim){const p=sim.p,k=[p.design,p.n,effOf(sim),sim.st.seed].join('|');if(!SIMC.has(k)){if(SIMC.size>60)SIMC.clear();SIMC.set(k,study(p.design,+p.n,effOf(sim),sim.st.seed));}return SIMC.get(k);}
const FAKE=new Map();
/* Out of 100 repeat studies of a product that does nothing, how many look like it works (an estimated effect of 5 points or more)? */
function fakeRate(design,n){const k=design+'|'+n;if(FAKE.has(k))return FAKE.get(k);let hit=0;const R=200;for(let i=0;i<R;i++){if(study(design,n,0,9001+i*7919).est>=5)hit++;}const v=hit/R*100;FAKE.set(k,v);return v;}
const effOf=sim=>atLeast('honors')?+sim.p.effect:0;
const none=sim=>sim.p.who==='nobody';
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* The rubric points stay hidden while the student scores the study ("Your turn"). */
const shown=sim=>!pend(sim)&&!!(sim.p.reveal||(GS(sim)&&GS(sim).g));
const sumOf=p=>rubric(p).L.map(L=>L.pts).join(' + ');
function studyText(p){const no=p.who==='nobody';if(no)return 'There is no study at all.';
 return `${WHO[p.who]}; ${p.n} people; ${DES[p.design].toLowerCase()}; ${p.paid==='unknown'?'who paid is not stated':'paid for by '+PAID[p.paid].toLowerCase()}.`;}
const sgn1=v=>(v>=0?'+':'−')+fmtNum(Math.abs(v),1);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function loadClaim(sim){const c=CLAIMS[sim.p.claim];BioLab.setValues(sim,{who:c.who,n:c.n,design:c.design,paid:c.paid});clearGut(sim);}
function wrapLines(ctx,s,maxW,size){ctx.font='700 '+size+'px '+FONT;const out=[];let line='';s.split(' ').forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=w;}else line=t;});if(line)out.push(line);return out;}
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='',yy=y;words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
function designWord(d){return d==='none'?'no control group':(d==='compare'?'a control group that was not randomized':'a randomized placebo group');}

const SIM={
 id:'checkclaim',hash:'checkclaim',apUnit:4,order:2,tab:'Check the Claim',kind:'Simulation',prereq:[],
 skills:{bio:'Scoring evidence: control groups, randomization and sample size · Health (Unit 2: Nutrition: labels, fad diets and supplements), Statistics (Unit 3: collecting data)',honors:'Regression to the mean and false positives · Health (Unit 2: Nutrition: labels, fad diets and supplements), Statistics (Unit 3: collecting data)',ap:'Margin of error: SE ≈ s·√(1/n₁ + 1/n₂) · Health (Unit 2: Nutrition), AP Statistics (Unit 7: inference for means)'},
 card:'Rate a supplement claim by the study behind it, then watch a 10-person study of a product that does nothing still “prove” it works.',
 title:'Check the claim: how good is the evidence?',
 lede:{bio:'Supplement labels make big promises: more energy, sharper focus, stronger immunity. The question is not whether people said it worked. It is who studied it, how many people, whether there was a fair comparison, and who paid.',
  honors:'A study with no control group cannot tell a product’s effect from people getting better on their own. People try a product on a bad day, and bad days are usually followed by more ordinary ones. That is regression to the mean, and only a randomized control group cancels it.',
  ap:'The estimated effect is the treatment group’s average change minus the control group’s. With n people per group and a per-person spread s, its standard error is about s·√(2/n), so the 95% margin shrinks with √n.'},
 scale:'One fictional product label and a simulated study of people rating how they feel out of 100. Every product, claim and study here is fictional. Nothing you set here leaves your browser.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The claim and its study',
 controls:[
  {id:'guess',label:'Your gut: how well supported is this claim?',type:'seg',def:'mod',options:BANDS.map(b=>({v:b.id,l:b.l}))},
  {id:'claim',label:'Claim on the label',type:'seg',def:'metab',noGut:true,onChange:loadClaim,options:Object.keys(CLAIMS).map(k=>({v:k,l:CLAIMS[k].l})),help:'Choosing a claim loads the study behind it. You can then change the study below to see how the rating moves.'},
  {id:'who',label:'Who ran the study',type:'seg',def:'seller',noGut:true,onChange:clearGut,options:[{v:'nobody',l:'No study'},{v:'seller',l:'The seller'},{v:'indep',l:'Independent researchers'}]},
  {id:'n',label:'How many people',type:'range',min:10,max:1000,step:10,def:10,unit:'',noGut:true,onChange:clearGut},
  {id:'design',label:'Comparison',type:'seg',def:'none',noGut:true,onChange:clearGut,options:[{v:'none',l:'No control group'},{v:'compare',l:'Control, not randomized'},{v:'rct',l:'Randomized, placebo'}]},
  {id:'paid',label:'Who paid',type:'seg',def:'seller',noGut:true,onChange:clearGut,options:[{v:'seller',l:'The seller'},{v:'indep',l:'Independent funder'},{v:'unknown',l:'Not stated'}]},
  {id:'reveal',label:'Show the rubric scores now',type:'toggle',def:false,noTrial:true,help:'Normally the scores appear once you lock in your gut answer.'},
  {id:'effect',label:'What the product really does (true effect)',type:'range',min:0,max:10,step:1,def:0,unit:' points',lvl:'honors',noGut:true,help:'0 means it does nothing. Try a real effect and see which designs can find it.'}
 ],
 actions:[{id:'rerun',label:'Run the study again',run(sim){sim.st.seed=(sim.st.seed*48271+11)%2147483647;sim.infoDirty=true;}}],
 init(){return {seed:432};},step(){},
 metrics:[
  {id:'score',label:'Evidence score (rubric)',unit:'of 10',d:0,min:0,max:10,get:sim=>shown(sim)?rubric(sim.p).total:null},
  {id:'band',label:'Evidence strength',text:true,get:sim=>shown(sim)?BANDS[bandOf(rubric(sim.p).total)].l:'Lock in your gut answer to see'},
  {id:'chg',label:'Average change, people who took it',unit:'points',d:1,min:-20,max:20,get:sim=>none(sim)?null:cur(sim).mA},
  {id:'ctl',label:'Average change, control group',unit:'points',d:1,min:-20,max:20,get:sim=>(none(sim)||sim.p.design==='none')?null:cur(sim).mC},
  {id:'est',label:'What the study says the product does',unit:'points',d:1,min:-20,max:20,get:sim=>none(sim)?null:cur(sim).est},
  {id:'fake',label:'Studies like this of a do-nothing product that look like it works',unit:'of 100',d:0,min:0,max:100,get:sim=>none(sim)?null:fakeRate(sim.p.design,+sim.p.n)},
  {id:'moe',label:'95% margin of error on the estimate (±)',unit:'points',d:1,min:0,max:20,lvl:'ap',get:sim=>none(sim)?null:1.96*cur(sim).se}
 ],
 draw(sim,ctx,vdt,k){const big=k>1.3,ks=Math.min(k,1.4),c=CLAIMS[sim.p.claim],R=rubric(sim.p),sh=shown(sim),G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,0,340,450);
  /* the label and the study behind it */
  let y,ty;
  if(!big){rr(ctx,14,12,312,104,12);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
   ctx.fillStyle=PAL['s6'];rr(ctx,26,30,30,58,8);ctx.fill();ctx.fillStyle=PAL['cv-soft'];rr(ctx,31,22,20,10,3);ctx.fill();ctx.fillStyle=PAL['card'];ctx.fillRect(30,50,22,16);
   txt(ctx,'On the label',68,34,{s:12*k,c:PAL['cv-soft']});
   wrap(ctx,'“'+c.claim+'”',68,34+22*ks,250,18*k,{s:15*k,w:700,c:PAL['cv-ink']});
   y=136;txt(ctx,'The study behind it',20,y,{s:13*k,w:700});txt(ctx,'Points',320,y,{s:12*k,c:PAL['cv-soft'],a:'right'});
   y+=10;R.L.forEach((L,i)=>{const yy=y+(i+1)*38;
    txt(ctx,L.k,20,yy-15,{s:12*k,c:PAL['cv-soft']});txt(ctx,L.v,20,yy,{s:13*k,w:700});
    pill(ctx,sh?`${L.pts}/${L.max}`:'?',300,yy-6*ks,sh?(L.pts?PAL['s3']:PAL['cv-soft']):PAL['line'],sh?'#fff':PAL['cv-ink'],12*ks);});
   ty=y+5*38+30*ks;}
  else{const lines=wrapLines(ctx,'“'+c.claim+'”',290,14*k),lh=17*k,ch=lines.length*lh+16;
   rr(ctx,12,10,316,ch,10);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
   lines.forEach((l,i)=>txt(ctx,l,24,10+lh*(i+1)-2,{s:14*k,w:700}));
   const p=sim.p,no=p.who==='nobody',SH=[no?'No study':(p.who==='indep'?'Independent':'Seller’s study'),no?'No people':p.n+' people',no?'No control':(p.design==='none'?'No control':'Control group'),no?'Not random':(p.design==='rct'?'Randomized':'Not random'),no?'No funder':(p.paid==='indep'?'Indep. funder':(p.paid==='seller'?'Seller paid':'Funder unknown'))];
   y=10+ch+8;R.L.forEach((L,i)=>{const yy=y+(i+1)*24*ks+4;txt(ctx,SH[i],20,yy,{s:12*k,w:700});
    pill(ctx,sh?`${L.pts}/${L.max}`:'?',298,yy-6*ks,sh?(L.pts?PAL['s3']:PAL['cv-soft']):PAL['line'],sh?'#fff':PAL['cv-ink'],12*ks);});
   ty=y+5*24*ks+30*ks;}
  if(sh){const b=BANDS[bandOf(R.total)],mth=G&&G.m;pill(ctx,mth&&big?`${sumOf(sim.p)} = ${R.total}/10`:`${R.total}/10: ${b.l}`,170,ty,PAL['rj'],'#fff',14*ks);
   if(mth&&!big)txt(ctx,`${sumOf(sim.p)} = ${R.total}`,170,ty-22*ks,{s:13*k,w:700,c:PAL['rj'],a:'center'});}
  else txt(ctx,pend(sim)?(big?'Score it yourself':'Add up the points yourself first'):(big?'Lock in your gut':'Lock in your gut answer to score it'),170,ty+5,{s:12*k,c:PAL['cv-soft'],a:'center'});
  if(G&&G.g&&!big)txt(ctx,'Your gut: '+BANDS[gIdx(G.g.guess)].l,170,ty+28,{s:12,w:700,c:PAL['s4'],a:'center'});
  /* the simulated study */
  const X0=356;
  if(none(sim)){txt(ctx,big?'No study to run':'No study to run',X0+8,40,{s:15*k,w:700});
   wrap(ctx,'A doctor in an ad, or a page of 5-star reviews, is opinion, not a test. Nothing here separates the claim from chance, from people getting better on their own, or from marketing.',X0+8,40+28*ks,420,20*k,{s:14*k,c:PAL['cv-ink']});
   wrap(ctx,'Pick a different “Who ran the study” to see what a real test of this claim could show.',X0+8,big?330:240,420,18*k,{s:12*k,c:PAL['cv-soft']});return;}
  const S=cur(sim),d=sim.p.design,eff=effOf(sim);
  txt(ctx,big?'If it did nothing:':(eff?`A study where the product adds ${eff} points`:'What this study shows if the product does nothing'),X0+4,24,{s:13*k,w:700});
  txt(ctx,big?`${sim.p.n} people`:`${sim.p.n} people, ${designWord(d)}. Rating out of 100.`,X0+4,24+17*ks,{s:12*k,c:PAL['cv-soft']});
  if(!big)txt(ctx,'Red dashed line: people sign up below 50, on a bad day.',X0+4,24+34,{s:12,c:PAL['s1']});
  const T=big?92:88,B=big?336:350,Y=v=>B-clamp(v,0,100)/100*(B-T);
  /* axis */
  ctx.strokeStyle=PAL['g-grid'];ctx.lineWidth=1;[0,25,50,75,100].forEach(v=>{ctx.beginPath();ctx.moveTo(X0+30,Y(v));ctx.lineTo(788,Y(v));ctx.stroke();txt(ctx,String(v),X0+24,Y(v)+4,{s:12*ks,c:PAL['cv-soft'],a:'right'});});
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X0+30,Y(CUT));ctx.lineTo(788,Y(CUT));ctx.stroke();ctx.setLineDash([]);
  const groups=d==='none'?[[S.A,'Took it',X0+150,S.mA]]:[[S.A,'Took it',X0+110,S.mA],[S.C,d==='rct'?'Placebo':'Chose not to',X0+300,S.mC]];
  groups.forEach(([g,lab,gx,m])=>{const w=110,shownN=Math.min(g.length,30);const r=rng(77);
   for(let i=0;i<shownN;i++){const p=g[i],jx=(r()-0.5)*16;const x1=gx+jx,x2=gx+w+jx;
    ctx.strokeStyle=p.a>p.b?PAL['s3']:PAL['s1'];ctx.globalAlpha=.35;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x1,Y(p.b));ctx.lineTo(x2,Y(p.a));ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.arc(x1,Y(p.b),3,0,7);ctx.fill();ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(x2,Y(p.a),3,0,7);ctx.fill();}
   const mb=g.reduce((s,x)=>s+x.b,0)/g.length,ma=g.reduce((s,x)=>s+x.a,0)/g.length;
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=4;[[gx,mb],[gx+w,ma]].forEach(([x,v])=>{ctx.beginPath();ctx.moveTo(x-16,Y(v));ctx.lineTo(x+16,Y(v));ctx.stroke();});
   ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(gx+16,Y(mb));ctx.lineTo(gx+w-16,Y(ma));ctx.stroke();
   txt(ctx,lab,gx+w/2,T-10,{s:13*k,w:700,a:'center'});
   txt(ctx,'Before',gx,B+16*ks,{s:12*ks,c:PAL['cv-soft'],a:'center'});txt(ctx,'After',gx+w,B+16*ks,{s:12*ks,c:PAL['cv-soft'],a:'center'});
   pill(ctx,'avg '+sgn1(m),gx+w/2,Y(Math.max(mb,ma))-18,PAL['card2'],PAL['cv-ink'],12*ks);
   if(g.length>shownN&&!big)txt(ctx,`showing 30 of ${g.length}`,gx+w/2,B+32,{s:12,c:PAL['cv-soft'],a:'center'});});
  const fr=fakeRate(d,+sim.p.n);
  pill(ctx,(d==='none'?'Average change ':'Took it minus control ')+sgn1(S.est)+' points',X0+(big?120:130),B+(big?44:48),PAL['rj'],'#fff',12*ks);
  txt(ctx,big?`Fake “works”: ${Math.round(fr)}/100`:`A do-nothing product “works” in ${Math.round(fr)} of 100 studies like this`,X0+4,B+(big?78:82),{s:12*k,w:700,c:PAL['cv-ink']});},
 narrate(sim){const c=CLAIMS[sim.p.claim],R=rubric(sim.p);
  if(none(sim))return `“${c.claim}.” ${c.story} <b>With no study, there is no evidence to weigh, only a claim.</b>`;
  if(pend(sim))return `Your rating is locked. Now <b>score the study yourself</b> with the rubric: who ran it, how many people, a control group, random assignment, and who paid.`;
  const S=cur(sim),fr=fakeRate(sim.p.design,+sim.p.n),d=sim.p.design;
  const lead=sim.p.claim&&CLAIMS[sim.p.claim]&&CLAIMS[sim.p.claim].who===sim.p.who&&+CLAIMS[sim.p.claim].n===+sim.p.n&&CLAIMS[sim.p.claim].design===d?c.story+' ':'';
  if(d==='none')return `${lead}With no control group, the people who took it changed by ${sgn1(S.mA)} points on average${effOf(sim)?'':', even though the product here does nothing'}. <b>They signed up on a bad day, and most bad days are followed by better ones.</b> A study like this “works” ${Math.round(fr)} times in 100 with a do-nothing product.`;
  if(d==='compare')return `${lead}Both groups were measured, but people chose for themselves. Takers signed up on a bad day; the others were less often on one, so they had less room to bounce back. <b>The comparison is not fair</b>, and a do-nothing product “works” ${Math.round(fr)} times in 100.`;
  return `${lead}Both groups signed up on a bad day and were assigned at random, so both bounce back about the same. The difference, ${sgn1(S.est)} points, is the product’s effect plus chance. <b>A do-nothing product “works” in only ${Math.round(fr)} of 100 studies like this.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Read the claim and the study behind it on the left. Pick how well you think the evidence supports the claim here, then lock it in.',
   honors:'Read the study details on the left. Before you see the rubric, pick how well supported you think the claim is, then lock it in.'},
  lock(sim){const m=bandOf(rubric(sim.p).total),g=gIdx(sim.p.guess);return {v:Math.abs(g-m),guess:sim.p.guess,label:BANDS[g].l};},
  solve(sim){const R=rubric(sim.p),m=bandOf(R.total);sim.p.guess=BANDS[m].id;return {v:0,guess:BANDS[m].id,label:`${BANDS[m].l} (${R.total} out of 10)`};},
  hint:{bio:'Lock in your rating. Then you will score the study yourself with the rubric.'},
  calc:{unit:'points',d:0,tol:0,
   prompt:{bio:sim=>`The study behind this claim: <b>${studyText(sim.p)}</b><br>Rubric: independent researchers <b>2</b> (the seller 0). People: <b>0</b> under 30, <b>1</b> for 30 to 99, <b>2</b> for 100 to 499, <b>3</b> for 500 or more. A control group <b>2</b>. Randomized <b>2</b>. An independent funder <b>1</b>. No study at all scores 0. What does this study score, out of 10?`,
    ap:sim=>`The study: ${studyText(sim.p)} Score it on the rubric (who 0 or 2; n: 0, 1, 2 or 3 at cutoffs 30, 100, 500; control 2; randomized 2; independent funder 1). Total out of 10?`},
   answer:sim=>rubric(sim.p).total,
   hint:'Go line by line: who ran it, how many people, control group, randomized, who paid. Then add.',
   steps(sim){const R=rubric(sim.p);return R.L.map(L=>`${L.k}: ${L.v}, <b>${L.pts}</b> of ${L.max}.`).concat([`Total: ${sumOf(sim.p)} = <b>${R.total}</b> out of 10: ${BANDS[bandOf(R.total)].l.toLowerCase()}.`]);}},
  formula(sim){const R=rubric(sim.p);let f=`Evidence score = ${sumOf(sim.p)} = ${R.total} out of 10 (${BANDS[bandOf(R.total)].l.toLowerCase()})`;
   if(!none(sim))f+=`<br>Do-nothing product, ${sim.p.n} people, ${designWord(sim.p.design)}: “works” in ${Math.round(fakeRate(sim.p.design,+sim.p.n))} of 100 simulated studies`;return f;},
  how:{bio:'The rubric gives points for independent researchers (2), more people (up to 3), a control group (2), random assignment (2) and an independent funder (1). Then the simulation runs the same kind of study on a product that does nothing, 200 times, and counts how often it still looks like it works.',
   ap:'Rubric: who (0 or 2), n (0 under 30, 1 under 100, 2 under 500, 3 at 500 or more), control (2), randomized (2), funder (1). Simulation: T ~ N(60, 10), daily noise N(0, 10), sign-up only below 50, and “works” means an estimate of 5 points or more.'},
  compare(sim,g,m){const R=rubric(sim.p),c=CLAIMS[sim.p.claim];
   let terms;if(none(sim))terms=`There is no study at all, so nothing separates “${c.claim}” from chance or marketing.`;
   else{const fr=Math.round(fakeRate(sim.p.design,+sim.p.n));terms=`Run a study like this one (${sim.p.n} people, ${designWord(sim.p.design)}) on a product that does nothing, and it still looks like it works in <b>${fr} of 100</b> tries.`+(fr<=5?' So a good result from this design really means something.':' So a good result from this design proves very little.');}
   if(g.v===0)return `Your gut was right on: ${BANDS[bandOf(R.total)].l.toLowerCase()}, ${R.total} out of 10 on the rubric. ${terms}`;
   return `You rated it <b>${g.label}</b>; the rubric says <b>${BANDS[bandOf(R.total)].l}</b> (${R.total} out of 10), ${g.v} step${g.v>1?'s':''} ${gIdx(g.guess)>bandOf(R.total)?'more trusting':'more doubtful'} than the evidence. ${terms}`;},
  again(sim){const ks=Object.keys(CLAIMS),c=ks[Math.floor(Math.random()*ks.length)],C=CLAIMS[c];sim.p.claim=c;sim.p.who=C.who;sim.p.n=C.n;sim.p.design=C.design;sim.p.paid=C.paid;sim.p.guess='mod';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different claim. Independent researchers studied 250 people. They compared people who chose to take the product with people who chose not to (a control group, not randomized). The seller paid. What does the rubric give it, out of 10?',answer:6,tol:0,unit:'points',d:0,hint:'Who 0 or 2; people 0, 1, 2 or 3; control 2; randomized 2; funder 1.',explain:'Independent researchers 2, 250 people (100 to 499) 2, control group 2, not randomized 0, seller paid 0: 2 + 2 + 2 + 0 + 0 = 6, moderate.'},
  {lvl:'bio',instant:true,q:'Ten people try an energy supplement on a day they feel worn out, and two weeks later most feel better. The product does nothing. Why did they improve?',choices:['They didn’t: the study must be fake','Bad days are usually followed by more ordinary days, so people improve on their own','A small study always makes products look worse'],correct:1,explain:'In this simulation, people who sign up on a bad day improve by about 9 points on average with no product at all. A 10-person study with no control group “shows” at least 5 points of improvement in about 85 of 100 runs.'},
  {lvl:'honors',instant:true,q:'The muscle study compares 60 lifters who chose to take the product with 60 who chose not to. Why is that comparison unfair?',choices:['The groups are too small to compare','People who chose it tended to start on a bad day; the others less often, so the takers had more room to bounce back','Comparison groups always favor the product by exactly 5 points'],correct:1,explain:'The two groups differ before the product does anything. Here a do-nothing product still “works” in about 26 of 100 studies like this. With random assignment from the same sign-up pool, both groups bounce back alike and the difference measures the product.'},
  {lvl:'honors',instant:true,q:'Same do-nothing product, randomized with a placebo group. How does going from 40 people to 600 change how often the study looks like it works?',choices:['It rises, because more people improve','It falls toward zero, because chance differences between the groups shrink','It stays the same'],correct:1,explain:'With 40 people (20 per group), chance alone gives a 5-point “effect” in about 12 of 100 runs here. With 600, in 0 of 100. Bigger randomized studies are harder to fool.'},
  {lvl:'ap',instant:true,q:'Each person’s change has a spread of about 12 points. In a randomized study with 300 per group, about what is the 95% margin of error on the difference in average change?',choices:['About ±0.7','About ±1.9','About ±5','About ±12'],correct:1,explain:'SE ≈ 12·√(1/300 + 1/300) = 12·√(0.00667) ≈ 0.98. The margin is 1.96 × 0.98 ≈ 1.9 points.'},
  {lvl:'ap',instant:true,q:'Why does selecting people with a rating under 50 make a do-nothing product look good in an uncontrolled study?',choices:['Low scorers are more honest','The cutoff selects people whose noise that day was low, and the next measurement’s noise averages to zero','Low scorers take the product more often'],correct:1,explain:'A low reading is partly a low usual level and partly bad luck that day. Next time the luck averages out, so the expected change is positive. In this model it is about +9 points.'}
 ],
 tour:[
  {title:'The claim',text:'On the left is a fictional label: “Boosts metabolism for all-day energy.” Under it is the study behind the claim, line by line.',focus:[0,0,340,450],pause:true,setup:sim=>BioLab.setValues(sim,{claim:'metab',reveal:false,effect:0})},
  {title:'The study, simulated',text:'On the right, the same kind of study runs on a product that does nothing. Each line is a person: their rating the day they signed up, and two weeks later. Green lines went up.',focus:[346,0,454,450],pause:true},
  {title:'Why they improve',text:'People sign up on a bad day, below the red dashed line at 50. Bad days are usually followed by more ordinary ones, so most of them improve with no product at all. That is regression to the mean.',focus:[346,0,454,450],pause:true},
  {title:'The rubric',text:'Now the points: no independent researchers, only 10 people, no control group, not randomized, paid for by the seller. 0 out of 10: not supported.',focus:[0,120,340,330],pause:true,setup:sim=>BioLab.setValues(sim,{reveal:true})},
  {title:'A fair test',text:'Here is the hydration claim: 600 athletes, randomly given the drink or a look-alike placebo, by independent researchers with public funding. Both groups bounce back alike, so the difference is close to zero for a do-nothing product.',focus:[346,0,454,450],pause:true,setup:sim=>BioLab.setValues(sim,{claim:'hydrate',reveal:true})},
  {title:'What fooled us',text:'The 10-person study of a do-nothing product looks like it works in about 85 of 100 runs. The 600-person randomized study almost never does. That is why the rubric rewards size, a control group and randomization.',pause:true,setup:sim=>BioLab.setValues(sim,{claim:'metab',reveal:true})},
  {lvl:'honors',title:'A real effect',text:'Give the product a real 5-point effect and switch to a randomized design with 200 people. Now the study finds it, and a do-nothing product would rarely fake it.',focus:[346,0,454,450],pause:true,setup:sim=>BioLab.setValues(sim,{claim:'metab',who:'indep',n:200,design:'rct',paid:'indep',effect:5,reveal:true})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{claim:'metab',reveal:false,effect:0});},
 lab:{bio:'<p><b>Question:</b> Which parts of a study protect you from being fooled?</p><ol><li>Choose the Metabolism claim. Record a trial, then press <b>Run the study again</b> twice and record each.</li><li>Change <b>How many people</b> to 200. Record. Then change <b>Comparison</b> to Randomized, placebo. Record.</li><li>Compare the do-nothing “works” count across your trials.</li></ol><p>Write one sentence: which change mattered most, and why?</p>',
  honors:'<p><b>Question:</b> When can a study find a real effect?</p><ol><li>Set the true effect to 5 points.</li><li>For each design, try 20, 100 and 500 people. Record the estimated effect.</li><li>Then set the true effect to 0 and record how often each design still “works.”</li></ol>',
  ap:'<p><b>Question:</b> How does the margin of error depend on the sample size?</p><ol><li>With a randomized design, record the 95% margin for n = 40, 160 and 640.</li><li>Check that each 4× increase in n roughly halves the margin.</li></ol><p><b>CER:</b> Use SE ≈ s·√(1/n₁ + 1/n₂) as your reasoning.</p>'},
 terms:[
  {t:'Control group',d:'People in a study who do not get the product, so you can compare them with people who do.'},
  {t:'Placebo',d:'A look-alike with nothing active in it, so people cannot tell which group they are in.'},
  {t:'Randomized',d:'Assigned to a group by chance, like a coin flip, so the groups start out alike.'},
  {t:'Regression to the mean',d:'An unusually high or low measurement tends to be followed by one closer to average.'},
  {t:'Structure/function claim',d:'A label claim about how a product affects the body, like “supports immunity.” It does not need FDA approval first.'},
  {t:'Conflict of interest',d:'When the people who run or pay for a study gain if it comes out a certain way.',lvl:'honors'},
  {t:'Margin of error',d:'How far the true effect could reasonably be from the study’s estimate, by chance alone.',lvl:'ap'}
 ],
 about:'<p><b>The rubric.</b> Who ran it: independent researchers 2, the seller 0. People: 0 under 30, 1 for 30 to 99, 2 for 100 to 499, 3 for 500 or more. Control group: 2. Randomized: 2. Independent funder: 1. With no study at all, the score is 0. Bands: 0 to 2 not supported, 3 to 5 weak, 6 to 8 moderate, 9 to 10 strong. The rubric is a teaching tool, not an official standard. Real reviews also look at blinding, how long people were followed, whether results were published and checked by other scientists, and whether other studies agree.</p><p><b>The simulation.</b> Each person’s usual rating is drawn from a normal distribution with mean 60 and spread 10, and each day adds noise with spread 10. People sign up when that day’s rating is under 50. A non-randomized comparison group (people who chose not to take it) enters when that day’s rating is under 60 instead, because people who skip a product are less often on a bad day; that cutoff is an assumption for illustration. A study “looks like it works” when its estimated effect is 5 points or more. The do-nothing count comes from 200 simulated studies. All of these numbers are assumptions for illustration, and every product, claim and study is fictional.</p><p><b>Facts.</b> In the US, dietary supplements do not need FDA approval for safety or effectiveness before they are sold. A label with a structure/function claim must say the FDA has not evaluated the statement and the product is not intended to diagnose, treat, cure or prevent any disease (Dietary Supplement Health and Education Act, DSHEA, 1994). Registering a facility with the FDA is not FDA approval. This is a simplified model, not medical advice. Ask a doctor or pharmacist before taking a supplement.</p>'
};
BioLab.register(SIM);
})();

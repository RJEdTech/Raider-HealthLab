(function(){
'use strict';
const {clamp,rng,rr,txt,pill,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* ---- The test viewer. These habits are made up for illustration. The feed never sees them: it only sees what the viewer does. ---- */
const T=[
 {id:'friends',name:'Friends’ posts',short:'Friends',col:'s2',clip:15,watch:0.70,like:0.40,share:0.02,comment:0.10,ni:0.02,want:0.40},
 {id:'study',name:'Study tips',short:'Study tips',col:'s3',clip:45,watch:0.45,like:0.08,share:0.14,comment:0.02,ni:0.05,want:0.35},
 {id:'cooking',name:'Cooking',short:'Cooking',col:'s4',clip:40,watch:0.50,like:0.10,share:0.06,comment:0.03,ni:0.06,want:0.15},
 {id:'sports',name:'Sports highlights',short:'Sports',col:'s6',clip:25,watch:0.80,like:0.12,share:0.10,comment:0.05,ni:0.04,want:0.10},
 {id:'outrage',name:'Outrage clips',short:'Outrage',col:'s1',clip:40,watch:0.90,like:0.05,share:0.10,comment:0.14,ni:0.12,want:0}];
const NT=T.length,NP=50,NC=10,N0=2,RUNS=10,OUT=4;
const avgSec=t=>t.clip*t.watch;
const PRI={min:T.reduce((s,t)=>s+avgSec(t)/60,0)/NT,like:T.reduce((s,t)=>s+t.like,0)/NT,share:T.reduce((s,t)=>s+t.share,0)/NT,comment:T.reduce((s,t)=>s+t.comment,0)/NT,ni:T.reduce((s,t)=>s+t.ni,0)/NT};
const W=['wW','wL','wS','wC','wN'];
const PRESET={watch:[10,0,0,0,0],like:[0,10,0,0,0],share:[0,0,10,0,0],comment:[0,0,0,10,0]};
const PNAME={watch:'Rank only by watch time',like:'Rank only by likes',share:'Rank only by shares',comment:'Rank only by comments'};
const wOf=sim=>W.map(k=>+sim.p[k]);
const eps=sim=>sim.p.explore/100;
const f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1);
/* One test run: 50 posts. Each post, the feed looks at 10 candidates (2 per topic, each with its own quality q from 0.6 to 1.4).
   With chance "explore" it serves a random candidate; otherwise it serves the one with the highest score from what it has learned so far. */
function run1(w,ex,seed){const r=rng(seed|0);const est=T.map(()=>({n:N0,min:PRI.min*N0,like:PRI.like*N0,share:PRI.share*N0,comment:PRI.comment*N0,ni:PRI.ni*N0}));
 const posts=[],cnt=[0,0,0,0,0];let sec=0;
 for(let i=0;i<NP;i++){const c=[];for(let j=0;j<NC;j++)c.push({t:j%NT,q:0.6+0.8*r()});
  const isEx=r()<ex;let pick=c[0];
  if(isEx)pick=c[Math.floor(r()*NC)];
  else{let best=-1e9;c.forEach(o=>{const e=est[o.t],q=o.q,s=w[0]*q*e.min/e.n+w[1]*q*e.like/e.n+w[2]*q*e.share/e.n+w[3]*q*e.comment/e.n-w[4]*e.ni/e.n;if(s>best+1e-12){best=s;pick=o;}});}
  const tt=T[pick.t],q=pick.q,u=()=>0.7+0.6*r();
  const ws=tt.clip*Math.min(1,tt.watch*q*u()),lk=Math.min(1,tt.like*q*u()),sh=Math.min(1,tt.share*q*u()),cm=Math.min(1,tt.comment*q*u()),ni=Math.min(1,tt.ni*u());
  const e=est[pick.t];e.n++;e.min+=ws/60/q;e.like+=lk/q;e.share+=sh/q;e.comment+=cm/q;e.ni+=ni;
  sec+=ws;cnt[pick.t]++;posts.push({t:pick.t,ex:isEx,ws});}
 const top=Math.max(...cnt);
 return {min:sec/60,top:100*top/NP,topT:cnt.indexOf(top),endorse:100*T.reduce((s,t,i)=>s+Math.min(cnt[i]/NP,t.want),0),cnt,posts,
  seen:cnt.filter(x=>x>0).length,est:est.map(e=>({min:e.min/e.n,like:e.like/e.n,share:e.share/e.n,comment:e.comment/e.n,ni:e.ni/e.n}))};}
const CACHE=new Map();
function evalW(w,ex,seed){const key=w.join(',')+'|'+ex+'|'+seed;let o=CACHE.get(key);if(o)return o;
 const a={min:0,top:0,endorse:0,out:0,seen:0,cnt:[0,0,0,0,0],first:null};
 for(let k=0;k<RUNS;k++){const x=run1(w,ex,seed*101+k);if(!k)a.first=x;a.min+=x.min/RUNS;a.top+=x.top/RUNS;a.endorse+=x.endorse/RUNS;a.out+=x.cnt[OUT]/RUNS;a.seen+=x.seen/RUNS;x.cnt.forEach((c,i)=>a.cnt[i]+=c/RUNS);}
 const top=Math.max(...a.cnt);a.topT=a.cnt.indexOf(top);a.topShare=100*top/NP;
 if(CACHE.size>3000)CACHE.clear();CACHE.set(key,a);return a;}
const cur=sim=>evalW(wOf(sim),eps(sim),sim.st.seed);
/* The optimizer: try 324 weight settings (plus the four one-signal feeds and yours) on the same 10 test runs, keep the best. */
const GRID=[];[0,2,5,10].forEach(a=>[0,5,10].forEach(b=>[0,5,10].forEach(c=>[0,5,10].forEach(d=>[0,5,10].forEach(e=>GRID.push([a,b,c,d,e]))))));
function optimize(sim,goal){const ex=eps(sim),seed=sim.st.seed,cand=GRID.concat(Object.values(PRESET),[wOf(sim)]);let best=null,bv=-1e9;
 cand.forEach(w=>{const o=evalW(w,ex,seed),v=goal==='time'?o.min:o.endorse;if(v>bv+1e-9){bv=v;best=w;}});return best;}
function setW(sim,w,ui){const v={};W.forEach((k,i)=>v[k]=w[i]);if(ui)BioLab.setValues(sim,v);else Object.assign(sim.p,v);syncPick(sim,ui);}
function presetOf(w){for(const k in PRESET)if(PRESET[k].every((x,i)=>x===w[i]))return k;return null;}
function syncPick(sim,ui){const k=presetOf(wOf(sim));sim.p.pick=k||'mix';if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.pick)sim.ui.ctl.pick.set(sim.p.pick);}
function wText(w){const n=['watch time','likes','shares','comments'],parts=[];w.slice(0,4).forEach((x,i)=>{if(x)parts.push(n[i]+' '+f1(x).replace(/\.0$/,''));});if(w[4])parts.push('Not interested −'+f1(w[4]).replace(/\.0$/,''));return parts.length?parts.join(', '):'all weights 0';}
function describe(w){const k=presetOf(w);return k?PNAME[k].replace('Rank only','ranking only'):'weights: '+wText(w);}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const matchPosts=v=>v/100*NP;

const SIM={
 id:'feedbuilder',hash:'feedbuilder',apUnit:2,order:1,tab:'Feed Builder',kind:'Simulation',
 card:'Set the ranking weights for a short-video feed, run a test viewer through 50 posts, and see what maxing out watch time does to the feed.',
 title:'Build a feed: what should it rank by?',
 lede:{bio:'A short-video feed gives every post a score and shows the highest one next. You choose what counts in the score. The feed then learns from what your test viewer lingers on. Does a feed that keeps them longest give them what they actually want?',
  honors:'The feed mixes exploit (serve the topic it already thinks wins) and explore (try something new). Watch what happens to the mix of topics when one signal dominates the score, and when the feed stops exploring.',
  ap:'Score = V(watch) × E(minutes watched) + V(like) × P(like) + V(share) × P(share) + V(comment) × P(comment) − V(NI) × P(Not interested). The P and E values are the feed’s running estimates for each topic, updated after every post.'},
 scale:'One test viewer scrolls 50 posts, about 10 to 30 minutes. The grid shows one test run; the readouts average 10 runs with fresh posts. The viewer and their habits are made up.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your feed’s ranking',
 controls:[
  {id:'pick',label:'Rank posts by one signal',type:'seg',def:'watch',options:[{v:'watch',l:'Watch time'},{v:'like',l:'Likes'},{v:'share',l:'Shares'},{v:'comment',l:'Comments'}],onChange(sim){if(PRESET[sim.p.pick])setW(sim,PRESET[sim.p.pick],true);},help:'A shortcut: sets that weight to 10 and the rest to 0.'},
  {id:'wW',label:'Weight on predicted watch time',type:'range',min:0,max:10,step:0.5,def:10,onChange:sim=>syncPick(sim,true)},
  {id:'wL',label:'Weight on likes',type:'range',min:0,max:10,step:0.5,def:0,onChange:sim=>syncPick(sim,true)},
  {id:'wS',label:'Weight on shares',type:'range',min:0,max:10,step:0.5,def:0,onChange:sim=>syncPick(sim,true)},
  {id:'wC',label:'Weight on comments',type:'range',min:0,max:10,step:0.5,def:0,onChange:sim=>syncPick(sim,true)},
  {id:'wN',label:'Penalty for “Not interested”',type:'range',min:0,max:10,step:0.5,def:0,onChange:sim=>syncPick(sim,true),help:'Subtracted from the score, times the chance the viewer taps Not interested.'},
  {id:'explore',label:'Explore: share of posts picked at random',type:'range',min:0,max:80,step:5,def:20,unit:'%',noGut:true,onChange:clearGut,help:'The rest exploit: the feed serves its top-scoring post. 20% is an assumption for illustration.'},
  {id:'peek',label:'Show the viewer’s hidden habits',type:'toggle',def:false,lvl:'honors',help:'The real feed never sees these. It only sees what the viewer does.'}
 ],
 actions:[
  {id:'optgood',label:'Optimize for the viewer',primary:true,run(sim){setW(sim,optimize(sim,'good'),true);}},
  {id:'opttime',label:'Optimize for minutes on the app',run(sim){setW(sim,optimize(sim,'time'),true);}},
  {id:'newrun',label:'New test runs',lvl:'honors',run(sim){sim.st.seed=1+Math.floor(Math.random()*9e5);clearGut(sim);}}
 ],
 init(){return {seed:1};},step(){},
 metrics:[
  {id:'minutes',label:'Minutes on the app',unit:'min',d:1,min:0,max:30,get:sim=>cur(sim).min},
  {id:'top',label:'Feed from the top topic',unit:'%',d:0,min:0,max:100,get:sim=>cur(sim).topShare},
  {id:'endorse',label:'Viewer would endorse',unit:'/100',d:0,min:0,max:100,get:sim=>cur(sim).endorse},
  {id:'outrage',label:'Outrage clips',unit:'of 50',d:1,min:0,max:50,get:sim=>cur(sim).out},
  {id:'seen',label:'Topics the feed tried (of 5)',unit:'',d:1,lvl:'honors',min:0,max:5,get:sim=>cur(sim).seen},
  {id:'toptopic',label:'Top topic',text:true,lvl:'honors',get:sim=>{const o=cur(sim);return T[o.topT].name+', '+f0(o.topShare)+'% of the feed';}},
  {id:'scores',label:'Score of a typical post, using the viewer’s true habits',text:true,lvl:'ap',get:sim=>{const w=wOf(sim);return T.map(t=>t.short+' '+fmtNum(w[0]*avgSec(t)/60+w[1]*t.like+w[2]*t.share+w[3]*t.comment-w[4]*t.ni,2)).join(' · ');}}
 ],
 graphs:[{id:'trade',label:'Minutes vs. what the viewer endorses',custom:true}],defaultGraph:'trade',
 plot(sim,ctx,box){const ex=eps(sim),seed=sim.st.seed,G=GS(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:30,ymin:0,ymax:100,xl:'Minutes on the app (50 posts)',yl:'Viewer would endorse (/100)'});
  const dot=(o,col,lab,r,dy)=>{const x=ax.X(clamp(o.min,0,30)),y=ax.Y(o.endorse);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
   if(lab){const right=x>box.L+box.W-120;txt(ctx,lab,x+(right?-10:10),y+(dy||4),{s:12,w:700,c:col,a:right?'right':'left'});}};
  const same=w=>[G&&G.g&&G.g.w,G&&G.m&&G.m.w].some(x=>x&&x.every((v,i)=>v===w[i]));
  Object.keys(PRESET).forEach((k,i)=>{const o=evalW(PRESET[k],ex,seed);dot(o,PAL['muted'],same(PRESET[k])?'':PNAME[k].replace('Rank only by ','Only '),5,[-8,14,-8,14][i]);});
  if(G&&G.g)dot(evalW(G.g.w,ex,seed),PAL['s4'],'Your gut',7,-12);
  if(G&&G.m)dot(evalW(G.m.w,ex,seed),PAL['s3'],'The math',7,18);
  dot(cur(sim),PAL['rj'],'',6);
  txt(ctx,'Higher = closer to what the viewer asked for.',box.L+8,box.T+12,{s:12,c:PAL['muted']});},
 draw(sim,ctx,vdt,k){const o=cur(sim),R=o.first,G=GS(sim),hon=atLeast('honors'),big=k>1.3,w=wOf(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* left: the 50 posts of one run */
  txt(ctx,big?'One test run: 50 posts':'One test run: the 50 posts your feed served, in order',20,24,{s:14*k,w:700});
  const X0=20,Y0=40,CW=42,CH=40;
  R.posts.forEach((p,i)=>{const x=X0+(i%10)*CW,y=Y0+Math.floor(i/10)*CH,t=T[p.t];
   rr(ctx,x,y,CW-5,CH-5,5);ctx.fillStyle=PAL[t.col];ctx.fill();
   const f=clamp(p.ws/45,0,1);ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(x+4,y+CH-12,(CW-13)*f,4);
   if(p.ex){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+CW-12,y+8,4,0,7);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1;ctx.stroke();}});
  /* legend */
  const ly=Y0+5*CH+18*k;ctx.font=(12*k)+'px '+FONT;let lx=20,row=0;
  const chip=(col,lab,shape)=>{const wd=ctx.measureText(lab).width+30*k;if(lx+wd>450){lx=20;row++;}const yy=ly+row*20*k;
   if(shape==='dot'){ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(lx+6,yy-4*k,4,0,7);ctx.fill();}else if(shape==='bar'){ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(lx,yy-6*k,14,4);}else{ctx.fillStyle=col;rr(ctx,lx,yy-10*k,13,13,3);ctx.fill();}
   txt(ctx,lab,lx+19,yy,{s:12*k,c:PAL['cv-ink']});ctx.font=(12*k)+'px '+FONT;lx+=wd;};
  T.forEach(t=>chip(PAL[t.col],t.short));
  if(!big){chip(null,'explore pick','dot');chip(null,'time watched','bar');}
  /* right: served vs asked for */
  const RX=476,RW=314;
  txt(ctx,'Served vs. asked for',RX,24,{s:14*k,w:700});
  const rh=big?48:42*Math.min(k,1.15);
  T.forEach((t,i)=>{const y=34+12*k+i*rh,sh=100*o.cnt[i]/NP,wa=100*t.want;
   txt(ctx,t.short,RX,y,{s:12*k,w:700,c:PAL[t.col]});
   txt(ctx,f0(sh)+'%'+(big?'':' (asked '+f0(wa)+'%)'),RX+RW,y,{s:12*k,w:700,a:'right'});
   const by=y+6,bh=10*Math.min(k,1.3);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(RX,by,RW,bh);
   ctx.fillStyle=PAL[t.col];ctx.fillRect(RX,by,RW*sh/100,bh);
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(RX+RW*wa/100,by-3);ctx.lineTo(RX+RW*wa/100,by+bh+3);ctx.stroke();});
  if(!big){const fy0=34+12*k+5*rh;txt(ctx,'Bar: share of the feed (average of 10 runs).',RX,fy0,{s:12,c:PAL['cv-soft']});txt(ctx,'Black line: what the viewer asked for.',RX,fy0+16,{s:12,c:PAL['cv-soft']});}
  /* bottom: the score formula and the result */
  const fy=big?345:328;
  const fs=big?'Score = '+w.slice(0,4).map((x,i)=>f1(x).replace(/\.0$/,'')+['×watch','×like','×share','×comment'][i]).join(' + ')+' − '+f1(w[4]).replace(/\.0$/,'')+'×NI'
   :'Score = '+f1(w[0]).replace(/\.0$/,'')+' × watch minutes + '+f1(w[1]).replace(/\.0$/,'')+' × P(like) + '+f1(w[2]).replace(/\.0$/,'')+' × P(share) + '+f1(w[3]).replace(/\.0$/,'')+' × P(comment) − '+f1(w[4]).replace(/\.0$/,'')+' × P(Not interested)';
  txt(ctx,fs,20,fy,{s:13*k,w:700,c:PAL['cv-ink']});
  const ps=13*Math.min(k,1.3);let py=big?382:366,px=20;ctx.font='700 '+ps+'px '+FONT;
  const pr=(s,bg)=>{ctx.font='700 '+ps+'px '+FONT;const wd=ctx.measureText(s).width+ps*1.1;pill(ctx,s,px+wd/2,py,bg,'#fff',ps);px+=wd+10;};
  pr(f1(o.min)+' min on the app','#2d5fa8');pr(f0(o.endorse)+'/100 endorsed','#2f6b3a');if(!big)pr(f1(o.out)+' outrage clips of 50','#a11a2e');
  py+=big?38:34;px=20;
  if(G&&G.g)pr('Your gut: '+f0(G.g.v)+'/100 endorsed','#9a5c00');if(G&&G.m)pr('The math: '+f0(G.m.v)+'/100','#2f6b3a');},
 narrate(sim){const o=cur(sim),t=T[o.topT],w=wOf(sim),ex=sim.p.explore;
  if(w.every(x=>x===0))return '<b>Every weight is 0,</b> so every post scores the same and the feed just serves the first candidate. Turn up at least one weight.';
  if(o.topT===OUT&&o.topShare>=40)return `<b>The feed is narrowing toward outrage clips:</b> ${f0(o.topShare)}% of posts. They hold this viewer about ${f0(avgSec(T[OUT]))} s each and draw the most comments, so a score built on ${w[0]>=w[1]?'watch time':'engagement'} keeps choosing them. Time on the app: ${f1(o.min)} min. Endorsed: ${f0(o.endorse)}/100.`;
  if(o.topShare>=60)return `<b>The feed has narrowed to one topic:</b> ${f0(o.topShare)}% ${t.name.toLowerCase()}. ${ex<=10?'With almost no exploring, the first topic that scores well wins every exploit pick.':'Each exploit pick goes to the same top scorer.'} Endorsed: ${f0(o.endorse)}/100 in ${f1(o.min)} min.`;
  return `The top topic is ${t.name.toLowerCase()} at ${f0(o.topShare)}%. ${o.endorse>=70?'<b>This mix is close to what the viewer asked for:</b> ':'<b>The mix is spread out,</b> '}${f0(o.endorse)}/100 endorsed, ${f1(o.min)} min on the app, ${f1(o.out)} outrage clips.`;},
 infoPanel(sim){const w=wOf(sim),o=cur(sim);
  let h='<p><b>What the viewer told you:</b> “Mostly my friends’ posts and study tips.” As shares of the feed: friends 40%, study tips 35%, cooking 15%, sports 10%, outrage 0%.</p>';
  if(!atLeast('honors'))return h+'<p>The feed cannot read that wish. It only sees what the viewer does: how long they watch, and whether they like, share, comment or tap Not interested.</p>';
  if(!sim.p.peek)return h+'<p>Turn on <b>Show the viewer’s hidden habits</b> to see what the viewer actually does with each topic.</p>';
  h+='<div style="overflow-x:auto"><table class="mini" style="font-size:13px;width:100%"><thead><tr><th>Topic</th><th>Watches</th><th>Like</th><th>Share</th><th>Comm.</th><th>NI</th>'+(atLeast('ap')?'<th>Score</th>':'')+'</tr></thead><tbody>';
  T.forEach(t=>{h+=`<tr><td>${t.short}</td><td>${fmtNum(avgSec(t),1)} s</td><td>${f0(100*t.like)}%</td><td>${f0(100*t.share)}%</td><td>${f0(100*t.comment)}%</td><td>${f0(100*t.ni)}%</td>${atLeast('ap')?`<td>${fmtNum(w[0]*avgSec(t)/60+w[1]*t.like+w[2]*t.share+w[3]*t.comment-w[4]*t.ni,2)}</td>`:''}</tr>`;});
  return h+'</tbody></table></div><p><b>Watches:</b> average seconds watched. <b>NI:</b> chance of a Not interested tap. Outrage clips hold this viewer longest and draw the most comments, but they also get the most Not interested taps, and the viewer says they want none.</p>';},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'This viewer says they want mostly friends’ posts and study tips. Which <b>one signal</b> would you rank posts by to give them that? Pick one here, then lock it in.',
   honors:'Which one signal gives this viewer the feed they asked for? Pick one here (in the full lab you can set all the sliders by feel instead), then lock it in.'},
  lockLabel:'Lock in my ranking',mathLabel:'Let the optimizer try',
  lock(sim){const w=wOf(sim),o=evalW(w,eps(sim),sim.st.seed);return {v:o.endorse,w,min:o.min,out:o.out,label:`${describe(w)}: ${f0(o.endorse)}/100 endorsed, ${f1(o.min)} min`};},
  solve(sim){const w=optimize(sim,'good');setW(sim,w,false);const o=evalW(w,eps(sim),sim.st.seed);return {v:o.endorse,w,min:o.min,out:o.out,label:`${describe(w)}: ${f0(o.endorse)}/100 endorsed, ${f1(o.min)} min`};},
  how:{bio:'The optimizer tried 324 combinations of the five weights (each 0, 5 or 10, and watch time 0, 2, 5 or 10) on the same 10 test runs, and kept the one whose feed best matched what the viewer asked for.',
   ap:'Grid search: 4 × 3 × 3 × 3 × 3 = 324 weight vectors, plus the one-signal feeds and yours, each scored by the mean endorse score over 10 seeded runs. It is a brute-force search, not calculus, because the feed’s choices are all-or-nothing.'},
  compare(sim,g,m){const d=m.v-g.v,dp=matchPosts(m.v)-matchPosts(g.v),dm=m.min-g.min,dout=g.out-m.out;
   if(d<1)return `Your gut was right on: your ranking already scores ${f0(g.v)}/100, as good as anything the optimizer found. About ${f0(matchPosts(g.v))} of the 50 posts match what the viewer asked for.`;
   return `The optimizer’s weights match what the viewer asked for on about <b>${f0(dp)} more of the 50 posts</b> (${f0(g.v)} → ${f0(m.v)} out of 100). ${dout>=0.5?`That is ${f1(dout)} fewer outrage clips per run. `:''}${dm<-0.5?`The cost: the viewer stays ${f1(-dm)} fewer minutes (${f1(g.min)} → ${f1(m.min)}). A feed built for its viewer is not the one that holds them longest.`:dm>0.5?`It also holds them ${f1(dm)} min longer.`:'Time on the app barely changes.'}`;},
  again(sim){sim.st.seed=1+Math.floor(Math.random()*9e5);setW(sim,PRESET.watch,false);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You rank posts only by predicted watch time. What fills the feed?',choices:['Friends’ posts, because the viewer likes them most','Outrage clips, because they hold the viewer longest','An even mix of all five topics'],correct:1,explain:'Outrage clips hold this viewer about 36 s each, against about 10.5 s for a friend’s post. A score built only on watch time keeps choosing them: about 36 of 50 posts on the default runs, even though the viewer asked for none.'},
  {lvl:'bio',instant:true,q:'Which feed keeps the viewer on the app longer: ranking only by watch time, or ranking only by likes?',choices:['Watch time, by about 15 minutes','Likes, because liked posts are watched longer','About the same'],correct:0,explain:'On the default runs, watch time gives about 27.1 minutes and likes about 11.6. Ranking by likes fills the feed with short friends’ posts, which is closer to what the viewer wants (52 versus 28 out of 100 endorsed) but much less time on the app.'},
  {lvl:'honors',instant:true,q:'Rank only by likes, then turn Explore down from 20% to 0%. What happens to the feed?',choices:['It narrows further: friends’ posts take over almost every pick','It spreads out across all topics','Nothing changes'],correct:0,explain:'Friends’ posts go from 82% to 94% of the feed, the feed tries only about 3.2 of the 5 topics, and the endorsed score drops from 52 to 45. With no exploring, the feed only learns about topics it happens to serve, so once one topic beats its starting guess, it wins every pick. Vombatkere and colleagues found TikTok explored on roughly half or more of a new user’s first 1,000 videos.'},
  {lvl:'honors',instant:true,q:'Ranking only by shares mostly serves study tips. Why does that still miss what the viewer asked for?',choices:['It serves almost no friends’ posts, and the viewer wants 40% friends','Study tips are not endorsed','Shares cannot be predicted'],correct:0,explain:'Friends’ posts are rarely shared (2%), so a share-only score buries them. The viewer asked for friends 40% and study tips 35%. One signal pushes the feed toward one topic; matching a mix takes several weights.'},
  {lvl:'ap',instant:true,q:'With weights watch 10 and everything else 0, what is the score of a typical outrage clip (it holds the viewer 36 s)?',choices:['0.6','6','36','360'],correct:1,explain:'Watch time enters as minutes: 36 s = 0.6 min, and 10 × 0.6 = 6. A friend’s post (10.5 s = 0.175 min) scores 1.75, so outrage wins every head-to-head unless another weight pulls it down.'},
  {lvl:'ap',instant:true,q:'X’s 2023 open-source ranker (secondary source) weighted a reply 13.5 and a like 0.5. How many likes is one predicted reply worth?',choices:['6.75','13','27','13.5'],correct:2,explain:'13.5 ÷ 0.5 = 27. A post that draws arguments in the replies can outscore one that people quietly like, which is one way engagement ranking rewards conflict. Production weights may differ from that release.'}
 ],
 tour:[
  {title:'Your test viewer',text:'The bars on the right show the feed your viewer got. The black lines show what they asked for: friends 40%, study tips 35%, cooking 15%, sports 10%, no outrage clips.',focus:[470,0,330,300],pause:true,setup:sim=>{BioLab.setValues(sim,{explore:20});setW(sim,PRESET.watch,true);}},
  {title:'Rank by watch time',text:'Right now the score counts only predicted watch time. The grid is one run of 50 posts: red tiles are outrage clips, and they take over about 36 of the 50 posts.',focus:[10,0,450,300],pause:true},
  {title:'Why outrage wins',text:'This viewer lingers about 36 s on an outrage clip and about 10.5 s on a friend’s post. The feed learns from lingering, so the clips that hold attention keep getting served: about 27.1 minutes on the app, but only 28 out of 100 on what the viewer would endorse.',focus:[0,300,800,150],pause:true},
  {title:'Rank by likes',text:'Now the score counts only likes. Friends’ posts get liked most, so the feed fills with them: 82% of posts, 52 out of 100 endorsed, but only about 11.6 minutes. Closer to the wish, but almost no study tips.',pause:true,setup:sim=>{BioLab.setValues(sim,{explore:20});setW(sim,PRESET.like,true);}},
  {lvl:'honors',title:'Explore vs. exploit',text:'Now Explore is 0%. The feed only learns about topics it happens to serve, so once friends’ posts beat its starting guess, they win every pick: 94% of the feed, and only about 3.2 of the 5 topics ever tried.',pause:true,setup:sim=>BioLab.setValues(sim,{explore:0})},
  {title:'A feed built for its viewer',text:'The optimizer’s mix: watch 2, likes 5, shares 10, Not interested penalty 5. It scores 78 out of 100 endorsed, with about 17.3 minutes on the app and about 5.3 outrage clips (down from about 36). That is the trade-off: what serves the viewer is not what holds them longest.',pause:true,setup:sim=>{BioLab.setValues(sim,{explore:20});setW(sim,[2,5,10,0,5],true);},focus:[0,0,800,450]},
  {lvl:'ap',title:'The score is a weighted sum',text:'Each candidate gets Σ weight × predicted signal, using the feed’s running estimate for its topic times the post’s own quality. That is the same shape as the simplified formula in TikTok’s leaked “Algo 101” document.',pause:true,focus:[0,300,800,40]}
 ],
 lab:{bio:'<p><b>Question:</b> Which one signal gives the viewer the feed they asked for, and what does it cost in minutes?</p><ol><li>Pick each of the four signals in turn. Record a trial for each.</li><li>Press <b>Optimize for minutes on the app</b>, then <b>Optimize for the viewer</b>. Record both.</li><li>Graph <b>Trials</b> with minutes on x and endorsed on y.</li></ol><p>Write one sentence: what do you give up to build a feed the viewer would endorse?</p>',
  honors:'<p><b>Question:</b> How does exploring change the filter bubble?</p><ol><li>Use watch-time ranking. Set Explore to 0%, 20%, 40%, 60% and 80%. Record the top-topic share and endorsed score each time.</li><li>Repeat with the optimizer’s weights.</li></ol><p>Explain why exploring helps one feed more than the other.</p>',
  ap:'<p><b>Question:</b> Can a penalty fix an engagement feed?</p><ol><li>Start from watch 10. Raise only the Not interested penalty from 0 to 10 in steps of 2.5. Record outrage clips and minutes.</li><li>Then add likes and shares.</li></ol><p><b>CER:</b> Use the hidden-habits table to explain why the penalty alone does or does not work. Compare with Mozilla’s finding about YouTube’s “Not interested” button.</p>'},
 terms:[
  {t:'Ranking score',d:'The number a feed gives each candidate post. It shows the highest one next.'},
  {t:'Weight',d:'How much one signal counts in the score. Doubling a weight doubles that signal’s pull.'},
  {t:'Signal',d:'Something the feed can measure or predict: watch time, likes, shares, comments, Not interested taps.'},
  {t:'Filter bubble',d:'A feed that narrows to a few topics because it keeps serving what already scored well.'},
  {t:'Explore vs. exploit',d:'Exploit: serve the post the feed already predicts will win. Explore: try something new to learn about it.',lvl:'honors'},
  {t:'Proxy',d:'A measurable stand-in for what you really want. Watch time is a proxy for “the viewer values this,” and it can be a bad one.',lvl:'honors'},
  {t:'Grid search',d:'Trying every combination on a grid of settings and keeping the best one.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Five topics, each with made-up habits for one test viewer (the hidden-habits table at Closer look). For each of 50 posts the feed sees 10 candidates, 2 per topic, each with its own quality from 0.6 to 1.4. With probability “Explore” it serves a random candidate. Otherwise it serves the highest score: Σ weight × the feed’s current estimate for that topic × the post’s quality, minus the Not interested penalty × the estimated chance of that tap. After each post the feed updates its estimate for that topic from what the viewer did (with some noise). Every topic starts at the average of all five. Readouts average 10 runs. “Viewer would endorse” is the overlap between the feed’s mix and the mix the viewer asked for: Σ min(feed share, asked share) × 100. Real feeds use thousands of signals, pool data across millions of users, and add rules for variety; this is a simplified model.</p>'+
  '<p><b>Real feeds.</b> TikTok’s internal “Algo 101” document, reported by the New York Times in December 2021 (TikTok confirmed it was authentic), gave a simplified score of roughly P(like) × V(like) + P(comment) × V(comment) + E(playtime) × V(playtime) + P(play) × V(play), and named retention and time spent as goals. Secondary coverage: <a href="https://gizmodo.com/leaked-tiktok-doc-reveals-its-obvious-secret-to-an-addi-1848166901" target="_blank" rel="noopener">Gizmodo</a>. Vombatkere and colleagues (2024) studied donated TikTok data from 347 users (9.2 million views): in a user’s first 1,000 videos, about 30% to 50% of recommendations exploited known interests and the rest explored (<a href="https://arxiv.org/html/2403.12410v1" target="_blank" rel="noopener">arXiv</a>). A companion CHI 2024 study found average daily time rose from about 29 minutes on day 1 to about 50 minutes by day 120.</p>'+
  '<p>X’s 2023 open-source “heavy ranker” weights, as shown in a secondary source (production may differ): like 0.5, repost 1.0, reply 13.5, reply engaged by the author 75, good click 11, profile click 12, negative feedback −74, report −369 (<a href="https://ernests.github.io/the-algorithm/interactive/engagement-calculator.html" target="_blank" rel="noopener">engagement calculator</a>). YouTube’s 2016 recommendation paper (Covington and colleagues) ranked by expected watch time because ranking by click-through promoted deceptive videos. Mozilla’s 2022 study found that on YouTube, “Not interested” prevented only about 11% of unwanted recommendations, and “Don’t recommend channel” about 43%. In December 2025 Instagram added a “Your Algorithm” view showing the topics it thinks you like in Reels.</p>'
};
BioLab.register(SIM);
})();

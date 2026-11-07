(function(){
'use strict';
const {clamp,rng,rr,txt,pill,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* A simulated user pulls to refresh. You set the reward rule; the user, not you, does the pulling.
   Reward-prediction error model: for each "pulls since the last post" state s, the user's brain keeps a prediction V[s].
   At a pull, the cue response is V[s]. When the result shows, the error is δ = r − V[s], and V[s] ← V[s] + α·δ. */
const CAP=80,LIM=200;
const f0=v=>fmtNum(v,0),f2=v=>fmtNum(v,2).replace(/^-/,'−');
function run(p,seed){const r=rng(seed|0),n=p.ratio,a=p.alpha,V=new Array(CAP).fill(0),pulls=[];let dry=0,maxDry=0,posts=0;
 const one=(phase,rew)=>{const s=Math.min(dry,CAP-1),cue=V[s],d=rew-V[s];V[s]+=a*d;pulls.push({s,cue,rew,d,phase});if(rew){dry=0;posts++;}else{dry++;}};
 for(let i=0;i<p.train;i++){let rew;if(p.sched==='fixed')rew=(dry+1>=n)?1:0;else rew=r()<1/n?1:0;one('t',rew);if(!rew)maxDry=Math.max(maxDry,dry);}
 const left=dry,thr=Math.floor(p.patience*Math.max(1,maxDry))+1;let after=0;
 while(after<LIM){one('x',0);after++;if(dry>=thr)break;}
 const T=pulls.filter(x=>x.phase==='t'),late=T.slice(-30),lateR=late.filter(x=>x.rew),X=pulls.filter(x=>x.phase==='x');
 return {pulls,posts,maxDry,left,thr,after,capped:after>=LIM&&dry<thr,
  burst:lateR.length?lateR.reduce((s,x)=>s+x.d,0)/lateR.length:0,
  cue:Math.max(0,...late.map(x=>x.cue)),
  dip:Math.min(0,...X.map(x=>x.d)),V};}
const CACHE=new Map();
function R(sim,over){const p=Object.assign({},sim.p,over||{}),key=[p.sched,p.ratio,p.train,p.patience,p.alpha,sim.st.seed].join('|');let o=CACHE.get(key);if(!o){o=run(p,sim.st.seed);if(CACHE.size>400)CACHE.clear();CACHE.set(key,o);}return o;}
const other=sim=>sim.p.sched==='fixed'?'variable':'fixed';
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!((sim.tour&&sim.tour.on)||(sim.st&&sim.st.shown)||(sim.gutS&&sim.gutS.g));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const scen=sim=>{clearGut(sim);sim.st.shown=false;};
const rule=sim=>sim.p.sched==='fixed'?`Fixed: every ${sim.p.ratio}th pull shows a new post`:`Variable: each pull has a 1 in ${sim.p.ratio} chance`;

const SIM={
 id:'scroll',hash:'scroll',apUnit:2,order:2,tab:'Why can’t I stop scrolling?',kind:'Simulation',
 card:'Set the reward rule for a simulated user’s pull-to-refresh, then watch its dopamine prediction signal and how long it keeps pulling after the posts stop.',
 title:'Why can’t I stop scrolling?',
 lede:{bio:'You don’t pull anything here. You set the rule for when a simulated user’s pull to refresh shows something new, then watch two things: a model of its dopamine signal, and how long it keeps pulling once nothing new is coming.',
  honors:'Dopamine neurons signal reward-prediction error: a burst for a reward better than expected, nothing for a reward that was predicted, a dip when an expected reward does not come. Fixed and variable schedules teach the brain very different predictions.',
  ap:'Temporal-difference style model: for each state s (pulls since the last post), prediction V(s). Cue response = V(s); error δ = r − V(s); update V(s) ← V(s) + αδ. The user quits when its dry streak passes patience × the longest dry streak it saw while posts were coming.'},
 scale:'One simulated user, one session of pull-to-refresh: 100 pulls while new posts come, then the posts stop. The user and its rules are a model, not a real person or app.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The reward rule you set',
 controls:[
  {id:'sched',label:'Schedule',type:'seg',def:'variable',noGut:true,onChange:scen,options:[{v:'fixed',l:'Fixed ratio'},{v:'variable',l:'Variable ratio'}],help:'Fixed: a new post every nth pull, like clockwork. Variable: each pull might pay, at random, with the same average.'},
  {id:'ratio',label:'One new post per … pulls (on average)',type:'range',min:2,max:10,step:1,def:5,noGut:true,onChange:scen},
  {id:'guess',label:'Your guess: pulls after the posts stop',type:'range',min:0,max:200,step:1,def:15,unit:' pulls'},
  {id:'train',label:'Pulls while posts keep coming',type:'range',min:40,max:200,step:10,def:100,lvl:'honors',noGut:true,onChange:scen},
  {id:'patience',label:'Patience',type:'range',min:1,max:3,step:0.25,def:1.5,unit:'×',lvl:'honors',noGut:true,onChange:scen,help:'The user gives up when a dry streak gets this many times longer than the longest one it saw while posts were coming. An assumption for illustration.'},
  {id:'alpha',label:'Learning rate α',type:'range',min:0.05,max:0.5,step:0.05,def:0.15,lvl:'ap',noGut:true,onChange:scen,help:'How far each surprise moves the prediction.'}
 ],
 actions:[
  {id:'show',label:'Skip my guess and show the result',run(sim){sim.st.shown=true;}},
  {id:'newsess',label:'Run a new session',primary:true,run(sim){sim.st.seed=1+Math.floor(Math.random()*9e5);sim.st.shown=false;clearGut(sim);}}
 ],
 init(){return {seed:7,shown:false};},step(){},
 metrics:[
  {id:'after',label:'Pulls after the posts stop',unit:'pulls',d:0,min:0,max:100,get:sim=>shown(sim)?R(sim).after:null},
  {id:'posts',label:'New posts while they kept coming',unit:'',d:0,min:0,max:100,get:sim=>R(sim).posts},
  {id:'maxdry',label:'Longest dry streak while posts came',unit:'pulls',d:0,min:0,max:40,get:sim=>R(sim).maxDry},
  {id:'burst',label:'Dopamine burst at a new post (last 30 pulls)',unit:'',d:2,min:0,max:1,get:sim=>R(sim).burst},
  {id:'cue',label:'Biggest response to a pull itself (last 30 pulls)',unit:'',d:2,lvl:'honors',min:0,max:1,get:sim=>R(sim).cue},
  {id:'dip',label:'Deepest dip after the posts stop',unit:'',d:2,lvl:'honors',min:-1,max:0,get:sim=>shown(sim)?R(sim).dip:null},
  {id:'other',label:'Pulls after the posts stop, other schedule',unit:'pulls',d:0,lvl:'ap',min:0,max:100,get:sim=>shown(sim)?R(sim,{sched:other(sim)}).after:null}
 ],
 graphs:[{id:'persist',label:'Pulls after the posts stop, by schedule',custom:true}],defaultGraph:'persist',
 plot(sim,ctx,box){if(!shown(sim)){txt(ctx,'Lock in your guess (or skip it) to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const ns=[2,3,4,5,6,7,8,9,10],fx=ns.map(n=>R(sim,{sched:'fixed',ratio:n}).after),vx=ns.map(n=>R(sim,{sched:'variable',ratio:n}).after),top=Math.max(10,Math.ceil(Math.max(...fx,...vx)/10)*10);
  const ax=axes(ctx,box,{xmin:2,xmax:10,ymin:0,ymax:top,xl:'One new post per … pulls',yl:'Pulls after posts stop'});
  [[fx,PAL['s2'],'Fixed ratio'],[vx,PAL['s1'],'Variable ratio']].forEach(([ys,col,lab],j)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ys.forEach((y,i)=>{const X=ax.X(ns[i]),Y=ax.Y(y);i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.stroke();
   ys.forEach((y,i)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(ns[i]),ax.Y(y),4,0,7);ctx.fill();});
   txt(ctx,lab,box.L+12,box.T+14+j*18,{s:12,w:700,c:col});});
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ax.X(sim.p.ratio),box.T);ctx.lineTo(ax.X(sim.p.ratio),box.T+box.H);ctx.stroke();ctx.setLineDash([]);},
 draw(sim,ctx,vdt,k){const o=R(sim),sh=shown(sim),G=GS(sim),big=k>1.3,P=o.pulls,NT=sim.p.train;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* top strip: the whole session */
  txt(ctx,big?'The whole session':'The whole session: every pull by the simulated user',20,22,{s:14*k,w:700});
  if(!big)txt(ctx,rule(sim),780,22,{s:12*k,c:PAL['cv-soft'],a:'right'});
  const SX=20,SW=760,SY=56,nShow=sh?P.length:NT+Math.max(12,Math.round(NT*0.25)),dx=SW/nShow;
  {const x0=SX+NT*dx;ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(x0,SY-24,SX+SW-x0,48);ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText('Posts stop').width;if(x0+6+lw<796)txt(ctx,'Posts stop',x0+6,SY-10,{s:12*k,w:700,c:PAL['cv-soft']});else txt(ctx,'Posts stop',x0-6,SY-10,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});}
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;
  P.forEach((q,i)=>{if(q.phase==='x'&&!sh)return;const x=SX+(i+0.5)*dx;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(x,SY+4);ctx.lineTo(x,SY+16);ctx.stroke();ctx.globalAlpha=1;
   if(q.rew){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(x,SY-2,Math.max(2,Math.min(4,dx*0.45)),0,7);ctx.fill();}});
  if(!sh)txt(ctx,'?',SX+NT*dx+(SW-NT*dx)/2,SY+14,{s:20*k,w:700,c:PAL['cv-soft'],a:'center'});
  else{const xq=SX+P.length*dx;txt(ctx,(o.capped?'Still pulling at ':'Gives up after ')+o.after,Math.min(780,xq),SY+34*Math.min(k,1.2),{s:12*k,w:700,c:PAL['rj'],a:'right'});}
  {const ly0=SY+34*Math.min(k,1.2);txt(ctx,'● new post',SX,ly0,{s:12*k,w:700,c:PAL['s3']});if(!big){ctx.font=(12*k)+'px '+FONT;txt(ctx,'|  a pull with nothing new',SX+ctx.measureText('● new post').width+18,ly0,{s:12*k,c:PAL['cv-soft']});}}
  /* three windows on the dopamine model */
  const tr=P.filter(q=>q.phase==='t'),ex=P.filter(q=>q.phase==='x');
  const wins=[{t:'First 20 pulls',a:tr.slice(0,20)},{t:big?'Last 20 with posts':'Last 20 pulls with posts',a:tr.slice(-20)},{t:'After posts stop',a:sh?ex.slice(0,20):null}];
  const PY=118,PH=300,PW=246,top0=PY+30*k+16+22,bot0=PY+PH-10,BY=(top0+bot0)/2,SC=(bot0-top0)/2;
  wins.forEach((w,j)=>{const x0=20+j*(PW+11);rr(ctx,x0,PY,PW,PH,8);ctx.fillStyle=PAL['cv-bg2'];ctx.fill();
   txt(ctx,w.t,x0+10,PY+20*k,{s:12*k,w:700});
   if(!w.a){txt(ctx,'?',x0+PW/2,PY+PH/2,{s:28*k,w:700,c:PAL['cv-soft'],a:'center'});txt(ctx,'Lock in your guess first',x0+PW/2,PY+PH/2+26*k,{s:12*k,c:PAL['cv-soft'],a:'center'});return;}
   const sw=(PW-20)/20,ry=PY+30*k+16;
   w.a.forEach((q,i)=>{const x=x0+10+i*sw;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;
    if(q.rew){ctx.fillStyle=PAL['s3'];rr(ctx,x+1.5,ry,sw-3,sw-3,2);ctx.fill();}else{rr(ctx,x+1.5,ry,sw-3,sw-3,2);ctx.stroke();}
    const cH=q.cue*SC,dH=q.d*SC;
    if(cH>0.5){ctx.fillStyle=PAL['s5'];ctx.fillRect(x+1,BY-cH,sw/2-1.5,cH);}
    if(Math.abs(dH)>0.5){ctx.fillStyle=dH>0?PAL['s1']:PAL['s2'];ctx.fillRect(x+sw/2+0.5,dH>0?BY-dH:BY,sw/2-1.5,Math.abs(dH));}});
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0+8,BY);ctx.lineTo(x0+PW-8,BY);ctx.stroke();
});
  /* legend */
  const ly=PY+PH+22*Math.min(k,1.2);let lx=20;ctx.font=(12*k)+'px '+FONT;
  const chip=(col,lab)=>{ctx.fillStyle=col;ctx.fillRect(lx,ly-10*k,10,12*k);txt(ctx,lab,lx+15,ly,{s:12*k,c:PAL['cv-ink']});ctx.font=(12*k)+'px '+FONT;lx+=ctx.measureText(lab).width+34;};
  chip(PAL['s5'],big?'at the pull':'response at the pull (cue)');chip(PAL['s1'],big?'better':'better than predicted');chip(PAL['s2'],big?'worse':'worse than predicted');
  if(G&&G.g&&!big){ctx.font='700 13px '+FONT;const s='Your guess: '+G.g.guess+' pulls',wd=ctx.measureText(s).width+16;pill(ctx,s,780-wd/2,ly-5,'#9a5c00','#fff',13);}},
 narrate(sim){const o=R(sim),fx=sim.p.sched==='fixed',n=sim.p.ratio;
  if(!shown(sim))return fx?`Every ${n}th pull shows a new post. After ${sim.p.train} pulls the model has learned exactly when: the <b>response moves to the pull that predicts the post</b> (${f2(o.cue)}), and the post itself barely registers (${f2(o.burst)}). Lock in your guess to see what happens when the posts stop.`
   :`About 1 pull in ${n} shows a new post, at random. The model can never predict which one, so <b>each new post is still a surprise</b> (burst ${f2(o.burst)}), and the longest dry streak was ${o.maxDry} pulls. Lock in your guess to see what happens when the posts stop.`;
  if(fx)return `On the fixed schedule, ${o.maxDry} empty pulls in a row was the most the user ever saw. When the expected post does not come, the signal <b>dips</b> (${f2(o.dip)}), the gap quickly looks abnormal, and the user gives up after ${o.after} pull${o.after===1?'':'s'}.`;
  return `On the variable schedule, the user once went ${o.maxDry} pulls without a post, so a long empty run looks normal and the dips stay small (${f2(o.dip)}). <b>It keeps pulling ${o.capped?'past '+o.after:o.after} times after the posts stop</b>, against ${R(sim,{sched:'fixed'}).after} on a fixed schedule with the same average.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The simulated user gets a new post on about 1 pull in 5, at random. Then the posts stop for good. How many more times will it pull before it gives up? Drag the slider here to your guess, then lock it in.',
   honors:'Read the rule in the picture. After the posts stop for good, how many more times will this simulated user pull before it gives up? Drag the slider here, then lock it in.'},
  lockLabel:'Lock in my guess',mathLabel:'Run the model',
  lock(sim){const g=Math.round(sim.p.guess),a=R(sim).after;return {v:Math.abs(g-a),guess:g,label:`${g} more pulls`};},
  solve(sim){const a=R(sim).after;sim.p.guess=Math.min(200,a);return {v:Math.abs(sim.p.guess-a),guess:a,label:`${a} more pull${a===1?'':'s'}`};},
  how:{bio:'The model keeps a prediction for “a post on this pull.” It gives up when an empty run gets 1.5 times longer than the longest empty run it saw while posts were still coming.',
   ap:'Quit rule: stop on the first pull where the dry streak exceeds patience × (longest dry streak in training). Pulls after the posts stop = that threshold minus the dry streak already running when they stopped.'},
  compare(sim,g,m){const a=m.guess,o=R(sim),alt=R(sim,{sched:other(sim)}).after,d=Math.abs(g.guess-a),fx=sim.p.sched==='fixed';
   const tail=fx?` On a variable schedule with the same average, it would have pulled ${alt} times.`:` On a fixed schedule with the same average, it would have quit after ${alt}.`;
   if(d<=2)return `Your gut was right on: the model pulled <b>${a} more times</b> and you guessed ${g.guess}.${tail}`;
   return `The model pulled <b>${a} more times</b>; you guessed ${g.guess}, off by <b>${d} pulls</b> (${g.guess<a?'too few':'too many'}). Its longest empty run while posts were coming was ${o.maxDry} pulls, so it waited for a run longer than ${f0(o.thr-1)} before quitting.${tail}`;},
  again(sim){sim.st.seed=1+Math.floor(Math.random()*9e5);sim.st.shown=false;sim.p.sched=Math.random()<0.5?'fixed':'variable';sim.p.ratio=3+Math.floor(Math.random()*6);sim.p.guess=15;}
 },
challenges:[
  {lvl:'bio',instant:true,q:'Same average: one new post per 5 pulls. Which schedule keeps the simulated user pulling longer after the posts stop?',choices:['Fixed ratio: every 5th pull','Variable ratio: 1 in 5 at random','About the same'],correct:1,explain:'In this session the user pulls 20 more times on the variable schedule and 7 on the fixed one. On the fixed schedule it never saw more than 4 empty pulls in a row, so the end is obvious; on the variable one it once went 14. Ferster and Skinner found variable-ratio schedules produce the most persistent responding.'},
  {lvl:'bio',instant:true,q:'Fixed schedule, every 5th pull. After 100 pulls, when does the model’s dopamine signal respond most?',choices:['When the new post appears','At the 5th pull itself, before the post shows','It stops responding at all'],correct:1,explain:'The response at the 5th pull reaches 0.95, and the post itself barely registers (0.07). Once a reward is predictable, the signal moves to the cue that predicts it: Schultz, Dayan and Montague described this in 1997.'},
  {lvl:'honors',instant:true,q:'Fixed schedule, after 100 pulls. The posts stop. The 5th pull comes and nothing appears. What does the signal do?',choices:['A burst, because the pull itself is exciting','A dip below baseline','Nothing changes'],correct:1,explain:'The model predicted a post at that pull and got none, so the error is negative: a dip to −0.96. Dopamine neurons dip like this when an expected reward is omitted. That sharp signal is part of why the fixed-schedule user quits after 7 pulls.'},
  {lvl:'honors',instant:true,q:'Sherman and colleagues (2016) scanned 32 teens, ages 13 to 18, with fMRI while they viewed photos. What happened with photos that showed many likes?',choices:['The nucleus accumbens, a reward area, was more active, and teens were more likely to like those photos too','Reward areas were less active','Likes made no difference'],correct:0,explain:'The nucleus accumbens was more active for photos with many likes, and teens were more likely to like photos that already had many likes. A like count is information the brain treats as reward.'},
  {lvl:'ap',instant:true,q:'The model predicts V = 0.2 for this pull. What is the prediction error δ if a post appears, and if none does?',choices:['0.8 and −0.2','1 and 0','0.2 and −0.8','1.2 and −0.2'],correct:0,explain:'δ = r − V. With a post, r = 1: δ = 1 − 0.2 = 0.8. Without, r = 0: δ = 0 − 0.2 = −0.2. On a 1-in-5 variable schedule, V settles near 0.2, so posts stay big surprises and missing posts barely dip.'},
  {lvl:'ap',instant:true,q:'V = 0.5 and α = 0.15. A post appears. What is the new V?',choices:['0.575','0.65','0.5','1.0'],correct:0,explain:'δ = 1 − 0.5 = 0.5. V ← 0.5 + 0.15 × 0.5 = 0.575. Each surprise moves the prediction a fraction α of the way toward what happened.'}
 ],
 tour:[
  {title:'You set the rules',text:'The simulated user pulls to refresh 100 times. Green dots are pulls that showed a new post. You don’t pull anything: you set the rule. Here every 5th pull shows a new post: a fixed-ratio schedule.',focus:[0,0,800,105],pause:true,setup:sim=>BioLab.setValues(sim,{sched:'fixed',ratio:5})},
  {title:'At first: a burst at the post',text:'In the first 20 pulls the model has no prediction yet, so the first new post is completely unexpected: a red burst of 1.00. The next one, 0.85. Dopamine neurons fire like this to a reward nobody predicted.',focus:[14,112,258,312],pause:true},
  {title:'Later: the response moves to the pull',text:'By the last 20 pulls the model predicts a post on every 5th pull. The purple response at that pull reaches 0.95, and the post itself barely registers (0.07). The signal has moved from the reward to the cue that predicts it.',focus:[271,112,258,312],pause:true},
  {title:'The posts stop: a dip',text:'Now nothing new comes. At the 5th pull the model expected a post and got none: a blue dip to −0.96. Four empty pulls in a row was the most it had ever seen, so the gap looks wrong fast, and it gives up after 7 pulls.',focus:[528,112,258,312],pause:true},
  {title:'Same average, at random',text:'Now switch to a variable ratio: each pull has a 1 in 5 chance. The model can’t tell which pull will pay, so each post is still a big surprise (0.93 on average near the end) and the response at the pull stays small (at most 0.33).',focus:[271,112,258,312],pause:true,setup:sim=>BioLab.setValues(sim,{sched:'variable',ratio:5})},
  {title:'Hard to notice the end',text:'While posts were coming, this user once went 14 pulls with nothing. So an empty run after the posts stop looks normal and the dips stay small (−0.22). It pulls 20 more times: almost three times as long as on the fixed schedule.',focus:[[0,0,800,105],[528,112,258,312]],pause:true},
  {lvl:'ap',title:'The update rule',text:'Each pull: δ = r − V(s), then V(s) ← V(s) + αδ, with α = 0.15. The first post: δ = 1 − 0 = 1, so V becomes 0.15. The next time that state pays, δ = 1 − 0.15 = 0.85. That is the shrinking burst you saw in the first window.',pause:true,setup:sim=>BioLab.setValues(sim,{sched:'fixed',ratio:5}),focus:[14,112,258,312]}
 ],
 lab:{bio:'<p><b>Question:</b> Which schedule keeps the user pulling longer after the posts stop?</p><ol><li>Set Fixed ratio, one post per 5 pulls. Press <b>Skip my guess and show the result</b>, then record a trial.</li><li>Switch to Variable ratio and record again.</li><li>Press <b>Run a new session</b> three times for each schedule and record each.</li></ol><p>Write one sentence comparing the two schedules.</p>',
  honors:'<p><b>Question:</b> Where does the dopamine response go once a reward is predictable?</p><ol><li>On Fixed ratio, compare the first and last windows: where are the red bars, and where are the purple ones?</li><li>Repeat on Variable ratio.</li><li>Record the burst, the pull response and the dip for each.</li></ol><p>Explain the shift using the words <i>prediction</i> and <i>error</i>.</p>',
  ap:'<p><b>Question:</b> Why does an unpredictable schedule resist extinction?</p><ol><li>For ratios 2 to 10, record pulls after the posts stop on each schedule (or read the graph).</li><li>Change patience and the learning rate. Which one changes persistence, and which one changes the dopamine trace?</li></ol><p><b>CER:</b> Use the longest dry streak and the size of the dip as evidence.</p>'},
 terms:[
  {t:'Dopamine',d:'A chemical messenger in the brain. Dopamine neurons in the midbrain fire in patterns that track reward and prediction.'},
  {t:'Reward-prediction error',d:'Reward received minus reward predicted. Positive: better than expected (a burst). Zero: as predicted. Negative: worse than expected (a dip).'},
  {t:'Fixed-ratio schedule',d:'A reward after every nth response, like clockwork.'},
  {t:'Variable-ratio schedule',d:'A reward after an unpredictable number of responses, with a set average. It produces the most persistent responding.'},
  {t:'Extinction',d:'What happens to a learned behavior once its reward stops coming.',lvl:'honors'},
  {t:'Nucleus accumbens',d:'A reward area deep in the brain that receives dopamine signals.',lvl:'honors'},
  {t:'Prefrontal cortex',d:'The front of the brain, involved in planning and self-control. It keeps maturing into the mid-20s.',lvl:'honors'},
  {t:'Learning rate α',d:'How much one surprise changes the next prediction.',lvl:'ap'}
 ],
about:'<p><b>The model.</b> Each pull, the user’s prediction for “a post on this pull” depends on how many pulls it has made since the last post. The response at the pull is that prediction V; when the result shows, the error is δ = r − V (r = 1 for a new post, 0 for nothing), and V moves a fraction α of the way toward r. This is a simplified version of the reward-prediction-error idea: Schultz, Dayan and Montague (Science, 1997) showed that dopamine neurons fire to an unexpected reward, shift their response to a cue once the reward is predictable, and dip when an expected reward is left out. The variable schedule here gives each pull the same 1 in n chance (a random-ratio version of a variable-ratio schedule). The quit rule, “give up when an empty run passes patience × the longest empty run seen while posts came,” is an assumption for illustration, and so is the patience of 1.5. Ferster and Skinner (1957) found that variable-ratio schedules produce the most persistent responding.</p>'+
  '<p><b>An analogy, not a measurement.</b> Comparing pull-to-refresh or endless feeds to a variable-ratio schedule is an analogy. No peer-reviewed study has measured variable-ratio reinforcement inside a commercial feed. This tool does not run on rewards: you set the schedule and a simulated user does the pulling.</p>'+
  '<p><b>Teen brains.</b> Sherman and colleagues (Psychological Science, 2016) scanned 32 teens, ages 13 to 18, with fMRI while they viewed photos: the nucleus accumbens was more active for photos with many likes, and teens were more likely to like photos that already had many likes. The prefrontal cortex, involved in planning and self-control, keeps maturing into the mid-20s (NIMH).</p>'+
  '<p><b>Mental health is debated.</b> Orben and Przybylski (2019) found that technology use explained at most 0.4% of the variation in teen wellbeing. Jonathan Haidt argues for firm limits on phones and social media for kids. A 2025 JAMA study by Xiao and colleagues linked rising <i>addictive</i> use, not total screen time, to higher risk. This tool does not measure your mental health or anyone else’s. If stress or mood is weighing on you, talk to RJ counseling, or use Safe2Tell. This is a simplified model, not medical advice.</p>'
};
BioLab.register(SIM);
})();

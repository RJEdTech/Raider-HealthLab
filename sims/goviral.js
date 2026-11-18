(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* How a product spreads on social media with no paid ads: a branching (geometric) model.
   Each video gets V views (times a feed boost b). One viewer in S makes their own video. Videos per video: R = V·b/S.
   Videos in round k: R^k. Total views through round n: V·b·(R^(n+1) − 1)/(R − 1)  (or V·b·(n+1) when R = 1).
   Context: FDA's Jan 2025 Zyn authorization limits the company's own ads to adults 21+; PMI says it does not pay influencers.
   Truth Initiative (Tobacco Control): 10,000+ pouch-related TikTok videos, Jan 2021 to Oct 2023, and a reciprocal link between that content and pouch sales. */
const V=sim=>atLeast('honors')?sim.p.views:1000;
const S=sim=>atLeast('honors')?sim.p.one:500;
const B=sim=>atLeast('honors')?sim.p.boost:1;
const NR=sim=>atLeast('ap')?sim.p.rounds:10;
const R=sim=>V(sim)*B(sim)/S(sim);
const vids=(sim,k)=>Math.pow(R(sim),k);
function total(sim,n){n=n===undefined?NR(sim):n;const r=R(sim),v=V(sim)*B(sim);if(Math.abs(r-1)<1e-9)return v*(n+1);return v*(Math.pow(r,n+1)-1)/(r-1);}
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const big=v=>v>=1e9?(v/1e9).toFixed(2)+' billion':v>=1e6?(v/1e6).toFixed(2)+' million':Math.round(v).toLocaleString('en-US');
const n2=v=>(Math.round(v*100)/100).toString();
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fLine(sim){const r=R(sim),v=V(sim)*B(sim),n=NR(sim);if(Math.abs(r-1)<1e-9)return `${v.toLocaleString('en-US')} × ${n+1} = ${big(total(sim))} views`;return `${v.toLocaleString('en-US')} × (${n2(r)}^${n+1} − 1) ÷ (${n2(r)} − 1) = ${big(total(sim))} views`;}

const SIM={
 id:'goviral',hash:'goviral',apUnit:7,order:3,tab:'Going viral with no ads',kind:'Simulation',prereq:[],next:['lifetime','whosad','feedbuilder'],
 skills:{bio:'Doubling and adding up a pattern · Algebra 1 (exponential growth), Health (Unit 6 and 7)',honors:'Geometric growth and the tipping point R = 1 · Algebra 1 (Unit 5), Algebra 2, Health (Unit 6)',ap:'Geometric series: S = a(rⁿ⁺¹ − 1)/(r − 1) · Algebra 2 (Unit 6), AP Precalculus (Unit 2A)'},
 card:'One video of a new drink, and a few viewers make their own. Guess how many views that adds up to after ten rounds, then find the tipping point.',
 title:'Going viral with no ads: how a product trend spreads',
 lede:{bio:'Some of the biggest teen product crazes of the last few years spread mostly through people’s own videos: a drink everyone had to find, a snack challenge, a pouch brand. If a few viewers of each video post their own, the number of videos doubles again and again, and the views pile up fast, with or without a single ad.',
  honors:'Call R the number of new videos each video inspires. If R is above 1, the trend grows every round; below 1, it fades. Feeds that boost videos people watch and share raise the views per video, which raises R. It is the same tipping point as R for a disease.',
  ap:'Videos in round k: Rᵏ. Total views through round n: V·(Rⁿ⁺¹ − 1)/(R − 1), a geometric series. A small change in R near 1 makes a huge difference after many rounds.'},
 scale:'A made-up video trend about a new drink on a short-video app. One “round” is the time for viewers to post their own versions, say a few days. The numbers are simplified; real views vary enormously from video to video.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'The trend',
 controls:[
  {id:'guess',label:'Your gut: total views after 10 rounds',type:'range',min:0,max:5,step:0.05,def:0.1,unit:' million'},
  {id:'views',label:'Views per video',type:'range',min:200,max:5000,step:100,def:1000,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'one',label:'One viewer in this many posts their own video',type:'range',min:200,max:5000,step:100,def:500,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'boost',label:'Feed boost (the app shows engaging videos to more people)',type:'range',min:0.5,max:3,step:0.25,def:1,unit:'×',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'rounds',label:'Rounds',type:'range',min:3,max:15,step:1,def:10,lvl:'ap',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the spread now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'R',label:'New videos each video inspires (R)',unit:'',d:2,min:0,max:null,get:sim=>R(sim)},
  {id:'tot',label:'Total views through the last round',unit:'',d:0,min:0,max:null,text:true,get:sim=>shown(sim)?big(total(sim)):'Lock in your gut answer to see this.'},
  {id:'vids',label:'Videos posted in the last round',unit:'',d:0,min:0,max:null,get:sim=>hid(sim,vids(sim,NR(sim)))},
  {id:'teen',label:'Of those views, by teens on an app 68% of US teens use (if viewers match the app’s users)',unit:'',d:0,text:true,lvl:'honors',get:sim=>shown(sim)?'Millions of views can reach teens even when a company’s own ads are limited by age: those rules do not apply to other people’s videos.':'—'}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim)||stg<99,bg=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const n=NR(sim),r=R(sim);
  /* rounds revealed so far (animated) */
  const upto=stg===1?0:stg===2?Math.min(3,Math.floor(tau/1.2)):(stg>=99&&!sh)?0:Math.min(n,Math.floor(tau/0.7));
  /* ---- top: the tree for the first rounds ---- */
  const TX=24,TY=34,TW=360,TH=170;txt(ctx,'Who posts',TX,TY-12,{s:13*k,w:700});
  const cols=Math.min(5,n);let prev=[{x:TX+10,y:TY+TH/2}];
  for(let g=0;g<=cols;g++){const cnt=Math.min(32,Math.round(vids(sim,g)));const x=TX+10+g*(TW-20)/cols;const pts=[];
   for(let i=0;i<cnt;i++){const y=TY+8+(TH-16)*(cnt===1?0.5:i/(cnt-1));pts.push({x,y});}
   if(g<=upto){if(g>0){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;pts.forEach((p,i)=>{const q=prev[Math.min(prev.length-1,Math.floor(i*prev.length/Math.max(1,pts.length)))];ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();});}
    pts.forEach(p=>{ctx.fillStyle=g===upto&&stg<99?PAL['rj']:'#ff006e';rr(ctx,p.x-5,p.y-7,10,14,3);ctx.fill();});
    if(Math.round(vids(sim,g))>32)txt(ctx,'+ more',x,TY+TH+14,{s:12*k,c:PAL['cv-soft'],a:'center'});}
   prev=pts.length?pts:prev;}
  if(r<1&&upto>=1)txt(ctx,'Fewer than 1 new video per video: the trend fades',TX,TY+TH+30,{s:12*k,w:700,c:'#2a9d8f'});
  /* ---- right: the running total ---- */
  const run=sh?total(sim,upto):0;rr(ctx,410,24,370,130,12);ctx.fillStyle=PAL['card'];ctx.fill();
  txt(ctx,sh?'Views through round '+upto:'Total views',430,52,{s:14*k,w:700,c:PAL['cv-soft']});
  txt(ctx,sh?big(run):'?',430,100,{s:34*k,w:800,c:'#ff006e'});
  txt(ctx,'R = '+n2(r)+(r>1?': grows':r<1?': fades':': steady'),430,138,{s:14*k,w:700,c:r>1?PAL['rj']:'#2a9d8f'});
  const G=stg>=99?GS(sim):null;if(G)txt(ctx,'Your gut: '+G.guess+' million',770,138,{s:13*k,w:700,c:PAL['s4'],a:'right'});
  /* ---- bottom: views per round ---- */
  const L=Math.round(60+12*k),Rr=784,T=250,Bb=Math.round(410-6*k);
  const vmax=Math.max(1,V(sim)*B(sim)*Math.max(...[...Array(n+1).keys()].map(g=>vids(sim,g))));
  const bw=(Rr-L)/(n+1);txt(ctx,'Views in each round',L,T-12,{s:13*k,w:700});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,Bb);ctx.lineTo(Rr,Bb);ctx.stroke();
  for(let g=0;g<=n;g++){const v=V(sim)*B(sim)*vids(sim,g),h=sh&&g<=upto?(Bb-T)*v/vmax:0,x=L+g*bw;
   ctx.fillStyle=g===upto&&stg<99?PAL['rj']:'#ff006e';ctx.fillRect(x+bw*0.15,Bb-h,bw*0.7,h);
   if(!bg||g%2===0)txt(ctx,String(g),x+bw/2,Bb+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'Round',L-8,Bb+16*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  if(sh&&upto>=1){const v=V(sim)*B(sim)*vids(sim,upto);txt(ctx,big(v),clamp(L+upto*bw+bw/2,L+40,Rr-40),Math.max(T+12,Bb-(Bb-T)*v/vmax-8),{s:12*k,w:700,c:PAL['rj'],a:'center'});}
  if(!sh)pill(ctx,'Lock in your gut answer to watch it spread',(L+Rr)/2,(T+Bb)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));
  if(stg===5)pill(ctx,'Company ads: limited by rules · Other people’s videos: not covered',(L+Rr)/2,T+20,PAL['rj'],'#fff',12.5*Math.min(k,1.3));},
 narrate(sim){const r=R(sim),n=NR(sim);if(!shown(sim))return `One video gets ${V(sim).toLocaleString('en-US')} views, and one viewer in ${S(sim)} posts their own. <b>After ${n} rounds of this, how many total views?</b>`;
  return `Each video inspires <b>${n2(r)}</b> new ones, so `+(r>1?`the trend ${r>=2?'at least doubles':'grows'} every round: <b>${big(total(sim))}</b> views after ${n} rounds, with no ad paid for.`:r<1?`it fades: only ${big(total(sim))} views in all. Below R = 1, a trend dies out.`:`it holds steady at one new video per video.`);},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: one video of someone hunting for a new drink gets 1,000 views. One viewer in 500 posts their own version, and each of those gets 1,000 views too. Drag the slider to the total views you think there are after 10 rounds, then lock it in.',
   honors:'Before the spread appears: drag the slider to the total views after the last round, in millions, then lock it in.'},
  lock(sim){const a=total(sim)/1e6;return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:sim.p.guess+' million views'};},
  solve(sim){const a=total(sim)/1e6;return {v:0,guess:Math.round(a*100)/100,label:big(total(sim))+' views'};},
  hint:{bio:'Lock in your gut answer. Then you will add up the rounds yourself.'},
  calc:{unit:'views',d:0,tol:a=>Math.max(10,0.01*a),
   prompt:{bio:sim=>`Round 0 is the first video. Each video gets <b>${(V(sim)*B(sim)).toLocaleString('en-US')} views</b> and inspires <b>${n2(R(sim))}</b> new videos in the next round. How many views in all, from round 0 through round <b>${NR(sim)}</b>?`},
   answer:sim=>total(sim),
   hint:'List the videos in each round (1, 2, 4, 8, …), add them up, then multiply by the views per video. Or use (Rⁿ⁺¹ − 1) ÷ (R − 1).',
   steps(sim){const r=R(sim),n=NR(sim),v=V(sim)*B(sim);const list=[...Array(Math.min(n,6)+1).keys()].map(g=>n2(vids(sim,g)));
    const sumV=Math.abs(r-1)<1e-9?n+1:(Math.pow(r,n+1)-1)/(r-1);
    return [`Videos in each round: ${list.join(', ')}${n>6?', …':''} (multiply by ${n2(r)} each round).`,`Total videos, rounds 0 to ${n}: ${Math.abs(r-1)<1e-9?n+1:`(${n2(r)}^${n+1} − 1) ÷ (${n2(r)} − 1)`} = ${n2(sumV)}.`,`Views: ${n2(sumV)} × ${v.toLocaleString('en-US')} = <b>${big(total(sim))}</b>.`];}},
  formula:fLine,
  how:{bio:'Count the videos each round (doubling), add them up, and multiply by the views per video.',ap:'S = V(Rⁿ⁺¹ − 1)/(R − 1).'},
  compare(sim,g,m){const a=total(sim)/1e6,off=Math.abs(g.guess-a);if(off<0.1*Math.max(a,0.1))return `Your gut was right on: about <b>${big(total(sim))}</b> views, from one video and no paid ads.`;
   return `Your gut was off by <b>${off.toFixed(2)} million</b> views. ${g.guess<a?'Doubling sneaks up on you: the last round alone is about half the total.':'You guessed high.'} The model says <b>${big(total(sim))}</b>.`;},
  again(sim){if(atLeast('honors')){sim.p.views=500+100*Math.floor(Math.random()*20);sim.p.one=400+100*Math.floor(Math.random()*16);sim.p.boost=[0.75,1,1.25,1.5][Math.floor(Math.random()*4)];}sim.p.guess=0.1;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Videos double every round: 1, 2, 4, 8, … How many videos are posted in round 10?',answer:1024,tol:0,unit:'videos',d:0,hint:'2 multiplied by itself 10 times',explain:'2¹⁰ = 1,024. Round 10 alone has more videos than all earlier rounds put together (1,023).'},
  {lvl:'bio',instant:true,q:'Rules limit who a nicotine or energy drink company can aim its own ads at. Do those rules cover videos ordinary people post?',choices:['Yes, every video about the product','No: they cover the company’s marketing, not ordinary users’ posts'],correct:1,explain:'Marketing rules apply to the company. Unpaid posts by fans are not the company’s ads, even when the company benefits.'},
  {lvl:'bio',instant:true,q:'If one viewer in 2,000 posts their own video (instead of 1 in 500), with 1,000 views each, what happens?',choices:['It still doubles','Each video inspires 0.5 new ones, so the trend fades','It grows faster'],correct:1,explain:'R = 1,000 ÷ 2,000 = 0.5. Below 1, every round is smaller than the last.'},
  {lvl:'honors',instant:true,q:'The feed shows engaging videos to twice as many people (boost 2×). With 1,000 views and 1 in 500 posting, what is R?',choices:['2','4','1','0.5'],correct:1,explain:'Views per video become 2,000, and 2,000 ÷ 500 = 4 new videos per video. The app’s choices change R as much as the viewers’ do.'},
  {lvl:'honors',instant:true,q:'A study found that pouch videos on TikTok and pouch sales rose together, each following the other. What does that show?',choices:['That the videos caused the sales','A link worth taking seriously, but other factors could drive both','Nothing at all'],correct:1,explain:'The Truth Initiative researchers said they could not rule out other factors. A relationship over time is evidence, not proof of cause.'},
  {lvl:'ap',kind:'num',q:'R = 1.5, 1,000 views per video. Total views through round 8 (rounds 0 to 8)?',answer:74887,tol:50,unit:'views',d:0,hint:'1,000 × (1.5⁹ − 1) ÷ 0.5',explain:'1.5⁹ ≈ 38.44; (38.44 − 1)/0.5 ≈ 74.89; × 1,000 ≈ 74,900 views.'}
 ],
 tour:[
  {title:'One video',text:'Round 0: one person posts a video hunting stores for a hard-to-find drink. It gets 1,000 views. No company paid for it.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;BioLab.setValues(sim,{views:1000,one:500,boost:1,rounds:10});}},
  {title:'Some viewers post their own',text:'One viewer in 500 makes their own version. 1,000 ÷ 500 = 2 new videos for each video. Watch the videos double: 1, 2, 4, 8.',pause:true,speed:0.5,setup:sim=>{sim.tst=2;sim._t0=null;}},
  {title:'Ten rounds',text:'Watch the bars. Each round doubles the last. By round 10 there are 1,024 new videos in that round alone, and the total passes 2 million views.',pause:true,speed:0.5,setup:sim=>{sim.tst=3;sim._t0=null;}},
  {title:'A real example: PRIME',text:'PRIME drinks, started in 2022 by YouTubers Logan Paul and KSI, spread fast through fans’ own videos on TikTok. In July 2023 a US senator asked the FDA to look into PRIME Energy, which has 200 mg of caffeine per 12 oz can, saying its marketing reached kids; the company said it followed FDA rules.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Same math, different product',text:'Nicotine pouches spread the same way. The FDA limits Zyn’s own ads to adults 21 and older, but not other people’s videos. Truth Initiative researchers counted more than 10,000 pouch videos on TikTok from 2021 to 2023 and found the videos and sales rose together, though they could not rule out other causes.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'The tipping point',text:'Now only one viewer in 2,000 posts a video: R = 0.5. Watch the trend fade. Above R = 1 it explodes; below, it dies out. It is the same math as a disease outbreak.',pause:true,speed:0.5,setup:sim=>{sim.tst=6;sim._t0=null;BioLab.setValues(sim,{one:2000});}},
  {lvl:'honors',title:'The feed decides too',text:'Back to 1 in 500, but the app boosts engaging videos to twice as many people: R = 4. The feed’s ranking, which no one votes on, can turn a fading trend into a huge one.',pause:true,speed:0.5,setup:sim=>{sim.tst=7;sim._t0=null;BioLab.setValues(sim,{one:500,boost:2});}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> How fast does a doubling trend grow?</p><ol><li>Watch the bars and write down the views in rounds 1 to 5.</li><li>What do you multiply by each round?</li></ol><p>Write one sentence: who benefits when a product trend spreads with no paid ads?</p>',
  honors:'<p><b>Question:</b> Where is the tipping point?</p><ol><li>Keep 1,000 views. Find the “one in …” value that makes R exactly 1.</li><li>Set the feed boost to 0.5, 1, 2 and 3. Record total views.</li></ol><p>Explain what a viewer can control and what only the app can control.</p>',
  ap:'<p><b>Question:</b> How sensitive is the total to R?</p><ol><li>Derive S = V(Rⁿ⁺¹ − 1)/(R − 1).</li><li>For n = 10, compare R = 0.9, 1.0, 1.1 and 2.</li><li>As n grows, what does S approach when R < 1?</li></ol><p><b>CER:</b> Claim which change cuts the total most: fewer people posting, or a feed that stops boosting. Use the formula.</p>'},
 terms:[
  {t:'Viral',d:'Spreading from person to person, the way an infection does.'},
  {t:'Influencer',d:'Someone whose posts reach many people. Some are paid by companies; many are not.'},
  {t:'R (reproduction number)',d:'How many new copies each copy produces. Above 1 grows, below 1 fades.',lvl:'honors'},
  {t:'Engagement-ranked feed',d:'A feed that shows each person what the app predicts they will watch, like or share.',lvl:'honors'},
  {t:'Geometric series',d:'A sum where each term is the last times the same ratio: a + ar + ar² + …',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Each video gets V × boost views, and one viewer in S posts their own video, so each video inspires R = V × boost ÷ S new videos. The totals are a geometric series. Real trends are messier: a few videos get millions of views and most get very few, and people stop posting as a joke gets old. The point is the shape of the growth and the tipping point at R = 1.</p><p><b>What is real.</b> PRIME Hydration launched in January 2022, founded by Logan Paul and KSI, and grew through fans’ videos; PRIME Energy has 200 mg of caffeine per 12 oz can. In July 2023 Senator Chuck Schumer asked the FDA to investigate its caffeine content and marketing to kids; PRIME said it complied with all FDA rules (AP; BevNET; FoodNavigator-USA). For pouches: the FDA’s January 2025 authorization of Zyn limits the company’s ads to adults 21 and older; Philip Morris says it does not pay influencers. Truth Initiative researchers found a two-way relationship between pouch-related TikTok content and pouch sales from January 2021 to October 2023 (<i>Tobacco Control</i>). Truth Initiative reports TikTok is used by 68% of US teens.</p><p><b>See also:</b> HealthLab’s “Who’s this ad for?” and “Build a feed” tools, on how apps pick what you see.</p>'
};
BioLab.register(SIM);
})();

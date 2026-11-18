(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* The playbook through time: tactics × eras, each cell colored by the kind of evidence behind it. */
const ERAS=['1929: Lucky Strike','1967: Sugar industry','1988–97: Joe Camel','2015–19: JUUL','2019–now: Zyn and pouches'];
const EV={C:{l:'Court ruling',s:'Court',c:'#9d0208',r:4},S:{l:'Investigation (settled)',s:'Settled',c:'#e85d04',r:3},R:{l:'Research',s:'Research',c:'#3a6fd8',r:2},H:{l:'Historical record',s:'Records',c:'#7b2cbf',r:2},N:{l:'Not a tactic then',s:'',c:null,r:0}};
const ROWS=[
 {k:'young',sh:'Young faces',t:'Young-looking people or characters',c:[
  ['H','Young women from society families were recruited to smoke in the 1929 Easter Parade, a stunt planned by publicist Edward Bernays for the American Tobacco Company.'],
  ['N','The sugar campaign aimed at scientists and doctors, not at kids.'],
  ['C','The 2006 federal ruling in United States v. Philip Morris found the cigarette companies, RJ Reynolds among them, intentionally marketed to people under 21. In 1991, a JAMA study found 91% of 6-year-olds matched Joe Camel with cigarettes, about as many as matched the Disney logo with Mickey Mouse. Camel’s share of underage smokers rose from under 1% to 32.8%.'],
  ['S','33 states found JUUL’s ads and social posts used young, trendy-looking models (settled for $438.5 million, 2022).'],
  ['R','The FDA bars Zyn’s own ads from showing actors who look under 35. But a 2026 study of #Zyn posts found TikTok carried many creator-made posts likely to appeal to youth (JMIR Infodemiology).']]},
 {k:'free',sh:'Freedom',t:'Selling it as freedom or rebellion',c:[
  ['H','Women smoking in public were framed as lighting “torches of freedom,” tying cigarettes to women’s independence. Historians note the press coverage was smaller than Bernays later claimed.'],
  ['N','Not this campaign’s tactic.'],
  ['R','Joe Camel was drawn as a cool, rule-breaking character; the 1991 studies found high schoolers knew him far better than adults did (97.7% vs. 72.2%).'],
  ['S','The states found JUUL’s launch campaign built a youthful, trendy image; Stanford researchers who studied the ads described them as patently youth-oriented.'],
  ['N','No company campaign known. Online posts by users often joke about pouches as a lifestyle, but that is not the company’s message.']]},
 {k:'flav',sh:'Flavors',t:'Sweet and cool flavors',c:[
  ['N','Not a tactic then.'],
  ['N','Sugar is the flavor; not a separate tactic here.'],
  ['N','Candy and fruit flavors in cigarettes were banned in 2009 (Tobacco Control Act); not a Joe Camel tactic.'],
  ['R','JUUL sold flavors like mango and crème brûlée until 2019; in 2019, 59% of high schoolers who vaped named JUUL as their usual brand (JAMA).'],
  ['R','97% of teens who have used pouches use a flavor most often, mint most of all (Monitoring the Future, 2025). The FDA authorized flavored Zyn for adults in 2025.']]},
 {k:'news',sh:'Free attention',t:'Getting into the news or the feed without paying for ads',c:[
  ['H','Bernays staged the parade as news, so newspapers covered it for free.'],
  ['H','Instead of ads, the industry paid for a research review in a top medical journal (1967). The researchers who found the documents say it helped steer the debate about sugar for decades.'],
  ['N','Mostly paid magazine ads, billboards and merchandise.'],
  ['S','The states found JUUL used launch parties, free samples and social media posts to reach young people.'],
  ['R','More than 10,000 pouch videos on TikTok, mostly unpaid “Zynfluencers,” rose along with pouch sales (Truth Initiative, Tobacco Control). Zyn’s maker says it does not pay influencers.']]},
 {k:'health',sh:'Health claims',t:'Health-sounding claims',c:[
  ['H','Around 1930, Lucky Strike ads claimed “20,679 physicians say LUCKIES are less irritating.”'],
  ['H','A sugar trade group paid three Harvard scientists about $50,000 in today’s dollars for a 1967 review that played down sugar’s link to heart disease and pointed at fat. The funding was not disclosed; it came out from internal documents in 2016 (JAMA Internal Medicine).'],
  ['N','Not a Joe Camel tactic.'],
  ['S','The states said JUUL presented itself as a way to quit smoking without FDA approval to make that claim.'],
  ['R','Zyn Chill was sold as “Flavor-Ban Approved” but contained a cooling agent; researchers called the label misleading (Tobacco Control, 2025). Separately, in June 2026 the FDA allowed Zyn to say that using it instead of cigarettes lowers some disease risks, while stating that does not mean it is safe.']]},
 {k:'hide',sh:'Easy to hide',t:'Easy to hide from adults',c:[
  ['N','Not a tactic then.'],
  ['N','Not a tactic then.'],
  ['N','Not a tactic then.'],
  ['R','JUUL’s small, flat design looked like a USB flash drive, which the CDC warned parents and teachers about.'],
  ['R','No smoke or vapor. In a Montana survey, about 1 in 4 youth and young adults who used pouches named being able to use them unnoticed as a reason.']]}
];
const KINDS=['C','S','R','H'];
/* gut: which kind of evidence is strongest that a company targeted teens? options ranked */
const GOPT=[{v:0,l:'The company says it sells only to adults'},{v:1,l:'Teens say they like the product'},{v:2,l:'Researchers found teens see and like the ads'},{v:3,l:'A court, after reading the company’s own internal documents, ruled that it did'}];
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on));
const rowOf=sim=>Math.max(0,ROWS.findIndex(r=>r.k===sim.p.row));
const cnt=r=>r.c.filter(c=>c[0]!=='N').length;

const SIM={
 id:'playbook',hash:'playbook',apUnit:7,order:7,tab:'The playbook through time',kind:'Learning tool',prereq:['replacement'],next:['vapegraph'],
 skills:{bio:'Organizing evidence in a table and counting patterns · Health (Unit 7), US History',honors:'Weighing evidence: court findings, settlements, research and company statements · Health, US History, Government',ap:'Evaluating sources and the strength of causal claims · AP US History, AP US Government, AP Statistics (Unit 3)'},
 card:'Line up five eras, from a 1929 cigarette stunt and the 1967 sugar papers to vapes and pouches, and sort the tactics by how strong the evidence behind each one is.',
 title:'The playbook through time',
 lede:{bio:'The same moves keep coming back, across cigarettes, sugar, vapes and pouches: youthful images, the feeling of freedom, sweet flavors, getting talked about without paying for ads, and science that sounds reassuring. But not every claim has the same proof behind it. A court ruling is stronger than a rumor, and what a company says about itself is the weakest of all.',
  honors:'Each cell is colored by the strongest kind of evidence behind it. A court ruling and a government investigation looked at the companies’ own documents. Published research measured effects. For pouches, most evidence so far is research, not court findings: that difference matters when you make a claim.',
  ap:'A settlement is not an admission of guilt, and a correlation in research is not proof that marketing caused use. Strong claims need strong evidence; this table shows where the evidence is strong and where it is still building.'},
 scale:'Five eras of marketing in the United States, 1929 to today: cigarettes, sugar, an e-cigarette and nicotine pouches. Each cell gives the evidence and its source.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Explore the table',
 controls:[
  {id:'guess',label:'Your gut: which is the strongest evidence that a company targeted teens?',type:'select',def:0,options:GOPT},
  {id:'row',label:'Look closely at one tactic',type:'select',def:'young',noGut:true,options:ROWS.map(r=>({v:r.k,l:r.t}))},
  {id:'reveal',label:'Show the evidence colors now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'n',label:'Eras where this tactic shows up',unit:'of 5',d:0,min:0,max:4,get:sim=>cnt(ROWS[rowOf(sim)])}
 ],
 infoPanel(sim){const r=ROWS[rowOf(sim)];return `<h4>${r.t}</h4>`+r.c.map((c,i)=>`<p><b>${ERAS[i]}</b> · <i>${EV[c[0]].l}</i><br>${c[1]}</p>`).join('');},
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),bg=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=bg?150:220,T=50,W=(790-L)/5,H=bg?54:52;
  ERAS.forEach((e,i)=>{const x=L+i*W+W/2;const parts=e.split(': ');txt(ctx,parts[0],x,T-26,{s:12*k,c:PAL['cv-soft'],a:'center'});txt(ctx,bg?parts[1].split(' ')[0]:parts[1],x,T-10,{s:13*k,w:700,a:'center'});});
  const rsel=rowOf(sim),focusRow=stg===2?0:stg===3?2:stg===4?3:stg===5||stg===7?4:-1;
  ROWS.forEach((r,j)=>{const y=T+j*H;const hi=(stg>=99&&j===rsel)||j===focusRow;
   if(hi){ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.10;ctx.fillRect(4,y,786,H);ctx.globalAlpha=1;}
   const words=(bg?r.sh:r.t).split(' ');let line='',ly=y+18*k,lines=[];words.forEach(w=>{if((line+' '+w).length>(bg?16:27)){lines.push(line);line=w;}else line=(line?line+' ':'')+w;});lines.push(line);
   lines.slice(0,3).forEach((l,q)=>txt(ctx,l,10,y+16+q*15*Math.min(k,1.2),{s:12*k,w:hi?800:600}));
   r.c.forEach((c,i)=>{const e=EV[c[0]],x=L+i*W+4,show=sh&&(stg>=99||stg>=6||j===focusRow||stg===1&&false);
    rr(ctx,x,y+4,W-8,H-8,8);if(c[0]==='N'){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();txt(ctx,'—',x+(W-8)/2,y+H/2+5,{s:14*k,c:PAL['cv-soft'],a:'center'});}
    else{ctx.fillStyle=show?e.c:'#b0b5ba';ctx.fill();if(show&&!bg)txt(ctx,e.s,x+(W-8)/2,y+H/2+5,{s:11.5*k,w:700,c:'#fff',a:'center'});}});});
  /* legend */
  const ly=T+ROWS.length*H+16;let lx=10;KINDS.concat(['N']).forEach(kk=>{const e=EV[kk];if(e.c){ctx.fillStyle=e.c;rr(ctx,lx,ly-10,14,14,3);ctx.fill();}else{ctx.strokeStyle=PAL['line'];rr(ctx,lx,ly-10,14,14,3);ctx.stroke();}
   const lab=bg?e.l.split(' ')[0]:e.l;txt(ctx,lab,lx+20,ly+2,{s:12*k});ctx.font=(12*k)+'px sans-serif';lx+=ctx.measureText(lab).width+34;});
  if(!sh)pill(ctx,'Lock in your gut answer to color the evidence',400,T+ROWS.length*H/2,PAL['muted'],'#fff',13*Math.min(k,1.4));
  if(stg===1)pill(ctx,'Same moves, four eras',400,T+ROWS.length*H/2,PAL['rj'],'#fff',14*Math.min(k,1.4));},
 narrate(sim){if(!shown(sim))return 'Before the colors appear: <b>what kind of evidence would most strongly show that a company targeted teenagers?</b> Pick your answer.';
  const r=ROWS[rowOf(sim)];return `“${r.t}” shows up in <b>${cnt(r)} of 5</b> eras. The table below the picture gives the evidence for each era. Notice the colors: the strongest evidence (court rulings and investigations) is for the older products; for pouches it is research so far.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Pick the kind of evidence you think would most strongly show that a company targeted teenagers, then lock it in.'},
  lock(sim){const g=+sim.p.guess;return {v:3-g,guess:g,label:GOPT[g].l};},
  solve(sim){return {v:0,guess:3,label:GOPT[3].l};},
  hint:{bio:'No math yet. Think about who saw what, and who had something to gain.'},
  compare(sim,g,m){if(g.guess===3)return 'Right. A court ruling after reading a company’s own internal documents is the strongest of these: a judge weighed both sides and saw what the company wrote privately. That is what happened to the cigarette companies in 2006.';
   const why=['What a company says about itself is the weakest evidence: it has a reason to say it.','Teens liking a product shows appeal, not intent: adults might like it too.','Research is real evidence of effect, but it cannot see inside the company.'];
   return why[g.guess]+' The strongest is a court ruling based on the company’s own internal documents, as with the cigarette companies in 2006.';},
  again(sim){sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Under Joe Camel, Camel’s share of underage smokers went from 0.5% to 32.8%. How many times bigger is that?',answer:65.6,tol:1,unit:'times',d:1,hint:'32.8 ÷ 0.5',explain:'32.8 ÷ 0.5 = 65.6 times. RJ Reynolds retired Joe Camel in 1997 under government pressure.'},
  {lvl:'bio',instant:true,q:'JUUL settled with 33 states for $438.5 million. Does a settlement prove the company broke the law?',choices:['Yes, always','No: a settlement ends a case without a trial verdict, but the states’ investigation findings are still evidence','No, it means the states were wrong'],correct:1,explain:'Companies often settle without admitting wrongdoing. The investigation’s findings and the company’s own documents are still evidence; they just were not tested in a trial.'},
  {lvl:'bio',instant:true,q:'Which tactic appears in the JUUL era and the Zyn era but not in 1929 or with Joe Camel?',choices:['Sweet and cool flavors','Health-sounding claims','Young-looking people'],correct:0,explain:'Flavored cigarettes other than menthol were banned in 2009, so flavors moved to vapes and pouches.'},
  {lvl:'honors',instant:true,q:'For Zyn, most of the evidence in the table is published research, not court rulings. What is the fair way to say that?',choices:['Zyn has been proven to target teens','Research shows teens see and like pouch content and flavors; whether the company intends that has not been decided by any court','There is no evidence of anything'],correct:1,explain:'Match the strength of your claim to the strength of your evidence. Strong research findings are real; a finding of intent needs a different kind of evidence.'},
  {lvl:'ap',instant:true,q:'Pouch videos on TikTok and pouch sales rose together. What would strengthen a causal claim that the videos drove sales?',choices:['More videos','Evidence that sales rose first in places where the videos spread first, with other causes ruled out','A bigger correlation'],correct:1,explain:'Timing, place-by-place comparison and ruling out other causes are what turn a correlation into a stronger causal argument.'}
 ],
 tour:[
  {title:'Four eras',text:'Each column is an era of nicotine marketing: a 1929 publicity stunt, the Joe Camel cartoon, the JUUL e-cigarette and Zyn pouches. Each row is a tactic. Gray cells have evidence behind them; dashes mean it was not a known tactic then.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Young-looking faces',text:'Every era has one. Joe Camel was so well known that 91% of 6-year-olds in a 1991 study matched him with cigarettes. The FDA now bars Zyn’s ads from using actors who look under 35, but people’s own videos are not covered.',pause:true,setup:sim=>{sim.tst=2;BioLab.setValues(sim,{row:'young'});}},
  {title:'Flavors moved',text:'Candy and fruit flavors were banned in cigarettes in 2009. Flavors then showed up in vapes (JUUL’s mango) and now in pouches (97% of teen pouch users use flavors).',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{row:'flav'});}},
  {title:'Free attention',text:'In 1929, a staged parade got free newspaper coverage. In the JUUL era, launch parties and social posts. Now, thousands of unpaid TikTok videos. The cheapest ad is one someone else makes for you.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{row:'news'});}},
  {title:'Health-sounding claims',text:'“Less irritating,” “a way to quit,” “Flavor-Ban Approved.” Each made a product sound safer or allowed. Notice the evidence type in each era.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{row:'health'});}},
  {title:'Sugar, 1967: buying the science',text:'Sometimes the move is not an ad at all. A sugar trade group paid Harvard scientists for a 1967 review that played down sugar’s role in heart disease. Nobody knew until researchers found the internal documents in 2016.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{row:'health'});}},
  {title:'Read the colors',text:'Dark red and orange (courts and government investigations) are strongest, and they cover the older products. For pouches the evidence is research. That is a reason to keep watching, and to say exactly what the evidence shows.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 lab:{bio:'<p><b>Question:</b> Which tactics keep coming back?</p><ol><li>Pick each tactic in the menu. Count the eras it shows up in.</li><li>For one tactic, read the evidence for every era.</li></ol><p>Write one sentence about which tactic you think works best on teens, and why.</p>',
  honors:'<p><b>Question:</b> How strong is the evidence for each era?</p><ol><li>For each era, list the strongest kind of evidence it has.</li><li>Find one real ad or post from the Stanford Research into the Impact of Tobacco Advertising collection (tobacco.stanford.edu) and decide which tactic it uses.</li></ol><p>Write a claim about pouches that matches the strength of the evidence, no stronger and no weaker.</p>',
  ap:'<p><b>Question:</b> What would it take to prove intent?</p><ol><li>Compare what a court ruling, a settlement and a research study can each show.</li><li>Design a study that could test whether pouch videos cause teens to start.</li></ol><p><b>CER:</b> Claim what is known and unknown about pouch marketing and teens.</p>'},
 terms:[
  {t:'Tactic',d:'A specific move a marketer uses to get attention or make a product appealing.'},
  {t:'Settlement',d:'An agreement that ends a lawsuit or investigation without a trial verdict. Companies often settle without admitting wrongdoing.'},
  {t:'Internal document',d:'A company’s private memo or report. Lawsuits made millions of tobacco documents public.'},
  {t:'Strength of evidence',d:'How well evidence supports a claim. A court ruling based on a company’s own documents is stronger than a correlation, which is stronger than a company’s own statement.',lvl:'honors'}
 ],
 about:'<p><b>Sources by era.</b> <i>Sugar:</i> Kearns, Schmidt and Glantz, “Sugar Industry and Coronary Heart Disease Research,” <i>JAMA Internal Medicine</i>, 2016, from Sugar Research Foundation documents; the 1967 review appeared in the <i>New England Journal of Medicine</i>. <i>1929:</i> Edward Bernays’s “torches of freedom” stunt for the American Tobacco Company (historians, e.g. Murphree, <i>American Journalism</i>, 2015, show its press impact was exaggerated); Lucky Strike “20,679 physicians” ads (c. 1930). <i>Joe Camel:</i> Fischer et al. and DiFranza et al., <i>JAMA</i>, December 1991; RJ Reynolds ended the campaign in July 1997. <i>JUUL:</i> the 2022 multistate settlement ($438.5 million, 33 states and Puerto Rico) and the states’ investigation findings; Cullen et al., <i>JAMA</i>, 2019 (59.1% of high school e-cigarette users named JUUL as their usual brand); CDC guidance on USB-shaped devices. <i>Pouches:</i> Monitoring the Future 2025 flavor data (<i>Tobacco Control</i>, 2026); Jabba et al., <i>Tobacco Control</i>, 2025 (“Flavor-Ban Approved”); Truth Initiative’s TikTok and sales study (<i>Tobacco Control</i>); Tripathi et al., <i>JMIR Infodemiology</i>, 2026; Montana DPHHS youth survey; the FDA’s January 2025 marketing orders and June 2026 modified-risk orders for Zyn. Philip Morris International states that it markets Zyn only to adults 21 and older and does not pay influencers.</p><p><b>Not shown.</b> The table picks well-documented examples. It is not a complete history, and absence of a cell does not prove absence of a tactic.</p>'
};
BioLab.register(SIM);
})();

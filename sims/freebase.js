(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast,rng}=BioLab.h;
/* Free-base vs. charged (protonated) nicotine, and why pouches contain pH adjusters.
   Henderson–Hasselbalch: free/charged = 10^(pH − pKa), pKa = 8.02 (nicotine's pyrrolidine nitrogen).
   Share free f = 1/(1 + 10^(pKa − pH)). Only the uncharged form crosses the fatty lining of the gums easily, so in this model the crossing rate ∝ f.
   Mallock et al., Tobacco Control 2024: 44 pouches, median pH 8.8, median 86% free-base. Stanfill et al., Nicotine Tob Res 2021: 37 brands,
   free nicotine 0.17 to 6.07 mg per pouch. Zyn lists sodium carbonate and sodium bicarbonate as pH adjusters. */
const PKA=8.02;
const fr=pH=>1/(1+Math.pow(10,PKA-pH));
const ratio=pH=>Math.pow(10,pH-PKA);
const MG=sim=>atLeast('honors')?sim.p.mg:6;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const p1=v=>(Math.round(v*1000)/10).toFixed(1)+'%';
const n2=v=>(Math.round(v*100)/100).toString();
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fLine(sim){const pH=sim.p.pH;return `free share = 1 ÷ (1 + 10^(${PKA} − ${n2(pH)})) = 1 ÷ (1 + ${n2(Math.pow(10,PKA-pH))}) = ${p1(fr(pH))}`;}
const TOP=40,MEM=268,MEMH=18,BOT=436;
function mk(sim){const R=rng(7),P=[];for(let i=0;i<70;i++)P.push({x:40+R()*720,y:TOP+12+R()*(MEM-TOP-30),free:R()<fr(sim.p.pH),side:0,vx:0,vy:0,ph:R()*6});return P;}

const SIM={
 id:'freebase',hash:'freebase',apUnit:7,order:2,tab:'Why baking soda? Free-base nicotine',kind:'Simulation',prereq:['hooked'],next:['flavors'],
 skills:{bio:'Percents and powers of 10 · Chemistry (acids and bases), Biology (cell membranes), Health (Unit 7)',honors:'pH, pKa and the Henderson–Hasselbalch equation · Honors Chemistry (acids and bases), Biology (cell membranes)',ap:'Logarithms: log(free ÷ charged) = pH − pKa · AP Chemistry (Unit 8), AP Biology (Unit 2), AP Precalculus (Unit 2B)'},
 card:'Slide the pH of a pouch and watch nicotine molecules switch forms and slip through the gum lining. Find out why the ingredients list includes baking soda.',
 title:'Why is there baking soda in a nicotine pouch?',
 lede:{bio:'Nicotine comes in two forms. The charged form (blue, with a +) has trouble getting through the fatty lining of your gums. The free form (orange) slips right through into your blood. Which form wins depends on pH, and pouch makers add pH adjusters like baking soda to push it toward the free form.',
  honors:'Nicotine is a weak base. In acid, its nitrogen picks up an H⁺ and becomes charged (NicH⁺). Charged molecules dissolve in water but cross lipid membranes poorly. The Henderson–Hasselbalch equation gives the split: free ÷ charged = 10^(pH − pKa), with pKa ≈ 8.02 for nicotine.',
  ap:'Each pH unit multiplies the free-to-charged ratio by 10. At pH = pKa the split is 50/50. A lab study of 44 pouches found a median pH of 8.8 and a median of 86% free-base nicotine (Mallock et al., Tobacco Control, 2024).'},
 scale:'Inside your mouth, between a pouch and your gum, enlarged about 10 million times. Each dot is one nicotine molecule (real ones are under 1 nm across). Bottom: a tiny blood vessel under the gum lining.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'The pouch',
 controls:[
  {id:'guess',label:'Your gut: share of the nicotine in the free form at this pH',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'pH',label:'pH next to the pouch',type:'range',min:5,max:10,step:0.1,def:8.8,noGut:true,onChange:clearGut,help:'Saliva is around pH 7. Pouches with pH adjusters (like sodium carbonate and sodium bicarbonate, which is baking soda) raise it. A study of 44 pouches found a median of pH 8.8.'},
  {id:'mg',label:'Nicotine on the label',type:'seg',def:6,lvl:'honors',noGut:true,onChange:clearGut,options:[{v:3,l:'3 mg'},{v:6,l:'6 mg'},{v:9,l:'9 mg'},{v:15,l:'15 mg'}],help:'Common US strengths are 3 and 6 mg; some brands sell much stronger pouches.'},
  {id:'reveal',label:'Show the forms now',type:'toggle',def:false,noGut:true,help:'Normally the colors appear once you lock in your gut answer.'}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(sim){return {P:mk(sim),crossed:0,rate:0,acc:0,win:0};},
 step(){},
 upd(sim,dt){const S=sim.st,f=fr(sim.p.pH),R=Math.random;dt=Math.min(dt,0.05);
  S.P.forEach(m=>{if(m.side===0){/* switch forms toward the equilibrium share */const k=2.2;if(m.free){if(R()<k*(1-f)*dt)m.free=false;}else if(R()<k*f*dt)m.free=true;
    m.vx+=(R()-.5)*600*dt;m.vy+=(R()-.5)*600*dt+260*dt;m.vx*=.9;m.vy*=.9;m.x+=m.vx*dt;m.y+=m.vy*dt;
    if(m.x<30){m.x=30;m.vx*=-1;}if(m.x>770){m.x=770;m.vx*=-1;}if(m.y<TOP+8){m.y=TOP+8;m.vy=Math.abs(m.vy);}
    if(m.y>MEM-10){if(m.free&&R()<0.9){m.side=1;m.y=MEM+MEMH+8;m.vy=30+R()*60;S.win++;}else{m.y=MEM-10;m.vy=-Math.abs(m.vy)-20;}}}
   else{m.x+=90*dt;m.y+=m.vy*dt;m.vy*=.97;if(m.y<MEM+MEMH+6)m.y=MEM+MEMH+6;if(m.y>BOT-8)m.y=BOT-8;if(m.x>770){m.side=0;m.x=40+R()*720;m.y=TOP+10;m.free=R()<f;}}});
  S.acc+=dt;if(S.acc>=1){S.rate=S.rate*0.4+0.6*(S.win/S.acc);S.win=0;S.acc=0;}},
 metrics:[
  {id:'free',label:'Nicotine in the free (easily absorbed) form',unit:'%',d:1,min:0,max:100,get:sim=>hid(sim,100*fr(sim.p.pH))},
  {id:'fmg',label:'Free nicotine in this pouch',unit:'mg',d:2,min:0,max:null,lvl:'honors',get:sim=>hid(sim,MG(sim)*fr(sim.p.pH))},
  {id:'ratio',label:'Free molecules for every 1 charged one',unit:'',d:2,min:0,max:null,lvl:'honors',get:sim=>hid(sim,ratio(sim.p.pH))},
  {id:'vs7',label:'Absorbed this many times faster than at pH 7 (model)',unit:'×',d:1,min:0,max:null,get:sim=>hid(sim,fr(sim.p.pH)/fr(7))}
 ],
 draw(sim,ctx,vdt,k,t){if(vdt>0)SIM.upd(sim,Math.min(vdt,0.05));const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),big=k>1.3,pH=sim.p.pH,f=fr(pH);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* saliva layer */ctx.fillStyle='#8ecae6';ctx.globalAlpha=.18;ctx.fillRect(0,TOP,800,MEM-TOP);ctx.globalAlpha=1;
  txt(ctx,'Saliva and pouch side',12,TOP-12,{s:13*k,w:700,c:PAL['cv-soft']});
  /* membrane: lipid bilayer */const hl=stg===2;ctx.fillStyle='#e9c46a';ctx.globalAlpha=hl?.9:.6;ctx.fillRect(0,MEM,800,MEMH);ctx.globalAlpha=1;
  for(let x=4;x<800;x+=10){ctx.fillStyle='#d4a017';ctx.beginPath();ctx.arc(x,MEM+2,3,0,7);ctx.arc(x,MEM+MEMH-2,3,0,7);ctx.fill();}
  if(hl){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.strokeRect(2,MEM-3,796,MEMH+6);}
  txt(ctx,big?'Gum lining (fatty)':'Gum lining: a fatty (lipid) layer',788,MEM-6,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});
  /* blood */ctx.fillStyle='#e63946';ctx.globalAlpha=.12;ctx.fillRect(0,MEM+MEMH,800,BOT-MEM-MEMH);ctx.globalAlpha=1;
  txt(ctx,'Blood vessel → to the brain in seconds',12,BOT-6,{s:12*k,w:700,c:PAL['rj']});
  const col=sh||stg<99;
  sim.st.P.forEach(m=>{const fc=!col?'#9aa0a6':m.free?'#f4a261':'#3a6fd8';ctx.fillStyle=fc;ctx.beginPath();ctx.arc(m.x,m.y,7,0,7);ctx.fill();
   if(col&&!m.free){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x-3.5,m.y);ctx.lineTo(m.x+3.5,m.y);ctx.moveTo(m.x,m.y-3.5);ctx.lineTo(m.x,m.y+3.5);ctx.stroke();}});
  /* the pH strip */
  const sx=430,sw=330,sy=TOP+14;rr(ctx,sx-8,sy-16,sw+16,58,10);ctx.fillStyle=PAL['card'];ctx.globalAlpha=.92;ctx.fill();ctx.globalAlpha=1;
  const grd=ctx.createLinearGradient(sx,0,sx+sw,0);grd.addColorStop(0,'#e76f51');grd.addColorStop(.5,'#2a9d8f');grd.addColorStop(1,'#5e60ce');ctx.fillStyle=grd;rr(ctx,sx,sy,sw,12,6);ctx.fill();
  const PX=v=>sx+(v-5)/5*sw;[5,6,7,8,9,10].forEach(v=>txt(ctx,String(v),PX(v),sy+28*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(PX(pH),sy-2);ctx.lineTo(PX(pH)-7,sy-12);ctx.lineTo(PX(pH)+7,sy-12);ctx.closePath();ctx.fill();
  txt(ctx,'pH '+pH.toFixed(1),PX(pH)+(pH>8.6?-10:10),sy-4,{s:13*k,w:700,a:pH>8.6?'right':'left'});
  if(atLeast('honors')||stg>=5&&stg<99){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(PX(PKA),sy-6);ctx.lineTo(PX(PKA),sy+16);ctx.stroke();ctx.setLineDash([]);}
  /* share bar */
  if(col){const bx=24,by=TOP+16,bw=big?220:300;rr(ctx,bx-8,by-16,bw+16,58,10);ctx.fillStyle=PAL['card'];ctx.globalAlpha=.92;ctx.fill();ctx.globalAlpha=1;
   ctx.fillStyle='#f4a261';ctx.fillRect(bx,by,bw*f,14);ctx.fillStyle='#3a6fd8';ctx.fillRect(bx+bw*f,by,bw*(1-f),14);
   txt(ctx,'Free '+p1(f),bx,by+32*k,{s:13*k,w:700,c:'#e76f51'});txt(ctx,'Charged '+p1(1-f),bx+bw,by+32*k,{s:13*k,w:700,c:'#3a6fd8',a:'right'});}
  else pill(ctx,big?'Lock in your gut answer':'Lock in your gut answer to see which form each molecule is in',big?220:220,big?TOP+120:TOP+30,PAL['muted'],'#fff',12.5*Math.min(k,1.3));
  const G=stg>=99?GS(sim):null;if(G){pill(ctx,'Your gut: '+G.guess+'% free',150,MEM-26,PAL['s4'],'#fff',13*Math.min(k,1.4));}
  if(col&&(stg>=99||stg>=3)){const r=sim.st.rate;pill(ctx,'Crossing into the blood: '+r.toFixed(1)+' molecules/s',big?560:600,BOT-20,'#c1121f','#fff',13*Math.min(k,1.4));}
  if(stg===4||stg===5){pill(ctx,stg===4?'Add sodium carbonate and bicarbonate: pH goes up':'Each pH unit = 10× more free for every charged',400,MEM-30,PAL['rj'],'#fff',13*Math.min(k,1.4));}},
 narrate(sim){const pH=sim.p.pH,f=fr(pH);
  if(!shown(sim))return `The pH next to this pouch is ${pH.toFixed(1)}. Nicotine’s switch point (pKa) is about 8. <b>What share of the nicotine do you think is in the free form that slips through the gums?</b>`;
  return `At pH ${pH.toFixed(1)}, <b>${p1(f)}</b> of the nicotine is free and ${p1(1-f)} is charged. `+(pH<PKA?'Below the switch point, most molecules carry an H⁺ and bounce off the fatty gum lining.':'Above the switch point, most molecules have lost their H⁺ and cross the gum lining into the blood.')+` That is ${(f/fr(7)).toFixed(1)} times the free share at pH 7.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: a pouch with a pH of 8.8, the median for pouches tested in one lab study. The gray dots are nicotine. Drag the slider to the share you think is in the free form, then lock it in.',
   honors:'Before the colors appear: drag the slider to the share of the nicotine in the free form at this pH, then lock it in.'},
  lock(sim){const a=100*fr(sim.p.pH);return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:sim.p.guess+'% free'};},
  solve(sim){const a=100*fr(sim.p.pH);return {v:0,guess:a,label:a.toFixed(1)+'% free'};},
  hint:{bio:'Lock in your gut answer. Then you will work it out from the ratio of free to charged molecules.'},
  calc:{unit:'%',d:1,tol:a=>1,
   prompt:{bio:sim=>{const r=ratio(sim.p.pH);return `At pH <b>${sim.p.pH.toFixed(1)}</b> there are <b>${n2(r)}</b> free nicotine molecules for every <b>1</b> charged one. What percent of the molecules are free?`;},
    honors:sim=>`Use free ÷ charged = 10^(pH − pKa), with pH = ${sim.p.pH.toFixed(1)} and pKa = ${PKA}. What percent of the nicotine is free?`},
   answer:sim=>100*fr(sim.p.pH),
   hint:'If there are r free for every 1 charged, the free share is r ÷ (r + 1). Then multiply by 100.',
   steps(sim){const pH=sim.p.pH,r=ratio(pH);return [`Free ÷ charged = 10^(${pH.toFixed(1)} − ${PKA}) = 10^${n2(pH-PKA)} = ${n2(r)}.`,`Out of every ${n2(r+1)} molecules, ${n2(r)} are free: ${n2(r)} ÷ ${n2(r+1)} = ${n2(r/(r+1))}.`,`That is <b>${p1(fr(pH))}</b> free.`];}},
  formula:fLine,
  how:{bio:'Find how many free molecules there are for each charged one, then free ÷ (free + charged).',ap:'f = 1/(1 + 10^(pKa − pH)).'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);const tail=` At saliva’s pH of about 7, it would be only ${p1(fr(7))}.`;
   if(off<3)return `Your gut was right on: about <b>${m.guess.toFixed(0)}%</b> is free.`+tail;
   return `Your gut was off by <b>${off.toFixed(0)} points</b>. ${g.guess<m.guess?'You guessed low: one pH unit above the switch point already means about 10 free for every 1 charged.':'You guessed high: below the switch point, most molecules stay charged.'} The model says <b>${m.guess.toFixed(1)}%</b>.`+tail;},
  again(sim){sim.p.pH=Math.round((6.5+Math.random()*3)*10)/10;sim.p.guess=50;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which form of nicotine crosses the fatty lining of your gums easily?',choices:['The charged form (with H⁺)','The free (uncharged) form','Both equally'],correct:1,explain:'Fatty membranes block charged particles. The free form has no charge, so it dissolves into the lipid layer and passes through.'},
  {lvl:'bio',kind:'num',q:'At pH 9.0 there are about 9.5 free molecules for every 1 charged one. What percent are free?',answer:90.5,tol:1,unit:'%',d:1,hint:'free ÷ (free + charged) = 9.5 ÷ 10.5',explain:'9.5 ÷ 10.5 ≈ 0.905, about 90% free.'},
  {lvl:'bio',instant:true,q:'A pouch’s ingredients include sodium carbonate and sodium bicarbonate. What do they do to the nicotine?',choices:['Add flavor','Raise the pH so more nicotine is in the free form','Lower the nicotine dose'],correct:1,explain:'Both are bases. Raising the pH pulls the H⁺ off nicotine, so more of it is free and absorbed through the gums.'},
  {lvl:'honors',instant:true,q:'At pH = pKa (about 8), what share of the nicotine is free?',choices:['0%','50%','100%','It depends on the dose'],correct:1,explain:'At pH = pKa, 10^(pH − pKa) = 10⁰ = 1: one free for every charged, so 50%.'},
  {lvl:'honors',kind:'num',q:'A 6 mg pouch has pH 8.8 (86% free). How many mg of free nicotine is that?',answer:5.16,tol:0.1,unit:'mg',d:2,hint:'6 × 0.86',explain:'6 × 0.86 ≈ 5.2 mg. The CDC lab study of 37 brands found free nicotine from 0.17 to 6.07 mg per pouch: the label’s mg is not the whole story.'},
  {lvl:'ap',instant:true,q:'Raising pH from 7.8 to 8.8 multiplies the free-to-charged ratio by:',choices:['1.1','2','10','100'],correct:2,explain:'Ratio = 10^(pH − pKa), so one pH unit multiplies it by 10. The free share goes from about 38% to 86%.'},
  {lvl:'ap',instant:true,q:'Vapes like JUUL use nicotine salts (nicotine plus an acid). Why would a maker want the charged form for something inhaled?',choices:['It cannot be absorbed at all','Charged nicotine is less harsh on the throat, so a high dose is easier to inhale; the lungs still absorb it fast','Acids remove the nicotine'],correct:1,explain:'Free-base nicotine irritates the throat. Protonated salts are smoother, which allowed high-nicotine pods. In the lungs, the huge surface area still delivers nicotine quickly.'}
 ],
 tour:[
  {title:'Two forms of nicotine',text:'Every nicotine molecule here is either charged (blue, with a +) because it picked up an H⁺, or free (orange) with no charge. Molecules switch back and forth all the time; pH decides how many are in each form. At pH 7, like saliva, most are charged.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{pH:7});}},
  {title:'The gum lining is fatty',text:'The yellow layer is the gum lining, built from lipids (fats). Charged molecules dissolve in water but not in fat, so they bounce off. Free molecules slip through into the blood vessel below.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'At saliva’s pH: slow',text:'At pH 7 only about 9% of the nicotine is free. Watch how few molecules cross into the blood each second.',pause:true,speed:0.5,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{pH:7});}},
  {title:'Add a base',text:'Pouches list “pH adjusters”: sodium carbonate and sodium bicarbonate (baking soda). They are bases, so they pull H⁺ off the nicotine. At pH 8.8, the median in one study of 44 pouches, 86% is free. Watch the colors flip and the crossing rate jump.',pause:true,speed:0.5,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{pH:8.8});}},
  {title:'A log scale',text:'pH is a logarithm. Each pH unit above the switch point (about 8.0) means 10 times more free molecules for every charged one: 1 to 1 at pH 8.0, about 6 to 1 at 8.8, about 10 to 1 at 9.0.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{pH:9});}},
  {lvl:'honors',title:'The label is not the whole story',text:'A CDC lab study of 37 pouch brands found the free nicotine ranged from 0.17 to 6.07 mg per pouch. Two pouches with the same mg on the label can deliver very different amounts, depending on pH.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{pH:8.8,mg:6});}},
  {lvl:'ap',title:'Vapes went the other way',text:'For vapes, makers did the opposite: they added acid to make nicotine salts. The charged form is smoother on the throat, so pods could carry far more nicotine without the harshness. Same chemistry, tuned for a different way into the body.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{pH:6});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does pH change how much nicotine gets through?</p><ol><li>Set the pH to 6, 7, 8, 9 and 10. Each time, write down the free share and watch the crossing rate.</li><li>Find the pH where the share is closest to 50%.</li></ol><p>Write one sentence: why would a company add a base to a nicotine product?</p>',
  honors:'<p><b>Question:</b> How much free nicotine is in a pouch?</p><ol><li>For pH 7.5, 8.0, 8.5, 9.0 and 9.5, compute the free share with Henderson–Hasselbalch, then check the tool.</li><li>Compute the free mg for a 3 mg and a 6 mg pouch at each pH.</li></ol><p>Explain, using charge and the lipid membrane, why a 3 mg pouch at pH 9.5 can deliver more free nicotine than a 6 mg pouch at pH 7.</p>',
  ap:'<p><b>Question:</b> How sensitive is absorption to pH?</p><ol><li>Derive f = 1/(1 + 10^(pKa − pH)) from Henderson–Hasselbalch.</li><li>Find df/dpH at pH = pKa. Where is the free share most sensitive to pH?</li></ol><p><b>CER:</b> Claim why pouch makers and vape makers moved pH in opposite directions, with evidence from the tool and reasoning from acid-base chemistry.</p>'},
 terms:[
  {t:'pH',d:'A scale for how acidic or basic a solution is. Below 7 is acidic, above 7 basic. Each unit is a factor of 10.'},
  {t:'Free-base nicotine',d:'Nicotine with no extra H⁺, so it has no charge. It crosses fatty membranes easily.'},
  {t:'Charged (protonated) nicotine',d:'Nicotine that has picked up an H⁺ (NicH⁺). It dissolves in water but crosses fatty membranes poorly.'},
  {t:'Lipid membrane',d:'A layer made of fats. Cell membranes and the lining of your mouth are lipid layers.'},
  {t:'pKa',d:'The pH at which a molecule is half in each form. About 8.0 for the nitrogen in nicotine that matters here.',lvl:'honors'},
  {t:'Henderson–Hasselbalch equation',d:'pH = pKa + log(free ÷ charged), for a weak base like nicotine.',lvl:'honors'},
  {t:'Nicotine salt',d:'Nicotine paired with an acid, so it is mostly charged. Used in pod vapes because it is smoother to inhale.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The free share is f = 1/(1 + 10^(pKa − pH)) with pKa = 8.02, the value used for nicotine’s pyrrolidine nitrogen in the CDC’s pouch study. Molecules switch forms at random so that, on average, a share f is free. Only free molecules cross the gum lining, so the crossing rate is proportional to f. Real absorption also depends on how fast nicotine leaves the pouch, saliva flow, the pouch’s moisture and how long it stays in.</p><p><b>Sources.</b> Mallock et al., “Levels of nicotine and tobacco-specific nitrosamines in oral nicotine pouches,” <i>Tobacco Control</i>, 2024: 44 products, median pH 8.8, median 86% free-base. Stanfill et al., “Characterization of total and unprotonated (free) nicotine content of nicotine pouch products,” <i>Nicotine &amp; Tobacco Research</i>, 2021: 37 brands, free nicotine 0.17 to 6.07 mg per pouch, 36 of 37 flavored. Zyn’s ingredient list names sodium carbonate and sodium bicarbonate as pH adjusters. On vapes: Duell, Pankow and Peyton (<i>Chemical Research in Toxicology</i>, 2018) found the nicotine in JUUL liquids mostly in the charged, salt form.</p><p><b>History.</b> In 2006, in <i>United States v. Philip Morris</i>, a federal judge found that the major cigarette companies had falsely denied manipulating the nicotine their products deliver. Controlling the chemistry of nicotine delivery is not new.</p>'
};
BioLab.register(SIM);
})();

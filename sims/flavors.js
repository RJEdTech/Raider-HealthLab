(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* Flavors and youth nicotine pouch use.
   Monitoring the Future 2025 (Sanchez et al., Tobacco Control 2026): 472 8th, 10th and 12th graders who had ever used pouches.
   Flavor used most often: non-tobacco 97.0% (mint 58.6%, fruit 16.0%), original/unflavored 3.0%; ZYN the brand for 79.7%.
   NYTS 2025 (Campaign for Tobacco-Free Kids fact sheet): among current youth pouch users, flavors used (more than one allowed): mint 60.9%, fruit 25.0%, menthol 18.1%; over 90% non-tobacco.
   Cooling: Jabba et al., Tobacco Control 2025: Zyn Chill ("Flavor-Ban Approved") contained WS-3, a synthetic cooling agent, about 234 µg per pouch; it activated the cold receptor TRPM8. */
const MTF=[{k:'mint',l:'Mint',n:59,c:'#2a9d8f'},{k:'fruit',l:'Fruit',n:16,c:'#e76f51'},{k:'other',l:'Other flavors (citrus, coffee, cinnamon…)',n:22,c:'#9b5de5'},{k:'orig',l:'Original or unflavored',n:3,c:'#8d6e63'}];
const NYTS=[{l:'Mint',v:60.9,c:'#2a9d8f'},{l:'Fruit',v:25.0,c:'#e76f51'},{l:'Menthol',v:18.1,c:'#4f8fd1'}];
const ANS=97;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const n1=v=>(Math.round(v*10)/10).toString();
const school=sim=>atLeast('honors')?sim.p.school:1600;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const calcAns=sim=>atLeast('honors')?school(sim)*0.023*0.97:472*0.97;
/* which icons are colored in walkthrough stage s */
function colorOf(i,stg){let acc=0;for(let j=0;j<MTF.length;j++){const g=MTF[j];if(i<acc+g.n){const on=stg>=99||(stg>=2&&j===0)||(stg>=3&&j<=2)||(stg>=4);return on?g:null;}acc+=g.n;}return null;}

const SIM={
 id:'flavors',hash:'flavors',apUnit:7,order:3,tab:'Why mint? Flavors and teens',kind:'Learning tool',prereq:['freebase'],next:['zynviral'],
 skills:{bio:'Percent of a number; reading a 10 × 10 grid · Health (Unit 7), Chemistry, Biology (senses)',honors:'Percents of percents; why survey shares can add to more than 100% · Algebra 1, Statistics, Health (Unit 7)',ap:'Comparing surveys: “most often” vs. “any use” questions · AP Statistics (Unit 3), AP Biology (Unit 4: cell signaling)'},
 card:'Guess how many of 100 teens who use pouches pick a flavor, see the chemistry of a cooling agent, and weigh what each side says about flavors.',
 title:'Why mint? Flavors and teen nicotine use',
 lede:{bio:'Almost every teen who uses nicotine pouches uses a flavored one, and mint is far ahead. Flavors are not just taste: cooling ingredients act on a cold sensor in your mouth and make nicotine feel less harsh, which makes the first tries easier.',
  honors:'Cooling flavors like menthol and synthetic agents like WS-3 switch on TRPM8, the same receptor that senses cold. Nicotine triggers TRPA1, a receptor for irritation. A cool signal makes the irritation less noticeable. The FDA has said menthol’s cooling makes tobacco easier to start.',
  ap:'Two national surveys ask about flavors in different ways. One asks which flavor you use most often (one answer each, so shares add to 100%). The other asks which flavors you used at all (several answers each, so shares can add to more than 100%).'},
 scale:'Left: 100 teens who have ever used nicotine pouches, scaled from a national survey of 472 students (Monitoring the Future, 2025). Right: one nerve ending in the lining of the mouth, about 1 µm across, drawn huge.',
 aspect:16/9,timeless:true,animated:true,trials:false,graph:false,
 controlsTitle:'What to show',
 controls:[
  {id:'guess',label:'Your gut: of 100 teens who use pouches, how many use a flavor most often (not original or tobacco)?',type:'range',min:0,max:100,step:1,def:50,unit:' teens'},
  {id:'cool',label:'In the pouch',type:'seg',def:'mint',noGut:true,options:[{v:'none',l:'No cooling'},{v:'mint',l:'Mint flavor'},{v:'ws3',l:'WS-3 only (“Chill”)'}],help:'WS-3 is an odorless synthetic cooling agent. A lab found it in Zyn Chill, which was sold as “Flavor-Ban Approved.”'},
  {id:'survey',label:'Survey',type:'seg',def:'mtf',lvl:'honors',noGut:true,options:[{v:'mtf',l:'Flavor used most often (MTF)'},{v:'nyts',l:'Flavors used at all (NYTS)'}]},
  {id:'school',label:'Students in a school',type:'range',min:400,max:3000,step:100,def:1600,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the survey now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'flav',label:'Teens (of 100) who use a flavor most often',unit:'',d:0,min:0,max:100,get:sim=>hid(sim,ANS)},
  {id:'mint',label:'Teens (of 100) who use mint most often',unit:'',d:0,min:0,max:100,get:sim=>hid(sim,59)},
  {id:'sch',label:'Students in this school who use flavored pouches (if it matches the national 2.3% of high schoolers)',unit:'',d:0,min:0,max:null,lvl:'honors',get:sim=>hid(sim,school(sim)*0.023*0.97)}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),big=k>1.3;
  if(sim._t0==null)sim._t0=t;const tau=t-sim._t0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const nyts=atLeast('honors')&&sim.p.survey==='nyts'&&stg>=99;
  /* ---- left: the 100 teens ---- */
  const L=20,Tt=50,cell=30;
  txt(ctx,nyts?'Flavors used in the past 30 days (NYTS 2025)':'100 teens who have used pouches',L,30,{s:14*k,w:700});
  if(!nyts){for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=L+c*cell+cell/2,y=Tt+r*cell+cell/2;
    const g=(sh||stg<99)?colorOf(i,stg):null;ctx.fillStyle=g?g.c:'#b0b5ba';
    ctx.beginPath();ctx.arc(x,y-6,6,0,7);ctx.fill();rr(ctx,x-8,y+1,16,12,5);ctx.fill();
    if(stg===4&&g&&g.k==='orig'){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(x-cell/2+2,y-cell/2+1,cell-4,cell-2);}}
   if(sh||stg<99){MTF.forEach((g,j)=>{const on=stg>=99||(stg>=2&&j===0)||(stg>=3&&j<=2)||stg>=4;if(!on)return;const y=Tt+10*cell+18+(j%2)*18*Math.min(k,1.3),x=L+(j<2?0:150);ctx.fillStyle=g.c;ctx.fillRect(x,y-9,12,12);txt(ctx,g.l.split(' (')[0]+': '+g.n,x+18,y+2,{s:12*k,w:700,c:PAL['cv-ink']});});}
   else pill(ctx,'Lock in your gut answer to color them in',L+5*cell,Tt+5*cell,PAL['muted'],'#fff',13*Math.min(k,1.4));
   const G=stg>=99?GS(sim):null;if(G){const gi=Math.round(G.guess);const r=Math.floor(gi/10),c=gi%10;txt(ctx,'Your gut: '+gi+' of 100',L,Tt+10*cell+58*Math.min(k,1.3),{s:13*k,w:700,c:PAL['s4']});}}
  else{const bw=330,bx=L+80;NYTS.forEach((d,i)=>{const y=Tt+20+i*70;txt(ctx,d.l,L,y+20,{s:14*k,w:700});ctx.fillStyle=PAL['line'];ctx.fillRect(bx,y,bw,30);ctx.fillStyle=d.c;ctx.fillRect(bx,y,bw*d.v/100,30);txt(ctx,d.v+'%',bx+bw*d.v/100+6,y+21,{s:14*k,w:700});});
   const sum=NYTS.reduce((s,d)=>s+d.v,0);txt(ctx,'These add to '+n1(sum)+'% and leave out other flavors:',L,Tt+250,{s:13*k,w:700,c:PAL['rj']});txt(ctx,'students could pick more than one.',L,Tt+268,{s:13*k,w:700,c:PAL['rj']});}
  /* ---- right: the nerve ending ---- */
  const showR=stg>=5||stg>=99;if(!showR)return;
  const X0=440,W=350,Y0=40;rr(ctx,X0,Y0,W,390,14);ctx.fillStyle=PAL['cv-bg2'];ctx.fill();
  txt(ctx,'A nerve ending in your mouth',X0+12,Y0+22,{s:13*k,w:700});
  const cool=stg===6?'ws3':(stg===5?(tau%8<4?'none':'mint'):sim.p.cool);
  /* membrane with two receptor types */
  const my=Y0+150;ctx.fillStyle='#e9c46a';ctx.globalAlpha=.6;ctx.fillRect(X0+10,my-6,W-20,12);ctx.globalAlpha=1;
  const A=[X0+70,X0+190],M=[X0+130,X0+260];
  A.forEach(x=>{ctx.fillStyle='#d62828';rr(ctx,x-10,my-18,20,36,6);ctx.fill();});M.forEach(x=>{ctx.fillStyle='#219ebc';rr(ctx,x-10,my-18,20,36,6);ctx.fill();});
  if(!big){txt(ctx,'TRPA1: irritation sensor',X0+16,my+40,{s:12*k,c:'#d62828',w:700});txt(ctx,'TRPM8: cold sensor',X0+W-16,my+40,{s:12*k,c:'#219ebc',w:700,a:'right'});}
  /* molecules arriving */
  for(let i=0;i<6;i++){const ph=((t*0.5+i/6)%1);const x=A[i%2]+(i%3-1)*14,y=Y0+40+ph*(my-Y0-62);ctx.fillStyle='#e63946';ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill();}
  if(cool!=='none')for(let i=0;i<6;i++){const ph=((t*0.5+i/6+0.3)%1);const x=M[i%2]+(i%3-1)*14,y=Y0+40+ph*(my-Y0-62);ctx.fillStyle=cool==='ws3'?'#023e8a':'#48cae4';ctx.beginPath();ctx.arc(x,y,5,0,7);ctx.fill();}
  txt(ctx,'● nicotine',X0+16,Y0+44,{s:12*k,c:'#e63946',w:700});if(cool!=='none')txt(ctx,cool==='ws3'?'● WS-3 (cooling agent)':'● menthol and mint',X0+W-16,Y0+44,{s:12*k,c:cool==='ws3'?'#023e8a':'#219ebc',w:700,a:'right'});
  /* signals up the nerve to the brain */
  const coolStr=cool==='none'?0:cool==='ws3'?1:0.75,irr=cool==='none'?1:cool==='ws3'?0.45:0.6;
  for(let i=0;i<4;i++){const ph=((t*0.9+i/4)%1),y=my+30+ph*150;ctx.globalAlpha=irr*(1-ph*0.6);ctx.fillStyle='#d62828';rr(ctx,X0+90-6,y,12,18,5);ctx.fill();
   if(coolStr>0){ctx.globalAlpha=coolStr*(1-ph*0.6);ctx.fillStyle='#219ebc';rr(ctx,X0+240-6,y,12,18,5);ctx.fill();}ctx.globalAlpha=1;}
  const lab=cool==='none'?'Brain reads: harsh, burning':cool==='ws3'?'Brain reads: cool, smooth':'Brain reads: minty, less harsh';
  pill(ctx,lab,X0+W/2,Y0+352,cool==='none'?'#d62828':'#219ebc','#fff',13*Math.min(k,1.4));
  if(stg===8){const st=[['Mint + nicotine → dopamine',0],['Repeat 100s of times',2.5],['Mint alone → wanting',5]];st.forEach(([l,d],i)=>{if(tau>d){ctx.globalAlpha=Math.min(1,(tau-d)*1.5);pill(ctx,l,X0+W/2,Y0+90+i*34,i===2?'#7b2cbf':'#219ebc','#fff',13*Math.min(k,1.4));ctx.globalAlpha=1;}});}
  if(stg===6)pill(ctx,'Sold as “Flavor-Ban Approved”',X0+W/2,Y0+80,PAL['rj'],'#fff',13*Math.min(k,1.4));
  txt(ctx,'Diagram, not to scale or measured',X0+W-12,Y0+390-6,{s:11*k,c:PAL['cv-soft'],a:'right'});},
 narrate(sim){if(!shown(sim))return 'A national survey asked 472 students who had used nicotine pouches which flavor they use most often. <b>Out of 100 of them, how many do you think pick a flavor rather than original or tobacco?</b>';
  const c=sim.p.cool;return `<b>97 of 100</b> use a flavor most often, and 59 of 100 use mint. `+(c==='none'?'With no cooling ingredient, nicotine alone sets off the irritation sensor: harsh.':c==='ws3'?'WS-3 has no smell or taste of its own, yet it switches on the cold sensor strongly, so the pouch feels cool and smooth.':'Mint’s cooling switches on the cold sensor, which makes the irritation from nicotine less noticeable.');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: 100 teens who have used nicotine pouches, still gray. Drag the slider to how many of the 100 you think use a flavor most often (not original or tobacco), then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-ANS),guess:sim.p.guess,label:sim.p.guess+' of 100'};},
  solve(sim){return {v:0,guess:ANS,label:'97 of 100'};},
  hint:{bio:'Lock in your gut answer. Then you will use the survey’s percent to count real students.'},
  calc:{unit:'students',d:0,tol:a=>1,
   prompt:{bio:'The survey had <b>472</b> students who had used pouches. <b>97.0%</b> of them used a non-tobacco flavor most often. How many students is that?',
    honors:sim=>`A school has <b>${school(sim).toLocaleString('en-US')}</b> students. Suppose <b>2.3%</b> use nicotine pouches (the national rate for high schoolers in 2025) and <b>97%</b> of those use flavors. How many students use flavored pouches?`},
   answer:calcAns,
   hint:'Percent of a number: change the percent to a decimal and multiply. For a percent of a percent, multiply twice.',
   steps(sim){if(atLeast('honors')){const n=school(sim),a=n*0.023,b=a*0.97;return [`Pouch users: ${n.toLocaleString('en-US')} × 0.023 = ${n1(a)}.`,`Flavored: ${n1(a)} × 0.97 = ${n1(b)}, about <b>${Math.round(b)} students</b>.`,`In one step: ${n.toLocaleString('en-US')} × 0.023 × 0.97 = ${n1(b)}.`];}
    return ['97.0% = 0.970.','472 × 0.970 = 457.84, about <b>458 students</b>.','Only about 14 of the 472 used original or tobacco flavor most often.'];}},
  formula:sim=>atLeast('honors')?`${school(sim).toLocaleString('en-US')} × 0.023 × 0.97 = ${n1(calcAns(sim))} students`:'472 × 0.970 = 457.84 ≈ 458 students',
  how:{bio:'Turn the percent into a decimal and multiply by the number of students.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);if(off<=3)return 'Your gut was right on: <b>97 of 100</b>. Original flavor is rare among teens who use pouches.';
   return `Your gut was off by <b>${off}</b> teens. ${g.guess<m.guess?'You guessed low: flavors are close to universal among teens who use pouches.':'You guessed high.'} The survey says <b>97 of 100</b>, and 59 of 100 use mint most often.`;},
  again(sim){sim.p.school=400+100*Math.floor(Math.random()*27);sim.p.guess=50;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which flavor do the most teen pouch users use most often?',choices:['Fruit','Mint','Original','Coffee'],correct:1,explain:'Mint: 58.6% in Monitoring the Future 2025, far ahead of fruit at 16.0%.'},
  {lvl:'bio',instant:true,q:'WS-3 has almost no smell or taste. Why would it be in a pouch?',choices:['To lower the nicotine','It switches on the cold sensor, so the pouch feels cool and less harsh','To make the pouch last longer'],correct:1,explain:'WS-3 is a cooling agent: it activates TRPM8, the cold receptor. A lab found it in Zyn Chill, which was sold as “Flavor-Ban Approved.”'},
  {lvl:'bio',kind:'num',q:'Of 200 teens who use pouches, about how many use mint most often (58.6%)?',answer:117,tol:1.5,unit:'teens',d:0,hint:'200 × 0.586',explain:'200 × 0.586 = 117.2, about 117 teens.'},
  {lvl:'honors',instant:true,q:'In one survey, 60.9% of teen pouch users used mint, 25.0% fruit and 18.1% menthol. Those add to more than 100%. Why?',choices:['A math error','Students could check more than one flavor','Some students were counted twice by mistake'],correct:1,explain:'That question asked which flavors students used at all, so one student can count in several groups. “Most often” questions allow one answer, so they add to 100%.'},
  {lvl:'honors',kind:'num',q:'A school of 2,000 students. If 2.3% use pouches and 97% of them use flavors, how many students is that?',answer:44.6,tol:1,unit:'students',d:0,hint:'2,000 × 0.023 × 0.97',explain:'2,000 × 0.023 = 46 users; 46 × 0.97 ≈ 45 using flavors. Survey rates are averages: a real school can be higher or lower.'},
  {lvl:'ap',instant:true,q:'The FDA authorized flavored Zyn in 2025, and advocacy groups said flavors drive youth use. Which data would best test whether flavors help adults switch from cigarettes?',choices:['Teen flavor preferences','A study following adult smokers given flavored vs. unflavored pouches, measuring who quits cigarettes','Sales of mint pouches'],correct:1,explain:'A comparison of adult smokers over time answers the adult question. Teen preferences answer a different one. Both questions matter, which is why the debate is about trade-offs.'}
 ],
 tour:[
  {title:'The question',text:'These are 100 teens who have used nicotine pouches, scaled from a 2025 national survey of 472 students in 8th, 10th and 12th grade. Each one said which flavor they use most often.',pause:true,setup:sim=>{sim.tst=1;sim._t0=null;}},
  {title:'Mint',text:'59 of the 100 use mint most often. That is more than all the other choices together.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Fruit and the rest',text:'16 use fruit flavors, and 22 use other flavors such as citrus, coffee or cinnamon.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Original: 3 of 100',text:'Only 3 of 100 use original or unflavored most often. Among teens, flavored pouches are close to universal.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Why mint? The cold sensor',text:'Nicotine sets off TRPA1, a sensor for irritation, so it feels harsh. Watch what changes when mint is added: menthol switches on TRPM8, the cold sensor, and the brain reads “cool” over “burn.” The FDA has said menthol’s cooling makes tobacco easier to start.',pause:true,setup:sim=>{sim.tst=5;sim._t0=null;}},
  {title:'“Flavor-Ban Approved”',text:'Zyn Chill was sold as “Flavor-Ban Approved,” for places that ban flavors. Researchers at Yale and Duke found it contained WS-3, an odorless cooling agent, about 0.23 mg per pouch, which switched on the cold sensor more strongly than the mint pouches did (Tobacco Control, 2025).',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Flavor, dopamine and learning',text:'Every time mint arrives together with a nicotine hit, the brain links them. After many pairings, the taste and smell of mint alone can set off dopamine and wanting: a learned cue. Menthol may also add to the hit itself: in mice, menthol made nicotine more rewarding and boosted its effect on dopamine cells and receptor numbers (Henderson et al., Neuropsychopharmacology, 2017). People who smoke menthol cigarettes quit at lower rates.',pause:true,setup:sim=>{sim.tst=8;sim._t0=null;}},
  {lvl:'honors',title:'The other side',text:'In January 2025 the FDA authorized 20 Zyn products, including mint, citrus and cinnamon, judging that they could help adult smokers switch from cigarettes, with strict limits on marketing to youth. The Campaign for Tobacco-Free Kids argued that flavors drive youth use. Both sides agree on the data above; they weigh the trade-off differently.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim._t0=null;},
 lab:{bio:'<p><b>Question:</b> What does a cooling ingredient change?</p><ol><li>Switch between No cooling, Mint flavor and WS-3. Watch the two sensors and what the brain reads.</li><li>Count the colors in the grid. Check that they add to 100.</li></ol><p>Write one sentence: why might flavors matter most for someone trying nicotine for the first time?</p>',
  honors:'<p><b>Question:</b> How many students might this be in a real school?</p><ol><li>Set the school size to 800, 1,600 and 2,400. Record the number of students using flavored pouches.</li><li>Switch the survey to “Flavors used at all.” Explain why the bars add to more than 100%.</li></ol><p>Explain why a school’s real number can differ from a national rate.</p>',
  ap:'<p><b>Question:</b> What can each survey question tell us?</p><ol><li>Compare the “most often” and “used at all” results for mint.</li><li>Write one claim each survey supports and one it cannot support.</li></ol><p><b>CER:</b> Claim whether flavor rules for pouches should treat mint like fruit, with evidence from both surveys and the cooling chemistry.</p>'},
 terms:[
  {t:'Flavor additive',d:'An ingredient added for taste or feel. Cooling agents count, even with no smell.'},
  {t:'Cooling agent',d:'A chemical that triggers the cold sensor without lowering temperature. Menthol is natural; WS-3 and WS-23 are synthetic.'},
  {t:'TRPM8',d:'The receptor that senses cold. Menthol and WS-3 switch it on.',lvl:'honors'},
  {t:'TRPA1',d:'A receptor for irritating chemicals. Nicotine triggers it, which is part of why nicotine feels harsh.',lvl:'honors'},
  {t:'Check-all-that-apply question',d:'A survey question allowing several answers. Its percents can add to more than 100%.',lvl:'honors'}
 ],
 about:'<p><b>Data.</b> Monitoring the Future 2025, 8th, 10th and 12th graders who had ever used nicotine pouches (n = 472): non-tobacco flavor used most often 97.0%, mint 58.6%, fruit 16.0%, original or unflavored 3.0%; ZYN was the brand for 79.7% (Sanchez et al., <i>Tobacco Control</i>, 2026). The grid rounds these to 59, 16, 22 (the remaining non-tobacco flavors) and 3. National Youth Tobacco Survey 2025, current youth pouch users: mint 60.9%, fruit 25.0%, menthol 18.1%, with more than one answer allowed (Campaign for Tobacco-Free Kids fact sheet). The 2.3% high school use rate is from the 2025 NYTS.</p><p><b>Chemistry.</b> Jabba et al., “Synthetic cooling agent in oral nicotine pouch products marketed as ‘Flavour-Ban Approved’,” <i>Tobacco Control</i>, 2025: Zyn Chill contained WS-3 (234 ± 7 µg per pouch) as its only major flavor chemical and activated TRPM8 more strongly than the mint varieties; the mint pouches drew a stronger TRPA1 irritant response. The nerve-ending picture is a diagram: it shows which sensor each chemical acts on, not measured signal sizes.</p><p><b>Both sides.</b> The FDA’s January 16, 2025 authorization covered 20 Zyn products in 3 and 6 mg, including flavors, with marketing limited to adults 21 and older and a promise to act if youth use rose. Critics, including the Campaign for Tobacco-Free Kids, argued that flavors appeal to kids. In December 2024, Zyn’s U.S. maker settled a District of Columbia case over selling flavored pouches where flavored tobacco is banned.</p>'
};
BioLab.register(SIM);
})();

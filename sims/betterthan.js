(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast}=BioLab.h;
/* "Better than smoking?" Compared to what. And how a smoking alternative became a giant business.
   FDA, June 2026: modified-risk orders let Zyn say using it INSTEAD OF CIGARETTES lowers the risk of mouth cancer, heart disease, lung cancer, stroke, emphysema and chronic bronchitis;
   FDA: that "does not mean these products are safe or risk-free"; "those who do not use tobacco products should not start." Zyn is not an FDA-approved quit medicine (patches, gum, lozenges are).
   Shipments (PMI/Swedish Match, US cans): 2022 237.5M, 2023 384.8M, 2024 581.4M, 2025 about 797M (PMI: +37%). PMI paid about $16 billion for Swedish Match (2022). */
const SHIP=[[2022,237.5],[2023,384.8],[2024,581.4],[2025,581.4*1.37]];
const ROWS=[
 {t:'Smoke in the lungs (tar, carbon monoxide)',s:['down','None: no burning'],n:['same','None either way']},
 {t:'Cancer-causing chemicals',s:['down','Far fewer; FDA allows a lower-risk claim for mouth and lung cancer'],n:['up','Small amounts found in some pouches']},
 {t:'Heart and blood vessels',s:['down','FDA allows a lower-risk claim for heart disease and stroke'],n:['up','Nicotine raises heart rate and blood pressure']},
 {t:'Nicotine addiction',s:['same','Still addicted to nicotine'],n:['up','A new addiction']},
 {t:'The developing brain (under 25)',s:['same','An adult brain'],n:['up','Can harm attention and learning; easier to get hooked']},
 {t:'Gums and mouth',s:['diff','A different harm: irritation and gum recession where the pouch sits'],n:['up','Irritation, white patches, gum recession']}
];
const ICON={down:{c:'#2a9d8f',l:'Lower risk'},same:{c:'#8d99ae',l:'No change'},up:{c:'#d62828',l:'New risk'},diff:{c:'#e9a23b',l:'Different risk'}};
const pct=(a,b)=>100*(b-a)/a;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const hid=(sim,v)=>shown(sim)?v:null;
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const who=(sim,stg)=>stg===2?'s':stg===3?'n':(sim.p.who==='never'?'n':'s');

const SIM={
 id:'betterthan',hash:'betterthan',apUnit:7,order:9,tab:'Better than smoking? Yes, and no',kind:'Learning tool',prereq:['hooked'],next:['quitworks'],
 skills:{bio:'“Compared to what?”: choosing the right baseline; percent increase · Algebra 1 (Unit 1), Health (Unit 7)',honors:'Relative comparisons and growth rates: average yearly growth (b/a)^(1/n) − 1 · Algebra 1 (Unit 5), Health, Economics',ap:'Exponential growth models and projecting from a growth rate · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), AP Macroeconomics'},
 card:'Is a pouch “healthier”? It depends on who you compare: an adult who switches from cigarettes, or a teen who never used nicotine. Then see how a smoking alternative grew into a billion-dollar business.',
 title:'Better than smoking? Yes, and no',
 lede:{bio:'For an adult who smokes and switches completely, pouches are much less harmful than cigarettes: no smoke, far fewer cancer-causing chemicals. For a teen who has never used nicotine, a pouch is not “healthy smoking.” It adds an addiction and real risks to someone who had none. The answer depends on what you compare it to.',
  honors:'Zyn was pitched as an alternative for adults who smoke or dip, not as a way to quit nicotine, and it is not an FDA-approved quit medicine like the patch or gum. As sales grew from 238 million cans in 2022 to nearly 800 million in 2025, it became one of the fastest-growing businesses in tobacco.',
  ap:'“Less harmful” is a relative claim: it needs a baseline. Against cigarettes the relative risk is lower; against no nicotine it is higher. The FDA’s 2026 orders let Zyn make only the first comparison.'},
 scale:'Left: what changes for two made-up people. Right: Zyn cans shipped in the United States each year (millions).',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Compared to what?',
 controls:[
  {id:'guess',label:'Your gut: Zyn cans shipped in the US in 2024',type:'range',min:0,max:1000,step:10,def:100,unit:' million'},
  {id:'who',label:'Who starts using pouches?',type:'seg',def:'smoker',noGut:true,options:[{v:'smoker',l:'An adult who smokes switches completely'},{v:'never',l:'A teen who never used nicotine'}]},
  {id:'reveal',label:'Show the sales now',type:'toggle',def:false,noGut:true}
 ],
 thumbSetup(sim){sim.p.reveal=true;},
 init(){return {};},step(){},
 metrics:[
  {id:'s24',label:'Zyn cans shipped in the US, 2024',unit:'million',d:1,min:0,max:null,get:sim=>hid(sim,581.4)},
  {id:'g',label:'Growth, 2022 to 2024',unit:'%',d:1,min:0,max:null,get:sim=>hid(sim,pct(237.5,581.4))},
  {id:'yr',label:'Average growth per year, 2022 to 2024',unit:'%',d:1,min:0,max:null,lvl:'honors',get:sim=>hid(sim,100*(Math.sqrt(581.4/237.5)-1))},
  {id:'tally',label:'For this person: lower risks / new risks',text:true,get:sim=>{const w=who(sim,99);const L=ROWS.map(r=>r[w][0]);return L.filter(x=>x==='down').length+' lower / '+L.filter(x=>x==='up'||x==='diff').length+' new or different';}}
 ],
 draw(sim,ctx,vdt,k,t){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim)||stg<99,bg=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* ---- left: compared to what ---- */
  const w=who(sim,stg),showL=stg>=2;const LX=12,LW=bg?440:450;
  txt(ctx,bg?(w==='s'?'Adult smoker switches':'Teen who never used'):(w==='s'?'An adult who smokes switches to pouches':'A teen who never used nicotine starts'),LX,26,{s:14*k,w:800,c:w==='s'?'#2a9d8f':'#d62828'});
  txt(ctx,w==='s'?'Compared with: keeping on smoking':'Compared with: not using nicotine',LX,44*Math.min(k,1.2),{s:12*k,c:PAL['cv-soft']});
  const RH=bg?58:56;ROWS.forEach((r,j)=>{const y=58+j*RH,c=r[w],I=ICON[c[0]];rr(ctx,LX,y,LW,RH-6,8);ctx.fillStyle=PAL['card'];ctx.fill();
   txt(ctx,r.t,LX+46,y+18,{s:12.5*k,w:700});
   if(showL){ctx.fillStyle=I.c;ctx.beginPath();ctx.arc(LX+22,y+(RH-6)/2,13,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();const cx=LX+22,cy=y+(RH-6)/2;
    if(c[0]==='down'){ctx.moveTo(cx,cy-7);ctx.lineTo(cx,cy+6);ctx.moveTo(cx-5,cy+1);ctx.lineTo(cx,cy+6);ctx.lineTo(cx+5,cy+1);}else if(c[0]==='up'){ctx.moveTo(cx,cy+7);ctx.lineTo(cx,cy-6);ctx.moveTo(cx-5,cy-1);ctx.lineTo(cx,cy-6);ctx.lineTo(cx+5,cy-1);}else if(c[0]==='same'){ctx.moveTo(cx-6,cy-3);ctx.lineTo(cx+6,cy-3);ctx.moveTo(cx-6,cy+3);ctx.lineTo(cx+6,cy+3);}else{ctx.moveTo(cx-6,cy);ctx.lineTo(cx+6,cy);ctx.moveTo(cx,cy-6);ctx.lineTo(cx,cy+6);}ctx.stroke();
    if(!bg)txt(ctx,c[1],LX+46,y+36,{s:11.5*k,c:PAL['cv-soft']});}});
  /* ---- right: the business ---- */
  const L=500,R=784,T=70,B=Math.round(372-8*k);txt(ctx,bg?'US Zyn cans':'Zyn cans shipped in the US',L-10,26,{s:14*k,w:800});txt(ctx,'millions per year',L-10,44*Math.min(k,1.2),{s:12*k,c:PAL['cv-soft']});
  const Y=v=>B-v/850*(B-T),bw=(R-L)/4;
  SHIP.forEach(([y,v],i)=>{const x=L+i*bw+bw*0.15,on=stg>=99?(shown(sim)||y<2024):stg>=4;const h=on?B-Y(v):0;
   ctx.fillStyle=i===3?'#ff8fab':'#ff006e';ctx.fillRect(x,B-h,bw*0.7,h);txt(ctx,String(y)+(i===3?'*':''),x+bw*0.35,B+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
   if(on)txt(ctx,Math.round(v)+'',x+bw*0.35,B-h-6,{s:13*k,w:800,c:'#c9184a',a:'center'});});
  if(stg>=99&&!shown(sim))pill(ctx,'Lock in your gut answer',(L+R)/2,(T+B)/2,PAL['muted'],'#fff',13*Math.min(k,1.4));
  const G=stg>=99?GS(sim):null;if(G){const y=Y(G.guess);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(L+2*bw,y);ctx.lineTo(L+3*bw,y);ctx.stroke();txt(ctx,'Your gut: '+G.guess,L+2*bw+bw/2,y-6,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  txt(ctx,'* 2025 from PMI’s reported +37%',R,B+34*k,{s:11.5*k,c:PAL['cv-soft'],a:'right'});
  if(stg===5)pill(ctx,'2022: Philip Morris buys Zyn’s maker for about $16 billion',(L+R)/2-40,T-8,'#7b2cbf','#fff',12.5*Math.min(k,1.3));
  if(stg===6)pill(ctx,'FDA: “not safe or risk-free” · not an approved quit medicine',400,428,PAL['rj'],'#fff',13*Math.min(k,1.4));},
 narrate(sim){const w=sim.p.who==='never'?'n':'s';if(!shown(sim))return 'Zyn’s maker shipped 237.5 million cans in the US in 2022. <b>How many do you think it shipped in 2024?</b>';
  return (w==='s'?'For an adult who smokes and switches completely, pouches lower several big risks: <b>yes, better than smoking</b>.':'For a teen who never used nicotine, every row is a new risk or no change: <b>no, not “healthy smoking”</b>.')+` Meanwhile sales grew ${f1(pct(237.5,581.4))}% from 2022 to 2024.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the picture: Zyn’s maker shipped 237.5 million cans in the US in 2022. Drag the slider to how many million cans you think it shipped in 2024, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-581.4),guess:sim.p.guess,label:sim.p.guess+' million cans'};},
  solve(sim){return {v:0,guess:581.4,label:'581.4 million cans'};},
  hint:{bio:'Lock in your gut answer. Then you will work out the percent growth.'},
  calc:{unit:'%',d:1,tol:a=>1,after:'tour',
   prompt:{bio:'Zyn shipped <b>237.5 million</b> cans in the US in 2022 and <b>581.4 million</b> in 2024. By what percent did shipments grow?',
    honors:'Shipments grew from <b>237.5 million</b> (2022) to <b>581.4 million</b> (2024) cans. What average growth per year, as a percent, gives that over 2 years?'},
   answer:sim=>atLeast('honors')?100*(Math.sqrt(581.4/237.5)-1):pct(237.5,581.4),
   hint:'Percent growth = (new − old) ÷ old × 100. For a yearly rate over 2 years: (new ÷ old)^(1/2) − 1.',
   steps(sim){if(atLeast('honors'))return ['Growth factor over 2 years: 581.4 ÷ 237.5 = 2.448.','Per year: 2.448^(1/2) = 1.565.',`Minus 1, × 100: <b>${f1(100*(Math.sqrt(581.4/237.5)-1))}% a year</b>. (Check: 237.5 × 1.565 × 1.565 ≈ 581.)`];
    return ['Change: 581.4 − 237.5 = 343.9 million cans.','Divide by the start: 343.9 ÷ 237.5 = 1.448.',`× 100 = <b>${f1(pct(237.5,581.4))}%</b>: shipments almost two and a half times as big.`];}},
  formula:sim=>atLeast('honors')?`(581.4 ÷ 237.5)^(1/2) − 1 = ${f1(100*(Math.sqrt(581.4/237.5)-1))}% a year`:`(581.4 − 237.5) ÷ 237.5 × 100 = ${f1(pct(237.5,581.4))}%`,
  how:{bio:'(new − old) ÷ old × 100.'},
  compare(sim,g,m){const off=Math.abs(g.guess-581.4);if(off<40)return 'Your gut was right on: about <b>581 million cans</b> in 2024, and about 797 million in 2025.';
   return `Your gut was off by <b>${Math.round(off)} million</b> cans. The real number: <b>581.4 million</b> in 2024, up from 237.5 million in 2022, and about 797 million in 2025.`;},
  again(sim){sim.p.guess=100;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A friend says, “Zyn is basically healthy smoking.” For a teen who has never used nicotine, what is the honest answer?',choices:['True: no smoke, no harm','False: compared with not using nicotine, it adds an addiction, heart effects and mouth harm','It depends on the flavor'],correct:1,explain:'“Better than smoking” only applies to someone who would otherwise smoke. Compared with not using nicotine, every change is a new risk.'},
  {lvl:'bio',instant:true,q:'Is Zyn an FDA-approved way to quit nicotine?',choices:['Yes','No: the FDA authorized it as an alternative to cigarettes for adults; approved quit medicines are things like the patch, gum and lozenge'],correct:1,explain:'Authorized is not approved, and switching from cigarettes to pouches keeps the nicotine addiction. The FDA said its 2026 orders do not mean pouches are safe or risk-free.'},
  {lvl:'bio',kind:'num',q:'Shipments went from 581.4 million cans (2024) up 37% in 2025. About how many million cans in 2025?',answer:796.5,tol:3,unit:'million',d:1,hint:'581.4 × 1.37',explain:'581.4 × 1.37 ≈ 796.5 million cans, more than 2 cans for every person in the US.'},
  {lvl:'honors',instant:true,q:'The FDA’s 2026 orders let Zyn say using it “instead of cigarettes” lowers some risks. Why does the phrase “instead of cigarettes” matter?',choices:['It does not matter','It sets the baseline: the claim compares pouches with smoking, not with using nothing','It means pouches have no risk'],correct:1,explain:'A relative claim is only as meaningful as its baseline. For someone who does not smoke, the claim does not apply.'},
  {lvl:'ap',kind:'num',q:'If shipments kept growing 37% a year from 796.5 million in 2025, how many million cans in 2028?',answer:2048.2,tol:15,unit:'million',d:0,hint:'796.5 × 1.37³',explain:'796.5 × 1.37³ ≈ 2,048 million. Real growth almost always slows; projecting a hot growth rate forward is a classic way to overestimate.'}
 ],
 tour:[
  {title:'Two people, two answers',text:'“Is Zyn better than smoking?” The honest answer starts with another question: better than what? Each row is one kind of harm.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Yes: for an adult who smokes',text:'If an adult who smokes switches completely, there is no smoke and far fewer cancer-causing chemicals. In June 2026 the FDA let Zyn say that using it instead of cigarettes lowers the risk of mouth cancer, lung cancer, heart disease, stroke, emphysema and chronic bronchitis. The addiction stays.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'No: for a teen who never used nicotine',text:'Compared with not using nicotine, nothing gets better. Nicotine adds an addiction, raises heart rate and blood pressure, can harm the developing brain, and pouches irritate the gums. It is not “healthy smoking”: it is nicotine.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'From alternative to industry',text:'Zyn was pitched as an alternative for adults who smoke or dip, not as a way off nicotine. Watch the bars: 238 million cans in 2022, 385 million in 2023, 581 million in 2024, about 797 million in 2025.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Why a cigarette company bought it',text:'In 2022 Philip Morris International paid about $16 billion for Zyn’s maker, Swedish Match. With cigarette sales falling, pouches became its fastest-growing US business, and in 2024 it announced a $600 million Zyn factory in Aurora, Colorado.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'What the FDA said',text:'The FDA said its orders “do not mean these products are safe or risk-free,” that people who do not use tobacco should not start, and that it could withdraw them if youth use rises significantly. Zyn is not an approved quit medicine.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 lab:{bio:'<p><b>Question:</b> Better than what?</p><ol><li>Switch between the two people. Count the lower risks and the new risks for each.</li><li>Write the sentence a friend might say about Zyn, and fix it so it is true.</li></ol><p>Write one sentence: who is the “better than smoking” claim true for?</p>',
  honors:'<p><b>Question:</b> How fast is the business growing?</p><ol><li>Compute the growth each year: 2022 to 2023, 2023 to 2024, 2024 to 2025.</li><li>Is the growth rate speeding up or slowing down?</li></ol><p>Explain why a company would welcome adult switchers and also why public health experts watch who else starts.</p>',
  ap:'<p><b>Question:</b> What does a relative risk claim leave out?</p><ol><li>Write the FDA’s claim with its baseline made explicit.</li><li>Fit an exponential model to 2022 to 2025 shipments and project 2030. Then argue why the projection is likely too high.</li></ol><p><b>CER:</b> Claim whether pouches are a public health win, considering both adults who switch and teens who start.</p>'},
 terms:[
  {t:'Baseline',d:'What something is compared with. “Lower risk” means nothing until you know: lower than what?'},
  {t:'Harm reduction',d:'Lowering the harm for people who already use a substance, for example by switching to a less harmful product.'},
  {t:'Authorized vs. approved',d:'The FDA authorizes tobacco products to be sold; it approves medicines as safe and effective. Zyn is authorized, not approved.'},
  {t:'Modified risk tobacco product',d:'A tobacco product the FDA allows to claim lower risk than another product, such as cigarettes.',lvl:'honors'}
 ],
 about:'<p><b>The comparison table.</b> Summarizes the FDA’s June 2026 modified-risk orders for 20 Zyn products (claim allowed only for use instead of cigarettes) and public health sources on nicotine: it raises heart rate and blood pressure and constricts blood vessels; Zyn’s own label warns people with or at risk of heart disease or high blood pressure; the 2016 Surgeon General’s report found adolescent nicotine exposure can harm the developing brain; oral effects include irritation, thickened white patches and gum recession at the pouch site. Some pouches contained small amounts of tobacco-specific nitrosamines (Mallock et al., <i>Tobacco Control</i>, 2024). Long-term health data on pouches is still limited because they are new.</p><p><b>The business.</b> US Zyn shipments: 237.5 million cans (2022, Swedish Match), 384.8 million (2023), 581.4 million (2024), and growth of 37% in 2025 (PMI reports); the 2025 bar is 581.4 × 1.37. Philip Morris International bought Swedish Match for about $16 billion in 2022 and announced a $600 million Zyn plant in Aurora, Colorado in July 2024.</p><p><b>Help.</b> Teens in Colorado: text <b>Start My Quit</b> to 36072 or call 1-855-891-9989 (My Life, My Quit). Truth Initiative’s EX Program (text <b>EXPROGRAM</b> to 88709) covers pouches.</p>'
};
BioLab.register(SIM);
})();

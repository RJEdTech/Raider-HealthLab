(function(){
'use strict';
const {clamp,rr,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Where the groceries are. One household of 4 (USDA's reference family) gets groceries from the nearest full grocery store.
   One-way trip, minutes:
     car  = d / v_car × 60 + 3 (parking)
     walk = d / 3 × 60                         (3 mph walking pace)
     bus  = s / 3 × 60 + h / 2 + d / v_bus × 60 + 2   (walk s miles to the stop, wait half the headway h on average, ride, 2-minute walk to the door)
   Round trip = 2 × one way. Trips a week = 1 by car; without a car, ceil(8 bags ÷ bags you can carry).
   Full cost of one dinner for 4 = money + (minutes ÷ 60) × value of an hour + travel money.
   Every place, speed, fare and price here is an assumption for illustration unless the about panel gives a source. */
const PLACES={
 rich:{name:'Grocery-rich neighborhood',short:'Grocery-rich',dist:0.5,head:15,stop:0.2,bus:12,car:20,rural:false},
 city:{name:'Low-access city neighborhood',short:'Low-access city',dist:1.8,head:30,stop:0.25,bus:12,car:20,rural:false},
 rural:{name:'Rural county',short:'Rural',dist:12,head:120,stop:0.5,bus:25,car:40,rural:true}
};
const WALK=3,PARK=3,DOOR=2,BAGS=8,SHOP=46,TFP=236.10,FARE=2.50,PERMI=0.30,QMIN=15,MEALS=21;
const PL=sim=>PLACES[sim.p.place]||PLACES.city;
const dist=sim=>sim.p.newstore&&atLeast('honors')?Math.min(sim.p.dist,0.5):sim.p.dist;
const head=sim=>sim.p.head;
function parts(sim,mode){const P=PL(sim),d=dist(sim);mode=mode||sim.p.mode;
 if(mode==='car')return [{k:'drive',m:d/P.car*60},{k:'park',m:PARK}];
 if(mode==='walk')return [{k:'walk',m:d/WALK*60}];
 return [{k:'walk',m:P.stop/WALK*60},{k:'wait',m:head(sim)/2},{k:'ride',m:d/P.bus*60},{k:'walk',m:DOOR}];}
const oneWay=(sim,mode)=>parts(sim,mode).reduce((s,p)=>s+p.m,0);
const trip=(sim,mode)=>2*oneWay(sim,mode);
const carry=sim=>atLeast('honors')?sim.p.carry:BAGS;
const trips=(sim,mode)=>{mode=mode||sim.p.mode;return mode==='car'?1:Math.ceil(BAGS/carry(sim));};
const travelCost=(sim,mode)=>{mode=mode||sim.p.mode;const n=trips(sim,mode);return mode==='car'?n*2*dist(sim)*PERMI:mode==='bus'?n*2*FARE:0;};
const weekMin=(sim,mode)=>trips(sim,mode)*(trip(sim,mode)+SHOP);
const vot=sim=>atLeast('honors')?sim.p.vot:15;
const cookMin=sim=>atLeast('honors')?sim.p.cook:45;
const ffp=sim=>atLeast('ap')?sim.p.ffp:9;
function meal(sim,mode){const tc=cookMin(sim)+weekMin(sim,mode)/MEALS,mc=TFP/MEALS,tr=travelCost(sim,mode)/MEALS,mq=4*ffp(sim);
 return {mc,tr,tc,cook:mc+tr+tc/60*vot(sim),mq,tq:QMIN,quick:mq+QMIN/60*vot(sim)};}
function breakEven(sim){const m=meal(sim);return m.tc>m.tq?(m.mq-m.mc-m.tr)/((m.tc-m.tq)/60):null;}
const yearH=sim=>trip(sim)*(atLeast('honors')?trips(sim):1)*52/60;
/* The round-trip totals stay hidden while the student adds up the trip ("Your turn"). The parts of one way are the givens, so they show. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pend(sim))||(sim.tour&&sim.tour.on));
const n2=v=>(Math.round(v*100)/100).toString();
const PNAME={walk:'walk',wait:'wait',ride:'ride',drive:'drive',park:'park'};
function fLine(sim){const ps=parts(sim);return `Round trip = 2 × (${ps.map(p=>n2(p.m)).join(' + ')}) = 2 × ${n2(oneWay(sim))} = ${n2(trip(sim))} min`;}
const hid=(sim,v)=>shown(sim)?v:null;
const GS=sim=>(sim.tour&&sim.tour.on)?null:(sim.gutS&&sim.gutS.g?sim.gutS.g:null);
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>fmtNum(v,1),usd=v=>'$'+(Math.round(v*100)/100).toFixed(2);
const MODE={car:'by car',bus:'by bus',walk:'on foot'};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function lineTest(sim){const P=PL(sim),d=dist(sim);
 if(P.rural)return d>10?{yes:true,t:'Beyond the 10-mile rural line'}:{yes:false,t:'Inside the 10-mile rural line'};
 return d>1?{yes:true,t:'Beyond the 1-mile city line'}:d>0.5?{yes:true,t:'Beyond the half-mile line only'}:{yes:false,t:'Inside both city lines'};}
/* USDA ERS Large Retailer Access Map (formerly the Food Access Research Atlas), 2019 data: tract flags summed by county. Population is the 2010 Census. */
const ATLAS=[
 {n:'Arapahoe County, CO',pop:572003,a:20716,h:197282,v:25294,nv:5.3},
 {n:'Denver, CO',pop:600158,a:78385,h:250974,v:119753,nv:11.1},
 {n:'Dallas County, TX',pop:2368139,a:441656,h:1171402,v:409486,nv:7.4},
 {n:'Shelby County, TN (Memphis)',pop:927644,a:231087,h:461654,v:263467,nv:8.9},
 {n:'Perry County, KY',pop:28712,a:0,h:0,v:21614,nv:12.6},
 {n:'United States',pop:308745538,a:39074974,h:82164473,v:43646621,nv:null}];
const pct=(a,b)=>(100*a/b).toFixed(1)+'%';
const SEGC=k=>({walk:PAL['s3'],wait:PAL['s4'],ride:PAL['s2'],drive:PAL['s5'],park:PAL['cv-soft']}[k]);
const SEGL={walk:'Walk',wait:'Wait',ride:'Ride',drive:'Drive',park:'Park'};

const CSS=`.fdx h4{margin:10px 0 4px;font-size:15px}.fdx p,.fdx li{font-size:14px}.fdx ul{margin:4px 0 8px 18px;padding:0}
.fdx .bdg{display:inline-block;font-size:12px;font-weight:700;padding:1px 7px;border-radius:9px;margin-right:6px;border:1px solid var(--line);white-space:nowrap}
.fdx .b-m{color:var(--good,#1b7339)}.fdx .b-o{color:var(--focus,#1f6feb)}.fdx .b-a{color:var(--warn-ink,#6e4300);background:var(--warn-bg,#fff4dc)}
.fdx table{border-collapse:collapse;font-size:13px;width:100%}.fdx th,.fdx td{text-align:left;padding:3px 5px;border-top:1px solid var(--line);vertical-align:top}.fdx th{font-size:12px;color:var(--muted)}
.fdx .card{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin-top:8px;background:var(--card2,transparent)}`;
function css(){if(typeof document==='undefined'||document.getElementById('fdx-css'))return;const s=document.createElement('style');s.id='fdx-css';s.textContent=CSS;document.head.appendChild(s);}

const REF=(()=>{let h='<div class="fdx"><p><b>How good is this number?</b></p><ul>';
 h+='<li><span class="bdg b-a">Modeled</span>Trip times: built from assumed distances, speeds and bus schedules. Real trips vary with traffic, transfers, weather and how much you carry.</li>';
 h+='<li><span class="bdg b-o">Official</span>Thrifty Food Plan, $236.10 a week for a family of 4 (USDA, June 2026). It is a cost-of-food benchmark, not what any real family spends.</li>';
 h+='<li><span class="bdg b-o">Official, older</span>County food-access figures: USDA’s 2019 store list with 2010 Census population.</li>';
 h+='<li><span class="bdg b-a">Assumption</span>Value of an hour, cooking time, 8 bags a week, bus fare $2.50, car cost $0.30 a mile and the $9 quick-food price are placeholders you can change.</li>';
 h+='<li><span class="bdg b-m">Peer-reviewed</span>The supply vs. demand split and the food-swamp finding: published studies, each with its own method and limits.</li></ul>';
 h+='<p><b>USDA food-access data for counties used across Raider Labs (2019 data)</b></p><table><thead><tr><th>Place</th><th>People</th><th>In low-income, low-access tracts (1 and 10 mi)</th><th>(0.5 and 10 mi)</th><th>(vehicle measure)</th><th>Households without a vehicle</th></tr></thead><tbody>';
 ATLAS.forEach(r=>{h+=`<tr><td>${r.n}</td><td>${f0(r.pop)}</td><td>${f0(r.a)} (${pct(r.a,r.pop)})</td><td>${f0(r.h)} (${pct(r.h,r.pop)})</td><td>${f0(r.v)} (${pct(r.v,r.pop)})</td><td>${r.nv===null?'n/a':'about '+r.nv+'%'}</td></tr>`;});
 h+='</tbody></table><p>Counts are everyone living in flagged tracts, summed from USDA’s tract data; population is the 2010 Census. Vehicle shares are from the 2014–18 American Community Survey as used in the atlas.</p>';
 h+='<p><b>Package size.</b> Illustrative prices: rice at $2.49 for 2 lb ($1.245 a pound) or $8.99 for 10 lb ($0.899 a pound). The small bag costs about 38% more per pound. More on extra costs like this: <a href="https://rjedtech.github.io/Raider-MathLab/#povertypremium" target="_blank" rel="noopener">The poverty premium</a> in MathLab.</p>';
 h+='<p><b>Health costs as expected value.</b> Diabetes cost the U.S. $412.9 billion in 2022: $306.6 billion in medical care and $106.3 billion in lost productivity (ADA). Spread over 333,287,557 residents, that is about $1,239 per person per year: an average, not anyone’s bill, and for diabetes from every cause.</p>';
 h+='<div class="card"><b>Questions to ask any number</b><ul><li>Who counted it, when, and how?</li><li>What is the unit: a person, a household, a tract, a county?</li><li>What is the comparison: compared with what, and with whom?</li><li>What would have to be true for this number to be wrong?</li><li>Does it show that one thing causes another, or only that they go together?</li></ul></div></div>';
 return h;})();

const SIM={
 id:'fooddesert',hash:'fooddesert',apUnit:6,order:1,tab:'Where the groceries are',kind:'Simulation',
 skills:{bio:'Rates (time = distance ÷ speed) and adding a multistep trip · Algebra 1 (Unit 2), Health (Unit 2)',honors:'Rates, unit prices and the full cost of a meal · Algebra 1 (Unit 2), Health (Unit 2)',ap:'Break-even with linear equations, and correlation vs. causation · Algebra 1 (Unit 5), Statistics (Chapter 3)'},
 card:'Work out how long a grocery run takes without a car, then add up the full cost of dinner in money, minutes and miles.',
 title:'Where the groceries are: food access, time, money and health',
 lede:{bio:'Some neighborhoods have a full grocery store a few blocks away. Others have only corner stores and quick food nearby, and the nearest full grocery is a bus ride or a long drive away. Distance turns into minutes, and minutes are part of what food really costs.',
  honors:'USDA calls a census tract low-income and low-access when many people there live more than 1 mile (city) or 10 miles (rural) from a supermarket. The full cost of a meal is the money plus the time it takes, valued at what an hour is worth to the family, plus the cost of getting there.',
  ap:'Does distance cause the gap in what families buy? A large study of grocery purchases found that a new supermarket nearby changes purchases very little, while differences in demand explain about 90% of the gap. Other researchers find that a surplus of quick food nearby (a food swamp) predicts county health better than distance does. Both are evidence; neither settles it alone.'},
 scale:'One household of 4, the family USDA uses for its Thrifty Food Plan. Distances in miles, times in minutes, money in 2026 dollars.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your week',
 controls:[
  {id:'place',label:'Where you live',type:'seg',def:'city',noGut:true,options:[{v:'rich',l:'Grocery-rich'},{v:'city',l:'Low-access city'},{v:'rural',l:'Rural'}],
   help:'Three made-up places for the math. The county data from USDA are in the panel below the picture.',
   onChange(sim){const P=PL(sim);BioLab.setValues(sim,{dist:P.dist,head:P.head});clearGut(sim);}},
  {id:'mode',label:'How you get there this week',type:'seg',def:'bus',noGut:true,onChange:clearGut,options:[{v:'bus',l:'Bus'},{v:'walk',l:'Walk'},{v:'car',l:'Car'}]},
  {id:'gmin',label:'Your gut: minutes for the round trip (there and back, not counting shopping)',type:'range',min:0,max:500,step:1,def:30,unit:' min'},
  {id:'reveal',label:'Show the answers now',type:'toggle',def:false,noGut:true,help:'Normally the totals appear once you lock in your gut answer.'},
  {id:'carry',label:'Bags you can carry home without a car',type:'range',min:1,max:8,step:1,def:4,unit:' bags',lvl:'honors',noGut:true,onChange:clearGut,help:'The family needs about 8 bags a week (an assumption: 2 per person). Fewer bags per trip means more trips.'},
  {id:'vot',label:'What an hour is worth to this family',type:'range',min:0,max:40,step:1,def:15,unit:' $/h',lvl:'honors',noGut:true,help:'An assumption you set: pay that could be earned, or time with family, homework or rest. $15 is a placeholder, not a measured value.'},
  {id:'cook',label:'Hands-on time to cook and clean up one dinner',type:'range',min:10,max:120,step:5,def:45,unit:' min',lvl:'honors',noGut:true,help:'45 minutes is an assumption. In 2024, Americans who cooked on a given day spent about 1.06 hours on food preparation and cleanup (BLS).'},
  {id:'newstore',label:'What if a new full grocery opens 0.5 mile away?',type:'toggle',def:false,lvl:'honors',noGut:true,onChange:clearGut,help:'Moves the nearest store to 0.5 mile and shows what research says a new store changes.'},
  {id:'dist',label:'Miles to the nearest full grocery',type:'range',min:0.2,max:20,step:0.1,def:1.8,unit:' mi',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'head',label:'The bus comes every',type:'range',min:10,max:180,step:5,def:30,unit:' min',lvl:'ap',noGut:true,onChange:clearGut,help:'The headway. If you arrive at a random time, the average wait is half of it.'},
  {id:'ffp',label:'Quick food: price per person for dinner',type:'range',min:4,max:16,step:0.5,def:9,unit:' $',lvl:'ap',noGut:true,help:'$9 is an assumption for illustration, not survey data.'}
 ],
 init(){return {};},step(){},
 initVis(){css();},
 metrics:[
  {id:'trip',label:'Round trip to the full grocery',unit:'min',d:1,min:0,max:null,get:sim=>hid(sim,trip(sim))},
  {id:'alt',label:'Same round trip by car',unit:'min',d:1,min:0,max:null,get:sim=>hid(sim,trip(sim,'car'))},
  {id:'year',label:'Hours a year on these trips',unit:'h',d:1,min:0,max:null,get:sim=>hid(sim,yearH(sim))},
  {id:'line',label:'USDA low-access line',text:true,get:sim=>lineTest(sim).t+' ('+f1(dist(sim))+' mi)'},
  {id:'trips',label:'Trips a week (8 bags ÷ what you can carry)',unit:'',d:0,lvl:'honors',min:0,max:8,get:sim=>trips(sim)},
  {id:'weekh',label:'Hours getting groceries this week (travel and shopping)',unit:'h',d:2,lvl:'honors',min:0,max:null,get:sim=>hid(sim,weekMin(sim)/60)},
  {id:'weekd',label:'Food money this week (Thrifty Food Plan plus travel)',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>TFP+travelCost(sim)},
  {id:'mealc',label:'Full cost of a cooked dinner for 4',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>hid(sim,meal(sim).cook)},
  {id:'mealq',label:'Full cost of a quick-food dinner for 4',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>hid(sim,meal(sim).quick)},
  {id:'be',label:'Break-even value of an hour',unit:'$/h',d:2,lvl:'ap',min:0,max:null,get:sim=>hid(sim,breakEven(sim))}
 ],
 graphs:[{id:'modes',label:'Round trip by each way of getting there',custom:true},{id:'meal',label:'Full cost of one dinner for 4',lvl:'honors',custom:true},{id:'places',label:'Hours a week getting groceries, by place',lvl:'honors',custom:true}],defaultGraph:'modes',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see the graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  if(id==='meal'){const m=meal(sim),top=Math.max(10,Math.ceil(Math.max(m.cook,m.quick)*1.3/10)*10);
   const ax=axes(ctx,box,{xmin:0,xmax:2,ymin:0,ymax:top,xcats:['Cooked at home','Quick food'],yl:'Dollars, full cost'});
   const stack=(i,segs)=>{let y=0;segs.forEach(s=>{const x0=ax.X(i+.2),x1=ax.X(i+.8);ctx.fillStyle=s.c;ctx.fillRect(x0,ax.Y(y+s.v),x1-x0,ax.Y(y)-ax.Y(y+s.v));y+=s.v;});txt(ctx,usd(y),ax.X(i+.5),ax.Y(y)-6,{s:13,w:700,c:PAL['fg'],a:'center'});};
   stack(0,[{v:m.mc,c:PAL['s2']},{v:m.tr,c:PAL['s3']},{v:m.tc/60*vot(sim),c:PAL['s4']}]);
   stack(1,[{v:m.mq,c:PAL['s2']},{v:m.tq/60*vot(sim),c:PAL['s4']}]);
   legend(ctx,box.L+8,box.T+8,[{label:'Money for food',color:PAL['s2']},{label:'Travel money',color:PAL['s3']},{label:'Time × $/h',color:PAL['s4']}]);return;}
  if(id==='places'){const keys=['rich','city','rural'],save={place:sim.p.place,dist:sim.p.dist,head:sim.p.head,ns:sim.p.newstore},vals=[];
   keys.forEach(k=>{sim.p.place=k;sim.p.dist=PLACES[k].dist;sim.p.head=PLACES[k].head;sim.p.newstore=false;vals.push([weekMin(sim,'car')/60,weekMin(sim,'bus')/60]);});
   sim.p.place=save.place;sim.p.dist=save.dist;sim.p.head=save.head;sim.p.newstore=save.ns;
   const top=Math.ceil(Math.max(...vals.map(v=>v[1]))*1.35+1);
   const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:top,xcats:keys.map(k=>PLACES[k].short),yl:'Hours a week'});
   vals.forEach((v,i)=>{[[v[0],PAL['s5'],.14],[v[1],PAL['s2'],.52]].forEach(([h,c,o])=>{const x0=ax.X(i+o),x1=ax.X(i+o+.34);ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(h),x1-x0,ax.Y(0)-ax.Y(h));txt(ctx,f1(h),(x0+x1)/2,ax.Y(h)-5,{s:12,w:600,c:PAL['fg'],a:'center'});});});
   legend(ctx,box.L+8,box.T+8,[{label:'With a car',color:PAL['s5']},{label:'By bus',color:PAL['s2']}]);return;}
  const ms=['car','bus','walk'],v=ms.map(m=>trip(sim,m)),top=Math.max(20,Math.ceil(Math.max(...v)*1.2/20)*20);
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:top,xcats:['Car','Bus','Walk'],yl:'Minutes, round trip'});
  ms.forEach((m,i)=>{const x0=ax.X(i+.2),x1=ax.X(i+.8);ctx.fillStyle=m===sim.p.mode?PAL['rj']:PAL['s2'];ctx.fillRect(x0,ax.Y(v[i]),x1-x0,ax.Y(0)-ax.Y(v[i]));txt(ctx,f0(v[i])+' min',(x0+x1)/2,ax.Y(v[i])-6,{s:13,w:700,c:PAL['fg'],a:'center'});});
  const G=GS(sim);if(G&&G.gmin<=top){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(box.L,ax.Y(G.gmin));ctx.lineTo(box.L+box.W,ax.Y(G.gmin));ctx.stroke();ctx.setLineDash([]);txt(ctx,'Your gut',box.L+box.W-4,ax.Y(G.gmin)-6,{s:12,w:700,c:PAL['s4'],a:'right'});}},
 draw(sim,ctx,vdt,k){const P=PL(sim),d=dist(sim),big=k>1.3,sh=shown(sim),mode=sim.p.mode,G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,228,800,222);
  /* header */
  txt(ctx,big?P.short+': '+f1(d)+' mi':P.name+': nearest full grocery '+f1(d)+' mi',16,24*k,{s:14*k,w:700});
  if(!big)txt(ctx,(sim.p.newstore&&atLeast('honors')?'A new store has opened. ':'')+'Getting there '+MODE[mode]+'. One way, step by step:',16,46,{s:12*k,c:PAL['cv-soft']});
  /* the route: home, segments, store */
  const RY=148,L0=58,R0=512,ps=parts(sim);
  const raw=mode==='bus'?[P.stop,0,d,0.1]:[d,0],segPx=[];
  if(mode==='bus'){const fixed=2*70,rest=R0-L0-fixed;segPx.push(70,0,rest,70);}else{segPx.push(R0-L0,0);}
  /* home icon */
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(20,RY-4);ctx.lineTo(36,RY-18);ctx.lineTo(52,RY-4);ctx.closePath();ctx.fill();ctx.fillRect(24,RY-4,24,20);ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(33,RY+5,7,11);
  txt(ctx,'Home',36,RY+28+8*k,{s:12*k,w:700,a:'center'});
  /* store icon: a building with an awning and a basket */
  const SX=518;ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(SX,RY-20,40,36);for(let i=0;i<4;i++){ctx.fillStyle=i%2?PAL['s3']:PAL['card'];ctx.fillRect(SX+i*10,RY-26,10,8);}
  ctx.strokeStyle=PAL['cv-bg'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(SX+10,RY-6);ctx.lineTo(SX+30,RY-6);ctx.lineTo(SX+27,RY+6);ctx.lineTo(SX+13,RY+6);ctx.closePath();ctx.stroke();
  txt(ctx,big?'Grocery':'Full grocery',SX+20,RY+28+8*k,{s:12*k,w:700,a:'center'});
  /* quick food near home: abstract squares */
  for(let i=0;i<3;i++){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.75;rr(ctx,70+i*22,196,16,16,4);ctx.fill();ctx.globalAlpha=1;}
  if(!big)txt(ctx,atLeast('honors')?'Quick food and corner stores, closer to home (illustration)':'Quick food and corner stores, closer to home',144,209,{s:12*k,c:PAL['cv-soft']});
  /* segments */
  let x=L0,j=0;const lab=[];
  ps.forEach((p,i)=>{const w=mode==='bus'?segPx[i]:segPx[0];if(p.k==='park')return;
   if(p.k==='wait'){ctx.fillStyle=SEGC('wait');ctx.beginPath();ctx.arc(x,RY,8,0,7);ctx.fill();lab.push({x:x,up:false,t:big?'Wait ~'+f0(p.m):'Wait about '+f0(p.m)+' min',c:SEGC('wait')});return;}
   ctx.strokeStyle=SEGC(p.k);ctx.lineWidth=p.k==='walk'?4:7;ctx.setLineDash(p.k==='walk'?[6,5]:[]);ctx.beginPath();ctx.moveTo(x,RY);ctx.lineTo(x+w,RY);ctx.stroke();ctx.setLineDash([]);
   const t=p.k==='drive'?(big?'Drive '+f1(p.m)+' + park 3':'Drive '+f1(p.m)+' min, park 3 min'):p.k==='ride'?(big?'Ride '+f1(p.m):'Ride '+f1(p.m)+' min ('+f1(d)+' mi)'):(big?'Walk '+f1(p.m):'Walk '+f1(p.m)+' min');
   lab.push({x:x+w/2,up:j%2===0,t,c:SEGC(p.k)});x+=w;j++;});
  if(mode==='bus'){lab[0].up=true;lab[1].up=false;lab[2].up=false;lab[3].up=true;}else lab.forEach(l=>l.up=true);
  lab.forEach(l=>{ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(l.t).width;const cx=clamp(l.x,L0+w/2-30,(l.up?SX-6:R0+30)-w/2);txt(ctx,l.t,cx,l.up?RY-16:RY+26*Math.min(k,1.3),{s:12*k,w:700,c:l.c,a:'center'});});
  /* where USDA's line falls along the route */
  if(!big){const lineMi=P.rural?10:1;if(d>lineMi&&mode!=='bus'){const lx=L0+(R0-L0)*lineMi/d;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(lx,RY-8);ctx.lineTo(lx,RY+8);ctx.stroke();txt(ctx,lineMi+' mi',lx,RY+44,{s:12,c:PAL['cv-soft'],a:'center'});}}
  /* right card: the low-access test, or what a new store changes */
  const CX=580,CW=208;ctx.fillStyle=PAL['card'];rr(ctx,CX,62,CW,150,10);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
  if(sim.p.newstore&&atLeast('honors')){const bx=CX+10,bw=CW-20;
   if(big){txt(ctx,'Gap closed',bx,88,{s:12*k,w:700});const by=100;ctx.fillStyle=PAL['s5'];ctx.fillRect(bx,by,bw,14);ctx.fillStyle=PAL['s2'];ctx.fillRect(bx,by,bw*.10,14);ctx.fillStyle=PAL['s1'];ctx.fillRect(bx,by,Math.max(2,bw*.015),14);
    [['s1','Store ≤1.5%'],['s2','Supply ~10%'],['s5','Demand ~90%']].forEach((r,i)=>{const y=142+i*26;ctx.fillStyle=PAL[r[0]];ctx.fillRect(bx,y-14,12,12);txt(ctx,r[1],bx+18,y,{s:12*k,c:PAL['cv-ink']});});}
   else{txt(ctx,'Gap in how healthy groceries',bx,82,{s:12*k,w:700});txt(ctx,'are, higher vs. lower income',bx,98,{s:12*k,w:700});const by=108;
    ctx.fillStyle=PAL['s5'];ctx.fillRect(bx,by,bw,16);ctx.fillStyle=PAL['s2'];ctx.fillRect(bx,by,bw*.10,16);ctx.fillStyle=PAL['s1'];ctx.fillRect(bx,by,Math.max(2,bw*.015),16);
    [['s1','New store nearby: at most 1.5%'],['s2','Same stores and prices: ~10%'],['s5','Demand differences: ~90%']].forEach((r,i)=>{const y=by+36+i*20*k;ctx.fillStyle=PAL[r[0]];ctx.fillRect(bx,y-9,10,10);txt(ctx,r[1],bx+16,y,{s:12*k,c:PAL['cv-ink']});});}}
  else{const T=lineTest(sim);txt(ctx,big?'USDA test':'USDA low-access test',CX+10,88,{s:big?12*k:13,w:700});
   if(big){[(P.rural?'Line: 10 mi':'Line: 1 mi'),'Here: '+f1(d)+' mi'].forEach((r,i)=>txt(ctx,r,CX+10,122+i*28,{s:12*k,w:i?700:400,c:i?PAL['cv-ink']:PAL['cv-soft']}));}
   else ['City line: 1 mile (or 0.5)','Rural line: 10 miles (or 20)','This trip: '+f1(d)+' mi, '+(P.rural?'rural':'city')].forEach((r,i)=>txt(ctx,r,CX+10,110+i*20,{s:12,c:i===2?PAL['cv-ink']:PAL['cv-soft'],w:i===2?700:400}));
   pill(ctx,big?(T.yes?'Low access':'Not low access'):T.t,CX+CW/2,194,T.yes?PAL['s1']:PAL['s3'],'#fff',big?12*k:12);}
  /* the timeline: round trip, minutes */
  const tm=trip(sim),alt=mode==='car'?'bus':'car',ta=trip(sim,alt),gm=G?G.gmin:null;
  const top=Math.max(20,Math.ceil(Math.max(sh?tm:0,sh?ta:0,gm||0,20)*1.08/10)*10),BL=big?120:150,BR=big?640:680,X=v=>BL+v/top*(BR-BL);
  txt(ctx,'Round trip, minutes (there and back)',16,252*1+ (big?4:0),{s:13*k,w:700});
  if(sh&&!big&&sim.gutS&&sim.gutS.m&&!(sim.tour&&sim.tour.on))txt(ctx,'The math: '+fLine(sim).replace('Round trip = ',''),784,252,{s:12*k,w:700,c:PAL['rj'],a:'right'});
  const bar=(y,label,mm,which)=>{txt(ctx,label,BL-10,y+22,{s:12*k,w:700,a:'right'});
   if(!sh){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;rr(ctx,BL,y+4,BR-BL,28,6);ctx.stroke();ctx.setLineDash([]);txt(ctx,'?',(BL+BR)/2,y+25,{s:18,w:700,c:PAL['cv-soft'],a:'center'});return;}
   let xx=BL;[0,1].forEach(()=>parts(sim,which).forEach(p=>{const w=p.m/top*(BR-BL);ctx.fillStyle=SEGC(p.k);ctx.fillRect(xx,y+4,w,28);ctx.strokeStyle=PAL['cv-bg2'];ctx.lineWidth=1;ctx.strokeRect(xx,y+4,w,28);xx+=w;}));
   txt(ctx,f0(mm)+' min',xx+8,y+24,{s:big?12*k:13,w:700,c:PAL['cv-ink']});};
  bar(266,big?'You':MODE[mode][0].toUpperCase()+MODE[mode].slice(1),tm,mode);
  bar(318,alt==='car'?(big?'Car':'With a car'):(big?'Bus':'By bus'),ta,alt);
  /* axis */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(BL,362);ctx.lineTo(BR,362);ctx.stroke();
  const st=top<=60?10:top<=150?30:top<=300?60:120;for(let v=0;v<=top+1e-9;v+=st){ctx.beginPath();ctx.moveTo(X(v),358);ctx.lineTo(X(v),366);ctx.stroke();if(!big||v%(st*2)===0)txt(ctx,String(v),X(v),382*1+(big?6:0),{s:12*k,c:PAL['cv-soft'],a:'center'});}
  if(G){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(gm),262);ctx.lineTo(X(gm),364);ctx.stroke();ctx.setLineDash([]);
   const gl=(big?'Gut ':'Your gut: ')+f0(gm)+' min';ctx.font='700 '+(12*k)+'px '+FONT;const gw=ctx.measureText(gl).width;txt(ctx,gl,clamp(X(gm),BL+gw/2,792-gw/2),big?412:402,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  /* legend */
  if(!big){const used=[...new Set(parts(sim).concat(parts(sim,alt)).map(p=>p.k))];let lx=16;used.forEach(kk=>{ctx.fillStyle=SEGC(kk);ctx.fillRect(lx,428,12,12);txt(ctx,SEGL[kk],lx+17,439,{s:12,c:PAL['cv-ink']});lx+=ctx.measureText(SEGL[kk]).width+40;});
   if(sh)txt(ctx,'A year of '+(atLeast('honors')&&trips(sim)>1?trips(sim)+' trips a week':'weekly trips')+': '+f0(yearH(sim))+' hours',784,439,{s:12,w:700,c:PAL['cv-ink'],a:'right'});}},
 narrate(sim){const P=PL(sim),d=dist(sim),m=sim.p.mode,tm=trip(sim),tc=trip(sim,'car');
  if(!shown(sim))return `${P.name}: the nearest full grocery is ${f1(d)} miles away, and you are going ${MODE[m]}. <b>How many minutes is the round trip, there and back?</b>`;
  if(m==='car')return `By car the round trip takes about <b>${f0(tm)} minutes</b>. The same trip by bus takes about ${f0(trip(sim,'bus'))} minutes, and on foot about ${f0(trip(sim,'walk'))}. What would change for a household without a car here?`;
  const extra=tm-tc,yr=extra*(atLeast('honors')?trips(sim):1)*52/60;
  let s=`Going ${MODE[m]}, the round trip takes about <b>${f0(tm)} minutes</b>, against about ${f0(tc)} by car: ${f0(extra)} more minutes per trip, or about <b>${f0(yr)} extra hours a year</b>.`;
  if(m==='bus')s+=` The biggest piece is waiting: about ${f0(head(sim))} minutes of each round trip, because the bus comes every ${f0(head(sim))} minutes.`;
  if(atLeast('honors')&&trips(sim)>1)s+=` Carrying ${carry(sim)} bags at a time means ${trips(sim)} trips for a week of groceries.`;
  return s;},
 gut:{better:'lower',controls:['gmin'],
  ask:{bio:'Your family’s car is in the shop this week. The picture shows each part of one way to the full grocery. By feel, drag the slider here to how many minutes the round trip takes, there and back. Then lock it in.',
   honors:'By feel, set the slider here to the round trip in minutes and lock it in. Then you will work it out, and see what those minutes do to the full cost of dinner.'},
  lock(sim){const t=trip(sim);return {v:Math.abs(sim.p.gmin-t),gmin:sim.p.gmin,label:`${f0(sim.p.gmin)} minutes`};},
  solve(sim){const t=trip(sim);sim.p.gmin=+t.toFixed(1);return {v:Math.abs(sim.p.gmin-t),gmin:sim.p.gmin,label:`${f1(t)} minutes ${MODE[sim.p.mode]}, round trip`};},
  hint:{bio:'Lock in your gut answer. Then you will add up the trip yourself.'},
  calc:{unit:'minutes',d:1,tol:a=>Math.max(1,0.02*a),
   prompt:{bio:sim=>{const ps=parts(sim),P=PL(sim);const desc=p=>p.k==='wait'?`wait about ${n2(p.m)} min (the bus comes every ${f0(head(sim))})`:p.k==='park'?`park ${n2(p.m)} min`:`${PNAME[p.k]} ${n2(p.m)} min`;
     return `One way to the full grocery ${MODE[sim.p.mode]}: <b>${ps.map(desc).join(', ')}</b>. How many minutes is the round trip, there and back (not counting shopping)?`;},
    honors:sim=>{const P=PL(sim),d=dist(sim),m=sim.p.mode;
     if(m==='bus')return `By bus: walk ${n2(P.stop)} mile to the stop at 3 mph, wait half of the ${f0(head(sim))} minutes between buses, ride ${f1(d)} miles at ${P.bus} mph, then walk 2 minutes to the door. How many minutes is the round trip?`;
     if(m==='walk')return `On foot: ${f1(d)} miles at 3 mph each way. How many minutes is the round trip?`;
     return `By car: ${f1(d)} miles at ${P.car} mph, plus 3 minutes to park, each way. How many minutes is the round trip?`;}},
   answer:sim=>trip(sim),
   hint:'Add the parts of one way. You wait for a bus home too, so the round trip is 2 × one way. For a ride or a walk, minutes = miles ÷ mph × 60.',
   steps(sim){const ps=parts(sim),P=PL(sim),d=dist(sim),out=[];
    if(atLeast('honors')){ps.forEach(p=>{if(p.k==='walk'&&p.m!==DOOR)out.push(`Walk: ${n2(sim.p.mode==='bus'?P.stop:d)} ÷ 3 × 60 = ${n2(p.m)} min.`);else if(p.k==='wait')out.push(`Wait: half of ${f0(head(sim))} = ${n2(p.m)} min.`);else if(p.k==='ride')out.push(`Ride: ${f1(d)} ÷ ${P.bus} × 60 = ${n2(p.m)} min.`);else if(p.k==='drive')out.push(`Drive: ${f1(d)} ÷ ${P.car} × 60 = ${n2(p.m)} min.`);});}
    out.push(`One way: ${ps.map(p=>n2(p.m)).join(' + ')} = ${n2(oneWay(sim))} min.`);
    out.push(`Round trip: 2 × ${n2(oneWay(sim))} = <b>${n2(trip(sim))} min</b>${sim.p.mode==='bus'?', because you wait for a bus home too':''}.`);
    return out;}},
  formula:fLine,
  how:{bio:'One way = walk to the stop + average wait + ride + walk to the door. The average wait is half the time between buses, if you arrive at a random time. A round trip is two of those. Time = distance ÷ speed: 0.25 mile at 3 miles per hour is 0.25 ÷ 3 × 60 = 5 minutes.',
   ap:'Round trip by bus = 2 × (s ÷ 3 × 60 + h ÷ 2 + d ÷ v × 60 + 2), with s the miles to the stop, h the headway, d the miles to the store and v the bus’s average speed. By car: 2 × (d ÷ v_car × 60 + 3).'},
  compare(sim,g,m){const t=trip(sim),tc=trip(sim,'car'),off=g.gmin-t,n=atLeast('honors')?trips(sim):1,yr=Math.abs(off)*n*52/60,v=vot(sim);
   let s;if(Math.abs(off)<3)s=`Your gut was right on: about ${f0(t)} minutes. You already sense how the parts add up.`;
   else s=`Your gut was ${f0(Math.abs(off))} minutes ${off<0?'short':'long'}. The round trip takes about <b>${f0(t)} minutes</b>. Planned weekly${n>1?', '+n+' trips a week':''}, that gap adds up to about <b>${f0(yr)} hours a year</b>${v>0?`, or about $${f0(yr*v)} at $${v} an hour`:''}.`;
   if(sim.p.mode!=='car')s+=` By car the same trip takes about ${f0(tc)} minutes, so going ${MODE[sim.p.mode]} costs this family about ${f0((t-tc)*n*52/60)} extra hours a year.`;
   return s;},
  again(sim){const ks=['rich','city','rural'],k=ks[Math.floor(Math.random()*3)];sim.p.place=k;sim.p.dist=PLACES[k].dist;sim.p.head=PLACES[k].head;sim.p.mode=Math.random()<0.6?'bus':'walk';sim.p.gmin=30;sim.p.reveal=false;sim.p.newstore=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'No car. The bus stop is a 10-minute walk, the bus comes every 20 minutes (you arrive at a random time), the ride is 12 minutes, and the store is a 2-minute walk from the stop. How many minutes is the round trip?',answer:68,tol:1,unit:'minutes',d:0,hint:'The average wait is half of 20 minutes. Add the four parts of one way, then double it.',explain:'One way: 10 + 10 + 12 + 2 = 34 minutes. The round trip is 2 × 34 = 68 minutes, because you wait for a bus home too.'},
  {lvl:'bio',instant:true,q:'A rural family is 12 miles from the nearest full grocery. By car the round trip takes about 42 minutes. A rural transit van comes every 2 hours. Which part of the trip without a car is biggest?',choices:['The ride','The walking','The waiting'],correct:2,explain:'Waiting half of 120 minutes each way is about 60 minutes, twice: 120 of the roughly 202-minute round trip. The ride itself is about 29 minutes each way.'},
  {lvl:'honors',instant:true,q:'A 2-pound bag of rice costs $2.49 and a 10-pound bag costs $8.99 (illustrative prices). How much more per pound does the small bag cost?',choices:['About 10% more','About 38% more','About 72% more','The same per pound'],correct:1,explain:'Unit prices: $2.49 ÷ 2 = $1.245 a pound and $8.99 ÷ 10 = $0.899 a pound. $1.245 ÷ $0.899 ≈ 1.38, so about 38% more. Without a car, a 10-pound bag is hard to carry on a bus, so a family carrying groceries home may buy the small bag and pay the higher unit price.'},
  {lvl:'honors',instant:true,q:'In USDA’s 2019 data, Perry County, Kentucky had no residents in low-income, low-access tracts at 1 and 10 miles, but about 75% of its residents lived in tracts flagged by the vehicle measure. What explains the difference?',choices:['The data are wrong','Most residents live within 10 miles of a supermarket, but many households are far from one and have no vehicle','Perry County has more supermarkets than Denver'],correct:1,explain:'The rural line is 10 miles, so most of the county passes. The vehicle measure flags a low-income tract where at least 100 households are more than half a mile from a supermarket and have no vehicle. In the same data, about 12.6% of Perry County households had no vehicle. The distance number and the car number tell different stories.'},
  {lvl:'ap',instant:true,q:'A cooked dinner for 4 costs $11.72 in food and travel money and takes 55.3 minutes in all. A quick-food dinner costs $36.00 and takes 15 minutes. Above what value of an hour does the quick-food dinner have the lower full cost?',choices:['About $12 an hour','About $24 an hour','About $36 an hour','Never'],correct:2,explain:'Set the full costs equal: 11.72 + 55.3h/60 = 36.00 + 15h/60. Then 24.28 = (40.3/60)h, so h ≈ $36.2 an hour. Below that, cooking has the lower full cost; above it, quick food does. Different families face different numbers, which is why the same choice can make sense for one and not another.'},
  {lvl:'ap',instant:true,q:'Neighborhoods with fewer full grocery stores tend to buy fewer fruits and vegetables. What does this association alone show?',choices:['Distance to the store causes the difference','The two go together, but other factors (income, time, habits, where stores choose to open) could explain both','Nothing, because neighborhoods are too big to compare'],correct:1,explain:'Correlation is not causation. Stores open where they expect customers, so demand can shape supply. Allcott and coauthors followed households when a new supermarket opened nearby and found their purchases changed very little. Other researchers argue that the whole mix of nearby food outlets matters more than the distance to one store. Each study answers a slightly different question.'},
  {lvl:'ap',instant:true,q:'Diabetes cost the U.S. $412.9 billion in 2022 (ADA). The U.S. had about 333.3 million residents. As an expected value, what is that per resident per year?',choices:['About $124','About $1,239','About $12,390','About $41,290'],correct:1,explain:'$412.9 billion ÷ 333,287,557 ≈ $1,239 per resident. It is an average over everyone, most of whom pay none of it directly, and it covers all diabetes from every cause, not only diet. That is why population costs are expected values, not anyone’s bill.'}
 ],
 tour:[
  {title:'Two places, one errand',text:'This family needs a week of groceries. Home is on the left and the nearest full grocery is on the right, 1.8 miles away. The small red squares are quick food and corner stores, closer to home.',pause:true,focus:[0,60,570,165],setup:sim=>BioLab.setValues(sim,{place:'city',mode:'bus',newstore:false,carry:4,vot:15,cook:45})},
  {title:'The parts of one way',text:'Without a car: walk 5 minutes to the stop, wait about 15 minutes (the bus comes every 30), ride 9 minutes, walk 2 minutes to the door. One way is 31 minutes.',pause:true,focus:[0,90,570,110]},
  {title:'There and back',text:'The round trip is 62 minutes, because you wait for a bus home too. By car the same trip takes about 17 minutes.',pause:true,focus:[0,236,800,160]},
  {title:'USDA’s line',text:'1.8 miles is past the 1-mile city line, so many people here would count as low-access. In the rural county the line is 10 miles, and the trip without a car takes over 3 hours.',pause:true,focus:[575,58,216,158]},
  {title:'The rural county',text:'12 miles away, with a transit van every 2 hours: about 202 minutes round trip, 120 of them spent waiting. By car: about 42 minutes.',pause:true,setup:sim=>BioLab.setValues(sim,{place:'rural',mode:'bus'}),focus:[0,236,800,160]},
  {lvl:'honors',title:'The full cost of dinner',text:'Back in the city. Full cost = money + time × the value of an hour + travel money. At $15 an hour, a cooked dinner for 4 comes to about $25.54 and a quick-food dinner to about $39.75. Open the graph “Full cost of one dinner for 4.”',pause:true,setup:sim=>BioLab.setValues(sim,{place:'city',mode:'bus'})},
  {lvl:'honors',title:'What a new store changes',text:'With a new store 0.5 mile away, the bus round trip falls from 62 to about 49 minutes: the 30 minutes of waiting stay. Research on grocery purchases finds that a nearby supermarket closes only a small share of the gap in what families buy. The card on the right shows the split.',pause:true,setup:sim=>BioLab.setValues(sim,{newstore:true}),focus:[575,58,216,158]}
 ],
 onTourExit(sim){BioLab.setValues(sim,{newstore:false,place:'city',mode:'bus'});},
 infoPanel(sim){
  return '<div class="fdx"><h4>What this number hides</h4><ul><li>A tract’s flag covers everyone in it, including people who live next to a store and people who have no car.</li><li>Counting stores hides prices, opening hours, quality and whether the store sells the foods a family actually cooks.</li><li>A “healthy basket” like the Thrifty Food Plan is one menu. It can leave out cultural foods, allergies and religious food practices.</li><li>Averages hide who does the shopping and cooking, and how much time they have after work or school.</li></ul><p>Sources, the county data table and how good each number is: <b>About this model</b>, below.</p></div>';},
 lab:{bio:'<p><b>Question:</b> How much does a car change the time a week of groceries takes?</p><ol><li>Turn on <b>Show the answers now</b>.</li><li>For each place, record the round trip by car, by bus and on foot.</li><li>Record a trial each time.</li></ol><p>Write one sentence for each place: how many extra minutes does a household without a car spend per trip? Which part of the trip is biggest?</p>',
  honors:'<p><b>Question:</b> When does cooking at home have the lower full cost?</p><ol><li>In the low-access city, going by bus, record the full cost of a cooked dinner and a quick-food dinner at $0, $15, $25 and $40 an hour.</li><li>Change <b>Bags you can carry</b> from 2 to 8 and record the trips a week.</li><li>Turn on the new store and record the change.</li></ol><p>Explain which numbers depend on assumptions and which come from data.</p>',
  ap:'<p><b>Question:</b> How does the break-even value of an hour depend on distance and the bus schedule?</p><ol><li>Record <b>Break-even value of an hour</b> for distances of 0.5, 1, 2, 5 and 12 miles, with the bus every 30 minutes.</li><li>Repeat with the bus every 15 and every 60 minutes.</li><li>Derive the break-even formula from full cost = money + (minutes ÷ 60) × value of an hour.</li></ol><p><b>CER:</b> Make a claim about supply (distance, buses) vs. demand, using your table and the studies in the panel. Name one piece of evidence on each side.</p>'},
 terms:[
  {t:'Food desert',d:'An informal name for an area where many low-income people live far from a full grocery store. USDA’s formal term is a low-income, low-access census tract.'},
  {t:'Low-income, low-access tract',d:'USDA: a low-income census tract where at least 500 people, or a third of residents, live more than 1 mile (city) or 10 miles (rural) from a supermarket. Other versions use 0.5 and 10, 1 and 20, or vehicle access.'},
  {t:'Census tract',d:'A small area the Census Bureau uses for statistics, usually home to about 1,200 to 8,000 people.'},
  {t:'Round trip',d:'There and back. Waiting happens in both directions.'},
  {t:'Headway',d:'The time between buses. If you arrive at a random time, the average wait is half the headway.'},
  {t:'Food swamp',d:'An area where quick food and corner stores greatly outnumber places selling a full range of groceries.',lvl:'honors'},
  {t:'Thrifty Food Plan',d:'USDA’s estimate of the cost of a healthy, low-cost diet, re-evaluated in 2021 and updated monthly for prices. SNAP benefits are based on it.',lvl:'honors'},
  {t:'Unit price',d:'Price per unit (per pound, per ounce). It lets you compare packages of different sizes.',lvl:'honors'},
  {t:'Full cost',d:'Money plus the value of the time it takes plus the cost of getting there.',lvl:'honors'},
  {t:'Value of time (opportunity cost)',d:'What an hour could otherwise be used for, written in dollars so time and money can be added.',lvl:'honors'},
  {t:'Supply vs. demand',d:'Supply: what stores offer, where and at what price. Demand: what households want and choose to buy.',lvl:'ap'},
  {t:'Correlation vs. causation',d:'Two things moving together does not show that one causes the other.',lvl:'ap'},
  {t:'Expected value',d:'An average outcome: the total cost divided across everyone, or each outcome times its chance, added up.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> One way by bus = walk to the stop (miles ÷ 3 mph × 60) + half the headway + ride (miles ÷ bus speed × 60) + 2 minutes to the door. By car = miles ÷ car speed × 60 + 3 minutes to park. On foot = miles ÷ 3 × 60. A round trip is twice one way. Trips a week = 1 by car, or 8 bags ÷ bags carried, rounded up. Hours getting groceries = trips × (round trip + 46 minutes in the store). Full cost of a cooked dinner for 4 = $236.10 ÷ 21 meals + travel money ÷ 21 + (cooking minutes + weekly grocery minutes ÷ 21) ÷ 60 × value of an hour. Quick-food dinner = 4 × price per person + 15 minutes × value of an hour. Break-even value of an hour = (quick money − cooked money) ÷ (cooked hours − quick hours).</p>'+
  '<p><b>Assumptions for illustration (not data).</b> The three places, their distances (0.5, 1.8 and 12 miles), bus schedules (every 15, 30 and 120 minutes), walks to the stop (0.2, 0.25 and 0.5 mile), bus speeds (12 and 25 mph) and car speeds (20 and 40 mph); 3 mph walking; 3 minutes to park; 8 bags a week; $2.50 bus fare; $0.30 a mile to run a car; $9 per person for a quick-food dinner and 15 minutes to get it; 45 minutes to cook and clean up a dinner; $15 for an hour. All are adjustable or labeled. Transit times are modeled, not measured: no source here measures bus time to a grocery store in these counties. In-store time of 46 minutes comes from the 2024 American Time Use Survey: people who grocery shopped on a given day spent 0.76 hours doing it (<a href="https://www.bls.gov/tus/tables/a1-2024.pdf" target="_blank" rel="noopener">BLS Table A-1, 2024</a>). The same table: Americans averaged 0.67 hours a day on food preparation and cleanup (women 0.86, men 0.46), and those who did any spent 1.06 hours.</p>'+
  REF+
  '<p><b>Food access (USDA ERS).</b> USDA’s Large Retailer Access Map, renamed from the Food Access Research Atlas in July 2026, last updated with 2019 data: supermarket list as of 2019, population from the 2010 Census, income and vehicle data from the 2014–18 American Community Survey. A low-income tract has a poverty rate of 20% or more, or a median family income at or below 80% of the state or metro median. Low access: at least 500 people or 33% of the tract more than 1 mile (urban) or 10 miles (rural) from a supermarket; other versions use 0.5 and 10 miles or 1 and 20 miles; the vehicle measure flags tracts where at least 100 households are more than half a mile away with no vehicle, or 500 people or 33% are more than 20 miles away (<a href="https://ers.usda.gov/data-products/food-access-research-atlas/documentation/large-retailer-access-map-reference-guide" target="_blank" rel="noopener">LRAM reference guide</a>; <a href="https://www.ers.usda.gov/data-products/food-access-research-atlas/about-the-atlas" target="_blank" rel="noopener">about the atlas</a>, updated Oct 15, 2026). A newer SNAP-authorized Retailer Access Map, released July 2026, uses 2025 store data; its figures are not used here. County figures in the panel were summed from USDA’s 2019 tract layer (<a href="https://gisportal.ers.usda.gov/server/rest/services/FARA/FARA_2019/MapServer" target="_blank" rel="noopener">USDA ERS map service</a>, queried Nov 7, 2026). Nationally, 39.1 million people (12.7%) lived in low-income, low-access tracts at 1 and 10 miles; of them, USDA counts 18.8 million (6.1% of the U.S.) as living beyond the distance line.</p>'+
  '<p><b>Cost of food.</b> Thrifty Food Plan, June 2026: $236.10 a week, $1,023.20 a month, for a reference family of 4 (two adults 20–50, children 6–8 and 9–11); $75.30 a week for a male and $60.00 for a female aged 14–19. The plan was re-evaluated in 2021 and is updated monthly with the Consumer Price Index (<a href="https://fns-prod.azureedge.us/sites/default/files/resource-files/cnpp-costfood-june2026.pdf" target="_blank" rel="noopener">USDA Official Food Plans, June 2026</a>). Healthier diet patterns cost about $1.48 more per person per day (95% CI $1.01 to $1.95) than less healthy ones, across 27 studies in 10 countries, in 2011 international dollars; the authors put this at about $550 a person a year (Rao, Afshin, Singh and Mozaffarian, <i>BMJ Open</i>, 2013: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3855594/" target="_blank" rel="noopener">PMC3855594</a>). Time: Davis and You estimated that time makes up about 30% of the full cost of food at home for someone who also works for pay, and about 49% for someone who does not, and somewhat more for SNAP households following the Thrifty Food Plan (<i>Applied Economics</i>, 2010: <a href="https://econpapers.repec.org/RePEc:taf:applec:v:42:y:2010:i:20:p:2537-2552" target="_blank" rel="noopener">EconPapers</a>).</p>'+
  '<p><b>The debate: supply or demand?</b> One side: Allcott, Diamond, Dubé, Handbury, Rahkovsky and Schnell, “Food Deserts and the Causes of Nutritional Inequality,” <i>Quarterly Journal of Economics</i> 134(4), 2019 (circulated earlier as “The Geography of Poverty and Nutrition”). Using household purchase data, they found new supermarkets did not significantly improve the healthfulness of nearby residents’ purchases; nearby access explains at most about 1.5% of the high- vs. low-income gap, equal access and prices would reduce it by about 10%, and about 90% comes from demand, linked to education and nutrition knowledge (summary: <a href="https://www.ers.usda.gov/amber-waves/2020/september/differences-in-the-local-food-environment-are-not-the-main-cause-of-nutritional-inequality" target="_blank" rel="noopener">USDA ERS Amber Waves, Sept 2020</a>). Other side: Cooksey-Stowers, Schwartz and Brownell study food swamps, areas with many quick-food outlets relative to places selling a full range of groceries. They argue that the whole mix of food around a family matters more than the distance to one supermarket, and they found the pattern was stronger where income inequality was higher and residents were less mobile (<i>International Journal of Environmental Research and Public Health</i> 14(11):1366, 2017: <a href="https://scholars.duke.edu/publication/1289119" target="_blank" rel="noopener">abstract</a>). Time costs and travel are a third thread. The questions differ: what a new store changes, what surrounds a family, and what time a family has. This tool does not score an answer.</p>'+
  '<p><b>Health costs (population level only).</b> In 2023, an estimated 40.1 million people in the U.S. (12.0%) had diabetes, 29.1 million of them diagnosed, and 115.2 million adults had prediabetes (<a href="https://www.cdc.gov/diabetes/php/data-research/index.html" target="_blank" rel="noopener">CDC National Diabetes Statistics Report</a>, updated Sept 16, 2026). Diabetes cost $412.9 billion in 2022: $306.6 billion direct medical and $106.3 billion lost productivity; people with diagnosed diabetes had medical spending 2.6 times what would be expected without it (ADA, “Economic Costs of Diabetes in the U.S. in 2022,” <i>Diabetes Care</i>, 2023: <a href="https://diabetes.org/about-us/statistics/cost-diabetes" target="_blank" rel="noopener">ADA</a>). U.S. population 333,287,557 in 2022 (<a href="https://content.govdelivery.com/accounts/USCENSUS/bulletins/33ef9b6" target="_blank" rel="noopener">Census Bureau, Dec 22, 2022</a>). Diabetes has many causes, including genes, age, activity, income and access to care; these figures are not caused by food access alone. County diabetes rates were not included because a current official county source could not be opened for this tool.</p>'+
  '<p><b>Programs.</b> <b>SNAP</b> helps low-income households buy groceries; the average benefit was $187.91 per person per month in fiscal year 2025 (Colorado $193.17, Texas $181.37, Tennessee $204.66, Kentucky $177.89: <a href="https://www.kff.org/other/state-indicator/avg-monthly-snap-benefits/" target="_blank" rel="noopener">KFF, from USDA data</a>). <b>WIC</b> provides foods, nutrition education and referrals for low-income pregnant and postpartum women, infants and young children. The <b>Healthy Food Financing Initiative</b>, established in the 2014 Farm Bill and reauthorized in 2018, funds grocery stores and food businesses in underserved areas, including low-income, low-access tracts; it has awarded over $25 million to 162 projects through small grants, and $40 million to 16 partnerships in 2024 (<a href="https://www.rd.usda.gov/about-rd/initiatives/healthy-food-financing-initiative" target="_blank" rel="noopener">USDA Rural Development</a>). <b>Double Up Food Bucks</b> matches SNAP spending on fruits and vegetables; a study of one Detroit supermarket found modest increases in vegetable spending, produce share and variety that did not last after the incentive ended (Steele-Adjognon and Weatherspoon, <i>BMC Public Health</i>, 2017: <a href="https://doaj.org/article/dbd67927996c47d9b44db4ec122d9892" target="_blank" rel="noopener">abstract</a>). <b>School meals:</b> Colorado voters passed Proposition FF, Healthy School Meals for All, in 2022 with 56.75% of the vote: free meals for all public school students, funded by limiting state income tax deductions for people with federal taxable income of $300,000 or more, with grants for Colorado-grown food and meal-worker pay (<a href="https://en.wikipedia.org/wiki/2022_Colorado_Proposition_FF" target="_blank" rel="noopener">Proposition FF</a>). In 2025, Proposition MM passed with 59.73%, raising about $95 million a year for the program by further limiting those deductions, with any extra going to SNAP (<a href="https://en.wikipedia.org/wiki/2025_Colorado_Proposition_MM" target="_blank" rel="noopener">Proposition MM</a>; <a href="https://www.axios.com/local/denver/2025/11/05/colorado-propositions-ll-mm-healthy-school-meals" target="_blank" rel="noopener">Axios Denver</a>).</p>'+
  '<p><b>Not medical or dietary advice.</b> This is a simplified model of time, distance and money. It does not judge any family’s food choices, and it says nothing about what any one person should eat. Your doctor, the school nurse or a registered dietitian can answer personal nutrition questions.</p>'
};
BioLab.register(SIM);
})();

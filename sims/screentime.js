(function(){
'use strict';
const {clamp,rr,txt,pill,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* Your own week lives only in this variable, in this browser tab. Nothing is stored, sent or saved; a reload clears it. */
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],DAYL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const F=['min','pick','notif','first','late'];
const SAMPLE=[[245,92,160,'06:42',25],[210,85,145,'06:40',18],[268,98,170,'06:45',40],[230,79,150,'06:38',22],[312,104,190,'06:41',65],[410,96,120,'09:15',80],[355,76,130,'09:50',35]]
 .map(a=>({min:a[0],pick:a[1],notif:a[2],first:a[3],late:a[4]}));
const MINE=DAYS.map(()=>({min:null,pick:null,notif:null,first:null,late:null}));
const LIMIT=120;
const f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1);
const hm=m=>{m=Math.round(m);const h=Math.floor(m/60),r=m%60;return h?`${h}h ${String(r).padStart(2,'0')}m`:`${r}m`;};
const toMin=s=>{if(!s)return null;const m=String(s).match(/^(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null;};
const clock=m=>{m=Math.round(m);let h=Math.floor(m/60)%24;const mm=String(m%60).padStart(2,'0'),ap=h<12?'a.m.':'p.m.';h=h%12||12;return `${h}:${mm} ${ap}`;};
function parseDur(s){s=String(s||'').trim().toLowerCase();if(!s)return null;let m;
 if((m=s.match(/^(\d+):(\d{1,2})$/)))return (+m[1])*60+(+m[2]);
 if((m=s.match(/^(?:(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?$/))&&(m[1]||m[2]))return Math.round((m[1]?+m[1]*60:0)+(m[2]?+m[2]:0));
 if(/^\d+(\.\d+)?$/.test(s))return Math.round(+s);return null;}
const data=sim=>sim.p.week==='mine'?MINE:SAMPLE;
const vals=(sim,f)=>data(sim).map(d=>d[f]).filter(v=>v!==null&&v!==undefined&&v!==''&&isFinite(f==='first'?toMin(v):v)).map(v=>f==='first'?toMin(v):+v);
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
const sd=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));};
function corr(sim){const xs=[],ys=[];data(sim).forEach(d=>{if(d.notif!==null&&d.pick!==null&&isFinite(d.notif)&&isFinite(d.pick)){xs.push(+d.notif);ys.push(+d.pick);}});
 if(xs.length<3)return null;const mx=mean(xs),my=mean(ys);let a=0,b=0,c=0;xs.forEach((x,i)=>{a+=(x-mx)*(ys[i]-my);b+=(x-mx)**2;c+=(ys[i]-my)**2;});return b&&c?a/Math.sqrt(b*c):null;}
function stats(sim){const D=data(sim),mins=vals(sim,'min'),n=mins.length;
 let bi=-1;D.forEach((d,i)=>{if(d.min!==null&&isFinite(d.min)&&(bi<0||+d.min>+D[bi].min))bi=i;});
 const late=vals(sim,'late'),notif=vals(sim,'notif'),pick=vals(sim,'pick');
 return {n,total:mins.reduce((s,x)=>s+x,0),mean:mean(mins),median:median(mins),range:n?Math.max(...mins)-Math.min(...mins):null,bi,
  pick:mean(pick),notif:mean(notif),late:late.reduce((s,x)=>s+x,0),lateN:late.length,sd:sd(mins),
  over:mins.filter(x=>x>LIMIT).length,overMin:mins.reduce((s,x)=>s+Math.max(0,x-LIMIT),0)};}
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* While the student adds up the week ("Your turn"), the totals stay hidden. */
const shown=sim=>!!((sim.tour&&sim.tour.on)||(sim.st&&sim.st.shown&&!pend(sim))||(sim.gutS&&sim.gutS.g&&!pend(sim)));
const fc=v=>Math.round(v).toLocaleString('en-US');
const dayMins=sim=>data(sim).map((d,i)=>({i,m:d.min})).filter(x=>x.m!==null&&x.m!==undefined&&x.m!==''&&isFinite(x.m)).map(x=>({i:x.i,m:+x.m}));
const sumLine=sim=>dayMins(sim).map(x=>fc(x.m)).join(' + ');
const calcAns=sim=>Math.round(stats(sim).total/60*100)/100;
function medLine(sim){const a=dayMins(sim).map(x=>x.m).sort((x,y)=>x-y),n=a.length;if(!n)return '';const med=median(a);return n%2?`median ${fc(med)} min (number ${(n+1)/2} of ${n} in order)`:`median ${fmtNum(med,1)} min (the average of numbers ${n/2} and ${n/2+1} of ${n})`;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const clearGut=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const gate=(sim,v)=>shown(sim)&&v!==null&&v!==undefined&&isFinite(v)?v:null;

/* ---------- the private entry table, under the picture ---------- */
const CSS=`.stw{margin:10px 0 4px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card);grid-column:1/-1}
.stw-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}
.stw-priv{margin:6px 0 8px;font-size:14px;color:var(--fg)}.stw-priv b{color:var(--good,#1b7339)}
.stw-wrap{overflow-x:auto}.stw table{border-collapse:collapse;font-size:14px;min-width:560px;width:100%}
.stw th{font-size:12px;text-align:left;color:var(--muted);font-weight:700;padding:4px 6px;vertical-align:bottom}
.stw td{padding:3px 6px;border-top:1px solid var(--line)}
.stw input{width:84px;font:inherit;font-size:14px;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
.stw input:disabled{opacity:.85;border-color:transparent;background:transparent}
.stw input.bad{border-color:var(--bad,#b3261e)}
.stw .stw-hint{font-size:13px;color:var(--muted);margin:6px 0 0}
.stw textarea{width:100%;min-height:150px;font:12px/1.4 ui-monospace,monospace;margin-top:8px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:6px}`;
function buildTable(sim){if(sim._stw||!sim.ui||!sim.ui.stage||!sim.ui.stage.parentNode)return;
 if(!document.getElementById('stw-css')){const st=document.createElement('style');st.id='stw-css';st.textContent=CSS;document.head.appendChild(st);}
 const el=document.createElement('div');el.className='stw';el.setAttribute('aria-label','Your week, typed in by you');
 const H=['Day','Screen time<br>(minutes or 4:12)','Pickups','Notifications','First pickup','Minutes after<br>10 p.m.'];
 el.innerHTML=`<div class="stw-top"><b class="stw-h">Your week</b><div class="row"><button type="button" class="btn" data-w="mine">Type in my week</button><button type="button" class="btn" data-w="sample">Use the sample week</button><button type="button" class="btn" data-w="csv">Copy my table as CSV</button><button type="button" class="btn" data-w="clear">Clear my week</button></div></div>
 <p class="stw-priv"><b>Private:</b> what you type stays in this browser tab. Nothing is saved or sent anywhere, and it is gone when you reload or close the page.</p>
 <div class="stw-wrap"><table><thead><tr>${H.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${DAYS.map((d,i)=>`<tr><th scope="row">${DAYL[i]}</th>${F.map(f=>`<td><input ${f==='first'?'type="time"':'type="text" inputmode="numeric"'} data-d="${i}" data-f="${f}" aria-label="${DAYL[i]} ${f==='min'?'screen time':f==='pick'?'pickups':f==='notif'?'notifications':f==='first'?'first pickup time':'minutes after 10 p.m.'}"></td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="stw-hint">Find these in your phone’s screen-time report (Screen Time on iPhone, Digital Wellbeing on Android). Leave a day blank if you don’t have it. For minutes after 10 p.m., read the hourly bars and estimate.</p><div class="stw-out"></div>`;
 sim.ui.stage.parentNode.appendChild(el);sim._stw=el;
 el.addEventListener('input',e=>{const t=e.target;if(!t.dataset||t.dataset.d===undefined||sim.p.week!=='mine')return;const i=+t.dataset.d,f=t.dataset.f;let v=null,bad=false;
  if(f==='first')v=t.value||null;else if(f==='min'){v=parseDur(t.value);bad=t.value.trim()!==''&&v===null;}else{const s=t.value.trim();v=s===''?null:(/^\d+(\.\d+)?$/.test(s)?+s:null);bad=s!==''&&v===null;}
  if(v!==null&&f!=='first')v=clamp(v,0,f==='late'?480:f==='min'?1440:5000);
  MINE[i][f]=v;t.classList.toggle('bad',bad);sim.infoDirty=true;
  if(sim.gutS&&sim.gutS.m&&sim.mode!=='guided'){sim._gutBusy=true;try{sim.gutS.m=sim.def.gut.solve(sim);}finally{sim._gutBusy=false;}if(BioLab.gutRender)BioLab.gutRender(sim);}
  if(BioLab.refresh)BioLab.refresh(sim);});
 el.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b)return;const w=b.dataset.w;
  if(w==='mine'||w==='sample'){BioLab.setValues(sim,{week:w});syncTable(sim);if(w==='mine'){const f=el.querySelector('input');if(f)f.focus();}}
  else if(w==='clear'){MINE.forEach(d=>F.forEach(f=>d[f]=null));syncTable(sim);el.querySelector('.stw-out').innerHTML='';BioLab.refresh(sim);}
  else if(w==='csv'){const csv=toCSV(sim),out=el.querySelector('.stw-out');out.innerHTML='<textarea readonly aria-label="Your table as CSV"></textarea><p class="stw-hint">Copied if your browser allows it. Otherwise select the text above and copy it. Paste it into Excel or your Screen Time Reflection.</p>';
   const ta=out.querySelector('textarea');ta.value=csv;ta.select();try{if(navigator.clipboard)navigator.clipboard.writeText(csv).catch(()=>{});}catch(err){}}});
 syncTable(sim);}
function syncTable(sim){const el=sim._stw;if(!el)return;const mine=sim.p.week==='mine',D=data(sim);
 el.querySelectorAll('input[data-d]').forEach(t=>{const v=D[+t.dataset.d][t.dataset.f];t.disabled=!mine;if(document.activeElement!==t)t.value=v===null||v===undefined?'':String(v);t.classList.remove('bad');});
 el.querySelector('.stw-h').textContent=mine?'Your week (type your numbers)':'The sample week (made up, read only)';
 el.querySelector('[data-w=mine]').classList.toggle('primary',!mine);el.querySelector('[data-w=clear]').hidden=!mine;}
function toCSV(sim){const D=data(sim),s=stats(sim);const rows=[['Day','Screen time (min)','Pickups','Notifications','First pickup','Minutes after 10 p.m.']];
 D.forEach((d,i)=>rows.push([DAYL[i],d.min??'',d.pick??'',d.notif??'',d.first??'',d.late??'']));
 if(s.n){rows.push([]);rows.push(['Total screen time (h)',f1(s.total/60)]);rows.push(['Mean per day (min)',f0(s.mean)]);rows.push(['Median per day (min)',f0(s.median)]);rows.push(['Range (min)',f0(s.range)]);rows.push(['Busiest day',DAYL[s.bi]]);
  if(s.pick!==null)rows.push(['Mean pickups per day',f0(s.pick)]);if(s.notif!==null)rows.push(['Notifications per waking hour',f1(s.notif/sim.p.awake)]);}
 return rows.map(r=>r.map(c=>/[,"]/.test(String(c))?'"'+String(c).replace(/"/g,'""')+'"':c).join(',')).join('\n');}

const SIM={
 id:'screentime',hash:'screentime',apUnit:2,order:3,tab:'My Screen Time, Analyzed',kind:'Learning tool',
 skills:{bio:'Totals, mean, median and range · Health (Unit 1: SMART goals; Unit 6: Screen time and social media), Statistics (Unit 1: one-variable data)',honors:'Mean vs. median, and a rate per hour · Health (Unit 1: SMART goals; Unit 6: Screen time and social media), Statistics (Unit 1)',ap:'Standard deviation and correlation r · Health (Unit 6: Screen time and social media), AP Statistics (Units 1 and 2)'},
 card:'Type in a week of your own screen-time numbers (they never leave your browser), guess your totals, then see the mean, median, range and what a notification-free night would cut.',
 title:'My Screen Time, analyzed',
 lede:{bio:'Your phone already counts your screen time, pickups and notifications. Here you turn one week of those numbers into a few you can actually use: your total, your typical day, your busiest day and your late nights. What you type stays in this browser tab.',
  honors:'Mean or median? One long weekend day pulls the mean up, while the median stays at your typical day. The range tells you how much your days swing. Notifications per waking hour shows how often your phone asks for you.',
  ap:'Summary statistics for n = 7 days: mean, median, range and sample standard deviation s = √(Σ(x − x̄)² / (n − 1)), plus the correlation r between daily notifications and pickups. With 7 points, r is a description of your week, not proof that one causes the other.'},
 scale:'One week, Monday to Sunday. Bars show screen time per day; the darker top is time after 10 p.m.',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'Your week and your guesses',
 controls:[
  {id:'week',label:'Whose week',type:'seg',def:'sample',noGut:true,onChange(sim){syncTable(sim);clearGut(sim);},options:[{v:'sample',l:'Sample week'},{v:'mine',l:'My week'}],help:'Type your own numbers in the table under the picture.'},
  {id:'gH',label:'Your guess: total hours on screens this week',type:'range',min:0,max:100,step:0.5,def:20,unit:' h'},
  {id:'gP',label:'Your guess: pickups per day, on average',type:'range',min:0,max:300,step:1,def:50},
  {id:'trig',label:'Your estimate: how much of your late-night use starts with a notification',type:'range',min:0,max:100,step:5,def:50,unit:'%',noGut:true,help:'Your phone does not report this, so estimate it. It sets how much a notification-free window from 10 p.m. would cut.'},
  {id:'awake',label:'Hours awake per day',type:'range',min:12,max:18,step:0.5,def:16,unit:' h',lvl:'honors',noGut:true,help:'Used for notifications per waking hour. 16 hours awake is an assumption; set your own.'}
 ],
 actions:[{id:'show',label:'Skip my guess and show the numbers',run(sim){sim.st.shown=true;}}],
 init(){return {shown:false};},step(){},
 initVis(sim){buildTable(sim);syncTable(sim);},
 metrics:[
  {id:'total',label:'Screen time this week',unit:'h',d:1,min:0,max:70,get:sim=>{const s=stats(sim);return gate(sim,s.n?s.total/60:null);}},
  {id:'mean',label:'Mean per day',unit:'min',d:0,min:0,max:600,get:sim=>gate(sim,stats(sim).mean)},
  {id:'median',label:'Median per day',unit:'min',d:0,min:0,max:600,get:sim=>gate(sim,stats(sim).median)},
  {id:'range',label:'Range (busiest − quietest)',unit:'min',d:0,min:0,max:600,get:sim=>gate(sim,stats(sim).range)},
  {id:'busiest',label:'Busiest day',text:true,get:sim=>{const s=stats(sim);return !shown(sim)?(pend(sim)?'Add up your week first':'Lock in your guess to see'):s.bi<0?'No days entered yet':`${DAYL[s.bi]}: ${hm(data(sim)[s.bi].min)}`;}},
  {id:'pick',label:'Pickups per day (mean)',unit:'',d:0,min:0,max:200,get:sim=>gate(sim,stats(sim).pick)},
  {id:'npwh',label:'Notifications per waking hour',unit:'',d:1,min:0,max:20,get:sim=>{const n=stats(sim).notif;return gate(sim,n===null?null:n/sim.p.awake);}},
  {id:'late',label:'Minutes after 10 p.m. this week',unit:'min',d:0,min:0,max:600,get:sim=>{const s=stats(sim);return gate(sim,s.lateN?s.late:null);}},
  {id:'cut',label:'Late-night minutes a notification-free window would cut',unit:'min/week',d:0,min:0,max:600,get:sim=>{const s=stats(sim);return gate(sim,s.lateN?s.late*sim.p.trig/100:null);}},
  {id:'over',label:'Days over a 2-hour limit',unit:'days',d:0,lvl:'honors',min:0,max:7,get:sim=>{const s=stats(sim);return gate(sim,s.n?s.over:null);}},
  {id:'overmin',label:'Minutes over 2 hours, all week',unit:'min',d:0,lvl:'honors',min:0,max:2000,get:sim=>{const s=stats(sim);return gate(sim,s.n?s.overMin:null);}},
  {id:'first',label:'Average first pickup',text:true,lvl:'honors',get:sim=>{const a=vals(sim,'first');return !shown(sim)?(pend(sim)?'Add up your week first':'Lock in your guess to see'):a.length?clock(mean(a)):'No times entered yet';}},
  {id:'sd',label:'Standard deviation of daily minutes',unit:'min',d:0,lvl:'ap',min:0,max:300,get:sim=>gate(sim,stats(sim).sd)},
  {id:'r',label:'Correlation r: notifications vs. pickups',unit:'',d:2,lvl:'ap',min:-1,max:1,get:sim=>gate(sim,corr(sim))}
 ],
 graphs:[{id:'np',label:'Pickups vs. notifications, by day',custom:true}],defaultGraph:'np',
 plot(sim,ctx,box){const D=data(sim),pts=[];D.forEach((d,i)=>{if(d.notif!==null&&d.pick!==null&&isFinite(d.notif)&&isFinite(d.pick))pts.push([+d.notif,+d.pick,DAYS[i]]);});
  if(pts.length<2){txt(ctx,'Enter pickups and notifications for at least 2 days.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const xm=Math.max(50,Math.ceil(Math.max(...pts.map(p=>p[0]))/50)*50),ym=Math.max(50,Math.ceil(Math.max(...pts.map(p=>p[1]))/25)*25);
  const ax=axes(ctx,box,{xmin:0,xmax:xm,ymin:0,ymax:ym,xl:'Notifications that day',yl:'Pickups that day'});
  const boxes=[];pts.forEach(p=>{ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(ax.X(p[0]),ax.Y(p[1]),5.5,0,7);ctx.fill();});
  pts.forEach(p=>{const X=ax.X(p[0]),Yp=ax.Y(p[1]);ctx.font='12px '+FONT;const w=ctx.measureText(p[2]).width;
   const opts=[[X+8,Yp-6],[X+8,Yp+14],[X-8-w,Yp-6],[X-8-w,Yp+14],[X-w/2,Yp-12],[X-w/2,Yp+20]];
   const hit=(x,y)=>boxes.some(b=>x<b[0]+b[2]&&x+w>b[0]&&y-11<b[1]&&y+2>b[1]-13);
   const o=opts.find(([x,y])=>!hit(x,y));if(!o)return;boxes.push([o[0],o[1],w]);txt(ctx,p[2],o[0],o[1],{s:12,c:PAL['fg']});});
  const r=corr(sim);if(atLeast('ap')&&r!==null&&shown(sim))txt(ctx,'r = '+fmtNum(r,2)+' (n = '+pts.length+' days)',box.L+10,box.T+12,{s:13,w:700,c:PAL['fg']});},
 draw(sim,ctx,vdt,k){const D=data(sim),s=stats(sim),sh=shown(sim),G=GS(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,sim.p.week==='mine'?'Your week':'The sample week (made up)',20,24,{s:14*k,w:700});
  if(!s.n){txt(ctx,'Type your numbers in the table under the picture.',400,200,{s:16*k,w:700,c:PAL['cv-ink'],a:'center'});txt(ctx,'Nothing you type leaves this page.',400,200+26*k,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  const top=Math.max(180,Math.ceil(Math.max(...D.map(d=>+d.min||0))/60)*60+30),L=64,R=big?640:675,Y0=360,Y1=70,Y=v=>Y0-(v/top)*(Y0-Y1),cw=(R-L)/7;
  /* grid lines every hour */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let h=60;h<top;h+=(big?120:60)){ctx.beginPath();ctx.moveTo(L,Y(h));ctx.lineTo(R,Y(h));ctx.stroke();txt(ctx,(h/60)+' h',L-8,Y(h)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(L,Y0);ctx.lineTo(R,Y0);ctx.stroke();
  D.forEach((d,i)=>{const x=L+i*cw+cw*0.16,w=cw*0.68,m=+d.min;
   txt(ctx,big?DAYS[i].slice(0,2):DAYS[i],x+w/2,Y0+18*k,{s:12*k,w:700,a:'center'});
   if(!big&&d.pick!==null&&isFinite(d.pick))txt(ctx,f0(d.pick)+' pickups',x+w/2,Y0+34,{s:12,c:PAL['cv-soft'],a:'center'});
   if(d.min===null||!isFinite(m))return;
   const lt=clamp(+d.late||0,0,m);ctx.fillStyle=PAL['s2'];ctx.fillRect(x,Y(m),w,Y0-Y(m));
   if(lt>0){ctx.fillStyle=PAL['s5'];ctx.fillRect(x,Y(m),w,Y(m-lt)-Y(m));}
   if(sh&&i===s.bi){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.strokeRect(x-3,Y(m)-3,w+6,Y0-Y(m)+3);}
   if(!big||m>=60){const lab=big?(m/60).toFixed(1):hm(m);ctx.font='700 '+(12*k)+'px '+FONT;const tw=ctx.measureText(lab).width+6;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x+w/2-tw/2,Y(m)-8-12*k,tw,14*k);txt(ctx,lab,x+w/2,Y(m)-8,{s:12*k,w:700,a:'center'});}});
  /* reference lines, labeled in the right gutter with no overlaps */
  const lines=[{v:LIMIT,col:PAL['s4'],dash:[3,4],lab:big?'2 h limit':'2-hour limit',sub:big?'':'(teen accounts)'}];
  if(sh){lines.push({v:s.mean,col:PAL['s1'],dash:[],lab:'Mean',sub:hm(s.mean)});lines.push({v:s.median,col:PAL['s3'],dash:[7,5],lab:'Median',sub:hm(s.median)});}
  lines.forEach(l=>{ctx.strokeStyle=l.col;ctx.lineWidth=l.dash.length&&l.v===LIMIT?2:2.5;ctx.setLineDash(l.dash);ctx.beginPath();ctx.moveTo(L,Y(l.v));ctx.lineTo(R+6,Y(l.v));ctx.stroke();ctx.setLineDash([]);l.y=Y(l.v);});
  const gap=(big?1.05:2.1)*14*k;const ord=[...lines].sort((a,b)=>a.y-b.y);ord.forEach((l,i)=>{l.ly=l.y+4;if(i&&l.ly<ord[i-1].ly+gap)l.ly=ord[i-1].ly+gap;});
  const over=ord.length?ord[ord.length-1].ly+(big?0:14*k)-(Y0+10):0;if(over>0)ord.forEach(l=>l.ly-=over);
  ord.forEach(l=>{txt(ctx,l.lab,R+12,l.ly,{s:12*k,w:700,c:l.col});if(l.sub&&!big)txt(ctx,l.sub,R+12,l.ly+14*k,{s:12*k,c:l.col});});
  /* legend and guess */
  const ly=440;ctx.font=(12*k)+'px '+FONT;let lx=20;
  const chip=(col,lab)=>{ctx.fillStyle=col;ctx.fillRect(lx,ly-10*k,11,11*k);txt(ctx,lab,lx+16,ly,{s:12*k,c:PAL['cv-ink']});ctx.font=(12*k)+'px '+FONT;lx+=ctx.measureText(lab).width+34;};
  chip(PAL['s2'],big?'screen time':'screen time');chip(PAL['s5'],'after 10 p.m.');
  if(sh&&!big){ctx.font='700 13px '+FONT;const str=`Total ${f1(s.total/60)} h · ${s.pick!==null?f0(s.pick)+' pickups/day':''}`;const w=ctx.measureText(str).width+16;pill(ctx,str,780-w/2,ly-5,'#2d5fa8','#fff',13);}
  if(sh&&!big&&G&&G.m){txt(ctx,`${sumLine(sim)} = ${fc(s.total)} min ÷ 60 = ${f1(s.total/60)} h · ${medLine(sim)}`,20,418,{s:12,w:700,c:PAL['cv-ink']});}
  if(G&&G.g){ctx.font='700 '+(12*Math.min(k,1.3))+'px '+FONT;const str=`Your guess: ${f1(G.g.gH)} h, ${f0(G.g.gP)} pickups/day`;const w=ctx.measureText(str).width+16;pill(ctx,str,780-w/2,24,'#9a5c00','#fff',12*Math.min(k,1.3));}},
 narrate(sim){const s=stats(sim),D=data(sim);
  if(!s.n)return 'No days yet. <b>Type your screen time for at least one day</b> in the table under the picture, or use the sample week.';
  if(pend(sim))return `Your guess is locked. Now <b>add up the ${s.n} day${s.n===1?'':'s'} yourself</b>: the minutes are on the bars and in the table.`;
  if(!shown(sim))return `${s.n} day${s.n===1?'':'s'} entered. Before the tool adds anything up, <b>set your gut guess</b> for the week’s total hours and your pickups per day, then lock it in.`;
  const skew=s.mean-s.median;
  return `Total: <b>${f1(s.total/60)} hours</b> over ${s.n} day${s.n===1?'':'s'}. Mean ${hm(s.mean)} a day, median ${hm(s.median)}${Math.abs(skew)>=10?`: <b>the ${skew>0?'mean is higher because a few long days pull it up':'mean is lower because a few short days pull it down'}</b>`:', close together, so your days are fairly even'}. Busiest: ${DAYL[s.bi]}. ${s.over} of ${s.n} days went over 2 hours.`;},
 gut:{better:'lower',controls:['gH','gP'],
  ask:{bio:'Use the sample week, or press <b>Type in my week</b> under the picture and copy in your numbers from your phone’s screen-time report. Then, without adding anything up, set your gut here: your <b>total hours</b> for the week and your <b>pickups per day</b>. Lock it in.',
   honors:'Sample week or yours (type it in under the picture). Without adding anything up, guess the week’s total hours and your average pickups per day here, then lock it in.'},
  lockLabel:'Lock in my guesses',mathLabel:'Add it up',
  lock(sim){const s=stats(sim),H=s.total/60,P=s.pick||0;return {v:Math.abs(sim.p.gH-H)/Math.max(H,1)+Math.abs(sim.p.gP-P)/Math.max(P,1),gH:sim.p.gH,gP:sim.p.gP,label:`${f1(sim.p.gH)} hours this week, ${f0(sim.p.gP)} pickups a day`};},
  solve(sim){const s=stats(sim),H=s.total/60,P=s.pick||0;sim.p.gH=H;sim.p.gP=P;sim.st.shown=true;return {v:0,gH:H,gP:P,label:s.n?`${f1(H)} hours this week, ${s.pick!==null?f0(P)+' pickups a day':'no pickups entered'}`:'no days entered yet'};},
  hint:{bio:'Lock in your guesses. Then you will add up the week yourself.'},
  calc:{unit:'hours',d:1,tol:0.06,
   prompt:{bio:sim=>{const D=dayMins(sim);if(!D.length)return 'Type at least one day of screen time in the table under the picture first. With no days, the total is 0 hours.';return `Your daily screen time, in minutes: <b>${D.map(x=>DAYS[x.i]+' '+fc(x.m)).join(', ')}</b>. Add them up and convert to hours (60 minutes = 1 hour). How many hours in all, to one decimal?`;},
    ap:sim=>{const D=dayMins(sim);if(!D.length)return 'Type at least one day first. With no days, the total is 0 hours.';return `Daily minutes: ${D.map(x=>fc(x.m)).join(', ')}. Find Σx ÷ 60, the week’s total in hours, to one decimal.`;}},
   answer:calcAns,
   hint:'Add all the minutes first. Then divide the sum by 60.',
   steps(sim){const s=stats(sim);if(!s.n)return ['No days entered, so the total is <b>0</b> hours.'];
    return [`Add the days: ${sumLine(sim)} = ${fc(s.total)} minutes.`,`Divide by 60: ${fc(s.total)} ÷ 60 = <b>${fmtNum(s.total/60,2)}</b> hours, about ${f1(s.total/60)}.`,`For comparison: mean = ${fc(s.total)} ÷ ${s.n} = ${fmtNum(s.mean,1)} minutes a day, and the ${medLine(sim)}.`];}},
  formula(sim){const s=stats(sim);if(!s.n)return 'No days entered yet.';return `Total = ${sumLine(sim)} = ${fc(s.total)} min ÷ 60 = ${f1(s.total/60)} h<br>Mean = ${fc(s.total)} ÷ ${s.n} = ${fmtNum(s.mean,1)} min a day; ${medLine(sim)}`+(s.pick!==null?`<br>Pickups: mean ${f0(s.pick)} a day`:'');},
  how:{bio:'Add the day totals and divide by 60 for hours. For pickups, add the days and divide by how many days you entered: that is the mean.',
   ap:'Total = Σ minutes ÷ 60. Mean pickups = Σ pickups ÷ n, where n counts only the days you filled in. Blank days are left out, not counted as zero.'},
  compare(sim,g,m){const s=stats(sim);if(!s.n)return 'Type at least one day in the table, then press <b>Add it up</b> again.';
   const H=s.total/60,P=s.pick,dH=H-g.gH,days=s.n;let out='';
   if(Math.abs(dH)<0.5)out+=`Your gut nailed the total: <b>${f1(H)} hours</b>. `;
   else out+=`The week adds up to <b>${f1(H)} hours</b>, you guessed ${f1(g.gH)}: <b>${f1(Math.abs(dH))} hours ${dH>0?'more':'less'}</b> than you thought, about ${hm(Math.abs(dH)*60/days)} a day. `;
   if(P!==null){const dP=P-g.gP;out+=Math.abs(dP)<3?`Pickups: right on, about ${f0(P)} a day.`:`Pickups: <b>${f0(P)} a day</b>, you guessed ${f0(g.gP)}. That is ${f0(Math.abs(dP)*7)} ${dP>0?'more':'fewer'} pickups a week than you expected.`;}
   return out;},
  again(sim){sim.p.gH=20;sim.p.gP=50;sim.st.shown=false;}
 },
challenges:[
  {lvl:'bio',kind:'num',q:'A different week of screen time: 180, 150, 200, 240, 210, 300 and 330 minutes. How many hours is that in total, to one decimal?',answer:26.8,tol:0.06,unit:'hours',d:1,hint:'Add the seven days, then divide by 60.',explain:'180 + 150 + 200 + 240 + 210 + 300 + 330 = 1,610 minutes, and 1,610 ÷ 60 = 26.83, about 26.8 hours.'},
  {lvl:'bio',instant:true,q:'In the sample week, which is bigger: the mean or the median of daily screen time?',choices:['The mean','The median','They are equal'],correct:0,explain:'Mean: 2,030 ÷ 7 = 290 minutes. Median: the middle day in order is 268 minutes. Saturday (410) and Sunday (355) pull the mean up, while the median stays at a typical day.'},
  {lvl:'bio',instant:true,q:'Monday in the sample week had 160 notifications. Over 16 waking hours, about how often did the phone ask for attention?',choices:['About once an hour','About every 6 minutes','About every 30 seconds'],correct:1,explain:'160 ÷ 16 = 10 notifications per waking hour, and 60 ÷ 10 = one every 6 minutes. Across the whole week it averages about 9.5 per waking hour.'},
  {lvl:'honors',instant:true,q:'The sample week has 285 minutes after 10 p.m. If half of that use starts with a notification, how much would a notification-free window from 10 p.m. cut?',choices:['About 20 minutes a night','About 41 minutes a night','All of it'],correct:0,explain:'285 × 0.5 = 142.5 minutes a week, and 142.5 ÷ 7 ≈ 20 minutes a night. The window only cuts the use that notifications start; the rest is up to you.'},
  {lvl:'honors',instant:true,q:'Teen accounts in the Meta settlement get a 2-hour daily limit. In the sample week, how many minutes go over 2 hours, across all seven days?',choices:['190','1,190','2,030'],correct:1,explain:'Every day is over 120 minutes, so subtract 7 × 120 = 840 from the 2,030-minute total: 1,190 minutes, almost 20 hours.'},
  {lvl:'ap',instant:true,q:'Which change would move the median of the sample week?',choices:['Saturday goes from 410 to 600 minutes','Wednesday, the middle day at 268, goes to 300','Tuesday, the quietest day, drops from 210 to 150'],correct:1,explain:'The median is the middle value. Making the biggest day bigger or the smallest day smaller leaves Wednesday in the middle at 268. Changing Wednesday to 300 makes the order 210, 230, 245, 300, 312, 355, 410, so the median becomes 300. The mean moves in all three cases.'},
  {lvl:'ap',instant:true,q:'In the sample week, r = 0.59 between daily notifications and daily pickups (7 days). What can you conclude?',choices:['Notifications cause pickups','They tended to rise and fall together this week, but 7 days cannot show cause','There is no relationship'],correct:1,explain:'A positive r means busier notification days tended to be busier pickup days. With n = 7, one odd day can swing r a lot, and something else, like a school day versus a weekend, could drive both.'}
 ],
 tour:[
  {title:'Your week, as bars',text:'Each bar is one day of screen time; the darker top is time after 10 p.m. The walkthrough uses the made-up sample week. If you typed in your own week, it comes back at the end.',focus:[55,50,735,340],pause:true,setup:sim=>BioLab.setValues(sim,{week:'sample',trig:50,awake:16})},
  {title:'Add it up',text:'Total: 245 + 210 + 268 + 230 + 312 + 410 + 355 = 2,030 minutes. Divide by 60: 33.8 hours in one week.',pause:true},
  {title:'Mean vs. median',text:'Mean = 2,030 ÷ 7 = 290 minutes (4h 50m). Median: put the days in order, and the middle one is Wednesday’s 268 minutes (4h 28m). The long weekend pulls the mean up; the median stays at a typical day.',pause:true},
  {title:'Range and the busiest day',text:'Saturday is the busiest at 410 minutes, Tuesday the quietest at 210. Range = 410 − 210 = 200 minutes: the days swing by 3 hours 20 minutes.',pause:true},
  {title:'Pickups and notifications',text:'Pickups average 630 ÷ 7 = 90 a day. Notifications average about 152 a day. Over 16 waking hours that is about 9.5 an hour: one every 6 or 7 minutes.',pause:true},
  {title:'The 2-hour line',text:'The dashed amber line is 2 hours, the daily limit that the Colorado-led settlement with Meta sets for teen accounts. Every sample day is above it: 2,030 − 7 × 120 = 1,190 minutes over across the week.',pause:true},
  {lvl:'honors',title:'Late nights',text:'The sample week has 285 minutes after 10 p.m. If half of that starts with a notification, a notification-free window from 10 p.m. cuts about 143 minutes a week, about 20 minutes a night.',pause:true},
  {lvl:'ap',title:'How much the days swing',text:'Standard deviation: s = √(Σ(x − 290)² / 6) ≈ 73 minutes. A typical day sits about an hour and a quarter from the mean.',pause:true}
 ],
 lab:{bio:'<p><b>For your Screen Time Reflection:</b></p><ol><li>Type in your week (or use the sample week). Lock in your guesses, then compare.</li><li>Write down your total, your mean and your busiest day.</li><li>Press <b>Copy my table as CSV</b> to paste your numbers into your reflection or a spreadsheet. Nothing is saved here, so copy before you close the page.</li></ol><p>Write one SMART goal that uses one of these numbers.</p>',
  honors:'<p><b>Question:</b> Which tells your typical day better, the mean or the median?</p><ol><li>Compare the two for your week. Which days pull the mean away from the median?</li><li>Count the days over 2 hours, and the minutes over 2 hours.</li><li>Set your estimate for late-night use that starts with a notification. How many minutes would a notification-free window from 10 p.m. cut?</li></ol><p>Explain which number you would track for a SMART goal, and why.</p>',
  ap:'<p><b>Question:</b> Do notifications go with pickups in your week?</p><ol><li>Read r on the graph.</li><li>Find the standard deviation of your daily minutes. Is your week steady or swingy?</li></ol><p><b>CER:</b> With n = 7, what can r tell you, and what can’t it? Name one other variable that could drive both notifications and pickups.</p>'},
 terms:[
  {t:'Mean',d:'Add the values and divide by how many there are. One very big day pulls it up.'},
  {t:'Median',d:'The middle value when the days are put in order. It ignores how extreme the biggest day is.'},
  {t:'Range',d:'Biggest value minus smallest value.'},
  {t:'Pickup',d:'Each time you pick up or unlock your phone, as your phone counts it.'},
  {t:'Rate',d:'A count per unit of something else, like notifications per waking hour.',lvl:'honors'},
  {t:'Standard deviation',d:'A typical distance of a day from the mean.',lvl:'ap'},
  {t:'Correlation r',d:'A number from −1 to 1 for how closely two things move together in a straight-line pattern. It does not show cause.',lvl:'ap'}
 ],
about:'<p><b>Your data stays here.</b> The numbers you type live only in this browser tab, in memory. They are not saved, not sent anywhere and not shared with your teacher or RJ; a reload clears them. <b>Copy my table as CSV</b> copies to your own clipboard so you can paste it into your reflection.</p>'+
  '<p><b>The math.</b> Total = sum of daily minutes ÷ 60. Mean = sum ÷ number of days entered (blank days are left out, not counted as zero). Median = the middle day in order (the average of the two middle days if the count is even). Range = biggest − smallest. Notifications per waking hour = mean daily notifications ÷ hours awake (16 unless you change it, an assumption). Late-night minutes cut = minutes after 10 p.m. × your estimate of how much of that use starts with a notification; phones do not report that share, so it is your estimate, not a measurement. Standard deviation uses n − 1. The sample week is made up for illustration. This tool summarizes numbers; it does not judge them, and it is not medical advice.</p>'+
  '<p><b>Context.</b> In a settlement announced August 26, 2026 and led by Colorado’s attorney general, Meta agreed that teen accounts get a 2-hour daily limit with pauses, a block from midnight to 6 a.m., and notifications muted during the school day (<a href="https://coag.gov/press-releases/weiser-announces-historic-settlement-with-meta/" target="_blank" rel="noopener">Colorado Attorney General</a>). The U.S. Surgeon General’s 2023 advisory reports that up to 95% of 13- to 17-year-olds use social media and more than a third say they use it “almost constantly” (<a href="https://www.hhs.gov/sites/default/files/sg-youth-mental-health-social-media-advisory.pdf" target="_blank" rel="noopener">advisory, PDF</a>). RJ Health teachers already assign a Screen Time Reflection; this tool is built to support it.</p>'+
  '<p><b>What the numbers don’t say.</b> Researchers disagree about how much screen time itself matters for mental health. Orben and Przybylski (2019) found technology use explained at most 0.4% of the variation in teen wellbeing; Jonathan Haidt argues for firm limits on phones and social media for kids; a 2025 JAMA study by Xiao and colleagues linked rising <i>addictive</i> use, not total screen time, to higher risk. This tool does not score your mental health. If stress or mood is weighing on you, talk to RJ counseling, or use Safe2Tell.</p>'
};
BioLab.register(SIM);
})();

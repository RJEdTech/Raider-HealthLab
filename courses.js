/* Raider HealthLab: the Health (HPE102) sequence comes from the RJ Health teachers' Canvas modules (Robbins, Bauer, Mihalco, McKeon; Fall 2025 to Spring 2027 shells, pulled Nov 7, 2026). */
BioLab.COURSES = [
 {id:'health',name:'Health',blurb:'RJ Health (boys’ and girls’ divisions), in the order most sections cover it. Sleep is not its own unit in Canvas, so the sleep tools sit with stress and the brain, where they fit best.',
  units:[
   {n:'Unit 1',t:'Introduction to health: the Health Triangle and SMART goals',ids:['screentime']},
   {n:'Unit 2',t:'Nutrition: labels, fad diets and supplements',ids:['checkclaim']},
   {n:'Unit 3',t:'Reproductive system and hormone regulation',ids:['feedback']},
   {n:'Unit 4',t:'The brain and nervous system',ids:['scroll','feedback']},
   {n:'Unit 5',t:'Emotions, stress and sleep',ids:['sleepdebt','watchlie','caffeinecurve']},
   {n:'Unit 6',t:'Screen time and social media',ids:['feedbuilder','scroll','screentime']},
   {n:'Unit 7',t:'Substances: caffeine, alcohol, nicotine and drug classification',ids:['caffeinecurve','whosad']}
  ]}
];
BioLab.TOPIC_ORDER = {1:['sleepdebt','watchlie','caffeinecurve'],2:['feedbuilder','scroll','screentime'],3:['feedback'],4:['whosad','checkclaim'],5:['cprclock','herd']};
BioLab.setSections({units:{},extra:{1:'Sleep',2:'Screens, feeds and attention',3:'How your body keeps balance',4:'Ads, claims and evidence',5:'Saving lives: what works',11:'Go further'},order:[1,2,3,4,5,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();

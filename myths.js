/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
sleepdebt:[
 {k:'need',s:'Most teenagers need about 8 to 10 hours of sleep a night.',fact:true,why:'That is the American Academy of Sleep Medicine recommendation for ages 13 to 18. Most US teens get less.'},
 {k:'weekend',s:'Sleeping in on the weekend fully makes up for a short week.',fact:false,why:'It helps some, but focus and mood don’t fully recover, and late weekend wake-ups shift your body clock, making Sunday night and Monday morning harder.'},
 {k:'used',s:'You can train your body to need less sleep.',fact:false,why:'People who sleep too little feel used to it, but tests show their attention and reaction time keep getting worse.'}
],
caffeinecurve:[
 {k:'half',s:'Half the caffeine from an afternoon drink can still be in your body around bedtime.',fact:true,why:'Caffeine’s half-life is about 5 hours in most adults, so a 3 p.m. drink is still about half there at 8 p.m.'},
 {k:'gone',s:'Once the jittery feeling fades, the caffeine is gone.',fact:false,why:'You can stop noticing it while enough is still there to delay sleep and make it lighter.'},
 {k:'water',s:'Caffeine levels drop faster if you drink a lot of water.',fact:false,why:'Your liver breaks caffeine down at its own pace. Water doesn’t speed that up.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of HealthLab. */
BioLab.addMyths({
checkclaim:[
 {k:'cause',s:'If two things happen together, one must cause the other.',fact:false,why:'Correlation isn’t causation. A third factor can drive both, or it can be chance.'},
 {k:'rct',s:'A randomized controlled trial is strong evidence that a treatment works.',fact:true,why:'Random assignment balances hidden differences between groups.'},
 {k:'one',s:'One small study is enough to settle a health question.',fact:false,why:'Small studies are often wrong by chance. Look for results repeated in several studies.'}
],
cprclock:[
 {k:'mouth',s:'Hands-only CPR is recommended for adults who suddenly collapse, if you aren’t trained in rescue breaths.',fact:true,why:'Push hard and fast in the center of the chest, about 100 to 120 times a minute, until help arrives.'},
 {k:'wait',s:'You should wait for paramedics rather than start CPR yourself.',fact:false,why:'Each minute without CPR cuts survival sharply. Bystander CPR can double or triple the chance of survival.'},
 {k:'aed',s:'An AED tells you what to do and only shocks if a shock is needed.',fact:true,why:'It reads the heart rhythm itself, so anyone can use it.'}
],
feedback:[
 {k:'neg',s:'Negative feedback pushes a system back toward its set point.',fact:true,why:'Like a thermostat, or your body sweating when you are hot.'},
 {k:'bad',s:'Positive feedback always means something good is happening.',fact:false,why:'Positive feedback amplifies a change. A feed that shows more of what you click can spiral.'},
 {k:'birth',s:'Childbirth contractions are an example of positive feedback.',fact:true,why:'Contractions release oxytocin, which causes stronger contractions, until birth.'}
],
feedbuilder:[
 {k:'neutral',s:'A social media feed shows posts in the order they were posted.',fact:false,why:'Most feeds rank posts by predicted engagement, so choices about the ranking shape what you see.'},
 {k:'rank',s:'What a feed ranks by changes what people see and share.',fact:true,why:'Ranking by clicks favors posts that grab attention, not necessarily ones that help.'},
 {k:'choice',s:'Some apps let you switch to a chronological feed.',fact:true,why:'Then you see posts in time order rather than by predicted engagement.'}
],
fooddesert:[
 {k:'dist',s:'Distance and time to a grocery store affect what people eat.',fact:true,why:'If the nearest full grocery store is far, families rely more on convenience stores and fast food.'},
 {k:'choice',s:'People in areas without grocery stores just choose to eat poorly.',fact:false,why:'Access, prices, time and transportation all limit choices.'},
 {k:'usda',s:'The USDA maps areas with low access to grocery stores.',fact:true,why:'Its Food Access Research Atlas uses distance and income data.'}
],
herd:[
 {k:'95',s:'Measles needs about 95% of people immune to stop outbreaks.',fact:true,why:'Measles is extremely contagious: one case can infect 12 to 18 people with no immunity.'},
 {k:'gone',s:'Measles has been gone from the U.S. so long that it can’t come back.',fact:false,why:'It was declared eliminated in 2000, but imported cases spread where vaccination rates drop, as in large outbreaks since 2019.'},
 {k:'protect',s:'Herd immunity protects babies too young to be vaccinated.',fact:true,why:'If the people around them are immune, the virus can’t reach them.'}
],
screentime:[
 {k:'pickup',s:'Phone settings can show how many times a day you pick up your phone.',fact:true,why:'Screen Time (iPhone) and Digital Wellbeing (Android) track pickups and app use.'},
 {k:'guess',s:'Most people guess their screen time accurately.',fact:false,why:'Studies find people often guess wrong, frequently too low.'},
 {k:'limit',s:'Setting app limits can help you use your phone the way you intend.',fact:true,why:'A pause before opening an app breaks the automatic habit.'}
],
scroll:[
 {k:'design',s:'Infinite scroll removes natural stopping points.',fact:true,why:'With no end of the page, you have to decide to stop yourself.'},
 {k:'will',s:'Scrolling too long is only a problem of willpower.',fact:false,why:'Apps are designed to hold attention, with unpredictable rewards like a slot machine.'},
 {k:'variable',s:'Unpredictable rewards keep people checking more than predictable ones.',fact:true,why:'Variable rewards are a powerful habit-builder, found in classic behavior research.'}
],
watchlie:[
 {k:'perfect',s:'Sleep trackers measure your sleep stages as accurately as a sleep lab.',fact:false,why:'They estimate from movement and heart rate. Lab tests measure brain waves.'},
 {k:'total',s:'Wearables are usually better at total sleep time than at sleep stages.',fact:true,why:'Telling asleep from awake is easier than telling light from deep sleep.'},
 {k:'worry',s:'Worrying about a sleep score can make some people sleep worse.',fact:true,why:'Researchers call it orthosomnia: anxiety over tracker data.'}
],
whosad:[
 {k:'profile',s:'Ad systems build a profile of you from what you click, watch and buy.',fact:true,why:'Advertisers pay to reach people who fit certain profiles.'},
 {k:'free',s:'Free apps make no money from their users.',fact:false,why:'Many earn money by selling ads aimed at their users using their data.'},
 {k:'teen',s:'In the U.S., COPPA limits collecting data from children under 13.',fact:true,why:'Sites need parental consent to collect personal data from kids under 13.'}
]
});

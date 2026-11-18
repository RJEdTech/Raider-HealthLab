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

/* Batch 3 (Nov 18, 2026): the nicotine section. */
BioLab.addMyths({
hooked:[
 {k:'choice',s:'If you only use pouches on weekends or at parties, you can’t get addicted.',fact:false,why:'Teen brains adapt quickly, and many people who start occasionally end up using daily. The craving loop builds with repeated use, not a set schedule.'},
 {k:'relief',s:'The calm feeling from a pouch is mostly relief from the craving that nicotine itself caused.',fact:true,why:'In a dependent brain, falling nicotine levels feel like stress. The next dose ends that, so it feels calming.'},
 {k:'taste',s:'Flavors only change the taste, not how hooked you get.',fact:false,why:'Cooling flavors mask harshness, a flavor paired with nicotine becomes a learned cue for craving, and in mice menthol boosted nicotine’s effect on dopamine cells.'},
 {k:'recover',s:'Once the brain adapts to nicotine, the change is permanent.',fact:false,why:'Brain scans of people who quit found nicotine receptor levels back to normal by about 6 to 12 weeks.'}
],
freebase:[
 {k:'mg',s:'Two pouches with the same mg on the label deliver the same nicotine.',fact:false,why:'pH changes how much is in the free form that crosses the gums. A CDC study found free nicotine from 0.17 to 6.07 mg per pouch.'},
 {k:'soda',s:'Some pouches contain baking soda (sodium bicarbonate).',fact:true,why:'It is a pH adjuster: a base that raises pH so more nicotine is absorbed.'},
 {k:'tobfree',s:'“Tobacco-free” means nicotine-free.',fact:false,why:'Tobacco-free pouches still contain nicotine, extracted from tobacco or made in a lab.'}
],
streaks:[
 {k:'safe',s:'If you and a friend each snap 99% of days, a 100-day streak is almost certain.',fact:false,why:'Each day survives with chance 0.9801, and 0.9801¹⁰⁰ is only about 13%.'},
 {k:'likes',s:'In a brain-scan study, teens were more likely to like a photo that already showed many likes.',fact:true,why:'Sherman et al. (2016) assigned like counts at random; the same photo got more likes when it already showed many.'},
 {k:'court',s:'No court has ever found a social media company responsible for how it designed its app.',fact:false,why:'In March 2026 a Los Angeles jury found Meta and YouTube negligent in their design. The companies can appeal.'}
],
teenbrain:[
 {k:'25',s:'Your brain finishes developing at exactly age 25.',fact:false,why:'Development is gradual and differs by person. Self-control areas mature through the 20s, and a 2025 study of about 4,200 people found wiring changes continuing into the early 30s.'},
 {k:'sleep',s:'Teens stay up late because they need less sleep than children.',fact:false,why:'Teens still need 8 to 10 hours. At puberty the body clock shifts about 2 hours later.'},
 {k:'peers',s:'In an experiment, teens took more risks in a driving game when friends were watching, but adults did not.',fact:true,why:'Gardner and Steinberg (2005), 306 people: early teens scored about twice as high on risky driving with friends watching.'}
],
goviral:[
 {k:'paid',s:'If you see a product all over your feed, the company must be paying for it.',fact:false,why:'Unpaid posts by users can spread a product widely. The company still profits.'},
 {k:'rule',s:'Rules on a company’s ads also apply to videos regular users post about its product.',fact:false,why:'Marketing rules cover the company’s own advertising, not fans’ posts.'},
 {k:'grow',s:'A trend where each post inspires 2 new ones passes 2 million views in about 10 rounds, starting from one 1,000-view video.',fact:true,why:'1,000 × (2¹¹ − 1) ≈ 2.05 million.'}
],
lifetime:[
 {k:'small',s:'An energy drink every couple of days adds up to about $600 a year.',fact:true,why:'3.5 cans a week × 52 × $3.29 ≈ $599.'},
 {k:'adults',s:'Most people who become regular nicotine users start as adults.',fact:false,why:'For cigarettes, 88% of adult daily smokers first smoked by 18 and 99% by 26 (Surgeon General, 2012).'},
 {k:'all',s:'All of the money you pay for a can goes to the company that makes it.',fact:false,why:'Stores, distributors and taxes take a share. In 2024 Zyn’s maker got about $3.23 per can.'}
],
playbook:[
 {k:'settle',s:'When a company settles a case, it always admits it broke the law.',fact:false,why:'Settlements usually end a case without an admission. Investigation findings are still evidence.'},
 {k:'camel',s:'In a 1991 study, most 6-year-olds could match Joe Camel with cigarettes.',fact:true,why:'91.3% did, about as many as matched the Disney logo with Mickey Mouse.'},
 {k:'new',s:'Social media marketing of nicotine is a completely new idea.',fact:false,why:'In 1929 a staged parade got free newspaper coverage. Getting attention without paying for ads is an old move.'}
],
betterthan:[
 {k:'healthy',s:'Zyn is “healthy smoking.”',fact:false,why:'Compared with smoking it lowers some risks; compared with not using nicotine, it adds addiction, heart effects and mouth harm.'},
 {k:'quit',s:'Zyn is an FDA-approved quit-smoking medicine.',fact:false,why:'It is authorized to be sold, not approved as a medicine. Approved quit aids include the patch, gum and lozenge.'},
 {k:'claim',s:'The FDA lets Zyn say it is lower risk than cigarettes.',fact:true,why:'In June 2026, for use instead of cigarettes, while stating that does not mean it is safe.'}
],
quitworks:[
 {k:'95',s:'Teen cigarette smoking has fallen by about 95% since 1997.',fact:true,why:'From 36.4% (1997) to 1.8% (2025).'},
 {k:'scare',s:'Scary warnings were the main thing that cut teen smoking.',fact:false,why:'Prices, marketing limits, youth-made campaigns like truth and age-21 laws all had measurable effects.'},
 {k:'help',s:'Text-message quit programs have been shown to help teens quit vaping.',fact:true,why:'In a 2024 randomized trial, teens in Truth Initiative’s program were 35% more likely to quit.'}
]
});

/* Batch 4 (Nov 18, 2026): The habit economy. */
BioLab.addMyths({
buynow:[
 {k:'timer',s:'If a countdown timer runs out, the deal is always gone.',fact:false,why:'The FTC found timers on offers that were not really time-limited. Sometimes the clock just resets.'},
 {k:'fees',s:'Fees that show up only at checkout are a known sales tactic with a name.',fact:true,why:'It is called drip pricing: a low price first, fees later.'},
 {k:'p4',s:'Pay-in-4 makes things cheaper.',fact:false,why:'The total is the same or more if you pay late. It only makes the number look smaller.'}
],
blisspoint:[
 {k:'more',s:'The sweeter a drink, the more people like it.',fact:false,why:'Liking peaks and then falls. Companies look for the peak, the bliss point.'},
 {k:'tsp',s:'A 20 oz cola has more than twice the AHA’s daily added-sugar limit for teens.',fact:true,why:'65 g is about 16 teaspoons; the limit for ages 2 to 18 is 6 teaspoons (25 g).'},
 {k:'paid',s:'Industries have paid scientists to make their products look safer.',fact:true,why:'In 1967 a sugar trade group paid Harvard scientists for a review that played down sugar’s link to heart disease.'}
],
companion:[
 {k:'friend',s:'An AI companion needs you as much as you need it.',fact:false,why:'It needs nothing from you. That is what makes the bond one-sided, or parasocial.'},
 {k:'bye',s:'Some companion apps try to stop you from leaving when you say goodbye.',fact:true,why:'A Harvard study found manipulative goodbye replies 37.4% of the time.'},
 {k:'all',s:'Most teens who use AI companions spend more time with them than with real friends.',fact:false,why:'In the Common Sense Media survey, most teen users still spent more time with real friends.'}
]
});

BioLab.addReview({
whosad:{
 questions:[
  {id:'topE',kind:'real',lvl:'bio',
   q:'The fictional 16-year-old: online 1.5 hours after midnight, stress and sleep searches, gaming follows, mostly at home and school. For the energy drink ad, which signal adds the most to the click score?',
   choices:['The age signal','Late-night use','Followed accounts','Location'],correct:1,
   steps:['Take each signal away, one at a time, and see how far the score drops.','Late-night use: 27.9% → 15.5%, a 12.4-point drop. Searches and follows: about 10.4 each. Age: about 5.6. Location (home and school): 0.','So late-night use is doing the most work.'],
   lab:{set:{ad:'energy',age:'known',late:1.5,search:'stress',follow:'gaming',place:'home',reveal:true},look:'Read the points next to each signal and <b>Points the biggest signal adds</b>.'},verify:[['dTop',12.44,0.05],['pE',27.89,0.05]]},
  {id:'vapeTop',kind:'real',lvl:'bio',
   q:'Same profile, but now the model scores the vape-style product. Which signal adds the most now?',
   choices:['Late-night use','Stress and sleep searches','Gaming follows','The age signal'],correct:1,
   steps:['For this ad, the stress searches carry a bigger weight (+0.9) than for the energy drink (+0.6).','Removing them drops the score from 24.5% to 11.7%: 12.8 points. Late-night use adds 10.3 and age 8.1.','Different ads lean on different signals, but both lean on signals of a hard week.'],
   lab:{set:{ad:'vape',age:'known',late:1.5,search:'stress',follow:'gaming',place:'home',reveal:true},look:'Read <b>Points the biggest signal adds</b>.'},verify:[['dTop',12.85,0.05],['pV',24.51,0.05]]},
  {id:'t21',kind:'test',lvl:'bio',
   q:'Under federal Tobacco 21 law (December 2019), what is the minimum age to buy e-cigarettes in the US?',
   choices:['18','19','21','It depends only on the state'],correct:2,
   steps:['Tobacco 21 set one federal minimum age for buying tobacco products.','It covers e-cigarettes too.','The minimum age is 21.']},
  {id:'ab',kind:'test',lvl:'honors',
   q:'An A/B test of the energy drink ad: version A (plain) gets 185 clicks per 1,000 users, version B (a late-night message) gets 245. Clicks from late-night or stress-search users go from 148 to 217. How many more clicks per 1,000 does B get from those users?',
   num:{ans:69,tol:1,unit:'clicks'},
   steps:['Late-night or stress-search users: 217 − 148 = 69 more clicks per 1,000.','Everyone else: 37 → 28, so 9 fewer.','B wins by 60 overall, and all of the gain comes from users with late-night or stress-search signals. The test keeps B because it only counts clicks.']},
  {id:'crowd',kind:'real',lvl:'honors',
   q:'In the crowd of 1,000 fictional users, how many are shown the vape-style ad and read as under 21 (a known minor or a likely teen)?',
   num:{ans:56,tol:0,unit:'people'},
   steps:['91 users are shown the vape-style ad, because it has their highest click score.','56 of them have an age signal under 21.','No one chose to show it to them. The model ranked clicks, and age was just one more signal.'],
   lab:{set:{law:false},look:'Read <b>In the crowd of 1,000</b>.'},verify:[['vapeU21',56,0.5]]},
  {id:'sb41',kind:'test',lvl:'honors',
   q:'Under Colorado’s SB24-041 (in force October 1, 2025), what must a business have before it uses the data of a user it knows is under 18 for targeted ads?',
   choices:['Nothing: the law covers only tobacco sales','Consent from the minor or a parent or guardian','A court order','Proof the ad is for a healthy product'],correct:1,
   steps:['SB24-041 amends the Colorado Privacy Act.','For a known minor, targeted advertising, sale of data and certain profiling need consent.','It also bans design features that significantly increase, sustain or extend a minor’s use.']},
  {id:'logit',kind:'test',lvl:'ap',
   q:'For the energy drink, the default profile has z = −3.2 + 0.3 + 0.5(1.5) + 0.6 + 0.6 + 0. What is P(click), in percent, to one decimal?',
   num:{ans:27.9,tol:0.1,unit:'%'},
   steps:['z = −3.2 + 0.3 + 0.75 + 0.6 + 0.6 = −0.95.','P = 1/(1 + e^0.95) = 1/(1 + 2.586) = 0.279.','So P ≈ 27.9%.'],
   lab:{set:{ad:'energy',age:'known',late:1.5,search:'stress',follow:'gaming',place:'home'},look:'Read <b>Energy drink: chance of a click</b>.'},verify:[['pE',27.89,0.05]]}
 ]
}
});

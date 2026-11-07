BioLab.addReview({
herd:{
 questions:[
  {id:'hit',kind:'real',lvl:'bio',
   q:'Where no one is immune, one case of measles infects about 15 people. What percent of people must be immune so that each case infects fewer than 1 person on average? Round to the nearest 0.1%.',
   num:{ans:93.3,tol:0.1,unit:'%'},
   steps:['Each case must infect fewer than 1 of its 15 contacts, so fewer than 1 in 15 can be unprotected.','Share immune needed: 1 − 1/15 = 14/15.','14 ÷ 15 ≈ 0.933, or 93.3%.'],
   lab:{set:{r0:15,ve:97,cant:1,comm:'school',reveal:true},look:'Read <b>Herd immunity threshold, 1 − 1/R₀</b>.'},verify:[['hit',93.33,0.01]]},
  {id:'school90',kind:'real',lvl:'bio',
   q:'Your school of 1,000 students has 90% two-dose coverage. One case of measles arrives. Using this model (R₀ = 15, 97% effectiveness), about how many students catch measles?',
   choices:['About 10','About 30','About 98','About 900'],correct:2,
   steps:['Protected: 0.90 × 0.97 = 87.3% of students, so 127 are not protected.','Each case infects 15 × 0.127 ≈ 1.9 others: more than 1, so it grows.','The SIR model says it runs through about 77% of the 127 unprotected students: about 98 catch it.'],
   lab:{set:{comm:'school',cov:90,r0:15,ve:97,cant:1,reveal:true},look:'Read <b>Catch measles after one case arrives</b>.'},verify:[['sick',98.4,0.3],['re',1.905,0.001]]},
  {id:'need',kind:'test',lvl:'honors',
   q:'Measles R₀ = 15. Two doses of MMR protect about 97% of people who get them. What vaccination coverage is needed to stop spread? Round to the nearest 0.1%.',
   num:{ans:96.2,tol:0.1,unit:'%'},
   steps:['Share that must be immune: 1 − 1/15 ≈ 0.9333.','Only 97% of vaccinated people are protected, so coverage × 0.97 must reach 0.9333.','Coverage = 0.9333 ÷ 0.97 ≈ 0.962, or 96.2%.'],
   lab:{set:{r0:15,ve:97,cant:1,reveal:true},look:'Read <b>Coverage needed to stop spread</b>.'},verify:[['need',96.22,0.01]]},
  {id:'r018',kind:'test',lvl:'honors',
   q:'Use the top of the commonly cited range, R₀ = 18, with 97% effectiveness. What coverage is needed now?',
   choices:['94.4%','95.0%','97.4%','99.9%'],correct:2,
   steps:['Threshold: 1 − 1/18 ≈ 0.9444.','Coverage: 0.9444 ÷ 0.97 ≈ 0.974.','About 97.4%. The 94.4% is the share that must be immune, not the share that must be vaccinated.'],
   lab:{set:{r0:18,ve:97,cant:1,reveal:true},look:'Read <b>Coverage needed to stop spread</b>.'},verify:[['need',97.37,0.01]]},
  {id:'cant',kind:'real',lvl:'honors',
   q:'In the same school at 90% coverage, 10 students cannot be vaccinated because of medical conditions. About how many of them catch measles when one case arrives?',
   num:{ans:7.7,tol:0.3,unit:'students'},
   steps:['They are part of the 127 unprotected students.','In this model about 98.4 of the 127 catch it: 98.4 ÷ 127 ≈ 77.5%.','10 × 0.775 ≈ 7.7. At the 96.2% threshold the same calculation gives about 1.6 of them.'],
   lab:{set:{comm:'school',cov:90,r0:15,ve:97,cant:1,reveal:true},look:'Read <b>Of those who cannot be vaccinated, catch measles</b>.'},verify:[['cantsick',7.75,0.05]]},
  {id:'uscases',kind:'test',lvl:'ap',
   q:'CDC counted 285 U.S. measles cases in 2024 and 2,289 in 2025. By what factor did cases grow? Round to one decimal place.',
   num:{ans:8.0,tol:0.05,unit:'times'},
   steps:['Growth factor = 2,289 ÷ 285.','2,289 ÷ 285 ≈ 8.03.','About 8.0 times. From 2025 to 2026 (5,182 as of November 5), the factor was 5,182 ÷ 2,289 ≈ 2.3, and the year was not over.']},
  {id:'deaths',kind:'test',lvl:'bio',
   q:'Worldwide measles deaths fell from 777,000 in 2000 to 95,000 in 2024. By what percent did they fall? Round to the nearest whole percent.',
   num:{ans:88,tol:0.5,unit:'%'},
   steps:['Drop: 777,000 − 95,000 = 682,000.','Percent drop: 682,000 ÷ 777,000 ≈ 0.878.','About 88%. Second-dose coverage rose from 17% to 76% over the same years.']}
 ]
}
});

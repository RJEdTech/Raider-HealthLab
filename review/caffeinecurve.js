BioLab.addReview({
caffeinecurve:{
 questions:[
  {id:'coffee',kind:'real',lvl:'bio',
   q:'You drink an 8 oz brewed coffee (about 95 mg) at 12:30 PM and go to sleep at 10:30 PM. With a 5-hour half-life, about how many mg are still in you at bedtime?',
   num:{ans:23.75,tol:0.5,unit:'mg'},
   steps:['12:30 PM to 10:30 PM is 10 hours: 10 ÷ 5 = 2 half-lives.','After one half-life: 95 ÷ 2 = 47.5 mg. After two: 47.5 ÷ 2 = 23.75 mg.','About 24 mg, roughly two thirds of a can of cola.'],
   lab:{set:{d1:'coffee',t1:750,d2:'none',bed:1350,reveal:true},look:'Read <b>Still in you at bedtime</b>.'},verify:[['bedmg',23.75,0.01]]},
  {id:'two',kind:'real',lvl:'bio',
   q:'Black tea (about 47 mg) at 1 PM and a cola (about 35 mg) at 6 PM. You fall asleep at 11 PM. With a 5-hour half-life, how much caffeine is left at bedtime?',
   num:{ans:29.25,tol:0.5,unit:'mg'},
   steps:['Tea: 10 hours before bed, 2 half-lives: 47 × 1/4 = 11.75 mg.','Cola: 5 hours before bed, 1 half-life: 35 × 1/2 = 17.5 mg.','Drinks add: 11.75 + 17.5 = 29.25 mg.'],
   lab:{set:{d1:'tea',t1:780,d2:'cola',t2:1080,bed:1380,reveal:true},look:'Read <b>Still in you at bedtime</b>.'},verify:[['bedmg',29.25,0.01]]},
  {id:'frac',kind:'test',lvl:'honors',
   q:'With a 5-hour half-life, what percent of a drink’s caffeine is still in you 7.5 hours later? Round to the nearest tenth.',
   num:{ans:35.4,tol:0.1,unit:'%'},
   steps:['7.5 hours ÷ 5 hours = 1.5 half-lives.','(1/2)^1.5 = 1 ÷ 2^1.5 = 1 ÷ 2.828 ≈ 0.354.','About 35.4%. For a 160 mg energy drink, that is about 57 mg.']},
  {id:'latest',kind:'real',lvl:'honors',
   q:'You want at most 20 mg of caffeine in you at a 10 PM bedtime, and your only drink is a shot of espresso (about 63 mg). With a 5-hour half-life, how many hours before bed must you drink it? Round to the nearest hundredth.',
   num:{ans:8.28,tol:0.02,unit:'h'},
   steps:['Solve 63 × (1/2)^(t/5) = 20, so (1/2)^(t/5) = 20/63.','t = 5 × log₂(63/20) = 5 × log₂(3.15) ≈ 5 × 1.655 ≈ 8.28 hours.','8.28 hours before 10 PM is about 1:43 PM.'],
   lab:{set:{d1:'espresso',t1:900,d2:'none',d3:'none',bed:1320,limit:20,half:5,reveal:true},look:'Read <b>Your latest drink must be at least this long before bed</b> and the latest time.'},verify:[['lead',8.277,0.002]]},
  {id:'person',kind:'real',lvl:'honors',
   q:'A 16 oz energy drink (about 160 mg) at 3 PM, asleep at 10:30 PM. How much is left at bedtime for someone whose half-life is 7 hours?',
   num:{ans:76.1,tol:0.5,unit:'mg'},
   steps:['7.5 hours ÷ 7 hours ≈ 1.071 half-lives.','160 × (1/2)^1.071 ≈ 160 × 0.476 ≈ 76.1 mg.','With a 5-hour half-life it would be about 57 mg, and with 3 hours about 28 mg.'],
   lab:{set:{d1:'energy',t1:900,d2:'none',d3:'none',bed:1350,half:7,reveal:true},look:'Read <b>Still in you at bedtime</b>.'},verify:[['bedmg',76.14,0.01]]},
  {id:'solve',kind:'test',lvl:'ap',
   q:'Solve 160(1/2)^(t/5) = 40 for t.',
   choices:['t = 5','t = 7.5','t = 10','t = 20'],correct:2,
   steps:['Divide by 160: (1/2)^(t/5) = 1/4 = (1/2)².','So t/5 = 2 and t = 10.','In general t = h·log₂(A₀/A) = 5·log₂ 4 = 10 hours.']},
  {id:'hour',kind:'test',lvl:'ap',
   q:'With a 5-hour half-life, what percent of the caffeine is left after each hour? Round to the nearest tenth.',
   num:{ans:87.1,tol:0.1,unit:'%'},
   steps:['Hourly factor: (1/2)^(1/5).','(1/2)^0.2 = e^(−0.2 ln 2) ≈ e^(−0.1386) ≈ 0.8706.','So about 87.1% is left after each hour; about 12.9% is cleared each hour.'],
   lab:{set:{half:5},look:'Read <b>Share left after each hour</b>.'},verify:[['perhour',87.06,0.01]]}
 ]
}
});

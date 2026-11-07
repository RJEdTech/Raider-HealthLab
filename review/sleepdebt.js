BioLab.addReview({
sleepdebt:{
 questions:[
  {id:'week',kind:'real',lvl:'bio',
   q:'On school nights you fall asleep at 11:30 PM and wake up at 6:00 AM. Your goal is 8 hours a night. How many hours short are you by the end of the school week (five nights)?',
   num:{ans:7.5,tol:0.05,unit:'h'},
   steps:['One night: 11:30 PM to 6:00 AM is 6 h 30 min, or 6.5 hours.','Short each night: 8 − 6.5 = 1.5 hours.','Five school nights: 5 × 1.5 = 7.5 hours, almost a whole night of sleep.'],
   lab:{set:{wbed:690,wwake:1080,goal:8,reveal:true},look:'Read <b>Short of your goal per school week</b>.'},verify:[['debt',7.5,0.001],['school',6.5,0.001]]},
  {id:'weekend',kind:'real',lvl:'bio',
   q:'Same school nights (11:30 PM to 6:00 AM). On Friday and Saturday you sleep from 1:00 AM to 11:00 AM. With an 8-hour goal, how far short are you for the whole week?',
   num:{ans:3.5,tol:0.05,unit:'h'},
   steps:['School nights: 7.5 hours short (5 × 1.5).','Weekend nights: 10 hours each, 2 over the goal. Two nights pay back 4 hours.','7.5 − 4 = 3.5 hours still short. Check: 7 × 8 − 5 × 6.5 − 2 × 10 = 56 − 32.5 − 20 = 3.5.'],
   lab:{set:{wbed:690,wwake:1080,ebed:780,ewake:1380,goal:8,reveal:true},look:'Read <b>Still short for the whole week, after the weekend</b>.'},verify:[['still',3.5,0.001]]},
  {id:'class',kind:'test',lvl:'bio',
   q:'In the 2023 CDC Youth Risk Behavior Survey, 76.8% of US high school students got less than 8 hours on an average school night. In a class of 30 students like that, about how many would get 8 hours or more?',
   num:{ans:7,tol:0.5,unit:'students'},
   steps:['Share with 8 or more hours: 100% − 76.8% = 23.2%.','23.2% of 30 = 0.232 × 30 ≈ 6.96.','About 7 students out of 30.']},
  {id:'sjl',kind:'test',lvl:'honors',
   q:'School nights: asleep 11:30 PM, up 6:00 AM. Weekends: asleep 1:00 AM, up 11:00 AM. How many hours of social jet lag is that?',
   num:{ans:3.25,tol:0.02,unit:'h'},
   steps:['School-night midpoint: 11:30 PM + 6.5 h ÷ 2 = 11:30 PM + 3 h 15 min = 2:45 AM.','Weekend midpoint: 1:00 AM + 10 h ÷ 2 = 1:00 AM + 5 h = 6:00 AM.','Gap: 2:45 AM to 6:00 AM is 3 h 15 min = 3.25 hours, a bit more than flying from San Francisco to New York.'],
   lab:{set:{wbed:690,wwake:1080,ebed:780,ewake:1380,reveal:true},look:'Read <b>Social jet lag</b> and look at the two midpoint diamonds.'},verify:[['sjl',3.25,0.001]]},
  {id:'later',kind:'real',lvl:'honors',
   q:'Same student (asleep 11:30 PM, up 6:00 AM). Their school moves the start 70 minutes later, and they respond the way Cherry Creek students did: waking about 61 minutes later and falling asleep about 13 minutes later. What is their new school-week shortfall from 8 hours?',
   num:{ans:3.5,tol:0.05,unit:'h'},
   steps:['Extra sleep per night: 61 − 13 = 48 minutes = 0.8 hours.','New school night: 6.5 + 0.8 = 7.3 hours, 0.7 short of 8.','Five nights: 5 × 0.7 = 3.5 hours, down from 7.5. The later start cuts the shortfall by more than half, but does not erase it for this student.'],
   lab:{set:{wbed:690,wwake:1080,goal:8,later:70,reveal:true},look:'Read <b>Short per school week with the later start</b>.'},verify:[['withlater',3.5,0.001],['gain',48,0.001]]},
  {id:'mid',kind:'test',lvl:'ap',
   q:'You fall asleep at 12:15 AM and wake at 9:45 AM. What is your sleep midpoint?',
   choices:['4:30 AM','5:00 AM','4:45 AM','5:15 AM'],correct:1,
   steps:['Time asleep: 12:15 AM to 9:45 AM is 9 h 30 min.','Half of that: 4 h 45 min.','12:15 AM + 4 h 45 min = 5:00 AM. Check: it is also the average of the two clock times, (0:15 + 9:45) ÷ 2 = 5:00.']},
  {id:'scale',kind:'test',lvl:'ap',
   q:'Using Cherry Creek’s ratios scaled in a straight line (wake moves 61/70 of the shift, bedtime 13/70), how many minutes later does the school-night midpoint move for a 70-minute later start?',
   num:{ans:37,tol:0.5,unit:'min'},
   steps:['Midpoint = (bed + wake) ÷ 2, so it moves by the average of the two shifts.','(61 + 13) ÷ 2 = 37 minutes.','So social jet lag shrinks by 37 minutes, if the weekend schedule stays the same.']}
 ]
}
});

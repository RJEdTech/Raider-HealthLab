BioLab.addReview({
cprclock:{
 questions:[
  {id:'nohelp',kind:'real',lvl:'bio',
   q:'In this model, 50 of 100 people would go home with a shock the instant they collapsed, and the chance falls 10% of what is left each minute with no CPR. No one helps, and paramedics shock when they arrive at 7.6 minutes. Out of 100, about how many go home?',
   num:{ans:22,tol:1,unit:'people'},
   steps:['Each minute keeps 90% of the chance: multiply by 0.9 once per minute.','For 7.6 minutes: 0.9^7.6 ≈ 0.449.','50 × 0.449 ≈ 22.4, so about 22 out of 100.'],
   lab:{set:{cpr:false,aed:false,ems:7.6,rate:10,rcpr:3,s0:50,model:'exp',reveal:true},look:'Read <b>Go home in this scenario</b>.'},verify:[['home',22.45,0.05],['none',22.45,0.05]]},
  {id:'bystander',kind:'real',lvl:'bio',
   q:'Same person, but you start CPR at 1 minute and a coach shocks with an AED at 3 minutes. During CPR the chance falls 3% a minute (the model’s assumption). How many more people out of 100 go home than with no help?',
   num:{ans:20,tol:0.6,unit:'people'},
   steps:['First minute, no CPR: 50 × 0.9 = 45.','Minutes 1 to 3, CPR: 45 × 0.97² = 45 × 0.9409 ≈ 42.3. The shock at 3 minutes stops the clock.','42.3 − 22.4 ≈ 19.9, so about 20 more people out of every 100 go home.'],
   lab:{set:{cpr:true,tcpr:1,aed:true,taed:3,ems:7.6,rate:10,rcpr:3,s0:50,model:'exp',reveal:true},look:'Read <b>Go home in this scenario</b> and <b>Extra people who go home because someone helped</b>.'},verify:[['home',42.34,0.05],['extra',19.89,0.05]]},
  {id:'range',kind:'test',lvl:'honors',
   q:'The CARES rule of thumb is that survival falls 7% to 10% per minute with no CPR or defibrillation. At the low end, 7% of what is left each minute, what percent of the starting chance is left after 7.6 minutes?',
   num:{ans:57.6,tol:0.3,unit:'%'},
   steps:['Each minute keeps 93% of the chance.','0.93^7.6 = e^(7.6 × ln 0.93) = e^(7.6 × −0.0726) ≈ e^(−0.552) ≈ 0.576.','About 57.6% is left. At 10% a minute it would be 44.9%.'],
   lab:{set:{rate:7,cpr:false,aed:false,ems:7.6,rcpr:3,s0:50,model:'exp',reveal:true},look:'Read <b>Share of the starting chance kept</b>.'},verify:[['kept',57.61,0.05]]},
  {id:'farems',kind:'real',lvl:'honors',
   q:'At an away game in the mountains, the ambulance takes 12 minutes. Compare no help with CPR at 1 minute plus an AED shock at 3 minutes (10% a minute with no CPR, 3% during CPR, starting at 50 of 100).',
   choices:['No help: about 14. CPR and AED: about 42','No help: about 22. CPR and AED: about 42','No help: about 14. CPR and AED: about 32','Both about 14: the ambulance time decides everything'],correct:0,
   steps:['No help: 50 × 0.9^12 ≈ 14.1.','CPR and AED: the shock at 3 minutes comes before the ambulance, so the answer is the same as before: 50 × 0.9 × 0.97² ≈ 42.3.','CPR alone would give 50 × 0.9 × 0.97^11 ≈ 32.2. The farther away help is, the more an AED nearby is worth.'],
   lab:{set:{ems:12,cpr:true,tcpr:1,aed:true,taed:3,rate:10,rcpr:3,s0:50,model:'exp',reveal:true},look:'Read <b>Go home if no one helps</b>, <b>With CPR only</b> and <b>With CPR and an AED</b>.'},verify:[['none',14.12,0.05],['both',42.34,0.05],['cpronly',32.19,0.05]]},
  {id:'half',kind:'test',lvl:'ap',
   q:'With no CPR, the chance keeps 90% of what is left each minute. After how many minutes is half of the starting chance gone? Give your answer to the nearest 0.1 minute.',
   num:{ans:6.6,tol:0.05,unit:'min'},
   steps:['Solve 0.9ᵗ = 0.5.','Take logs: t = ln 0.5 ÷ ln 0.9 = −0.6931 ÷ −0.1054 ≈ 6.58.','About 6.6 minutes, less than the 7.6-minute median ambulance time.']},
  {id:'linear',kind:'test',lvl:'ap',
   q:'A poster says “survival falls 10% a minute.” After 5 minutes with no help, what share of the starting chance is left if you read it as linear, and as exponential?',
   choices:['Linear 50%, exponential 59%','Linear 59%, exponential 50%','Both 50%','Linear 0%, exponential 50%'],correct:0,
   steps:['Linear: lose 10% of the starting chance each minute. 1 − 0.10 × 5 = 0.50.','Exponential: keep 90% of what is left each minute. 0.9⁵ = 0.59049 ≈ 59%.','The two readings split further apart over time: the linear one hits zero at 10 minutes.'],
   lab:{set:{model:'lin',cpr:false,aed:false,ems:5,rate:10,rcpr:3,s0:50,reveal:true},look:'Read <b>Share of the starting chance kept</b>, then switch to the exponential model.'},verify:[['kept',50,0.01]]}
 ]
}
});

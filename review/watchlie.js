BioLab.addReview({
watchlie:{
 questions:[
  {id:'total',kind:'real',lvl:'bio',
   q:'A sleep lab says you slept 400 minutes and were awake 80 minutes after lights out. Your tracker scored 60 of those awake minutes as sleep, and 10 minutes of your real sleep as awake. What total sleep does the tracker report?',
   num:{ans:450,tol:0.5,unit:'min'},
   steps:['Start from the real sleep: 400 minutes.','Take away the real sleep it called awake: 400 − 10 = 390.','Add the awake time it called sleep: 390 + 60 = 450 minutes. It over-reports by 50 minutes, 7 h 30 min instead of 6 h 40 min.']},
  {id:'what',kind:'test',lvl:'bio',
   q:'What does a typical wrist sleep tracker use to decide whether you are asleep?',
   choices:['Brain waves (EEG)','Movement and heart rate','Eye movement and muscle activity','Breathing sounds only'],correct:1,
   steps:['A sleep lab (polysomnography) records brain waves, eye movement, muscle activity, heart rate and more.','A wrist tracker has movement and heart rate, so it has to infer sleep from them.','That is why lying awake and still fools it.']},
  {id:'restless',kind:'real',lvl:'bio',
   q:'In the tool, choose the restless night with the tracker at setting 12 and heart rate on. How many minutes does the tracker over-report?',
   num:{ans:71,tol:0.5,unit:'min'},
   steps:['Turn on Show the scoring now and read Tracker over-reports by.','The tracker says 419 minutes; the sleep lab says 348.','419 − 348 = 71 minutes, about three times the 23 on the typical night.'],
   lab:{set:{night:'restless',thr:12,hr:true,reveal:true},look:'Read <b>Tracker over-reports by</b>.'},verify:[['over',71,0.01],['trk',419,0.01],['truth',348,0.01]]},
  {id:'matrix',kind:'test',lvl:'honors',
   q:'A night is scored in 960 epochs. Real sleep scored as sleep: 780. Real sleep scored as wake: 20. Real wake scored as sleep: 96. Real wake scored as wake: 64. What are the sensitivity and specificity?',
   choices:['97.5% and 40%','89% and 76%','97.5% and 60%','81% and 7%'],correct:0,
   steps:['Sensitivity uses only real sleep: 780 ÷ (780 + 20) = 780 ÷ 800 = 97.5%.','Specificity uses only real wake: 64 ÷ (96 + 64) = 64 ÷ 160 = 40%.','Both match the pattern in real device studies: sleep caught well, wake caught poorly.']},
  {id:'spec',kind:'real',lvl:'honors',
   q:'On the typical night, with the tracker at setting 12 and heart rate on, what percent of real wake does it score as wake? Round to the nearest tenth.',
   num:{ans:36.2,tol:0.1,unit:'%'},
   steps:['Real wake: 58 minutes, or 116 epochs.','The tracker scores 42 of those epochs (21 min) as wake; the other 37 minutes it calls sleep.','42 ÷ 116 ≈ 36.2%. That sits inside the 18% to 54% range Chinoy and colleagues found for real devices.'],
   lab:{set:{night:'typical',thr:12,hr:true,reveal:true},look:'Read <b>Specificity</b> and <b>Awake minutes scored as sleep</b>.'},verify:[['spec',36.21,0.01],['missed',37,0.01]]},
  {id:'acc',kind:'test',lvl:'ap',
   q:'A sensor has 95% sensitivity and 37% specificity. On a night that is 80% sleep, what is its epoch-by-epoch accuracy?',
   num:{ans:83.4,tol:0.1,unit:'%'},
   steps:['Accuracy = P(sleep) × sensitivity + P(wake) × specificity.','= 0.80 × 0.95 + 0.20 × 0.37 = 0.760 + 0.074 = 0.834.','83.4% sounds good, but it is mostly the easy sleep epochs. Accuracy depends on how much of the night was awake.']},
  {id:'cancel',kind:'test',lvl:'ap',
   q:'On the typical night (heart rate on), press Find the setting with the smallest total error. How many epochs does the tracker score wrong at that setting?',
   num:{ans:144,tol:0.5,unit:'epochs'},
   steps:['The best setting for the total is 9, where the tracker is off by only 7 minutes (it now under-reports slightly).','But it scores 144 epochs wrong, against 102 at setting 12.','Lowering the setting adds false wake that cancels missed wake in the total, while making more individual epochs wrong.'],
   lab:{set:{night:'typical',hr:true,reveal:true},act:'best',look:'Read <b>Tracker over-reports by</b> and <b>Epochs scored wrong</b>.'},verify:[['wrong',144,0.01],['over',-7,0.01]]}
 ]
}
});

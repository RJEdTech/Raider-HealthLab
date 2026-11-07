BioLab.addReview({
screentime:{
 questions:[
  {id:'total',kind:'real',lvl:'bio',
   q:'The sample week’s daily screen time is 245, 210, 268, 230, 312, 410 and 355 minutes. How many hours is that in total, to one decimal?',
   num:{ans:33.8,tol:0.05,unit:'h'},
   steps:['Add the days: 245 + 210 + 268 + 230 + 312 + 410 + 355 = 2,030 minutes.','Divide by 60: 2,030 ÷ 60 = 33.83.','About 33.8 hours, more than a full day and a third.'],
   lab:{set:{week:'sample'},act:'show',look:'Read <b>Screen time this week</b>.'},verify:[['total',33.83,0.01]]},
  {id:'median',kind:'test',lvl:'honors',
   q:'A student’s week: 180, 240, 150, 600, 210, 195 and 225 minutes. What is the median?',
   num:{ans:210,tol:0,unit:'min'},
   steps:['Put the days in order: 150, 180, 195, 210, 225, 240, 600.','With 7 values, the median is the 4th: 210 minutes.','The mean is 1,800 ÷ 7 ≈ 257 minutes. One 600-minute day pulls the mean far above the typical day, which is why the median describes this week better.']},
  {id:'npwh',kind:'real',lvl:'bio',
   q:'The sample week averages about 152 notifications a day. If you are awake 16 hours a day, about how many notifications arrive per waking hour?',
   num:{ans:9.5,tol:0.1,unit:'per hour'},
   steps:['Mean notifications: (160 + 145 + 170 + 150 + 190 + 120 + 130) ÷ 7 = 1,065 ÷ 7 ≈ 152.1.','Per waking hour: 152.1 ÷ 16 ≈ 9.5.','That is about one every 6 or 7 minutes (60 ÷ 9.5 ≈ 6.3).'],
   lab:{set:{week:'sample',awake:16},act:'show',look:'Read <b>Notifications per waking hour</b>.'},verify:[['npwh',9.509,0.01]]},
  {id:'over',kind:'real',lvl:'honors',
   q:'Teen accounts in the Meta settlement get a 2-hour daily limit. In the sample week, every day is over 2 hours. How many minutes over the limit is the week in total?',
   num:{ans:1190,tol:0,unit:'min'},
   steps:['Since every day is over 120 minutes, subtract 7 × 120 = 840 from the total.','2,030 − 840 = 1,190 minutes.','That is about 19.8 hours a week over the limit, or 170 minutes a day on average.'],
   lab:{set:{week:'sample'},act:'show',look:'Read <b>Minutes over 2 hours, all week</b>.'},verify:[['overmin',1190,0],['over',7,0]]},
  {id:'cut',kind:'test',lvl:'honors',
   q:'The sample week has 285 minutes after 10 p.m. You estimate that 50% of that use starts with a notification. How many minutes a week would a notification-free window from 10 p.m. cut?',
   num:{ans:142.5,tol:0.5,unit:'min'},
   steps:['Minutes cut = late-night minutes × share started by a notification.','285 × 0.50 = 142.5 minutes a week.','Per night: 142.5 ÷ 7 ≈ 20 minutes. The other half of the late-night use is not started by a notification, so silencing alerts will not touch it.'],
   lab:{set:{week:'sample',trig:50},act:'show',look:'Read <b>Late-night minutes a notification-free window would cut</b>.'},verify:[['cut',142.5,0.01]]},
  {id:'sg',kind:'real',lvl:'bio',
   q:'According to the U.S. Surgeon General’s 2023 advisory, about what share of 13- to 17-year-olds say they use social media “almost constantly”?',
   choices:['Fewer than 1 in 10','More than a third','Nearly all'],correct:1,
   steps:['The advisory reports that up to 95% of 13- to 17-year-olds use social media.','More than a third say they use it “almost constantly.”','“Up to 95%” is how many use it at all, not how many use it constantly.']},
  {id:'sdr',kind:'test',lvl:'ap',
   q:'Two weeks have the same mean, 290 minutes a day. Week A’s standard deviation is 73 minutes; week B’s is 15. Which statement is true?',
   choices:['Week B’s days are much more alike from day to day','Week A has more total screen time','Week B must have a higher median'],correct:0,
   steps:['Same mean, same 7 days: same total (2,030 minutes).','Standard deviation measures how far a typical day sits from the mean. 15 minutes means week B’s days are all close to 290.','The sample week is like week A: s ≈ 73 minutes, from a quiet 210 to a heavy 410.'],
   lab:{set:{week:'sample'},act:'show',look:'Read <b>Standard deviation of daily minutes</b>.'},verify:[['sd',72.59,0.01]]}
 ]
}
});

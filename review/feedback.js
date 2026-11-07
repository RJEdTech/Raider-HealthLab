BioLab.addReview({
feedback:{
 questions:[
  {id:'snack',kind:'real',lvl:'bio',
   q:'After a snack, blood sugar is 40 mg/dL above its set point of 90. The target band is 80 to 100 mg/dL and the insulin signal lands 10 minutes late. With a gentle response (gain 0.20), about how many minutes does blood sugar spend outside the band?',
   num:{ans:65,tol:3,unit:'min'},
   steps:['Start at 130 mg/dL, 30 above the top of the band.','For the first 10 minutes nothing happens: the insulin has not landed yet.','After that, a gain of 0.20 closes the gap slowly, about 20% of it per 10 minutes at first. Run the loop and it crosses back into the band at about 65 minutes.','A gain of 0.70 does it in about 21 minutes.'],
   lab:{set:{scen:'glucose',sign:'neg',push:1,lag:1,gain:0.2},look:'Read <b>Minutes off target</b>.'},verify:[['offMin',65,1]]},
  {id:'sweat',kind:'real',lvl:'bio',
   q:'On a hot run your body temperature rises. You sweat and the blood vessels in your skin widen, and your temperature comes back down. What kind of loop is this?',
   choices:['Positive feedback','Negative feedback','Not a feedback loop'],correct:1,
   steps:['The change is a rise in temperature.','The response (sweating, wider skin blood vessels) moves heat out and pushes temperature down, the opposite way.','A response that opposes the change is negative feedback. The hypothalamus in the brain is the control center.']},
  {id:'which',kind:'test',lvl:'bio',
   q:'Which of these is positive feedback?',
   choices:['Insulin lowering blood sugar after a meal','Shivering when you are cold','High estrogen triggering more LH release before ovulation','Glucagon raising blood sugar when it is low'],correct:2,
   steps:['Positive feedback amplifies a change instead of opposing it.','Before ovulation, high estrogen makes the brain and pituitary release more LH. The surge builds until ovulation ends it.','The other three all push the value back toward its set point: negative feedback.']},
  {id:'nofix',kind:'real',lvl:'bio',
   q:'Your feed shows you more of whatever you watch. A friend says a gentler algorithm would fix the runaway. In this model, what actually brings it back to your usual time?',
   choices:['A smaller gain','A bigger push the other way, once','Changing the sign: a stopping rule, such as a daily limit, that opposes extra watching'],correct:2,
   steps:['With positive feedback, any gain above zero makes the gap grow; a smaller gain only slows the runaway.','A stopping rule is a response that opposes the change, which makes the loop negative.','Here, at gain 0.20 the positive loop adds about 2,229 extra minutes over 3 weeks. A stopping rule at gain 0.75 holds it to about 36.'],
   lab:{set:{scen:'feed',sign:'pos',push:1,gain:0.2},look:'Read <b>Minutes off target</b>, then switch to negative feedback.'},verify:[['offMin',2229.4,2]]},
  {id:'limit',kind:'real',lvl:'honors',
   q:'You add a daily limit of 60 minutes after one long night (+20 minutes). A gentle rule (gain 0.20) costs about 100 extra minutes over 3 weeks. The fastest rule (gain 0.75) costs about 36. How many minutes does the firmer rule save?',
   num:{ans:63,tol:2,unit:'min'},
   steps:['Gentle rule: about 99.6 extra minutes over the limit in 3 weeks.','Firmer rule: about 36.4 extra minutes.','99.6 − 36.4 ≈ 63 minutes saved, about an hour of your time.'],
   lab:{set:{scen:'feed',sign:'neg',push:1,lag:1,gain:0.2},look:'Read <b>Minutes off target</b>, then press <b>Find the fastest gain</b>.'},verify:[['offMin',99.6,0.5]]},
  {id:'delay',kind:'test',lvl:'honors',
   q:'Blood sugar, gain 0.70. With the normal delay it spends about 21 minutes off target. If the delay doubles (Long), about how many minutes does it spend off target?',
   num:{ans:145,tol:5,unit:'min'},
   steps:['A longer delay means the response keeps pushing long after the gap has closed.','So it overshoots far below the band and swings back and forth.','Running the loop gives about 145 minutes off target, almost 7 times as long.'],
   lab:{set:{scen:'glucose',sign:'neg',push:1,lag:2,gain:0.7},look:'Read <b>Minutes off target</b> and <b>Overshoot past the set point</b>.'},verify:[['offMin',145,1]]},
  {id:'crit',kind:'test',lvl:'ap',
   q:'For de/dt = −g·e(t − τ) with τ = 2 steps, what is the largest gain with no overshoot at all? Give 2 decimals.',
   num:{ans:0.18,tol:0.01,unit:''},
   steps:['Try e = e^(λt): λ = −g·e^(−λτ).','Real (non-swinging) roots exist only when g·τ ≤ 1/e.','g ≤ 1/(2e) = 1/5.437 ≈ 0.18.']}
 ]
}
});

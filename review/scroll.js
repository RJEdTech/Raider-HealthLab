BioLab.addReview({
scroll:{
 questions:[
  {id:'fixed',kind:'real',lvl:'bio',
   q:'Fixed ratio, one new post on every 5th pull, 100 pulls. Then the posts stop. How many more times does the simulated user pull before it gives up?',
   num:{ans:7,tol:0,unit:'pulls'},
   steps:['On a fixed schedule the longest empty run while posts came was 4 pulls (pulls 1 to 4 of each group of 5).','The user gives up when an empty run passes 1.5 × 4 = 6, so on the 7th empty pull.','The 100th pull showed a post, so the empty run starts at 0: it pulls 7 more times.'],
   lab:{set:{sched:'fixed',ratio:5},act:'show',look:'Read <b>Pulls after the posts stop</b> and <b>Longest dry streak</b>.'},verify:[['after',7,0],['maxdry',4,0]]},
  {id:'variable',kind:'real',lvl:'bio',
   q:'Same average, but variable: each pull has a 1 in 5 chance. In this session, how many more times does the user pull after the posts stop?',
   choices:['About 7, the same as fixed','About 20','About 100'],correct:1,
   steps:['While posts were coming, this user once went 14 pulls in a row with nothing.','So an empty run after the posts stop does not look unusual for a long time.','It pulls 20 more times, almost three times the fixed schedule’s 7. Run new sessions and the number changes, but the variable schedule is almost always the more persistent one.'],
   lab:{set:{sched:'variable',ratio:5},act:'show',look:'Read <b>Pulls after the posts stop</b>, then try <b>Run a new session</b>.'},verify:[['after',20,0],['maxdry',14,0]]},
  {id:'rpe',kind:'test',lvl:'honors',
   q:'The model predicts V = 0.2 for a pull. A new post appears. What is the reward-prediction error δ?',
   num:{ans:0.8,tol:0.001,unit:''},
   steps:['δ = r − V, where r = 1 for a new post.','δ = 1 − 0.2 = 0.8: a burst, because the post was better than predicted.','If nothing had appeared, δ = 0 − 0.2 = −0.2: a small dip.']},
  {id:'update',kind:'test',lvl:'ap',
   q:'V = 0.5 and the learning rate α = 0.15. A post appears. What is the new prediction V?',
   num:{ans:0.575,tol:0.001,unit:''},
   steps:['δ = 1 − 0.5 = 0.5.','V ← V + αδ = 0.5 + 0.15 × 0.5 = 0.5 + 0.075.','New V = 0.575. Each surprise moves the prediction 15% of the way toward what happened.']},
  {id:'quit',kind:'test',lvl:'ap',
   q:'Variable schedule. The longest empty run while posts came was 14 pulls, and patience is 1.5. When the posts stop, the user is already 2 empty pulls into a run. It quits on the first pull where its empty run passes 1.5 × 14. How many pulls after the posts stop?',
   num:{ans:20,tol:0,unit:'pulls'},
   steps:['1.5 × 14 = 21, so it quits when the empty run reaches 22.','It already has 2, so it needs 22 − 2 = 20 more pulls.','That matches the model: 20 pulls after the posts stop.'],
   lab:{set:{sched:'variable',ratio:5},act:'show',look:'Read <b>Longest dry streak</b> and <b>Pulls after the posts stop</b>.'},verify:[['after',20,0]]},
  {id:'shift',kind:'test',lvl:'honors',
   q:'Schultz, Dayan and Montague (1997) described how dopamine neurons respond once a reward becomes predictable. Which is right?',
   choices:['They keep firing hardest at the reward itself','Their response moves to the cue that predicts the reward, and they dip if the expected reward is left out','They stop responding to anything'],correct:1,
   steps:['Before learning: a burst at the unexpected reward.','After learning: the burst moves to the predicting cue, and the reward itself gets little response.','If the predicted reward is left out: a dip below baseline. In the tool, on the fixed schedule: pull response 0.95, post 0.07, dip −0.96.']},
  {id:'sherman',kind:'real',lvl:'bio',
   q:'In Sherman and colleagues’ 2016 study, teens were more likely to like a photo when…',
   choices:['It already had many likes','It came from a stranger','It had no likes yet'],correct:0,
   steps:['32 teens, ages 13 to 18, viewed photos while in an fMRI scanner.','They were more likely to like photos that already had many likes, and the nucleus accumbens was more active for those photos.','A like count works as a social reward, and it pulls more likes toward posts that already have them.']}
 ]
}
});

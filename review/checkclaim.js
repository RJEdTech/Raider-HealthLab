BioLab.addReview({
checkclaim:{
 questions:[
  {id:'metab',kind:'real',lvl:'bio',
   q:'“Boosts metabolism for all-day energy.” The seller ran the study, with 10 people, no control group, and paid for it. What does the rubric give it, out of 10?',
   num:{ans:0,tol:0,unit:'points'},
   steps:['Who ran it: the seller, 0 of 2.','People: 10 is under 30, 0 of 3.','Control group: no, 0 of 2. Randomized: no, 0 of 2.','Who paid: the seller, 0 of 1. Total 0: not supported.'],
   lab:{set:{claim:'metab',who:'seller',n:10,design:'none',paid:'seller',reveal:true},look:'Read <b>Evidence score</b>.'},verify:[['score',0,0.01]]},
  {id:'fake10',kind:'real',lvl:'bio',
   q:'In this simulation, a 10-person study with no control group tests a product that does nothing. Out of 100 such studies, about how many look like the product works (5 points or more of improvement)?',
   choices:['About 5','About 25','About 50','About 85'],correct:3,
   steps:['People sign up on a bad day, with a rating under 50.','On a later day their rating is usually closer to their normal, about 9 points higher on average, with no product at all.','So most small uncontrolled studies “show” an improvement: about 85 of 100 here.'],
   lab:{set:{claim:'metab',who:'seller',n:10,design:'none',paid:'seller'},look:'Read <b>Studies like this of a do-nothing product that look like it works</b>.'},verify:[['fake',84.5,0.6]]},
  {id:'focus',kind:'real',lvl:'bio',
   q:'“Clinically proven to sharpen focus.” The maker ran one randomized trial with a placebo group: 40 students, paid for by the maker. What does the rubric give it?',
   num:{ans:5,tol:0,unit:'points'},
   steps:['Who ran it: the seller, 0.','People: 40 is from 30 to 99, so 1.','Control group: yes, 2. Randomized: yes, 2.','Who paid: the seller, 0. Total 5: weak. “Clinically proven” told you a study exists, not how strong it is.'],
   lab:{set:{claim:'focus',who:'seller',n:40,design:'rct',paid:'seller',reveal:true},look:'Read <b>Evidence score</b>.'},verify:[['score',5,0.01]]},
  {id:'dshea',kind:'test',lvl:'bio',
   q:'Which statement about dietary supplements in the US is true?',
   choices:['The FDA approves each supplement as effective before it is sold','“FDA registered” means the FDA approved the product','Supplements do not need FDA approval for safety or effectiveness before they are sold','A supplement label may claim to cure a disease'],correct:2,
   steps:['Under DSHEA (1994), supplements do not need FDA approval for safety or effectiveness before sale.','Registration of a facility is not approval.','Labels with structure/function claims must say the product is not intended to diagnose, treat, cure or prevent any disease.']},
  {id:'muscle',kind:'real',lvl:'honors',
   q:'The muscle study compares 60 lifters who chose to take the product with 60 who chose not to. In this simulation, out of 100 such studies of a do-nothing product, about how many look like it works?',
   num:{ans:26,tol:2,unit:'of 100'},
   steps:['The takers tended to start on a bad day; the others less often.','So the takers bounce back more, even with no product.','The simulation counts about 26 false “works” out of 100. Randomizing 600 people gets that to 0.'],
   lab:{set:{claim:'muscle',who:'indep',n:120,design:'compare',paid:'seller'},look:'Read <b>Studies like this of a do-nothing product that look like it works</b>.'},verify:[['fake',25.5,0.6]]},
  {id:'rtm',kind:'test',lvl:'honors',
   q:'A team picks the 10 students with the lowest scores on one quiz. On the next quiz, with no extra help, their average rises. What is the best explanation?',
   choices:['The first quiz was harder for everyone','Regression to the mean: some of their low scores were partly bad luck that day','Low scorers always study more after a quiz'],correct:1,
   steps:['Picking the lowest scorers picks people who had a bad day, as well as people who usually score low.','On the next quiz, the bad luck mostly does not repeat.','So the group average moves back toward normal. A study with no control group would credit whatever came in between.']},
  {id:'moe',kind:'test',lvl:'ap',
   q:'A randomized study grows from 40 people to 640 (16 times as many). By about what factor should its 95% margin of error shrink?',
   choices:['2','4','8','16'],correct:1,
   steps:['The margin is about 1.96·s·√(1/n₁ + 1/n₂), so it scales with 1/√n.','√16 = 4, so the margin shrinks to about a quarter.','In the tool, with these random draws: about ±8.1 points at 40 people and ±2.0 at 640.'],
   lab:{set:{who:'indep',n:640,design:'rct',paid:'indep'},look:'Read <b>95% margin of error</b>, then set 40 people.'},verify:[['moe',1.97,0.05]]}
 ]
}
});

BioLab.addReview({
feedbuilder:{
 questions:[
  {id:'outrage',kind:'real',lvl:'bio',
   q:'You rank posts only by predicted watch time, with Explore at 20%. About how many of the 50 posts are outrage clips, which the viewer asked for none of?',
   choices:['About 5','About 20','About 36','All 50'],correct:2,
   steps:['Outrage clips hold this viewer about 36 s each (0.90 × a 40 s clip). A friend’s post holds them about 10.5 s.','Every exploit pick goes to the highest predicted watch time, so outrage clips win almost every time. Only the 20% random explore picks spread out.','Averaged over 10 runs: about 35.8 outrage clips out of 50.'],
   lab:{set:{wW:10,wL:0,wS:0,wC:0,wN:0,explore:20},look:'Read <b>Outrage clips</b> and <b>Feed from the top topic</b>.'},verify:[['outrage',35.8,0.05]]},
  {id:'likesmin',kind:'real',lvl:'bio',
   q:'Now rank only by likes (Explore 20%). To the nearest minute, how long does the viewer spend on the app across the 50 posts?',
   num:{ans:12,tol:1,unit:'min'},
   steps:['Friends’ posts get liked most (40%), so the feed fills with them: about 82% of the posts.','A friend’s post is short: about 10.5 s watched.','Averaged over 10 runs: about 11.6 minutes, against about 27.1 with watch-time ranking. The likes feed is closer to what the viewer asked for (52 against 28 out of 100), and it holds them less than half as long.'],
   lab:{set:{wW:0,wL:10,wS:0,wC:0,wN:0,explore:20},look:'Read <b>Minutes on the app</b> and <b>Viewer would endorse</b>.'},verify:[['minutes',11.64,0.05]]},
  {id:'score',kind:'test',lvl:'honors',
   q:'Weights: watch 2, likes 5, shares 10, comments 0, Not interested penalty 5. A study-tip post is predicted to hold the viewer 20.25 s, with P(like) = 0.08, P(share) = 0.14 and P(Not interested) = 0.05. What is its score, to two decimals?',
   num:{ans:2.23,tol:0.01,unit:''},
   steps:['Watch time enters in minutes: 20.25 s = 0.3375 min, and 2 × 0.3375 = 0.675.','Likes: 5 × 0.08 = 0.40. Shares: 10 × 0.14 = 1.40. Comments: 0.','Penalty: 5 × 0.05 = 0.25, subtracted.','Score = 0.675 + 0.40 + 1.40 − 0.25 = 2.225 ≈ 2.23. A typical outrage clip scores 1.85 with the same weights, so the study tip now wins.']},
  {id:'xweights',kind:'test',lvl:'honors',
   q:'X’s 2023 open-source ranker (from a secondary source) weighted a like 0.5 and a reply 13.5. Post A: P(like) = 0.20, P(reply) = 0.01. Post B: P(like) = 0.05, P(reply) = 0.03. Counting only these two signals, which post ranks higher?',
   choices:['Post A, because it gets four times the likes','Post B','They tie'],correct:1,
   steps:['Post A: 0.5 × 0.20 + 13.5 × 0.01 = 0.10 + 0.135 = 0.235.','Post B: 0.5 × 0.05 + 13.5 × 0.03 = 0.025 + 0.405 = 0.43.','Post B wins by a lot. One predicted reply is worth 13.5 ÷ 0.5 = 27 likes, so posts that draw replies, including arguments, outrank posts people quietly like.']},
  {id:'overlap',kind:'test',lvl:'honors',
   q:'The viewer asked for friends 40%, study tips 35%, cooking 15%, sports 10%, outrage 0%. A feed serves friends 30%, study tips 10%, cooking 20%, sports 10%, outrage 30%. What is its “viewer would endorse” score?',
   num:{ans:65,tol:0.5,unit:'/100'},
   steps:['For each topic, count the smaller of what was served and what was asked for.','Friends min(30, 40) = 30. Study tips min(10, 35) = 10. Cooking min(20, 15) = 15. Sports min(10, 10) = 10. Outrage min(30, 0) = 0.','Total: 30 + 10 + 15 + 10 + 0 = 65 out of 100. Extra cooking beyond 15% earns nothing, and every outrage clip is a slot lost.']},
  {id:'explore',kind:'real',lvl:'ap',
   q:'With watch-time ranking, you raise Explore from 20% to 60%. About what share of the feed is now from the top topic (outrage clips)?',
   choices:['About 72%, no change','About 44%','About 20%','0%'],correct:1,
   steps:['Random explore picks land on outrage clips only 1 time in 5, so more exploring dilutes the bubble.','Averaged over 10 runs, the top-topic share falls from about 72% to about 44%, and the endorsed score rises from 28 to 49.','Minutes fall from about 27.1 to about 21.9. Exploring is a real lever, and Vombatkere and colleagues found TikTok explores on roughly half or more of a new user’s first 1,000 videos.'],
   lab:{set:{wW:10,wL:0,wS:0,wC:0,wN:0,explore:60},look:'Read <b>Feed from the top topic</b>, then set Explore back to 20%.'},verify:[['top',43.8,0.05],['endorse',49.1,0.05]]},
  {id:'mozilla',kind:'real',lvl:'bio',
   q:'You keep getting videos you don’t want on YouTube. According to Mozilla’s 2022 study, which button did more to stop them?',
   choices:['“Not interested”','“Don’t recommend channel”','Both worked about the same'],correct:1,
   steps:['Mozilla found “Not interested” prevented only about 11% of unwanted recommendations.','“Don’t recommend channel” prevented about 43%.','In this tool’s terms: a small penalty barely moves a score that is dominated by watch time. Raise only the Not interested penalty from 0 to 10 with watch-time ranking and outrage clips only fall from about 36 to about 30 of 50.']}
 ]
}
});

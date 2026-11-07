BioLab.addPractical({
scroll:{
 hook:'You pull down to refresh. Sometimes there’s something great, often nothing. Why is it so hard to stop, even when nothing new is coming? Here you set the refresh rule for a simulated user and watch what its brain model does.',
 answer:'Because an unpredictable reward makes an empty feed look normal. With a new post on 1 pull in 5 at random, the simulated user once went 14 pulls with nothing, so after the posts stopped it kept pulling 20 more times. With a post on exactly every 5th pull, it never saw more than 4 empty pulls in a row, noticed the end fast, and quit after 7.',
 uses:[
  'Pull-to-refresh and endless feeds: you can’t predict when something new will show up. Psychologists compare this to a variable-ratio schedule, the kind Ferster and Skinner found keeps responding going longest. It is an analogy: no peer-reviewed study has measured it inside a commercial feed.',
  'Likes on posts: Sherman and colleagues (2016) scanned 32 teens ages 13 to 18. The nucleus accumbens, a reward area, was more active when photos showed many likes, and teens were more likely to like photos that already had many likes.',
  'Stopping points from outside: under the Colorado-led settlement with Meta (August 26, 2026), teen accounts get a 2-hour daily limit with pauses and a midnight to 6 a.m. block. A stopping point you set ahead of time does not depend on noticing that the feed has gone dry.'
 ],
 takeaway:'Rewards you can’t predict keep the pulling going longest, because an empty pull doesn’t look like the end. In this model the quit point is patience × the longest empty run seen while rewards came, so a random schedule pushes it far out.'
}
});

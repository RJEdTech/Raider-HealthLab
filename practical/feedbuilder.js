BioLab.addPractical({
feedbuilder:{
 hook:'A friend says they want their feed to be mostly friends’ posts and study tips. You get to set the ranking for their short-video feed: how much predicted watch time, likes, shares and comments count, and a penalty for “Not interested.” What should the feed rank by?',
 answer:'Not by watch time alone. Ranking only by watch time keeps the test viewer about 27.1 minutes, but outrage clips fill about 36 of the 50 posts and the feed scores 28 out of 100 on what the viewer would endorse. Likes alone get 52 and shares alone 54. A mix (watch 2, likes 5, shares 10, Not interested penalty 5) reaches 78 out of 100, with about 17.3 minutes on the app.',
 uses:[
  'TikTok’s internal “Algo 101” document, reported by the New York Times in 2021, described a video’s score as predicted likes, comments and playtime, each times a weight, added up, with time spent named as a goal. How long you linger is a vote.',
  'When X released its ranking code in 2023, a predicted reply was weighted 13.5 and a like 0.5, so one reply counted as much as 27 likes (from a secondary source; production may differ). Posts that start arguments get a boost.',
  'Your own feed controls are weights too. Mozilla found that on YouTube, “Not interested” stopped only about 11% of unwanted recommendations, while “Don’t recommend channel” stopped about 43%. Since December 2025, Instagram’s “Your Algorithm” view shows the Reels topics it thinks you like.'
 ],
 takeaway:'A feed’s score is a weighted sum, and the feed serves more of whatever the weights reward. In this model, weights built on time serve what holds the viewer, not the mix they asked for.'
}
});

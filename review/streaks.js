BioLab.addReview({
streaks:{questions:[
 {
  "id": "s1",
  "kind": "test",
  "lvl": "bio",
  "q": "You and a friend each snap 99% of days. What is the chance a streak survives one day? Give a percent.",
  "num": {"ans": 98.01, "tol": 0.02, "unit": "%"},
  "steps": ["0.99 × 0.99 = 0.9801, or 98.01%."]
 },
 {
  "id": "s2",
  "kind": "test",
  "lvl": "bio",
  "q": "Why does a 100-day streak have only about a 13% chance, if each of you misses just 1 day in 100?",
  "choices": [
   "The app cheats",
   "Both of you must snap every day, and the small daily risks multiply over 100 days",
   "Streaks get harder after 50 days"
  ],
  "correct": 1,
  "steps": ["0.9801 multiplied by itself 100 times is about 0.13."],
  "lab": {"set": {"me": 99, "fr": 99, "days": 100}, "look": "Find the dot on the curve at day 100."}
 },
 {
  "id": "s3",
  "kind": "test",
  "lvl": "bio",
  "q": "In the UCLA study, the researchers assigned like counts at random. Why did that matter?",
  "choices": [
   "It made the photos prettier",
   "It meant any difference in how teens responded came from the like count, not from the photo",
   "It made the study faster"
  ],
  "correct": 1,
  "steps": ["The same photo was shown with many likes to some teens and few to others."]
 },
 {
  "id": "s4",
  "kind": "test",
  "lvl": "honors",
  "q": "pq = 0.98. What is the average streak before the first miss? Use pq ÷ (1 − pq).",
  "num": {"ans": 49, "tol": 0.5, "unit": "days"},
  "steps": ["0.98 ÷ 0.02 = 49 days."]
 },
 {
  "id": "s5",
  "kind": "test",
  "lvl": "honors",
  "q": "Which is the strongest evidence so far that a social app was designed in a way that harmed a young user?",
  "choices": [
   "A company blog post",
   "A jury verdict after a trial that heard internal documents",
   "A popular video about it"
  ],
  "correct": 1,
  "steps": ["In March 2026 a Los Angeles jury found Meta and YouTube negligent in their design; the companies can appeal."]
 },
 {
  "id": "s6",
  "kind": "ap",
  "lvl": "ap",
  "q": "pq = 0.99. After how many days is a streak more likely lost than alive? Solve 0.99ⁿ = 0.5.",
  "num": {"ans": 68.97, "tol": 0.3, "unit": "days"},
  "steps": ["n = ln 0.5 ÷ ln 0.99 ≈ −0.6931 ÷ −0.01005 ≈ 69 days."]
 }
]}
});

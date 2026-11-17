BioLab.addReview({
zynviral:{questions:[
 {
  "id": "z1",
  "kind": "test",
  "lvl": "bio",
  "q": "Videos double each round, starting with 1 in round 0. Total videos through round 5?",
  "num": {
   "ans": 63,
   "tol": 0,
   "unit": "videos"
  },
  "steps": [
   "1 + 2 + 4 + 8 + 16 + 32 = 63.",
   "Or 2⁶ − 1 = 63."
  ]
 },
 {
  "id": "z2",
  "kind": "real",
  "lvl": "honors",
  "q": "Each video gets 1,500 views and 1 viewer in 1,000 posts their own. What is R?",
  "num": {
   "ans": 1.5,
   "tol": 0.01,
   "unit": ""
  },
  "steps": [
   "R = views ÷ (1 in …) = 1,500 ÷ 1,000.",
   "R = 1.5: the trend grows."
  ],
  "lab": {
   "set": {
    "views": 1500,
    "one": 1000,
    "boost": 1
   },
   "look": "Read <b>R</b>."
  }
 },
 {
  "id": "z3",
  "kind": "test",
  "lvl": "bio",
  "q": "Which is covered by the FDA’s limits on Zyn marketing?",
  "choices": [
   "A teen’s funny video",
   "The company’s own ads",
   "Any video with a pouch in it"
  ],
  "correct": 1,
  "steps": [
   "The marketing limits apply to the company.",
   "Ordinary users’ posts are not the company’s advertising."
  ]
 },
 {
  "id": "z4",
  "kind": "ap",
  "lvl": "ap",
  "q": "For R < 1, total views V(1 + R + R² + …) approach:",
  "choices": [
   "Infinity",
   "V ÷ (1 − R)",
   "V × R"
  ],
  "correct": 1,
  "steps": [
   "An infinite geometric series with |R| < 1 converges.",
   "Sum = V ÷ (1 − R)."
  ]
 }
]}
});

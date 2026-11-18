BioLab.addReview({
buynow:{questions:[
 {
  "id": "b1",
  "kind": "real",
  "lvl": "bio",
  "q": "Sneakers $79.99, 8% tax on the item, $5.99 shipping, no fee. Total?",
  "num": {
   "ans": 92.38,
   "tol": 0.03,
   "unit": "$"
  },
  "steps": [
   "79.99 × 1.08 = 86.39.",
   "+ 5.99 = $92.38."
  ],
  "lab": {
   "set": {
    "where": "app",
    "price": 79.99,
    "fee": 0,
    "ship": 5.99,
    "tax": 8,
    "reveal": true
   },
   "look": "Read <b>What you really pay</b>."
  }
 },
 {
  "id": "b2",
  "kind": "test",
  "lvl": "bio",
  "q": "Which tactic changes the price you pay?",
  "choices": [
   "A countdown timer",
   "“28 people viewing”",
   "A service fee added at checkout"
  ],
  "correct": 2,
  "steps": [
   "Timers and viewer counts change how fast you decide.",
   "Fees change the total."
  ]
 },
 {
  "id": "b3",
  "kind": "real",
  "lvl": "honors",
  "q": "A $54.17 total. What percent above a $39.99 sticker is that?",
  "num": {
   "ans": 35.5,
   "tol": 0.2,
   "unit": "%"
  },
  "steps": [
   "14.18 ÷ 39.99 ≈ 0.355.",
   "About 35.5%."
  ]
 },
 {
  "id": "b4",
  "kind": "test",
  "lvl": "honors",
  "q": "When is “Only 2 left” not a dark pattern?",
  "choices": [
   "Never",
   "When it is true",
   "When it is in red"
  ],
  "correct": 1,
  "steps": [
   "The FTC’s concern is false scarcity claims.",
   "A true low-stock message is information."
  ]
 }
]}
});

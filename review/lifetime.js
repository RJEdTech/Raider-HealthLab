BioLab.addReview({
lifetime:{questions:[
 {
  "id": "l1",
  "kind": "real",
  "lvl": "bio",
  "q": "2 cans a week at $6 a can. How much in a year?",
  "num": {
   "ans": 624,
   "tol": 1,
   "unit": "$"
  },
  "steps": [
   "2 × 52 = 104 cans.",
   "104 × $6 = $624."
  ],
  "lab": {
   "set": {
    "cans": 2,
    "price": 6,
    "start": 15,
    "stop": 40
   },
   "look": "Read <b>Spent per year</b>."
  }
 },
 {
  "id": "l2",
  "kind": "real",
  "lvl": "bio",
  "q": "Using 3.5 cans a week at $5.69 from 16 to 30. Total?",
  "num": {
   "ans": 14498,
   "tol": 15,
   "unit": "$"
  },
  "steps": [
   "3.5 × 52 × 5.69 = $1,035.58 a year.",
   "14 years × 1,035.58 ≈ $14,498."
  ]
 },
 {
  "id": "l3",
  "kind": "test",
  "lvl": "honors",
  "q": "Lifetime spending as a function of starting age (stop age fixed) is:",
  "choices": [
   "Exponential",
   "Linear, with a negative slope",
   "Constant"
  ],
  "correct": 1,
  "steps": [
   "Each year earlier adds the same yearly amount.",
   "So spending falls by that amount for each year later you start."
  ]
 },
 {
  "id": "l4",
  "kind": "ap",
  "lvl": "ap",
  "q": "$1,000 a year invested at 7% for 20 years. Future value?",
  "num": {
   "ans": 40995,
   "tol": 50,
   "unit": "$"
  },
  "steps": [
   "FV = 1,000 × (1.07²⁰ − 1) ÷ 0.07.",
   "1.07²⁰ ≈ 3.8697, so FV ≈ $40,995."
  ]
 }
]}
});

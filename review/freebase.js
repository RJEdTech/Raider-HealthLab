BioLab.addReview({
freebase:{questions:[
 {
  "id": "f1",
  "kind": "test",
  "lvl": "bio",
  "q": "At pH 8.02 (nicotine’s pKa), what percent of nicotine is free?",
  "num": {
   "ans": 50,
   "tol": 0.5,
   "unit": "%"
  },
  "steps": [
   "At pH = pKa, free ÷ charged = 10⁰ = 1.",
   "Half free: 50%."
  ],
  "lab": {
   "set": {
    "pH": 8
   },
   "look": "Read the free share."
  }
 },
 {
  "id": "f2",
  "kind": "real",
  "lvl": "honors",
  "q": "A 6 mg pouch at pH 9.0. Free share = 1 ÷ (1 + 10^(8.02 − 9.0)). How many mg are free?",
  "num": {
   "ans": 5.43,
   "tol": 0.1,
   "unit": "mg"
  },
  "steps": [
   "10^(−0.98) ≈ 0.105.",
   "1 ÷ 1.105 ≈ 0.905.",
   "6 × 0.905 ≈ 5.43 mg."
  ],
  "lab": {
   "set": {
    "pH": 9,
    "mg": 6
   },
   "look": "Read <b>Free nicotine in this pouch</b>."
  }
 },
 {
  "id": "f3",
  "kind": "test",
  "lvl": "bio",
  "q": "Why does the charged form cross the gum lining poorly?",
  "choices": [
   "It is too heavy",
   "Charged particles do not dissolve in the fatty (lipid) membrane",
   "It reacts with saliva"
  ],
  "correct": 1,
  "steps": [
   "The lining of the mouth is a lipid layer.",
   "Charged molecules are attracted to water and are kept out of fat; uncharged ones pass through."
  ]
 },
 {
  "id": "f4",
  "kind": "ap",
  "lvl": "ap",
  "q": "pH rises from 6.5 to 8.5. By what factor does free ÷ charged change?",
  "choices": [
   "2",
   "20",
   "100",
   "1,000"
  ],
  "correct": 2,
  "steps": [
   "Each pH unit is a factor of 10.",
   "2 units: 10² = 100."
  ]
 }
]}
});

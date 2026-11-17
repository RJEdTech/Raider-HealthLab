BioLab.addReview({
hooked:{questions:[
 {
  "id": "h3",
  "kind": "real",
  "lvl": "bio",
  "q": "A daily user’s last pouch is at 4 PM. Normal line 25% of a pouch’s peak, half-life 2 h. When does the craving start? Give the hour as hours after 4 PM.",
  "num": {
   "ans": 4,
   "tol": 0.1,
   "unit": "h"
  },
  "steps": [
   "100% → 50% → 25%: two halvings.",
   "2 × 2 h = 4 h, so about 8 PM."
  ],
  "lab": {
   "set": {
    "weeks": 12,
    "last": 960,
    "n": 1
   },
   "look": "Read <b>The craving starts at</b>."
  }
 },
 {
  "id": "rec",
  "kind": "test",
  "lvl": "bio",
  "q": "What happens to nicotine receptors with weeks of daily use?",
  "choices": [
   "They disappear",
   "The cell makes more of them",
   "They stop working forever"
  ],
  "correct": 1,
  "steps": [
   "Daily nicotine upregulates the receptors: brain scans of daily smokers find roughly a quarter to a third more.",
   "After quitting they return to normal, by 6 to 12 weeks in one study."
  ]
 },
 {
  "id": "stress",
  "kind": "real",
  "lvl": "bio",
  "q": "Someone says a pouch helps them with stress. What does research on smoking suggest?",
  "choices": [
   "Nicotine cures stress",
   "Much of the “relief” is relief from withdrawal, which itself feels like stress",
   "Stress has nothing to do with it"
  ],
  "correct": 1,
  "steps": [
   "Between doses, a dependent brain goes into withdrawal, which feels like tension and irritability.",
   "The next dose ends that, so it feels calming (Parrott, American Psychologist, 1999)."
  ]
 },
 {
  "id": "ap1",
  "kind": "ap",
  "lvl": "ap",
  "q": "L₀ = 150%, C = 25%, h = 2 h. Hours until the level crosses C?",
  "num": {
   "ans": 5.17,
   "tol": 0.1,
   "unit": "h"
  },
  "steps": [
   "t = 2·log₂(150/25) = 2·log₂ 6.",
   "log₂ 6 ≈ 2.585, so t ≈ 5.17 h."
  ]
 }
]}
});

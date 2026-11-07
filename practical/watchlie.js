BioLab.addPractical({
watchlie:{
 hook:'Your wrist tracker says you slept 7 h 25 min last night. A sleep lab recorded the same night with brain waves. How many of the tracker’s minutes never happened, and why does it get them wrong?',
 answer:'On this typical night, 23 minutes. You were really awake for 58 minutes after lights out. The tracker caught only 21 of them (36% specificity) and scored 37 minutes of lying awake as sleep, while calling 14 minutes of real sleep “awake.” 37 − 14 = 23, so it reports 7 h 25 min when the sleep lab says 7 h 2 min. On the restless night, the gap grows to 71 minutes.',
 uses:[
  'Sleep clinics: doctors diagnose sleep problems with polysomnography, an overnight recording of brain waves, eye movement, muscle activity, heart rate and more, scored one 30-second epoch at a time. That is the sleep lab chart in this tool.',
  'Medical tests: rapid tests and screening tests are judged by the same two numbers, sensitivity and specificity. A test that almost never misses an illness can still raise a lot of false alarms, just as a tracker that catches nearly all sleep can still miss most wake.',
  'Your own tracker: a 2025 study of six popular wearables found they caught more than 90% of sleep epochs but only about 29% to 52% of wake. After a night you remember lying awake, the app’s total is probably too high.'
 ],
 takeaway:'A tracker that catches almost all your sleep can still miss most of your wake. Lying awake and still looks like sleep to it, so its totals run high, most of all on bad nights.'
}
});

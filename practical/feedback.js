BioLab.addPractical({
feedback:{
 hook:'You eat a snack after school and your blood sugar jumps about 40 mg/dL above its set point. Your pancreas answers with insulin, but say the signal takes 10 minutes to land. How hard should the response push back to get you into the target band fastest?',
 answer:'In this model, a gain of about 0.70: blood sugar is back in the band in about 21 minutes, after a small overshoot that stays inside the band. A gentle 0.20 takes about 65 minutes. A hard 1.40 overshoots low and swings for about 134 minutes. When the response lands late, the strongest push is not the fastest.',
 uses:[
  'Automated insulin delivery: many people with type 1 diabetes wear a glucose sensor that reads blood sugar every few minutes and a pump that adjusts insulin on its own. It is a negative feedback loop, and its makers tune it so it does not overshoot into low blood sugar.',
  'Thermostats and cruise control: both measure the gap from a set point and push back. A thermostat that reacts too hard, or too late, makes a room swing between too hot and too cold.',
  'Your feed: a recommendation system that shows you more of what you watch is a positive loop. A phone’s daily app limit is a stopping rule you choose: a negative loop. Cathy O’Neil’s <i>Weapons of Math Destruction</i> argues that harmful algorithms run on feedback loops like these.'
 ],
 takeaway:'Negative feedback opposes a change and returns to a set point; positive feedback amplifies a change until something ends it. When the response lands late, the fastest gain is firm but not the strongest: too much push overshoots.'
}
});

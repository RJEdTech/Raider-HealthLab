BioLab.addPractical({
caffeinecurve:{
 hook:'You grab a 16 oz energy drink (about 160 mg of caffeine) at 3 PM before practice and plan to be asleep by 10:30 PM. How much of that caffeine is still in your body when you turn out the light?',
 answer:'About 57 mg, if your half-life is about 5 hours: 160 × (1/2)^1.5. That is more than a 12 oz cola’s worth (about 35 mg) still in you at lights out. With a half-life of 3 or 7 hours it would be about 28 or 76 mg. Having the same drink at 1 PM only brings it down to about 43 mg; to be under 25 mg by 10:30 PM, you would need to drink it by about 9 AM.',
 uses:[
  '<b>Do:</b> if you have trouble falling asleep, move your last caffeine earlier rather than just drinking a little less late. <b>Why:</b> adenosine builds up all day and makes you sleepy, and caffeine works by blocking its receptors. With a 5-hour half-life, a 160 mg drink at 3 PM still leaves about 57 mg at 10:30 PM.',
  '<b>Do:</b> read the caffeine amount on the can or cup before you drink it. <b>Why:</b> the FDA says up to about 400 mg a day is not generally associated with negative effects for healthy adults, a figure set for adults, not teens. The American Academy of Pediatrics discourages caffeine for children and teens and has said energy drinks are not appropriate for them.',
  '<b>Do:</b> when a medicine label says “every 6 hours,” follow the interval exactly. <b>Why:</b> doctors and pharmacists use a drug’s half-life to decide how often a dose is taken. It is the same exponential decay you see in this curve.'
 ],
 takeaway:'Caffeine fades by half about every 5 hours, not all at once: dose × (1/2)^(hours ÷ 5). An afternoon drink is still partly there at bedtime, and both the dose and the hours before bed set how much.'
}
});

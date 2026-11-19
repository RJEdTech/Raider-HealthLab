/* "What the Church teaches" card (Nov 19, 2026), part of the Raider Labs Catholic-insight pass.
   Each point is a paraphrase in our own words. CCC = Catechism of the Catholic Church (checked against vatican.va, Nov 19, 2026).
   Teach, don't preach: Church teaching is stated as the Church's teaching; applications are left as "Your call" questions. */
(function(){
'use strict';
const P={
"attention": "Freedom has to be protected from the addictions of the “attention economy” and from the power to profile and steer people through their data. (<i>Magnifica humanitas</i> 170–172, 2026)",
"companion": "Simulated care can be helpful, but it can also mislead, and where real relationships are missing it can slowly weaken the desire to form them. (<i>Magnifica humanitas</i> 100, 2026)",
"conditions": "Society should help everyone reach the conditions to grow and thrive: food, housing, health care, education, work and social assistance. (CCC 2288)",
"hardship": "Paying unjust wages, or forcing up prices by taking advantage of someone’s ignorance or hardship, is a way of taking what belongs to others, even when it is legal. (CCC 2409)",
"health": "Life and health are gifts entrusted to us by God. We are asked to take reasonable care of them, keeping in mind the needs of others and the common good. (CCC 2288)",
"imageGod": "A person’s worth comes from being made in the image of God, not from any score, rank or price. (CCC 1700)",
"notNeutral": "No system is morally neutral: every tool reflects choices about what it measures, what it ignores and how it sorts people. (<i>Magnifica humanitas</i> 104, 2026)",
"option": "People weighed down by poverty receive a preferential love from the Church, because Christ identified himself with the least. (CCC 2448)",
"presence": "The Church asks us to cherish times when physical presence matters most: shared meals, time with the lonely, serving the poor. (<i>Magnifica humanitas</i> 239, 2026)",
"profit": "Treating profit as the only goal of economic life is morally unacceptable, and any practice that turns people into mere means of profit enslaves them. (CCC 2424)",
"solidarity": "Solidarity, also called social friendship, is a direct demand of our shared humanity: we are responsible for one another. (CCC 1939)",
"temperance": "Temperance is the virtue that helps us avoid every kind of excess, including in food, alcohol, tobacco and medicine. (CCC 2290)",
"temperanceGoods": "Temperance keeps our attachment to money and things in check; justice gives others what they are due; solidarity shares as Christ shared. (CCC 2407)",
"truth": "Truth is a common good. Tools and messages that blur truth and falsehood harm everyone, not just the person fooled. (<i>Magnifica humanitas</i> 132–134, 2026)",
"virtue": "Virtue is a habit of doing good, and freedom grows with practice: each good choice makes the next one easier. (CCC 1733–1734, 1803–1804)"
};
const C={
"hooked": [
[
"temperance",
"virtue"
],
"What would help a friend who wants to quit, without shaming them?"
],
"freebase": [
[
"temperance",
"profit"
],
"The chemistry was tuned to deliver more nicotine. Who is responsible for that choice?"
],
"betterthan": [
[
"health",
"temperance"
],
"“Healthier than cigarettes” for whom? What is the honest comparison for you?"
],
"quitworks": [
[
"virtue",
"solidarity"
],
"Teen smoking fell because many people acted together. What could your school do together?"
],
"teenbrain": [
[
"health",
"virtue"
],
"Your brain is still building. What habits do you want it to build around?"
],
"playbook": [
[
"profit",
"truth"
],
"Which move in the playbook would you most want people your age to recognize?"
],
"lifetime": [
[
"profit",
"imageGod"
],
"You are worth a lot to a company as a customer. What are you worth beyond that?"
],
"blisspoint": [
[
"temperance",
"profit"
],
"Food designed to be hard to stop eating: is that clever, harmful, or both?"
],
"buynow": [
[
"temperanceGoods",
"hardship"
],
"Which of these pressure tricks works on you? What helps you slow down?"
],
"scroll": [
[
"attention",
"virtue"
],
"When does scrolling stop being your choice?"
],
"streaks": [
[
"attention",
"presence"
],
"Is a streak a friendship, or a habit someone designed for you?"
],
"screentime": [
[
"attention",
"presence"
],
"What would you do with an extra hour a day of your own attention?"
],
"feedback": [
[
"attention",
"virtue"
],
"What would you want a feed to show you more of?"
],
"feedbuilder": [
[
"notNeutral",
"attention"
],
"If you ran the feed, what would you refuse to optimize for?"
],
"whosad": [
[
"notNeutral",
"imageGod"
],
"Should companies be allowed to target ads to teens based on their mood?"
],
"companion": [
[
"companion",
"presence"
],
"What does a real friend give you that an app cannot?"
],
"sleepdebt": [
[
"health",
"virtue"
],
"What would you trade to get more sleep this week?"
],
"caffeinecurve": [
[
"temperance",
"health"
],
"How much caffeine is enough for you, and how would you know?"
],
"watchlie": [
[
"truth",
"health"
],
"How much should you trust a number about your own body?"
],
"checkclaim": [
[
"truth",
"health"
],
"What evidence would you need before paying for a supplement?"
],
"goviral": [
[
"truth",
"solidarity"
],
"Before you share, what do you owe the people who will see it?"
],
"fooddesert": [
[
"conditions",
"option"
],
"Whose job is it to make healthy food reachable for everyone?"
],
"herd": [
[
"health",
"solidarity"
],
"Your choice about a vaccine affects people you will never meet. How do you weigh that?"
],
"cprclock": [
[
"solidarity",
"health"
],
"Would you step in? What would help you be ready?"
]
};
const css=`.chur{margin-top:14px;background:var(--card);border:1px solid var(--line);border-left:5px solid #b08d2e;border-radius:12px;padding:12px 16px}
.chur h3{margin:0 0 6px;font-size:1.02rem}.chur p.chur-sub{margin:0 0 8px;color:var(--muted);font-size:.92rem}
.chur ul{margin:0 0 8px;padding-left:1.2em}.chur li{margin:0 0 6px;line-height:1.4}
.chur .chur-call{margin:8px 0 0;padding:8px 12px;background:var(--card2,var(--bg));border-radius:8px}.chur .chur-src{margin:8px 0 0;font-size:.9rem;color:var(--muted)}
.chur a{color:var(--rj-ink,var(--rj));font-weight:600}`;
function card(id){const c=C[id];if(!c)return null;const box=document.createElement('section');box.className='chur';box.setAttribute('aria-label','What the Church teaches');
 box.innerHTML=`<h3>What the Church teaches</h3><p class="chur-sub">Regis Jesuit is a Catholic school. Here is what the Church teaches on this question, offered to every student to think through.</p><ul>${c[0].map(k=>'<li>'+P[k]+'</li>').join('')}</ul><p class="chur-call"><b>Your call:</b> ${c[1]}</p><p class="chur-src">CCC = <a href="https://www.vatican.va/archive/ENG0015/_INDEX.HTM" target="_blank" rel="noopener">Catechism of the Catholic Church</a>. Numbers are paragraphs.</p>`;
 return box;}
function add(sec){if(!sec||!sec.classList||sec.querySelector('.chur'))return;const id=(sec.id||'').replace(/^sim-/,'');const sid=sec.dataset.id||id;
 const b=card(sid);if(!b)return;const anchor=sec.querySelector('.about.terms')||sec.querySelector('details.about');if(!anchor)return;anchor.parentNode.insertBefore(b,anchor);}
function scan(){document.querySelectorAll('#sims > section, #sims > .sim').forEach(add);}
function init(){const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const root=document.getElementById('sims');if(!root)return;scan();new MutationObserver(scan).observe(root,{childList:true,subtree:false});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

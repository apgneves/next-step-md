/* Coping strategy library (spec Section 8.3). */
NS.data.strategyCategories = ['In the moment', 'Daily habits', 'People'];

NS.data.strategies = [
  { id: 'urge-surf', name: 'Urge surfing', category: 'In the moment',
    summary: 'Ride the craving out like a wave instead of acting on it.',
    steps: ['Notice the craving and where you feel it.', 'Rate it from 0 to 10.', 'Breathe and watch it rise, peak and fall like a wave.', 'Re-rate it after 10 to 15 minutes.'] },
  { id: 'halt', name: 'HALT check', category: 'In the moment',
    summary: 'Check whether a basic need is making the craving louder.',
    steps: ['Ask: am I Hungry, Angry, Lonely or Tired?', 'Meet that need first: eat, vent, call someone, or rest.'] },
  { id: 'text-someone', name: 'Text someone from my list', category: 'People',
    summary: 'Reach out to one person before the moment gets bigger.',
    steps: ['Open your people list.', 'Send a short message, like "Rough moment, can you talk?"', 'Stay with them or on the phone until it passes.'] },
  { id: 'walk-10', name: '10-minute walk', category: 'In the moment',
    summary: 'Change your surroundings and give the craving time to pass.',
    steps: ['Leave the space.', 'Walk for 10 minutes.', 'Focus on what you see and hear.'] },
  { id: 'leave', name: 'Leave the situation', category: 'In the moment',
    summary: 'Have an exit ready so leaving is easy.',
    steps: ['Have an exit line ready.', 'Leave or move to another room.', 'Tell one person you are heading out.'] },
  { id: 'box-breath', name: 'Box breathing', category: 'In the moment',
    summary: 'A simple breathing pattern to slow things down.',
    steps: ['Breathe in for 4 counts.', 'Hold for 4.', 'Breathe out for 4, then hold for 4.', 'Repeat 4 times.'] },
  { id: 'delay', name: 'Delay and distract', category: 'In the moment',
    summary: 'Put time between the craving and any decision.',
    steps: ['Set a 15-minute timer.', 'Do something absorbing: a game, a shower, music.', 'Check the craving again when the timer ends.'] },
  { id: 'sleep', name: 'Protect your sleep', category: 'Daily habits',
    summary: 'Poor sleep makes cravings stronger, so guard your rest.',
    steps: ['Keep a regular bedtime.', 'No screens for 30 minutes before bed.', 'Notice how sleep affects your cravings.'] },
  { id: 'exercise', name: 'Move every day', category: 'Daily habits',
    summary: 'Regular activity you enjoy, ideally with a friend.',
    steps: ['Pick any activity you enjoy.', 'Do it for 20 to 30 minutes.', 'Ask a friend to join you.'] },
  { id: 'routine', name: 'Plan your high-risk times', category: 'Daily habits',
    summary: 'Fill your riskiest times with something specific.',
    steps: ['Look at your triggers.', 'Schedule something specific for those times (for example, Friday nights).'] },
  { id: 'meeting', name: 'Go to a meeting', category: 'People',
    summary: 'Try one peer group, in person or online.',
    steps: ['Pick one peer group from the Help page.', 'Go once, in person or online.', 'You can just listen.'] },
  { id: 'counselor', name: 'Talk to a counselor', category: 'People',
    summary: 'Book a first appointment at campus counseling.',
    steps: ['Book a first appointment at campus counseling.', 'Write down 2 things you want to talk about.'] }
];

// Label for a plan.coping entry: a library id or "custom:Text".
NS.data.strategyName = function (id) {
  if (typeof id !== 'string') return '';
  if (id.indexOf('custom:') === 0) return id.slice(7);
  const s = NS.data.strategies.find(x => x.id === id);
  return s ? s.name : id;
};
NS.data.strategyById = id => NS.data.strategies.find(x => x.id === id) || null;

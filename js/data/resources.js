/* Help-page resources (spec Section 8.2).
 * verified: what was checked against the official site on 2026-11-20 (see README "Content verification").
 * teamFlag: items the team still needs to confirm by hand. Not shown to users. */
NS.data.resources = [
  {
    id: '988', name: '988 Suicide & Crisis Lifeline', tags: ['Crisis', 'Free', '24/7'],
    description: 'Call or text 988, or chat online, for mental health or substance use crises.',
    contact: { call: '988', text: '988', web: 'https://988lifeline.org', webLabel: 'Chat online' },
    expect: 'A counselor will answer, ask what is going on, and help you figure out next steps. You do not have to give your name. You can reach out for yourself or for a friend.',
    verified: '988lifeline.org lists call, text and chat, and covers alcohol or drug use concerns.',
    teamFlag: 'Spec text said Maryland calls route to a Maryland crisis center; the MDH 988 page does not state this, so the claim was removed. TODO-VERIFY if you want it back.'
  },
  {
    id: '911', name: 'Emergency services', tags: ['Crisis'],
    description: 'Call 911 for an overdose or any immediate danger.',
    contact: { call: '911' },
    expect: 'A dispatcher will ask where you are and what is happening. Stay on the line and follow their instructions.'
  },
  {
    id: 'samhsa-helpline', name: 'SAMHSA National Helpline', tags: ['Free', '24/7', 'Confidential'],
    description: 'Confidential treatment referrals and information in English and Spanish.',
    contact: { call: '1-800-662-4357' },
    expect: 'Someone will answer, listen, and help you find treatment, support groups or other services near you. The call is free and confidential.',
    teamFlag: 'TODO-VERIFY: samhsa.gov blocked automated checking; confirm the number and hours by hand.'
  },
  {
    id: 'findtreatment', name: 'FindTreatment.gov', tags: ['Free', 'Virtual'],
    description: 'Federal locator for treatment facilities, searchable by location and payment type.',
    contact: { web: 'https://findtreatment.gov', webLabel: 'Open FindTreatment.gov' },
    expect: 'Enter a ZIP code or town to see treatment programs nearby. You can filter by payment type and see contact details for each place. No account needed.',
    verified: 'findtreatment.gov loads (title "FindTreatment.gov").',
    teamFlag: 'TODO-VERIFY: page content could not be read automatically; confirm filters by hand.'
  },
  {
    id: 'md-211', name: 'Maryland 211', tags: ['Free', '24/7'],
    description: 'Dial 211 for local health and human services referrals.',
    contact: { call: '211' },
    expect: 'Tell the person who answers what kind of help you are looking for. They can share programs and services in your area.',
    teamFlag: 'TODO-VERIFY current substance-use routing (211md.org blocked automated checking).'
  },
  {
    id: 'campus-counseling', name: 'Your campus counseling center', tags: ['On campus', 'Free'],
    description: 'Most Maryland colleges offer free, confidential counseling to enrolled students.',
    contact: {},
    campus: true,
    expect: 'Call or stop by the counseling center and ask for a first appointment. It helps to write down one or two things you want to talk about. Counseling is confidential, with narrow exceptions such as immediate danger; check your school\'s policy.'
  },
  {
    id: 'umd-crc', name: 'Terps for Recovery (University of Maryland)', tags: ['Peer support', 'On campus'],
    description: 'Student-led collegiate recovery community with the University Health Center.',
    contact: { web: 'https://health.umd.edu/SUHR', webLabel: 'UMD Health Center page' },
    expect: 'You will meet other students in or curious about recovery. Peer groups are a place to listen and connect; you can share as much or as little as you want.',
    verified: 'health.umd.edu/SUHR mentions Terps for Recovery, a student-led organization.'
  },
  {
    id: 'towson-tir', name: 'Tigers in Recovery (Towson University)', tags: ['Peer support', 'On campus'],
    description: 'Collegiate recovery program founded in 2015.',
    contact: { web: 'https://collegiaterecovery.org/project/towson-university', webLabel: 'Program profile' },
    expect: 'You will meet other students in or curious about recovery. Peer groups are a place to listen and connect; you can share as much or as little as you want.',
    verified: 'ARHE profile: "founded in 2015".'
  },
  {
    id: 'umb-sfr', name: 'Scholars for Recovery (University of Maryland, Baltimore)', tags: ['Peer support', 'On campus'],
    description: 'Collegiate recovery program for students in recovery from alcohol and other drug use.',
    contact: { web: 'https://www.umaryland.edu/recovery/about-collegiate-recovery/', webLabel: 'Program page' },
    expect: 'You will meet other students in or curious about recovery. Peer groups are a place to listen and connect; you can share as much or as little as you want.',
    verified: 'umaryland.edu/recovery page is titled UMB Scholars for Recovery.'
  },
  {
    id: 'smart', name: 'SMART Recovery meetings', tags: ['Peer support', 'Virtual', 'Free'],
    description: 'Science-based mutual-help meetings, in person and online.',
    contact: { web: 'https://meetings.smartrecovery.org/', webLabel: 'Find a meeting' },
    expect: 'Type in a city to find an online or in-person meeting. You can join and just listen the first time; nobody will make you talk.',
    verified: 'meetings.smartrecovery.org is the official meeting finder (online and in person).'
  },
  {
    id: 'aa-na', name: 'AA and NA meetings', tags: ['Peer support', 'Free'],
    description: 'Twelve-step meetings across Maryland, in person and online.',
    contact: {
      web: 'https://na.org/meetingsearch/', webLabel: 'Find NA meetings',
      web2: 'https://www.aa.org/find-aa', web2Label: 'Find local AA'
    },
    expect: 'Open meetings welcome anyone. You can sit in and listen; first names only. AA\'s site points you to local AA contacts and meeting lists.',
    verified: 'na.org/meetingsearch is NA\'s meeting search. aa.org/find-aa lists local AA resources (it says it has no meeting finder itself, so wording reflects that).'
  }
];

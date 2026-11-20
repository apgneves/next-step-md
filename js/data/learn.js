/* Learn page sections (spec Section 8.1) and the full source list (Section 14).
 * Citations are written as [[Author, Year]] and rendered as links to the Sources section. */
NS.data.learn = [
  {
    id: 'brain', title: 'How addiction affects the brain',
    body: [
      'Many substances flood the brain\'s reward circuit with dopamine, a chemical messenger tied to pleasure and motivation. That surge teaches the brain to repeat the behavior [[NIDA, 2020]].',
      'With repeated use, the brain adapts. The same amount starts to have less effect, which is called tolerance, and everyday things can feel less rewarding. Cravings get stronger and can be set off by stress, places or people linked to past use. Use also affects brain areas involved in judgment, decision-making and self-control, which helps explain why stopping is hard even when someone really wants to [[NIDA, 2020]].',
      'None of this means a person is weak. Addiction is a treatable medical condition, not a lack of willpower. Treatment and support help people manage it.'
    ]
  },
  {
    id: 'risk', title: 'Why college students are at higher risk',
    body: [
      'The brain keeps developing into the mid-20s, especially the areas that handle planning, judgment and self-control. That is one reason young adults are more likely to take risks [[NIDA, 2020]].',
      'College adds its own pressures: exam stress, new independence, less structure, and social settings where use can seem normal.',
      'In Maryland, an estimated 27.0% of people aged 18 to 25 had a substance use disorder in the past year (2022-2023). Of those who needed treatment, 86.0% did not receive it [[SAMHSA, 2024]]. That gap is why this site exists. If you are struggling, you are far from alone, and you do not have to wait until things get worse to ask for help.'
    ]
  },
  {
    id: 'myths', title: 'Myths vs. facts',
    intro: 'Myths about addiction can keep people from getting help. Tap a card to see whether each statement is a myth or a fact.',
    flipCards: ['q01', 'q02', 'q04', 'q09', 'q14']
  },
  {
    id: 'recovery', title: 'Recovery is possible',
    body: [
      'Treatment works. Like asthma or high blood pressure, addiction is a chronic condition that can be managed. Relapse rates for substance use disorders are similar to those for other chronic illnesses [[NIDA, 2020]]. So a relapse is not proof that treatment failed. It is a sign the plan needs adjusting.',
      'How you think about a slip matters. The thought "I blew it, so why bother" is called the abstinence violation effect, and it makes heavier use more likely. Treating a slip as a chance to learn what triggered it, and what helped before, lowers the risk of a full relapse [[Larimer et al., 1999]].',
      'One hard day does not erase your progress. That is why this site never resets your progress to zero.'
    ]
  },
  {
    id: 'friend', title: 'How to help a friend',
    body: [
      'If you are worried about a friend, pick a private, calm moment. Start with what you have noticed and how much you care, for example: "You have seemed really stressed lately, and I am worried about you." Focus on concern, not blame or labels. Listen more than you talk, and do not expect one conversation to fix everything.',
      'Offer something concrete, like going with them to a first counseling appointment or a peer recovery meeting, and share the Help page.',
      'Know the crisis options. If they might hurt themselves, call or text 988. For an overdose or any immediate danger, call 911. And take care of yourself too: supporting someone is hard, and campus counseling is there for you as well.'
    ],
    note: 'General guidance, pending review by campus counseling staff.'
  },
  { id: 'sources', title: 'Sources', sources: true }
];

// APA reference list (Section 14 plus sources added for the extended quiz and Learn text).
NS.data.sources = [
  { key: '988 Suicide & Crisis Lifeline, n.d.', text: '988 Suicide & Crisis Lifeline. (n.d.). <i>988 Lifeline</i>.', url: 'https://988lifeline.org' },
  { key: 'Association of Recovery in Higher Education, n.d.', text: 'Association of Recovery in Higher Education. (n.d.). <i>Towson University: Tigers in Recovery</i>.', url: 'https://collegiaterecovery.org/project/towson-university' },
  { key: 'Larimer et al., 1999', text: 'Larimer, M. E., Palmer, R. S., & Marlatt, G. A. (1999). Relapse prevention: An overview of Marlatt\'s cognitive-behavioral model. <i>Alcohol Research &amp; Health, 23</i>(2), 151-160.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6760427/' },
  { key: 'Maryland Department of Health, n.d.', text: 'Maryland Department of Health. (n.d.). <i>988 Suicide &amp; Crisis Lifeline</i>. Behavioral Health Administration.', url: 'https://health.maryland.gov/bha/Pages/988md.aspx' },
  { key: 'NIDA, 2020', text: 'National Institute on Drug Abuse. (2020). <i>Drugs, brains, and behavior: The science of addiction</i>.', url: 'https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/treatment-recovery' },
  { key: 'NIDA, 2022', text: 'National Institute on Drug Abuse. (2022). <i>Benzodiazepines and opioids</i>.', url: 'https://nida.nih.gov/research-topics/opioids/benzodiazepines-opioids' },
  { key: 'Rensselaer, n.d.', text: 'Rensselaer Polytechnic Institute. (n.d.). <i>Mental health resources</i>. Student Experience.', url: 'https://studentexperience.rpi.edu/wellness/mental-health-resources' },
  { key: 'Roediger & Karpicke, 2006', text: 'Roediger, H. L., III, &amp; Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. <i>Psychological Science, 17</i>(3), 249-255.', url: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x' },
  { key: 'SAMHSA, 2024', text: 'Substance Abuse and Mental Health Services Administration. (2024). <i>2022-2023 National Surveys on Drug Use and Health: State-specific tables, Maryland</i> (Tables 51B and 52B).', url: 'https://www.samhsa.gov/data/sites/default/files/reports/rpt56188/2023-nsduh-sae-state-tables_0/2023-nsduh-sae-state-tabs-maryland.pdf' },
  { key: 'University of Maryland, Baltimore, n.d.', text: 'University of Maryland, Baltimore. (n.d.). <i>What is a collegiate recovery program?</i>', url: 'https://www.umaryland.edu/recovery/about-collegiate-recovery/' },
  { key: 'University of Maryland Health Center, n.d.', text: 'University of Maryland Health Center. (n.d.). <i>Substance use and harm reduction: Collegiate recovery</i>.', url: 'https://health.umd.edu/SUHR' }
];

export type QuizCategory =
  | 'lifestyle'
  | 'cleanliness'
  | 'finances'
  | 'social'
  | 'practical';

export interface QuizOption {
  id: string;
  text: string;
  traits: Record<string, number>; // trait name -> score contribution
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  subtitle?: string;
  options: QuizOption[];
}

export interface QuizResult {
  trait: string;
  label: string;
  description: string;
  icon: string;
  lowLabel: string;
  highLabel: string;
}

// Trait definitions for results
export const QUIZ_TRAITS: QuizResult[] = [
  {
    trait: 'schedule',
    label: 'Daily Rhythm',
    description: 'Your preferred daily schedule and sleep patterns',
    icon: '🌅',
    lowLabel: 'Night Owl',
    highLabel: 'Early Bird',
  },
  {
    trait: 'tidiness',
    label: 'Tidiness Level',
    description: 'How you approach cleanliness and organization',
    icon: '✨',
    lowLabel: 'Relaxed',
    highLabel: 'Spotless',
  },
  {
    trait: 'social',
    label: 'Social Energy',
    description: 'Your comfort with guests and social activities at home',
    icon: '🎉',
    lowLabel: 'Quiet Sanctuary',
    highLabel: 'Party Central',
  },
  {
    trait: 'independence',
    label: 'Independence',
    description: 'How much personal space and alone time you need',
    icon: '🚪',
    lowLabel: 'Together Time',
    highLabel: 'My Space',
  },
  {
    trait: 'communication',
    label: 'Communication Style',
    description: 'How you prefer to handle issues and conversations',
    icon: '💬',
    lowLabel: 'Go With Flow',
    highLabel: 'Direct & Clear',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // LIFESTYLE
  {
    id: 'q1',
    category: 'lifestyle',
    question: "It's 11 PM on a Tuesday. Where are you?",
    subtitle: 'Be honest, we won\'t judge... much.',
    options: [
      {
        id: 'a',
        text: 'Already asleep for 2 hours. Beauty sleep is non-negotiable.',
        traits: { schedule: 10, social: 2 },
      },
      {
        id: 'b',
        text: 'Winding down with a book or show, lights out by midnight.',
        traits: { schedule: 7, social: 4 },
      },
      {
        id: 'c',
        text: "Still productive! The night is young and so am I (sort of).",
        traits: { schedule: 3, social: 6 },
      },
      {
        id: 'd',
        text: "11 PM? That's when I truly come alive. Sleep is for the weak.",
        traits: { schedule: 0, social: 8 },
      },
    ],
  },
  {
    id: 'q2',
    category: 'lifestyle',
    question: 'Your ideal weekend morning looks like...',
    options: [
      {
        id: 'a',
        text: 'Up at 7 AM, coffee brewing, ready to seize the day!',
        traits: { schedule: 10, independence: 6 },
      },
      {
        id: 'b',
        text: 'Leisurely 9 AM wake-up, slow breakfast, no rush.',
        traits: { schedule: 6, independence: 5 },
      },
      {
        id: 'c',
        text: "Brunch? More like linner. I'll surface around noon.",
        traits: { schedule: 2, independence: 7 },
      },
      {
        id: 'd',
        text: 'What morning? I only acknowledge the existence of afternoons.',
        traits: { schedule: 0, independence: 8 },
      },
    ],
  },
  {
    id: 'q3',
    category: 'lifestyle',
    question: 'How do you feel about background noise at home?',
    subtitle: 'Music, TV, podcasts, the works.',
    options: [
      {
        id: 'a',
        text: 'Silence is golden. I need peace to think and exist.',
        traits: { social: 1, independence: 9 },
      },
      {
        id: 'b',
        text: 'Soft background music is nice, nothing too loud.',
        traits: { social: 4, independence: 6 },
      },
      {
        id: 'c',
        text: 'I like having something on, makes the place feel alive.',
        traits: { social: 7, independence: 4 },
      },
      {
        id: 'd',
        text: "If there's no music playing, something is very wrong.",
        traits: { social: 9, independence: 2 },
      },
    ],
  },

  // CLEANLINESS
  {
    id: 'q4',
    category: 'cleanliness',
    question: 'A dirty dish appears in the sink. Your reaction?',
    subtitle: 'The eternal roommate dilemma.',
    options: [
      {
        id: 'a',
        text: 'Wash it immediately. Dishes in the sink? Not in my house.',
        traits: { tidiness: 10, communication: 7 },
      },
      {
        id: 'b',
        text: "I'll wash it within a few hours, no big deal.",
        traits: { tidiness: 7, communication: 5 },
      },
      {
        id: 'c',
        text: "It can wait until I have a few more. Efficiency, you know?",
        traits: { tidiness: 4, communication: 4 },
      },
      {
        id: 'd',
        text: "That's a problem for future me. Present me has other priorities.",
        traits: { tidiness: 1, communication: 3 },
      },
    ],
  },
  {
    id: 'q5',
    category: 'cleanliness',
    question: 'How often should common areas be cleaned?',
    options: [
      {
        id: 'a',
        text: 'Daily touch-ups, deep clean weekly. Standards matter.',
        traits: { tidiness: 10, communication: 8 },
      },
      {
        id: 'b',
        text: 'Weekly cleaning routine keeps things civilized.',
        traits: { tidiness: 7, communication: 6 },
      },
      {
        id: 'c',
        text: 'When it starts looking rough. Every 2-3 weeks?',
        traits: { tidiness: 4, communication: 4 },
      },
      {
        id: 'd',
        text: 'When guests are coming over. Motivation at its finest.',
        traits: { tidiness: 2, communication: 3 },
      },
    ],
  },
  {
    id: 'q6',
    category: 'cleanliness',
    question: "Your roommate's stuff is slowly colonizing the living room. You...",
    subtitle: 'Their jacket, books, and mysteriously, a yoga mat.',
    options: [
      {
        id: 'a',
        text: 'Have a calm conversation about shared space boundaries.',
        traits: { tidiness: 8, communication: 10, independence: 6 },
      },
      {
        id: 'b',
        text: 'Drop subtle hints and hope they get the message.',
        traits: { tidiness: 6, communication: 4, independence: 5 },
      },
      {
        id: 'c',
        text: "Honestly, I probably wouldn't notice for a while.",
        traits: { tidiness: 3, communication: 3, independence: 4 },
      },
      {
        id: 'd',
        text: "Wait... that's not my stuff? I thought it was communal decor.",
        traits: { tidiness: 1, communication: 2, independence: 3 },
      },
    ],
  },

  // FINANCES
  {
    id: 'q7',
    category: 'finances',
    question: 'Bill-splitting philosophy: what feels right to you?',
    subtitle: 'The money talk nobody wants but everyone needs.',
    options: [
      {
        id: 'a',
        text: '50/50 split on everything. Simple, fair, no drama.',
        traits: { communication: 8, independence: 7 },
      },
      {
        id: 'b',
        text: 'Track shared expenses and settle up monthly.',
        traits: { communication: 7, independence: 6 },
      },
      {
        id: 'c',
        text: 'Alternate who pays for things, it evens out.',
        traits: { communication: 5, independence: 5 },
      },
      {
        id: 'd',
        text: "Keep it loose - we're adults, it'll work itself out.",
        traits: { communication: 3, independence: 4 },
      },
    ],
  },
  {
    id: 'q8',
    category: 'finances',
    question: 'Shared groceries: yay or nay?',
    options: [
      {
        id: 'a',
        text: 'Separate shelves, separate food. Clear boundaries.',
        traits: { independence: 10, communication: 6 },
      },
      {
        id: 'b',
        text: 'Share basics (milk, eggs), personal items separate.',
        traits: { independence: 6, communication: 7 },
      },
      {
        id: 'c',
        text: "Mostly shared, but respect each other's special items.",
        traits: { independence: 4, communication: 6 },
      },
      {
        id: 'd',
        text: "What's mine is yours! Except my secret snack stash.",
        traits: { independence: 2, communication: 5 },
      },
    ],
  },

  // SOCIAL
  {
    id: 'q9',
    category: 'social',
    question: 'Friday night: your roommate wants to have friends over. You...',
    options: [
      {
        id: 'a',
        text: 'Need advance notice. A week minimum, preferably.',
        traits: { social: 2, independence: 9, communication: 7 },
      },
      {
        id: 'b',
        text: 'A day or two heads-up is nice so I can plan accordingly.',
        traits: { social: 5, independence: 6, communication: 6 },
      },
      {
        id: 'c',
        text: "Same day is fine! I'll probably join in.",
        traits: { social: 8, independence: 3, communication: 5 },
      },
      {
        id: 'd',
        text: 'The more the merrier! Spontaneous parties are the best.',
        traits: { social: 10, independence: 1, communication: 4 },
      },
    ],
  },
  {
    id: 'q10',
    category: 'social',
    question: 'How do you feel about significant others staying over?',
    subtitle: 'The relationship subplot of roommate life.',
    options: [
      {
        id: 'a',
        text: 'Rarely and with prior discussion. This is my home too.',
        traits: { social: 2, independence: 9, communication: 8 },
      },
      {
        id: 'b',
        text: 'A few nights a week is reasonable with a heads-up.',
        traits: { social: 5, independence: 6, communication: 6 },
      },
      {
        id: 'c',
        text: 'Pretty flexible as long as they respect the space.',
        traits: { social: 7, independence: 4, communication: 5 },
      },
      {
        id: 'd',
        text: "Love is beautiful! They're welcome anytime.",
        traits: { social: 9, independence: 2, communication: 4 },
      },
    ],
  },
  {
    id: 'q11',
    category: 'social',
    question: 'You come home exhausted. Your roommate wants to chat. You...',
    options: [
      {
        id: 'a',
        text: 'Politely say I need alone time and retreat to my room.',
        traits: { independence: 10, communication: 8, social: 2 },
      },
      {
        id: 'b',
        text: 'Quick catch-up, then explain I need to recharge.',
        traits: { independence: 7, communication: 7, social: 4 },
      },
      {
        id: 'c',
        text: "Chat for a bit - venting about my day might actually help!",
        traits: { independence: 4, communication: 5, social: 7 },
      },
      {
        id: 'd',
        text: 'Talking to my roommate IS how I recharge!',
        traits: { independence: 1, communication: 4, social: 10 },
      },
    ],
  },

  // PRACTICAL
  {
    id: 'q12',
    category: 'practical',
    question: 'The great thermostat debate: where do you stand?',
    subtitle: 'Wars have been fought over less.',
    options: [
      {
        id: 'a',
        text: 'I run hot. Colder is better. Ice palace vibes.',
        traits: { communication: 5, independence: 6 },
      },
      {
        id: 'b',
        text: 'Moderate temp, maybe a sweater. Balance is key.',
        traits: { communication: 7, independence: 5 },
      },
      {
        id: 'c',
        text: 'Warmth is non-negotiable. Blankets for everyone!',
        traits: { communication: 5, independence: 6 },
      },
      {
        id: 'd',
        text: "I'll adapt to whatever. Thermostat democracy.",
        traits: { communication: 6, independence: 3 },
      },
    ],
  },
  {
    id: 'q13',
    category: 'practical',
    question: 'A conflict arises with your roommate. Your approach?',
    subtitle: 'The true test of cohabitation.',
    options: [
      {
        id: 'a',
        text: 'Address it directly and immediately. Clear the air.',
        traits: { communication: 10, independence: 6 },
      },
      {
        id: 'b',
        text: 'Take time to cool off, then have a calm discussion.',
        traits: { communication: 8, independence: 7 },
      },
      {
        id: 'c',
        text: 'Hope it resolves itself... maybe drop some hints.',
        traits: { communication: 3, independence: 5 },
      },
      {
        id: 'd',
        text: 'Passive-aggressive Post-it notes. A timeless classic.',
        traits: { communication: 1, independence: 8 },
      },
    ],
  },
  {
    id: 'q14',
    category: 'practical',
    question: 'How do you feel about pets in a shared living space?',
    options: [
      {
        id: 'a',
        text: 'No pets please. I have allergies/preferences/sanity.',
        traits: { independence: 8, communication: 6 },
      },
      {
        id: 'b',
        text: 'Small, quiet pets might be okay. Fish? Sure.',
        traits: { independence: 6, communication: 5 },
      },
      {
        id: 'c',
        text: "Pets are great! As long as everyone shares responsibility.",
        traits: { independence: 4, communication: 7 },
      },
      {
        id: 'd',
        text: 'The more animals, the better. This house needs life!',
        traits: { independence: 2, communication: 5 },
      },
    ],
  },
  {
    id: 'q15',
    category: 'practical',
    question: 'Final question: what does "home" mean to you?',
    subtitle: 'The philosophical finale.',
    options: [
      {
        id: 'a',
        text: 'My sanctuary. A peaceful escape from the world.',
        traits: { independence: 10, social: 1, tidiness: 7 },
      },
      {
        id: 'b',
        text: 'A comfortable base. Organized but lived-in.',
        traits: { independence: 6, social: 4, tidiness: 6 },
      },
      {
        id: 'c',
        text: 'A gathering place. Where life happens with others.',
        traits: { independence: 3, social: 8, tidiness: 4 },
      },
      {
        id: 'd',
        text: 'An adventure! Every day should bring something new.',
        traits: { independence: 2, social: 10, tidiness: 3 },
      },
    ],
  },
];

export const CATEGORY_INFO: Record<
  QuizCategory,
  { label: string; icon: string }
> = {
  lifestyle: { label: 'Lifestyle', icon: '🌙' },
  cleanliness: { label: 'Cleanliness', icon: '🧹' },
  finances: { label: 'Finances', icon: '💰' },
  social: { label: 'Social', icon: '👥' },
  practical: { label: 'Practical', icon: '⚙️' },
};

export { default as MoneyTalk } from './MoneyTalk';
export { default as LivingRules } from './LivingRules';
export { default as ConflictResolution } from './ConflictResolution';
export { default as PersonalSpace } from './PersonalSpace';

export const ARTICLES = [
  {
    slug: 'money-talk',
    title: 'The Money Talk',
    subtitle: 'Aligning Financial Expectations',
    description: 'The conversation nobody wants to have, but everyone needs to.',
    icon: '💰',
    readTime: '6 min read',
    category: 'Finances',
    categoryColor: 'amber',
  },
  {
    slug: 'living-rules',
    title: 'Living Rules That Work',
    subtitle: 'Creating Household Agreements',
    description: 'How to build a roommate agreement that prevents problems.',
    icon: '📋',
    readTime: '7 min read',
    category: 'Agreements',
    categoryColor: 'blue',
  },
  {
    slug: 'conflict-resolution',
    title: 'Conflict Resolution',
    subtitle: 'Turning Friction Into Growth',
    description: "Because 'fine' said through clenched teeth isn't actually fine.",
    icon: '🤝',
    readTime: '6 min read',
    category: 'Communication',
    categoryColor: 'green',
  },
  {
    slug: 'personal-space',
    title: 'Personal Space',
    subtitle: 'Balancing Togetherness',
    description: "Living together doesn't mean being together all the time.",
    icon: '🚪',
    readTime: '5 min read',
    category: 'Boundaries',
    categoryColor: 'purple',
  },
] as const;

export type ArticleSlug = (typeof ARTICLES)[number]['slug'];

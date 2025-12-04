export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export const USERS: Record<string, User & { password: string }> = {
  pierre: {
    id: 'pierre',
    email: 'pierre@example.com',
    name: 'Pierre',
    password: 'pierre123',
    avatarColor: '#3B82F6', // blue
  },
  marie: {
    id: 'marie',
    email: 'marie@example.com',
    name: 'Marie',
    password: 'marie123',
    avatarColor: '#EC4899', // pink
  },
};

export const AI_COPILOT = {
  id: 'ai_copilot',
  name: 'AI Co-pilot',
  avatarColor: '#10B981', // green
};


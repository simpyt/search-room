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
    password: 'P13rr3$2024!DemoSecure',
    avatarColor: '#3B82F6', // blue
  },
  marie: {
    id: 'marie',
    email: 'marie@example.com',
    name: 'Marie',
    password: 'M4r13$2024!DemoSecure',
    avatarColor: '#EC4899', // pink
  },
};

export const AI_COPILOT = {
  id: 'ai_copilot',
  name: 'AI Co-pilot',
  avatarColor: '#10B981', // green
};


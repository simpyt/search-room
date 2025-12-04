import { cookies } from 'next/headers';
import { USERS, type User } from '@/lib/types';

const SESSION_COOKIE_NAME = 'sr_session';

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const user = USERS[sessionCookie.value];
  if (!user) {
    return null;
  }

  // Return user without password
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function requireSession(): Promise<User> {
  const user = await getSession();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function validateCredentials(
  email: string,
  password: string
): User | null {
  const userEntry = Object.entries(USERS).find(
    ([, user]) => user.email === email && user.password === password
  );

  if (!userEntry) {
    return null;
  }

  const [, user] = userEntry;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

export function setSessionCookie(userId: string): { name: string; value: string; options: object } {
  return {
    name: SESSION_COOKIE_NAME,
    value: userId,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  };
}

export function clearSessionCookie(): { name: string; value: string; options: object } {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  };
}


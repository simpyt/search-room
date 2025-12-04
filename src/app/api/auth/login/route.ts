import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials, setSessionCookie } from '@/lib/auth';
import { getUserRooms } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has any rooms
    let redirectTo = '/rooms/new';
    try {
      const rooms = await getUserRooms(user.id);
      if (rooms.length > 0) {
        redirectTo = `/rooms/${rooms[0]}`;
      }
    } catch {
      // If DB fails, default to new room
      console.warn('Failed to fetch user rooms, defaulting to /rooms/new');
    }

    // Set session cookie
    const cookie = setSessionCookie(user.id);
    const response = NextResponse.json({
      user,
      redirectTo,
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


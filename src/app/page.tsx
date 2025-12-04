import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserRooms } from '@/lib/db';

export default async function Home() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check if user has any rooms
  try {
    const rooms = await getUserRooms(user.id);
    if (rooms.length > 0) {
      redirect(`/rooms/${rooms[0]}`);
    }
  } catch {
    // If DB fails, redirect to create room
  }

  redirect('/rooms/new');
}

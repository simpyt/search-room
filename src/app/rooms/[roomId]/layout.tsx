import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getRoomWithMembers, isUserMemberOfRoom, addMember } from '@/lib/db/rooms';
import { getRoomActivities, logMemberJoined } from '@/lib/db/activities';
import { getTheme } from '@/lib/theme';
import { USERS } from '@/lib/types';
import { RoomLayoutClient } from './RoomLayoutClient';

// Re-export useRoom and ListingContext from context for consumers
export { useRoom, type ListingContext } from './RoomContext';

interface RoomLayoutProps {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}

export default async function RoomLayout({ children, params }: RoomLayoutProps) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const { roomId } = await params;
  const hg = getTheme() === 'homegate';

  // Fetch room with members
  let room = await getRoomWithMembers(roomId);

  if (!room) {
    notFound();
  }

  // Check if user is a member, if not auto-join
  const isMember = await isUserMemberOfRoom(roomId, user.id);
  if (!isMember) {
    await addMember(roomId, user.id, 'member');
    await logMemberJoined(roomId, user.id, USERS[user.id]?.name || user.id);
    // Refresh room data after joining
    room = await getRoomWithMembers(roomId);
    if (!room) {
      notFound();
    }
  }

  // Fetch initial activities
  const activities = await getRoomActivities(roomId, 100);

  return (
    <RoomLayoutClient
      initialRoom={room}
      initialUser={user}
      initialActivities={activities}
      roomId={roomId}
      isHomegate={hg}
    >
      {children}
    </RoomLayoutClient>
  );
}

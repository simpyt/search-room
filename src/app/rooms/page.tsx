import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserRooms, getRoomWithMembers } from '@/lib/db/rooms';
import { getRoomActivities } from '@/lib/db/activities';
import { getTheme } from '@/lib/theme';
import { USERS } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoomsHeader } from '@/components/rooms/RoomsHeader';
import { RoomCard } from '@/components/rooms/RoomCard';
import { ResourcesSection } from '@/components/resources';
import type { RoomWithMembers, Activity } from '@/lib/types';
import Link from 'next/link';

interface RoomWithActivities extends RoomWithMembers {
  recentActivities: Activity[];
}

export default async function RoomsPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login?redirect=/rooms');
  }

  const hg = getTheme() === 'homegate';

  // Fetch all rooms with members and activities in parallel
  const roomIds = await getUserRooms(user.id);
  
  const roomsWithActivities: RoomWithActivities[] = await Promise.all(
    roomIds.map(async (roomId) => {
      const [room, activities] = await Promise.all([
        getRoomWithMembers(roomId),
        getRoomActivities(roomId, 3),
      ]);

      if (!room) {
        return null;
      }

      return {
        ...room,
        recentActivities: activities || [],
      };
    })
  ).then((results) => results.filter((r): r is RoomWithActivities => r !== null));

  // Sort by most recent activity or creation date
  roomsWithActivities.sort((a, b) => {
    const aDate = a.recentActivities[0]?.createdAt || a.createdAt;
    const bDate = b.recentActivities[0]?.createdAt || b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  // Get user with avatar color from USERS constant
  const currentUser = USERS[user.id] || user;

  return (
    <div
      className={`min-h-screen ${
        hg
          ? 'bg-gradient-to-br from-[#ffe6f4] via-white to-[#ffe6f4]'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      }`}
    >
      {!hg && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent" />
      )}

      <div className="relative container mx-auto px-4 py-8">
        <RoomsHeader
          user={currentUser}
          roomCount={roomsWithActivities.length}
          isHomegate={hg}
        />

        {/* Room cards */}
        {roomsWithActivities.length === 0 ? (
          <Card
            className={`text-center py-12 ${
              hg
                ? 'border-gray-200 bg-white'
                : 'border-slate-700/50 bg-slate-900/50'
            }`}
          >
            <CardContent>
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  hg ? 'bg-gray-100' : 'bg-slate-800'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-8 w-8 ${hg ? 'text-gray-400' : 'text-slate-500'}`}
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${hg ? 'text-gray-900' : 'text-white'}`}
              >
                No rooms yet
              </h3>
              <p className={`mb-4 ${hg ? 'text-gray-500' : 'text-slate-400'}`}>
                Create your first search room to start collaborating
              </p>
              <Link href="/rooms/new">
                <Button
                  className={
                    hg
                      ? 'bg-[#e5007d] hover:bg-[#ae0061] text-white'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                  }
                >
                  Create Room
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roomsWithActivities.map((room) => (
              <RoomCard key={room.roomId} room={room} isHomegate={hg} />
            ))}
          </div>
        )}

        {/* Resources section */}
        <ResourcesSection />
      </div>
    </div>
  );
}

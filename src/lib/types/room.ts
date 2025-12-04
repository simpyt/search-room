export type MemberRole = 'owner' | 'member';
export type SearchType = 'buy' | 'rent';

export interface Room {
  roomId: string;
  name: string;
  createdByUserId: string;
  createdAt: string;
  searchType: SearchType;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export interface RoomWithMembers extends Room {
  members: RoomMember[];
}


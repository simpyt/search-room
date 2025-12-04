export type MemberRole = 'owner' | 'member';
export type SearchType = 'buy' | 'rent';

export interface RoomContext {
  description: string;
  familySize?: number;
  profession?: string;
  workLocation?: string;
  preferences?: string[];
  updatedAt: string;
  updatedByUserId: string;
}

export interface Room {
  roomId: string;
  name: string;
  createdByUserId: string;
  createdAt: string;
  searchType: SearchType;
  context?: RoomContext;
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


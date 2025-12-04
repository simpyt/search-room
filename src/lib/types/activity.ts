export const ACTIVITY_TYPES = [
  'ChatMessage',
  'RoomCreated',
  'MemberJoined',
  'CriteriaUpdated',
  'SearchExecuted',
  'CompatibilityComputed',
  'ListingPinned',
  'ListingStatusChanged',
  'AICriteriaProposed',
  'AICompromiseProposed',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type SenderType = 'user' | 'ai_copilot' | 'system';

export interface BaseActivity {
  roomId: string;
  activityId: string;
  type: ActivityType;
  createdAt: string;
  senderType: SenderType;
  senderId: string;
}

export interface ChatMessageActivity extends BaseActivity {
  type: 'ChatMessage';
  text: string;
}

export interface RoomCreatedActivity extends BaseActivity {
  type: 'RoomCreated';
  roomName: string;
}

export interface MemberJoinedActivity extends BaseActivity {
  type: 'MemberJoined';
  memberName: string;
}

export interface CriteriaUpdatedActivity extends BaseActivity {
  type: 'CriteriaUpdated';
  criteriaRef: string;
  summary: string;
}

export interface SearchExecutedActivity extends BaseActivity {
  type: 'SearchExecuted';
  resultsCount: number;
  criteriaRef?: string;
}

export interface CompatibilityComputedActivity extends BaseActivity {
  type: 'CompatibilityComputed';
  compatibilityRef: string;
  scorePercent: number;
  level: string;
}

export interface ListingPinnedActivity extends BaseActivity {
  type: 'ListingPinned';
  listingId: string;
  listingTitle: string;
}

export interface ListingStatusChangedActivity extends BaseActivity {
  type: 'ListingStatusChanged';
  listingId: string;
  listingTitle: string;
  fromStatus: string;
  toStatus: string;
}

export interface AICriteriaProposedActivity extends BaseActivity {
  type: 'AICriteriaProposed';
  criteriaRef: string;
  summary: string;
}

export interface AICompromiseProposedActivity extends BaseActivity {
  type: 'AICompromiseProposed';
  criteriaRef: string;
  summary: string;
}

export type Activity =
  | ChatMessageActivity
  | RoomCreatedActivity
  | MemberJoinedActivity
  | CriteriaUpdatedActivity
  | SearchExecutedActivity
  | CompatibilityComputedActivity
  | ListingPinnedActivity
  | ListingStatusChangedActivity
  | AICriteriaProposedActivity
  | AICompromiseProposedActivity;


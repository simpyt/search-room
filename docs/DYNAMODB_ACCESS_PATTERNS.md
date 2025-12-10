# DynamoDB Access Patterns

This document describes the single-table design and access patterns for the Search Room application.

## Table Overview

| Property | Value |
|----------|-------|
| Table Name | `search-room` (configurable via `DYNAMODB_TABLE_NAME`) |
| Billing Mode | PAY_PER_REQUEST (on-demand) |
| Primary Key | `PK` (partition key), `SK` (sort key) |
| GSI1 | ExternalIdIndex (`GSI1PK`, `GSI1SK`) |
| GSI2 | StatusIndex (`GSI2PK`, `GSI2SK`) |
| TTL Attribute | `ttl` |

---

## Entity Types

### Room

Core entity representing a search room where users collaborate.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | UUID |
| `name` | String | Room display name |
| `createdByUserId` | String | Owner's user ID |
| `createdAt` | String | ISO 8601 timestamp |
| `searchType` | String | `buy` or `rent` |
| `context` | Object | Optional room context (description, family size, etc.) |

### Member

Room membership record.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | Room UUID |
| `userId` | String | User ID |
| `role` | String | `owner` or `member` |
| `joinedAt` | String | ISO 8601 timestamp |

### UserRoom

Reverse index for querying a user's rooms.

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` | String | User ID |
| `roomId` | String | Room UUID |
| `role` | String | `owner` or `member` |
| `joinedAt` | String | ISO 8601 timestamp |

### Listing

Property listing saved to a room.

| Attribute | Type | Description |
|-----------|------|-------------|
| `listingId` | String | UUID |
| `roomId` | String | Room UUID |
| `sourceBrand` | String | Source platform (homegate, immoscout24, etc.) |
| `externalId` | String | ID from source platform |
| `title` | String | Listing title |
| `location` | String | Location/city |
| `status` | String | UNSEEN, SEEN, VISIT_PLANNED, etc. |
| `seenBy` | Array | User IDs who have seen this listing |
| `addedAt` | String | ISO 8601 timestamp |

### Criteria (User)

Individual user's search criteria.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | Room UUID |
| `userId` | String | User ID |
| `timestamp` | String | ISO 8601 timestamp |
| `criteria` | Object | Search criteria (location, price, rooms, etc.) |
| `weights` | Object | Importance weights for each criterion |
| `source` | String | `manual` or `ai_proposed` |

### Criteria (Combined)

Merged criteria from all room members.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | Room UUID |
| `timestamp` | String | ISO 8601 timestamp |
| `criteria` | Object | Combined search criteria |
| `weights` | Object | Combined weights |
| `fromUserIds` | Array | User IDs that contributed |
| `combineMode` | String | `all`, `mixed`, or `strict` |

### Activity

Activity feed entry for a room.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | Room UUID |
| `activityId` | String | UUID |
| `type` | String | Activity type (ChatMessage, ListingPinned, etc.) |
| `createdAt` | String | ISO 8601 timestamp |
| `senderType` | String | `user`, `ai_copilot`, or `system` |
| `senderId` | String | Sender identifier |
| `ttl` | Number | Epoch seconds for automatic expiration (90 days) |

### Compatibility

Compatibility score snapshot between room members.

| Attribute | Type | Description |
|-----------|------|-------------|
| `roomId` | String | Room UUID |
| `timestamp` | String | ISO 8601 timestamp |
| `scorePercent` | Number | 0-100 compatibility score |
| `level` | String | low, medium, high, excellent |
| `comment` | String | AI-generated explanation |
| `criteriaRefs` | Array | References to criteria used |

---

## Key Structure

### Primary Table Keys

| Entity | PK | SK |
|--------|----|----|
| Room | `ROOM#<roomId>` | `ROOM` |
| Member | `ROOM#<roomId>` | `MEMBER#<userId>` |
| UserRoom | `USER#<userId>` | `ROOM#<roomId>` |
| Listing | `ROOM#<roomId>` | `LISTING#<listingId>` |
| User Criteria | `ROOM#<roomId>` | `CRITERIA#<userId>#<timestamp>` |
| Combined Criteria | `ROOM#<roomId>` | `CRITERIA_COMBINED#<timestamp>` |
| Activity | `ROOM#<roomId>` | `ACTIVITY#<timestamp>#<activityId>` |
| Compatibility | `ROOM#<roomId>` | `COMPATIBILITY#<timestamp>` |

### GSI1: ExternalIdIndex (Sparse)

Used for deduplicating listings by their external source ID.

| GSI1PK | GSI1SK |
|--------|--------|
| `SOURCE#<sourceBrand>#<externalId>` | `ROOM#<roomId>` |

**Populated on:** Listing (only if `externalId` is provided)

### GSI2: StatusIndex

Used for querying listings by status within a room.

| GSI2PK | GSI2SK |
|--------|--------|
| `ROOM#<roomId>` | `STATUS#<status>#<listingId>` |

**Populated on:** All Listings

---

## Access Patterns

### Room Operations

| Operation | Access Pattern | Key Condition |
|-----------|----------------|---------------|
| Get room by ID | GetItem | `PK=ROOM#<roomId>, SK=ROOM` |
| Get room members | Query | `PK=ROOM#<roomId>, SK begins_with MEMBER#` |
| Get user's rooms | Query | `PK=USER#<userId>, SK begins_with ROOM#` |
| Check membership | GetItem | `PK=ROOM#<roomId>, SK=MEMBER#<userId>` |
| Delete room | Query + BatchDelete | `PK=ROOM#<roomId>` (all items) + UserRoom cleanup |

### Listing Operations

| Operation | Access Pattern | Key Condition |
|-----------|----------------|---------------|
| Get listing by ID | GetItem | `PK=ROOM#<roomId>, SK=LISTING#<listingId>` |
| Get all room listings | Query | `PK=ROOM#<roomId>, SK begins_with LISTING#` |
| Get listings by status | Query (GSI2) | `GSI2PK=ROOM#<roomId>, GSI2SK begins_with STATUS#<status>#` |
| Find by external ID | Query (GSI1) | `GSI1PK=SOURCE#<source>#<extId>, GSI1SK=ROOM#<roomId>` |

### Criteria Operations

| Operation | Access Pattern | Key Condition |
|-----------|----------------|---------------|
| Get user's latest criteria | Query (Limit 1, DESC) | `PK=ROOM#<roomId>, SK begins_with CRITERIA#<userId>#` |
| Get all users' criteria | Query | `PK=ROOM#<roomId>, SK begins_with CRITERIA#` |
| Get combined criteria | Query (Limit 1, DESC) | `PK=ROOM#<roomId>, SK begins_with CRITERIA_COMBINED#` |

### Activity Operations

| Operation | Access Pattern | Key Condition |
|-----------|----------------|---------------|
| Get room activities | Query (DESC) | `PK=ROOM#<roomId>, SK begins_with ACTIVITY#` |
| Get activities after timestamp | Query | `PK=ROOM#<roomId>, SK > ACTIVITY#<timestamp>` |

### Compatibility Operations

| Operation | Access Pattern | Key Condition |
|-----------|----------------|---------------|
| Get latest compatibility | Query (Limit 1, DESC) | `PK=ROOM#<roomId>, SK begins_with COMPATIBILITY#` |
| Get compatibility history | Query (DESC) | `PK=ROOM#<roomId>, SK begins_with COMPATIBILITY#` |

---

## TTL Configuration

| Entity | TTL Duration | Purpose |
|--------|--------------|---------|
| Activity | 90 days | Automatic cleanup of old activity feed entries |
| Criteria | Not enabled | Preserved indefinitely (see note below) |

> **Note on Criteria TTL:** Criteria items don't have TTL to preserve user preferences even for inactive rooms. A scheduled cleanup Lambda could be implemented to set TTL on non-latest criteria versions if storage becomes a concern.

---

## Code References

Key helpers are defined in `src/lib/db/client.ts`:

```typescript
// Primary keys
keys.room(roomId)
keys.member(roomId, userId)
keys.userRoom(userId, roomId)
keys.listing(roomId, listingId)
keys.criteria(roomId, userId, timestamp)
keys.combinedCriteria(roomId, timestamp)
keys.activity(roomId, timestamp, activityId)
keys.compatibility(roomId, timestamp)

// GSI keys
gsiKeys.listingExternalId(sourceBrand, externalId, roomId)
gsiKeys.listingStatus(roomId, status, listingId)

// SK prefixes for queries
skPrefix.members
skPrefix.criteria(userId)
skPrefix.allCriteria
skPrefix.combinedCriteria
skPrefix.listings
skPrefix.activities
skPrefix.compatibility

// GSI SK prefixes
gsiSkPrefix.status(status)

// TTL helpers
calculateTTL(daysFromNow)
TTL_DAYS.activities // 90
TTL_DAYS.criteria   // 30 (for future use)
```

---

## Migration Notes

### Adding GSIs to Existing Tables

GSIs can be added to existing tables without downtime:

```bash
aws dynamodb update-table \
  --table-name search-room \
  --attribute-definitions \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
    AttributeName=GSI2PK,AttributeType=S \
    AttributeName=GSI2SK,AttributeType=S \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"ExternalIdIndex\",\"KeySchema\":[{\"AttributeName\":\"GSI1PK\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"GSI1SK\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"}}}]"
```

### Backfilling GSI Attributes

Existing listings won't have GSI attributes. Run a migration script to backfill:

```typescript
// Pseudo-code for backfill
const listings = await scanAllListings();
for (const listing of listings) {
  await updateListing(listing.roomId, listing.listingId, {
    GSI1PK: listing.externalId ? `SOURCE#${listing.sourceBrand}#${listing.externalId}` : undefined,
    GSI1SK: listing.externalId ? `ROOM#${listing.roomId}` : undefined,
    GSI2PK: `ROOM#${listing.roomId}`,
    GSI2SK: `STATUS#${listing.status}#${listing.listingId}`,
  });
}
```

### Enabling TTL

```bash
aws dynamodb update-time-to-live \
  --table-name search-room \
  --time-to-live-specification Enabled=true,AttributeName=ttl
```

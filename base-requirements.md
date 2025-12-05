
# Search Room – POC Requirements & Architecture

Context: Hackathon POC (2 users: **Pierre** & **Marie**)
Source of truth: **Search Room.drawio** diagram + this document.

---

## 1. Goal & Scope

**Goal:**
Build a POC of **Search Room**, a shared space where two users (**Pierre** and **Marie**) can:

* Define and adjust **search criteria**, both manually and via **AI**.
* See **combined and individual results** from a property search (Homegate API + mocked external brands).
* Create a shared **favorites list**, with **statuses** reflecting where each property stands in their decision journey.
* Chat with each other and an **AI Co-pilot** that:

  * Structures search criteria from natural language.
  * Computes and explains **compatibility** between their preferences.
  * Proposes **new criteria** to improve compatibility when it is low.

Focus of POC:

* 2 pre-created users only.
* 1 active Room per session (you log in, create/join a single Room).
* Clean separation of **modules** as in the diagram:

  * Activities
  * Results
  * Search Criteria
  * Compatibility
  * Communication (Chat)
  * Webpages
  * Events

---

## 2. Personas & Assumptions

### Personas

1. **Pierre**

   * User 1.
   * Logged in via pre-defined credentials.

2. **Marie**

   * User 2.
   * Logged in via pre-defined credentials.

3. **AI Co-pilot**

   * Not a human user; acts as an active “member” in the Room.
   * Conversational, appears in chat/activity feed.
   * Can:

     * Propose structured criteria from prompts.
     * Compute and explain compatibility.
     * Propose adjusted criteria when compatibility is low.

### Assumptions

* Each session has **exactly one Room** per pair (for POC).
* Both users are always logged in via the **simple 2-user auth**.
* No emails or push notifications; **only UI-based feedback**.
* All **non-SMG listings** are **mocked** (no real external APIs besides Homegate).

---

## 3. Pages & Navigation (Webpages)

### 3.1 Login Page

**URL:** `/login`

**Purpose:** Log in as Pierre or Marie.

**Content:**

* Email + password fields.
* Two valid credentials:

  * `pierre@example.com` / `P13rr3$2024!DemoSecure`
  * `marie@example.com` / `M4r13$2024!DemoSecure`
* On successful login:

  * Set `sr_session=<userId>` cookie.
  * Redirect to:

    * If user has no room: **Create Room page**.
    * If a room exists: **Search Room homepage** (Together tab).

---

### 3.2 Create Room Page

**URL:** `/rooms/new` (or immediate redirect after login if no room)

**Purpose:** Create the Room that will host the joint search.

**UI:**

* Basic Homegate-like search page with:

  * Location field (e.g. Fribourg + radius).
  * Offer type (simplified to **Buy** for POC, but conceptually the same as the screenshot).
  * Category.
  * Basic price & room fields.
* Prominent button: **“Create Search Room”**.

**Flow:**

1. User fills minimal initial criteria (or leaves defaults).
2. User clicks **Create Search Room**.
3. Backend:

   * Creates `ROOM#<roomId>` with:

     * Owner = current user (Pierre or Marie).
   * Adds `MEMBER#<ownerUserId>`.
   * Registers AI Co-pilot as logical member.
4. Redirect to **Search Room homepage – Together tab** for that room.

---

### 3.3 Search Room Homepage

**URL:** `/rooms/[roomId]`

**Tabs:**

1. **Together**
2. **My view** (current user – “Pierre” or “Marie”)

**Global layout (Both tabs):**

* **Main content area**:

  * Search Criteria module
  * Results/Favorites module
  * Compatibility summary (prominent)
* **Side panel (toggleable)**:

  * Combined **Chat + Activities** feed.
  * Chat messages are events; activities include system events (searches, status changes, criteria updates, etc.).

#### 3.3.1 Together tab

**Purpose:** Shared overview of the search for both users.

**Sections:**

1. **Search Criteria (Combined)**

   * Shows **per-user criteria** (Pierre vs Marie) side-by-side.
   * Shows **combined criteria** that will be used for shared search.
   * Visual cues for differences:

     * e.g. highlight fields where Pierre and Marie diverge.
   * Fields (based on screenshot):

     * Location (+ radius)
     * Offer type
     * Category
     * Price from / Price up to
     * “Only listings with price” (checkbox)
     * Rooms from / Rooms to
     * Living space from / to
     * Year built from / to
     * Lot size from / to
     * Type
     * Floor
     * Availability
     * Free-text search
     * Features & furnishings (checkboxes):

       * Balcony / Terrace
       * Elevator
       * Has wheelchair access
       * Parking space / Garage
       * Minergie
       * New building
       * Old building
       * Swimming pool

   **Weights (importance):**

   * Each relevant criterion can receive a **weight**:

     * 1 ⭐ – *“absolutely trivial”*
     * 3 ⭐ – *“nice to have”*
     * 5 ⭐ – *“must have”*
   * Users can set weights on their own criteria.
   * Combined view shows how each user’s weight compares.

   **AI interaction:**

   * A natural language prompt field:

     * Example: “We want a 4.5 room apartment near Fribourg, under 1.2M, ideally with a balcony and parking.”
   * Actions:

     * **Ask AI to build criteria**

       * AI Co-pilot returns a structured criteria proposal (fields + weights).
       * Users can accept or reject.
     * **Apply AI proposal (Together)**

       * Overwrites/updates the combined criteria (and optionally personal criteria).

2. **Results & Favorites**

   **Results:**

   * Primary results list based on **combined criteria** via Homegate Search.
   * Results show:

     * Base fields from Homegate (title, price, address, rooms, etc.).
   * Users can:

     * **Pin to favorites** (add to Room’s shortlist).
   * External listings (mocked data) can be added via explicit actions or by AI in the future (but not required for this POC).

   **Favorites (shortlist):**

   * Table/grid of pinned properties.
   * For each favorite:

     * Basic info.
     * Source (Homegate / external mock).
     * **Status** (Room-level, but semantics refer to partner visibility & process).

       * `Unseen` – partner has not opened this favorite.
       * `Seen` – partner has opened it at least once.
       * `Visit planned`
       * `Visited`
       * `Applied`
       * `Accepted (won)`
       * `Rejected (not won)`
       * `Deleted` (soft-deleted / archived; hidden by default from the main view).
   * Status change actions:

     * Dropdown or stepper allowing the current user to move a favorite to another status.
     * Changing to `Deleted` hides it from default view but keeps it in history.

3. **Compatibility summary**

   * Display:

     * **Compatibility percentage** (0–100%).
     * **Category** derived from %:

       * 0–40% → **Low**
       * 41–75% → **Medium**
       * 76–100% → **High**
     * Short explanatory comment generated by AI (“You both strongly agree on location and budget, but differ on living space and balcony.”).
   * Trigger points for recalculation:

     * Manual button: “Recalculate compatibility”.
     * Automatically after:

       * Major criteria changes,
       * Large status changes (e.g. a new set of favorites).
   * If compatibility is **Low**:

     * AI may propose **adjusted criteria** (e.g. slightly higher budget, larger radius, flexible living space).
     * Users can accept these adjustments to update combined criteria.

#### 3.3.2 My view tab

**Purpose:** Show the search from the perspective of the logged-in user.

**Differences vs Together:**

* **Criteria section:**

  * Shows only this user’s criteria with weights.
  * Allows editing of personal criteria (without immediately changing combined criteria).
  * Option to “Send my criteria to AI to harmonise with my partner”.

* **Results:**

  * Search based on **personal criteria**.
  * Pinning favorites affects shared shortlist.
  * Status view highlights:

    * Which favorites they added vs partner added.

* **Compatibility:**

  * Same score as in Together, but phrased relative to the current user (“Given your preferences, you are X% aligned with your partner.”).

---

### 3.4 Listing Details Page

**URL:** `/rooms/[roomId]/listings/[listingId]`

**Purpose:** Detail view of a favorite listing within Search Room context.

**Sections:**

1. **Listing info**

   * Data from Homegate or mocked external source.
   * Link “View on original website”.

2. **Status visualization**

   * Horizontal or vertical timeline showing:

     * Unseen → Seen → Visit planned → Visited → Applied → Accepted / Rejected → Deleted.
   * Current status highlighted; past statuses dimmed; future statuses greyed.

3. **Criteria conformity**

   * List of criteria with match indicators:

     * ✅ Match
     * ⚠️ Near miss
     * ❌ Miss
   * Show which user considered which criterion most important (based on weights).

4. **Actions**

   * Change status.
   * Scroll back to chat (e.g., “Discuss in Search Room”).

---

## 4. Communication & Activities Side Panel

**Behavior:**

* Toggleable side panel on the right (or left).
* Contains a **single chronological feed** of:

  * **Chat messages** (from Pierre, Marie, AI Co-pilot).
  * **Activities** (Room events).

**Conceptual model:**

* All feed entries are “activities”.
* Some activities are of type `ChatMessage`.
* Others include:

  * `RoomCreated`
  * `CriteriaUpdated`
  * `SearchExecuted`
  * `CompatibilityComputed`
  * `ListingPinned`
  * `ListingStatusChanged`
  * etc.

**User actions:**

* Type messages in an input field.
* Mention actions in natural language (e.g. “AI, help us improve compatibility”).
* AI responses appear as activity entries with type `ChatMessage` from `AI_COPILOT`.

---

## 5. AI Co-pilot – Required Features (POC)

**All of these are required; “suggest additional listings” explicitly NOT required.**

1. **Natural-language → structured criteria**

   * Input:

     * Prompt text from the user,
     * Optional previous criteria for context.
   * Output:

     * Structured criteria matching the filter fields (location, price range, rooms, features, etc.).
     * Suggested weights (1–5) per criterion.
   * UX:

     * Show proposed criteria as a diff (what changed).
     * Allow user to **accept** or **discard**.

2. **Compatibility scoring**

   * Inputs:

     * Pierre’s criteria & weights.
     * Marie’s criteria & weights.
     * Optionally some summary of favorites (e.g. counts by type/status).
   * Outputs:

     * `scorePercent` (0–100).
     * `level` (Low/Medium/High derived from %).
     * `comment` (short explanation of where they align or diverge).

3. **Propose new criteria when compatibility is low**

   * When `scorePercent` < threshold (e.g. < 40%):

     * Propose adjusted criteria:

       * Relax a constraint (e.g. slightly higher max price, broader radius, more flexible living space).
       * Or propose a compromise region.
   * UX:

     * Show “AI suggests this compromise” with fields/weights.
     * Button: “Apply compromise” which updates combined criteria and triggers new search.

4. **Conversational chat UX**

   * AI reacts to free-form text:

     * Can re-explain compatibility.
     * Can summarise the situation (“You’ve pinned 5 listings, most of them are in X region and meet your must-have criteria.”).
   * No usage limit in the UI.

---

## 6. Data Model (Conceptual + Dynamo Single Table)

### 6.1 Keys

* **Partition Key (PK):** `ROOM#<roomId>`
* **Sort Key (SK):** typed key for different entities.

### 6.2 Entities

1. **Room**

   * `PK = ROOM#<roomId>`
   * `SK = ROOM`
   * Fields:

     * `roomId`
     * `createdByUserId` (Pierre or Marie)
     * `createdAt`
     * `name` / label
     * `searchType` (Buy)

2. **Member**

   * `SK = MEMBER#<userId>`
   * Fields:

     * `userId` (Pierre or Marie)
     * `role` (Owner / Member)
     * `joinedAt`

3. **Criteria (per user)**

   * `SK = CRITERIA#<userId>#<timestamp>`
   * Fields:

     * `userId`
     * `timestamp`
     * `criteria` object with:

       * Fields from the search screenshot.
     * `weights`:

       * Map from criterion key → 1–5 integer.
     * `source`:

       * `manual` | `ai_proposed`

4. **Combined Criteria**

   * `SK = CRITERIA_COMBINED#<timestamp>`
   * Fields:

     * `criteria`
     * `weights`
     * `fromUserIds = ['pierre', 'marie']`

5. **Search Query (history)**

   * `SK = QUERY#<timestamp>`
   * Fields:

     * `roomId`
     * `userId` (who triggered)
     * `criteriaRef` (reference to criteria snapshot)
     * `resultsCount`
     * `source = 'homegate'`

6. **Listing (favorite)**

   * `SK = LISTING#<listingId>`
   * Fields:

     * `listingId`
     * `sourceBrand` (`homegate` or `external_mock`)
     * `title`, `location`, `price`, `rooms`, etc.
     * `addedByUserId`
     * `addedAt`
     * `status` (enum: `UNSEEN`, `SEEN`, `VISIT_PLANNED`, `VISITED`, `APPLIED`, `ACCEPTED`, `REJECTED`, `DELETED`)
     * Optionally: `seenBy` array indicating which partners have opened it.

7. **Compatibility Snapshot**

   * `SK = COMPATIBILITY#<timestamp>`
   * Fields:

     * `scorePercent` (0–100)
     * `level` (`LOW` | `MEDIUM` | `HIGH`)
     * `comment`
     * `criteriaRefs` (references to the criteria snapshots used)

8. **Activity / Chat Message**

   * `SK = ACTIVITY#<timestamp>` or `MESSAGE#<timestamp>`
     (we can choose one type key and differentiate via `type` field)
   * Fields:

     * `type` (`ChatMessage`, `RoomCreated`, `SearchExecuted`, `CriteriaUpdated`, `CompatibilityComputed`, `ListingPinned`, `ListingStatusChanged`, etc.)
     * `userId` or `senderType`/`senderId` (`AI_COPILOT` for AI messages)
     * `text` for chat/content
     * Optional references: `listingId`, `criteriaRef`, `compatibilityRef`
     * `createdAt`

---

## 7. Tech Architecture (Short Summary)

* **Framework:** Next.js (App Router).
* **Auth:**

  * 2 predefined users (Pierre & Marie) stored in code.
  * Login route `/api/auth/login` issues `sr_session` cookie with `userId`.
  * Middleware protects all routes except `/login` and auth API.
* **Search Integration:**

  * Server-only **Homegate Search API** via `/api/rooms/[roomId]/search`.
  * Parameters derived from criteria objects.
* **Data store:**

  * DynamoDB single table with `PK`, `SK`.
  * All Room, criteria, queries, favorites, activities and compatibility snapshots live there.
* **AI:**

  * ChatGPT via backend route handlers:

    * `/api/rooms/[roomId]/criteria/ai`
    * `/api/rooms/[roomId]/compatibility`
    * `/api/rooms/[roomId]/chat`
  * All AI interactions logged as activities/messages.

---

## 8. Open Points / To-Be-Decided

1. **Exact thresholds** for mapping percentage → Low/Medium/High compatibility (suggested: <40, 40–75, >75).
  -> Go with the best idea
2. **How strict** the combined criteria should be:

   * Always intersection of both users?
   * Or allow some “fuzzy” combination where medium-weight criteria can be relaxed?

   -> Give the option to filter by: all (inclusive OR), mixed (closest but not strict), full overlap (exclusive AND)
3. **Default weights**:

   * When user leaves some fields blank, what default weight do we assign (e.g. 1 or 3)?
   -> no weight (trivial if not set)
4. **Initial Room name**:

   * Static placeholder (“Search Room”) vs. auto-generated from first criteria (e.g. “Fribourg 4.5 rooms <1.25M”).
   -> The user should set the name at creation time

These can be finalised quickly during implementation, but having explicit decisions will avoid diverging behavior in the POC.

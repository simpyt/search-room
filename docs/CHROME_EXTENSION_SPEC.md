# Search Room - Chrome Extension Specification

A Chrome extension that allows users to add real estate listings from any website (Anibis, Facebook Marketplace, Homegate, Immoscout24, etc.) to their Search Room using AI-powered parsing.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technical Requirements](#technical-requirements)
4. [Authentication](#authentication)
5. [Core User Flows](#core-user-flows)
6. [AI Parsing Strategy](#ai-parsing-strategy)
7. [API Integration](#api-integration)
8. [Extension Components](#extension-components)
9. [Data Models](#data-models)
10. [Security Considerations](#security-considerations)
11. [Development Setup](#development-setup)
12. [Deployment](#deployment)
13. [Backend Changes Required](#backend-changes-required)

---

## Overview

### Purpose

Enable users to save real estate listings from any website directly to their Search Room, regardless of whether the platform is officially supported. The extension uses AI to intelligently parse listing data from any page structure.

### Key Features

- One-click listing capture from any real estate website
- AI-powered data extraction (OpenAI GPT-4)
- Room selection for organizing listings
- Visual feedback and error handling
- Works with: Homegate, Immoscout24, Anibis, Facebook Marketplace, Ricardo, and any other site

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Authentication | Cookie sharing | Simplest approach - reuses existing `sr_session` cookie from web app |
| Parsing | AI-only (OpenAI) | Maximum flexibility, handles any website without maintenance |
| Repository | Separate | Independent versioning, cleaner separation of concerns |
| UI Framework | React + Tailwind | Consistency with main app, modern DX |
| Build Tool | Vite | Fast builds, excellent Chrome extension support |

---

## Architecture

### Repository Structure

```
search-room-extension/
├── manifest.json                 # Chrome Extension Manifest V3
├── vite.config.ts               # Build configuration
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
├── package.json
├── README.md
│
├── src/
│   ├── popup/                   # Extension popup UI
│   │   ├── index.html
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── RoomSelector.tsx
│   │       ├── ListingPreview.tsx
│   │       ├── StatusIndicator.tsx
│   │       └── ErrorMessage.tsx
│   │
│   ├── content/                 # Content script (injected into pages)
│   │   ├── index.ts
│   │   └── extractor.ts         # DOM/structured data extraction
│   │
│   ├── background/              # Service worker
│   │   ├── index.ts
│   │   └── handlers/
│   │       ├── auth.ts
│   │       ├── api.ts
│   │       └── parser.ts
│   │
│   ├── lib/
│   │   ├── api.ts               # Search Room API client
│   │   ├── openai.ts            # OpenAI integration
│   │   ├── storage.ts           # Chrome storage helpers
│   │   ├── messages.ts          # Message type definitions
│   │   └── types.ts             # Shared types
│   │
│   └── assets/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
│
├── public/
│   └── icons/
│
└── dist/                        # Build output (gitignored)
```

### Component Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER TAB                               │
│  ┌─────────────────┐                                            │
│  │  Content Script │ ←──── Extracts page data                   │
│  └────────┬────────┘                                            │
└───────────┼─────────────────────────────────────────────────────┘
            │ chrome.runtime.sendMessage
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE WORKER (Background)                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   Auth Handler  │  │   API Handler   │  │  Parser Handler │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│           │                    │                    │           │
│           ▼                    ▼                    ▼           │
│     Read cookies        POST to API          Call OpenAI       │
└─────────────────────────────────────────────────────────────────┘
            ▲
            │ chrome.runtime.sendMessage
            │
┌───────────┴─────────────────────────────────────────────────────┐
│                         POPUP UI                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Room Selector  │  Listing Preview  │  Add Button          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

### Chrome Extension

- **Manifest Version**: V3 (required for new extensions)
- **Minimum Chrome Version**: 116+
- **Permissions Required**:
  - `activeTab` - Access current tab content
  - `cookies` - Read `sr_session` cookie for authentication
  - `storage` - Persist user preferences (last selected room)
  - `scripting` - Inject content scripts dynamically

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.23",
    "@types/chrome": "^0.0.260",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

---

## Authentication

### Strategy: Cookie Sharing

The extension reads the existing `sr_session` cookie from the Search Room domain. This means:

1. User must be logged into the Search Room web app
2. Extension reads cookie via `chrome.cookies.get()`
3. Cookie is forwarded with API requests

### Implementation

```typescript
// src/background/handlers/auth.ts

const SEARCH_ROOM_DOMAIN = 'localhost'; // or production domain
const SESSION_COOKIE_NAME = 'sr_session';

export async function getSessionCookie(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.cookies.get(
      {
        url: `http://${SEARCH_ROOM_DOMAIN}:3000`,
        name: SESSION_COOKIE_NAME,
      },
      (cookie) => {
        resolve(cookie?.value ?? null);
      }
    );
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSessionCookie();
  return session !== null;
}
```

### Auth Flow in Popup

```typescript
// src/popup/App.tsx

function App() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
      setAuthState(response.authenticated ? 'authenticated' : 'unauthenticated');
    });
  }, []);

  if (authState === 'loading') return <LoadingSpinner />;
  if (authState === 'unauthenticated') {
    return (
      <div className="p-4 text-center">
        <p>Please log in to Search Room first</p>
        <a href="http://localhost:3000/login" target="_blank" className="text-blue-500">
          Open Search Room
        </a>
      </div>
    );
  }

  return <MainUI />;
}
```

---

## Core User Flows

### Flow 1: Add Listing (Happy Path)

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. User browses listing on Anibis/FB Marketplace/etc            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. User clicks extension icon                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. Popup opens, shows "Extracting listing data..."              │
│    - Content script extracts HTML + structured data (JSON-LD)   │
│    - Sends to background worker                                  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. Background worker sends to OpenAI for parsing                 │
│    - Returns structured listing data                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. Popup shows listing preview:                                  │
│    ┌────────────────────────────────────────────────────────┐   │
│    │ 🏠 3.5 Room Apartment in Zurich                        │   │
│    │ Location: Zurich, 8001                                  │   │
│    │ Price: CHF 2,500/mo                                     │   │
│    │ Rooms: 3.5 | Space: 85m²                               │   │
│    │                                                         │   │
│    │ Add to room: [▼ Our Zurich Search    ]                 │   │
│    │                                                         │   │
│    │           [  Add Listing  ]                            │   │
│    └────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. User selects room and clicks "Add Listing"                    │
│    - POST to /api/rooms/:roomId/listings                        │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. Success! Shows confirmation with link to view in app         │
└──────────────────────────────────────────────────────────────────┘
```

### Flow 2: Not Logged In

1. User clicks extension icon
2. Popup shows "Please log in to Search Room first"
3. Link to open Search Room login page

### Flow 3: Duplicate Listing

1. User tries to add listing already in room
2. API returns 409 Conflict
3. Popup shows "This listing is already in your favorites"

### Flow 4: Parse Error

1. AI fails to extract meaningful data
2. Popup shows manual entry form as fallback
3. User can manually fill in title, location, price

---

## AI Parsing Strategy

### OpenAI Integration

The extension uses GPT-4o-mini for cost-effective, accurate parsing.

### System Prompt

```typescript
// src/lib/openai.ts

const SYSTEM_PROMPT = `You are a real estate listing data extractor. 
Given HTML content from a listing page, extract structured data.

Rules:
1. Extract only factual information present on the page
2. For price, extract the numeric value and currency separately
3. For rooms, use Swiss notation (e.g., 3.5 rooms)
4. Living space should be in square meters
5. If a field cannot be determined, return null
6. For features, extract notable amenities (balcony, parking, etc.)
7. Return valid JSON only, no markdown formatting`;

const USER_PROMPT_TEMPLATE = `Extract listing data from this page:

URL: {url}

Page content:
{content}

Return JSON in this exact format:
{
  "title": "string - listing title",
  "location": "string - city/area name",
  "address": "string or null - full address if available",
  "price": "number or null - numeric price value",
  "currency": "string - CHF, EUR, etc.",
  "rooms": "number or null - room count (e.g., 3.5)",
  "livingSpace": "number or null - square meters",
  "yearBuilt": "number or null - construction year",
  "features": ["array of strings - amenities/features"],
  "imageUrl": "string or null - main image URL"
}`;
```

### Parsing Implementation

```typescript
// src/background/handlers/parser.ts

import OpenAI from 'openai';

interface ParsedListing {
  title: string;
  location: string;
  address: string | null;
  price: number | null;
  currency: string;
  rooms: number | null;
  livingSpace: number | null;
  yearBuilt: number | null;
  features: string[];
  imageUrl: string | null;
}

export async function parseListingWithAI(
  content: string,
  url: string,
  apiKey: string
): Promise<ParsedListing> {
  const openai = new OpenAI({ apiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: USER_PROMPT_TEMPLATE
          .replace('{url}', url)
          .replace('{content}', truncateContent(content, 15000)),
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for consistent extraction
    max_tokens: 1000,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return validateAndNormalize(result);
}

function truncateContent(content: string, maxLength: number): string {
  // Prioritize main content, remove scripts/styles
  const cleaned = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned.slice(0, maxLength);
}
```

### Content Extraction (Content Script)

```typescript
// src/content/extractor.ts

export interface ExtractedContent {
  html: string;
  url: string;
  jsonLd: object | null;
  ogData: Record<string, string>;
  title: string;
}

export function extractPageContent(): ExtractedContent {
  // Get JSON-LD structured data if available
  const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
  let jsonLd = null;
  if (jsonLdScript) {
    try {
      jsonLd = JSON.parse(jsonLdScript.textContent || '');
    } catch {}
  }

  // Get Open Graph data
  const ogData: Record<string, string> = {};
  document.querySelectorAll('meta[property^="og:"]').forEach((meta) => {
    const property = meta.getAttribute('property')?.replace('og:', '');
    const content = meta.getAttribute('content');
    if (property && content) {
      ogData[property] = content;
    }
  });

  // Get main content area (heuristic)
  const mainContent = 
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.querySelector('article') ||
    document.body;

  return {
    html: mainContent.innerHTML,
    url: window.location.href,
    jsonLd,
    ogData,
    title: document.title,
  };
}
```

---

## API Integration

### API Client

```typescript
// src/lib/api.ts

const API_BASE_URL = 'http://localhost:3000/api'; // Configure for production

export interface Room {
  roomId: string;
  name: string;
  searchType: 'buy' | 'rent';
}

export interface CreateListingPayload {
  externalId?: string;
  title: string;
  location: string;
  address?: string;
  price?: number;
  currency?: string;
  rooms?: number;
  livingSpace?: number;
  yearBuilt?: number;
  features?: string[];
  imageUrl?: string;
  externalUrl: string;
  sourceBrand: string;
}

export class SearchRoomAPI {
  constructor(private sessionCookie: string) {}

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sr_session=${this.sessionCookie}`,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new APIError(response.status, error.error || 'Request failed');
    }

    return response.json();
  }

  async getRooms(): Promise<Room[]> {
    const data = await this.fetch<{ rooms: Room[] }>('/rooms');
    return data.rooms;
  }

  async createListing(roomId: string, listing: CreateListingPayload): Promise<void> {
    await this.fetch(`/rooms/${roomId}/listings`, {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  }

  async checkAuth(): Promise<boolean> {
    try {
      await this.fetch('/auth/me');
      return true;
    } catch {
      return false;
    }
  }
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
```

### Source Brand Detection

```typescript
// src/lib/sources.ts

export type ListingSource = 
  | 'homegate'
  | 'immoscout24'
  | 'anibis'
  | 'facebook'
  | 'ricardo'
  | 'comparis'
  | 'other';

export function detectSource(url: string): ListingSource {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('homegate.ch')) return 'homegate';
  if (hostname.includes('immoscout24.ch')) return 'immoscout24';
  if (hostname.includes('anibis.ch')) return 'anibis';
  if (hostname.includes('facebook.com')) return 'facebook';
  if (hostname.includes('ricardo.ch')) return 'ricardo';
  if (hostname.includes('comparis.ch')) return 'comparis';
  
  return 'other';
}

export function generateExternalId(url: string, source: ListingSource): string {
  // Extract platform-specific ID from URL when possible
  const patterns: Record<string, RegExp> = {
    homegate: /\/(\d+)(?:\?|$)/,
    immoscout24: /\/(\d+)(?:\?|$)/,
    anibis: /\/(\d+)(?:\?|$)/,
  };

  const pattern = patterns[source];
  if (pattern) {
    const match = url.match(pattern);
    if (match) return `${source}:${match[1]}`;
  }

  // Fallback: hash the URL
  return `${source}:${hashUrl(url)}`;
}

function hashUrl(url: string): string {
  // Simple hash for URL deduplication
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
```

---

## Extension Components

### Manifest V3

```json
{
  "manifest_version": 3,
  "name": "Search Room - Listing Saver",
  "version": "1.0.0",
  "description": "Save real estate listings from any website to your Search Room",
  
  "permissions": [
    "activeTab",
    "cookies",
    "storage",
    "scripting"
  ],
  
  "host_permissions": [
    "http://localhost:3000/*",
    "https://your-production-domain.com/*"
  ],
  
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "assets/icon-16.png",
      "32": "assets/icon-32.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.ts"],
      "run_at": "document_idle"
    }
  ],
  
  "icons": {
    "16": "assets/icon-16.png",
    "32": "assets/icon-32.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

### Popup UI Components

```typescript
// src/popup/components/RoomSelector.tsx

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
}

export function RoomSelector({ rooms, selectedRoomId, onSelect }: RoomSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Add to room
      </label>
      <select
        value={selectedRoomId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="" disabled>Select a room...</option>
        {rooms.map((room) => (
          <option key={room.roomId} value={room.roomId}>
            {room.name} ({room.searchType})
          </option>
        ))}
      </select>
    </div>
  );
}
```

```typescript
// src/popup/components/ListingPreview.tsx

interface ListingPreviewProps {
  listing: ParsedListing;
}

export function ListingPreview({ listing }: ListingPreviewProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {listing.imageUrl && (
        <img 
          src={listing.imageUrl} 
          alt={listing.title}
          className="w-full h-32 object-cover rounded-md"
        />
      )}
      
      <h3 className="font-semibold text-gray-900 line-clamp-2">
        {listing.title}
      </h3>
      
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4" />
          <span>{listing.location}</span>
        </div>
        
        {listing.price && (
          <div className="flex items-center gap-2">
            <CurrencyIcon className="w-4 h-4" />
            <span>
              {listing.currency} {listing.price.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex gap-4">
          {listing.rooms && (
            <span>{listing.rooms} rooms</span>
          )}
          {listing.livingSpace && (
            <span>{listing.livingSpace}m²</span>
          )}
        </div>
      </div>
      
      {listing.features.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {listing.features.slice(0, 5).map((feature) => (
            <span 
              key={feature}
              className="px-2 py-0.5 bg-blue-100 text-blue-700 
                         text-xs rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Message Types

```typescript
// src/lib/messages.ts

export type MessageType =
  | { type: 'CHECK_AUTH' }
  | { type: 'GET_ROOMS' }
  | { type: 'EXTRACT_CONTENT' }
  | { type: 'PARSE_LISTING'; content: ExtractedContent }
  | { type: 'CREATE_LISTING'; roomId: string; listing: CreateListingPayload };

export type MessageResponse<T extends MessageType['type']> = 
  T extends 'CHECK_AUTH' ? { authenticated: boolean } :
  T extends 'GET_ROOMS' ? { rooms: Room[] } :
  T extends 'EXTRACT_CONTENT' ? ExtractedContent :
  T extends 'PARSE_LISTING' ? ParsedListing :
  T extends 'CREATE_LISTING' ? { success: boolean; error?: string } :
  never;
```

---

## Data Models

### Listing Data (Extension to API)

```typescript
// Matches the backend Listing interface

interface ListingPayload {
  // Required
  title: string;           // "3.5 Room Apartment in Zurich"
  location: string;        // "Zurich"
  externalUrl: string;     // Original listing URL
  sourceBrand: ListingSource;
  
  // Optional
  externalId?: string;     // Platform-specific ID for deduplication
  address?: string;        // "Bahnhofstrasse 1, 8001 Zurich"
  price?: number;          // 2500 (numeric only)
  currency?: string;       // "CHF"
  rooms?: number;          // 3.5
  livingSpace?: number;    // 85 (m²)
  yearBuilt?: number;      // 1985
  features?: string[];     // ["Balcony", "Parking", "Dishwasher"]
  imageUrl?: string;       // Main listing image
}
```

### Storage Schema

```typescript
// src/lib/storage.ts

interface ExtensionStorage {
  // User preferences
  lastSelectedRoomId?: string;
  
  // API configuration (production URL)
  apiBaseUrl: string;
  
  // OpenAI API key (user provides their own)
  openaiApiKey?: string;
}

export const storage = {
  async get<K extends keyof ExtensionStorage>(
    key: K
  ): Promise<ExtensionStorage[K] | undefined> {
    const result = await chrome.storage.sync.get(key);
    return result[key];
  },
  
  async set<K extends keyof ExtensionStorage>(
    key: K, 
    value: ExtensionStorage[K]
  ): Promise<void> {
    await chrome.storage.sync.set({ [key]: value });
  },
};
```

---

## Security Considerations

### Permissions Justification

| Permission | Why Needed | Risk Mitigation |
|------------|-----------|-----------------|
| `activeTab` | Read current page content | Only activates when user clicks extension |
| `cookies` | Read `sr_session` for auth | Limited to Search Room domain only |
| `storage` | Save user preferences | No sensitive data stored |
| `scripting` | Inject content script | Only extracts DOM, no modifications |

### Cookie Security

```typescript
// Only access cookies for the Search Room domain
const ALLOWED_COOKIE_DOMAINS = [
  'localhost',
  'search-room.example.com', // production domain
];

export async function getSessionCookie(): Promise<string | null> {
  for (const domain of ALLOWED_COOKIE_DOMAINS) {
    const cookie = await chrome.cookies.get({
      url: domain.includes('localhost') 
        ? `http://${domain}:3000` 
        : `https://${domain}`,
      name: 'sr_session',
    });
    if (cookie?.value) return cookie.value;
  }
  return null;
}
```

### Content Security Policy

```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### OpenAI API Key Handling

- User provides their own API key (stored in `chrome.storage.sync`)
- Key never sent to Search Room backend
- Option to use server-side parsing endpoint instead (see Backend Changes)

---

## Development Setup

### Prerequisites

- Node.js 18+
- Chrome browser
- OpenAI API key

### Installation

```bash
# Clone the extension repo
git clone https://github.com/your-org/search-room-extension.git
cd search-room-extension

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your OpenAI API key to .env

# Start development build with watch
npm run dev
```

### Loading in Chrome

1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` folder

### Development Commands

```bash
npm run dev       # Watch mode for development
npm run build     # Production build
npm run test      # Run tests
npm run lint      # Lint code
npm run typecheck # Type check
```

### Environment Variables

```bash
# .env.example
VITE_API_BASE_URL=http://localhost:3000/api
VITE_OPENAI_API_KEY=sk-... # For development only
```

---

## Deployment

### Chrome Web Store Submission

1. **Prepare assets:**
   - 128x128 icon (PNG)
   - 440x280 promotional tile
   - Screenshots (1280x800)

2. **Build production bundle:**
   ```bash
   npm run build
   cd dist && zip -r ../search-room-extension.zip .
   ```

3. **Submit to Chrome Web Store:**
   - Create developer account ($5 one-time fee)
   - Upload ZIP
   - Fill in listing details
   - Submit for review (1-3 days)

### Privacy Policy Requirements

Chrome Web Store requires a privacy policy. Include:

- What data is collected (page content for parsing)
- How data is used (sent to OpenAI for parsing, to Search Room API for storage)
- No data sold to third parties
- Data retention policy

---

## Backend Changes Required

These changes need to be made to the main Search Room repository:

### 1. Expand ListingSource Type

```typescript
// src/lib/types/listing.ts

export type ListingSource = 
  | 'homegate' 
  | 'immoscout24'
  | 'anibis'
  | 'facebook'
  | 'ricardo'
  | 'comparis'
  | 'other';
```

### 2. Add CORS Headers for Extension

```typescript
// next.config.ts

const nextConfig: NextConfig = {
  // ... existing config
  
  async headers() {
    return [
      {
        // Allow requests from Chrome extension
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'chrome-extension://YOUR_EXTENSION_ID',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Cookie',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};
```

### 3. (Optional) Server-Side Parsing Endpoint

If you want to avoid users needing their own OpenAI key:

```typescript
// src/app/api/rooms/[roomId]/listings/parse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isUserMemberOfRoom } from '@/lib/db/rooms';
import { parseListingWithAI } from '@/lib/ai/listing-parser';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { roomId } = await params;
  const isMember = await isUserMemberOfRoom(roomId, user.id);
  if (!isMember) {
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  }

  const { content, url } = await request.json();
  
  try {
    const parsed = await parseListingWithAI(content, url);
    return NextResponse.json({ listing: parsed });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse listing' },
      { status: 500 }
    );
  }
}
```

---

## Error Handling

### Error States

| Error | User Message | Recovery Action |
|-------|--------------|-----------------|
| Not logged in | "Please log in to Search Room first" | Link to login page |
| No rooms | "Create a room in Search Room first" | Link to create room |
| Parse failed | "Couldn't extract listing data" | Show manual entry form |
| Duplicate | "This listing is already saved" | Show link to existing |
| Network error | "Connection failed. Try again?" | Retry button |
| API error | "Something went wrong" | Show error details |

### Manual Entry Fallback

```typescript
// src/popup/components/ManualEntryForm.tsx

export function ManualEntryForm({ 
  initialData, 
  onSubmit 
}: { 
  initialData?: Partial<ParsedListing>;
  onSubmit: (data: ParsedListing) => void;
}) {
  // Form with fields for title, location, price, etc.
  // Pre-populated with whatever AI was able to extract
}
```

---

## Future Enhancements

1. **Bulk import** - Import multiple listings from search results page
2. **Quick actions** - Right-click context menu to save listings
3. **Notifications** - Alert when listings match saved searches
4. **Offline queue** - Queue listings when offline, sync when online
5. **Multi-browser** - Firefox and Edge versions

---

## Appendix: Supported Platforms

| Platform | URL Pattern | Notes |
|----------|-------------|-------|
| Homegate | `homegate.ch/*/[id]` | Most common in CH |
| Immoscout24 | `immoscout24.ch/*/[id]` | Same company as Homegate |
| Anibis | `anibis.ch/*/[id]` | General classifieds |
| Facebook | `facebook.com/marketplace/*` | Requires login |
| Ricardo | `ricardo.ch/*/[id]` | Auction-style |
| Comparis | `comparis.ch/immobilien/*` | Aggregator |
| Any other | `*` | AI will attempt parsing |


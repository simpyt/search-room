# Search Room

Collaborative property search POC with AI Co-pilot. Two users (Pierre & Marie) can search for properties together, set criteria, compare compatibility, and manage a shared favorites list.

## Features

- **Two-user authentication** (Pierre & Marie)
- **Collaborative search criteria** with weights (1-5 stars)
- **AI Co-pilot** for natural language criteria, compatibility scoring, and chat
- **Homegate API integration** (with mock data fallback)
- **Favorites management** with status workflow
- **Real-time activity feed** with polling
- **Theme switcher** (Default dark mode + Homegate brand theme)

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router + Turbopack) | 16.0.7 |
| Runtime | React | 19.1.0 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + Radix UI | latest |
| Database | AWS DynamoDB (single-table design) | SDK 3.943.0 |
| AI | OpenAI API | SDK 6.9.1 |
| Forms | react-hook-form + Zod | 7.68.0 / 4.1.13 |
| Icons | lucide-react | 0.555.0 |
| Date handling | date-fns | 4.1.0 |
| Notifications | sonner | 2.0.7 |

## AI Integration

The AI Co-pilot uses OpenAI's Chat Completions API with JSON mode for structured outputs:

- **Criteria generation**: Natural language → structured search criteria with weights
- **Compatibility scoring**: Analyzes both users' criteria and weights (0-100%)
- **Compromise suggestions**: Proposes middle-ground criteria when compatibility is low
- **Conversational chat**: General Q&A about the search

All AI calls use `response_format: { type: 'json_object' }` for reliable structured outputs.

## Getting Started

### Prerequisites

- Node.js 18+
- AWS account with DynamoDB access
- OpenAI API key

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/simpyt/search-room.git
   cd search-room
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment variables:

   ```bash
   cp .env.example .env.local
   ```

4. Configure `.env.local`:

   ```
   AWS_REGION=eu-central-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   DYNAMODB_TABLE_NAME=search-room
   OPENAI_API_KEY=sk-your-key
   HOMEGATE_API_URL=https://apitest.homegate.ch/search
   HOMEGATE_API_KEY=your_homegate_key
   NEXT_PUBLIC_THEME=default  # or "homegate" for brand theme
   ```

5. Create the DynamoDB table:

   ```bash
   npm run db:create
   ```

   This creates a table with:
   - Partition Key: `PK` (String)
   - Sort Key: `SK` (String)
   - Billing Mode: Pay-per-request (on-demand)

6. Run the development server (with Turbopack):

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- Pierre: `pierre@example.com` / `pierre123`
- Marie: `marie@example.com` / `marie123`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build with Turbopack |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:create` | Create DynamoDB table |
| `npm run db:delete` | Delete DynamoDB table |
| `npm run db:test` | Test DB connection |
| `npm run db:seed` | Seed mock data |
| `npm run db:clean` | Clean mock data |

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes
│   │   ├── auth/       # Login, logout, session
│   │   └── rooms/      # Room CRUD, criteria, search, chat
│   ├── login/          # Login page
│   └── rooms/          # Room pages (Together/My view tabs)
├── components/
│   ├── chat/           # Activity feed & items
│   ├── compatibility/  # Compatibility card
│   ├── criteria/       # Criteria form, diff, weight selector
│   ├── listings/       # Results grid, favorites table
│   ├── ui/             # shadcn components
│   └── views/          # MyView & TogetherView
├── lib/
│   ├── ai/             # OpenAI integration
│   ├── db/             # DynamoDB data layer (single-table)
│   ├── homegate/       # Homegate API client
│   ├── types/          # TypeScript type definitions
│   └── theme.ts        # Theme configuration
└── proxy.ts            # API proxy utilities
```

## Theming

Two themes available via `NEXT_PUBLIC_THEME`:

- **`default`**: Dark mode with neutral palette
- **`homegate`**: Homegate brand colors (magenta primary)

Theme CSS variables are defined in `src/app/globals.css`.

## License

MIT

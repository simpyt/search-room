# Search Room

Collaborative property search POC with AI Co-pilot. Two users (Pierre & Marie) can search for properties together, set criteria, compare compatibility, and manage a shared favorites list.

## Features

- **Two-user authentication** (Pierre & Marie)
- **Collaborative search criteria** with weights (1-5 stars)
- **AI Co-pilot** for natural language criteria, compatibility scoring, and chat
- **Homegate API integration** (with mock data fallback)
- **Favorites management** with status workflow
- **Real-time activity feed** with polling

## Tech Stack

- Next.js 15.5 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- AWS DynamoDB (single-table design)
- OpenAI GPT-4o-mini

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
   HOMEGATE_API_URL=https://api.homegate.ch
   HOMEGATE_API_KEY=your_homegate_key
   ```

5. Create the DynamoDB table:
   ```bash
   npm run db:create
   ```
   
   This creates a table with:
   - Partition Key: `PK` (String)
   - Sort Key: `SK` (String)
   - Billing Mode: Pay-per-request (on-demand)

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

- Pierre: `pierre@example.com` / `pierre123`
- Marie: `marie@example.com` / `marie123`

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes
│   ├── login/          # Login page
│   └── rooms/          # Room pages
├── components/
│   ├── chat/           # Activity feed components
│   ├── compatibility/  # Compatibility card
│   ├── criteria/       # Criteria form & diff
│   ├── listings/       # Results & favorites
│   └── ui/             # shadcn components
└── lib/
    ├── ai/             # OpenAI integration
    ├── db/             # DynamoDB data layer
    ├── homegate/       # Homegate API client
    └── types/          # TypeScript types
```

## License

MIT

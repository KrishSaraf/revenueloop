# RevenueLoop

RevenueLoop is a demo-ready hackathon product: an autonomous AI digital agency that discovers local Singapore businesses with weak web presence, generates a website preview, prepares a sales strategy, requests human approval, simulates an AI sales call, creates a checkout link and tracks revenue, cost and profit.

The core message:

> An AI agent that finds its own customers, creates its own product and generates its own revenue.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.

The app works without API keys. It starts in mock mode, uses fictional Singapore businesses and stores demo data in browser localStorage so refreshes preserve the completed loop.

## Demo Flow

1. Open `/dashboard`.
2. Click **Start Revenue Loop**.
3. Watch the command centre scan prospects, score a lead, generate a website, request approval, stream a simulated call transcript, create checkout, receive payment and fund the next cycle.
4. Open `/prospects` to inspect discovery controls and lead cards.
5. Open any `/prospects/[id]` workspace to generate/edit/publish a demo site and approve a simulated call.
6. Open `/sales-agent` to review the call strategy, approval state, transcript and outcome.
7. Open a generated `/sites/[slug]` page to see the responsive preview site.

## Architecture

RevenueLoop is built with:

- Next.js App Router, TypeScript and Tailwind CSS
- Framer Motion for state changes and metric animation
- Zod validation for API input and environment parsing
- Provider interfaces for business search, research, content, website generation, voice and payments
- Mock providers that keep the full product demonstrable without external keys
- Live provider scaffolds for Google Places, OpenAI, ElevenLabs and Stripe
- Supabase/PostgreSQL migration and seed files under `supabase/`
- Vitest tests for scoring, state transitions, approval gates, providers, Stripe webhook validation, revenue math and slug handling

Important modules:

- `src/lib/types.ts`: domain model
- `src/lib/agent/state-machine.ts`: explicit workflow transitions
- `src/lib/providers/*`: mock and live adapter seams
- `src/lib/store/revenue-loop-context.tsx`: local durable demo runner
- `src/lib/scoring.ts`: opportunity scoring
- `src/lib/revenue.ts`: revenue, cost, profit and conversion metrics
- `src/app/api/*`: server-side validation and integration scaffolds

## State Machine

The main workflow is:

```text
DISCOVERING -> RESEARCHING -> SCORING -> GENERATING_SITE -> PREPARING_PITCH -> AWAITING_APPROVAL -> CALLING -> FOLLOWING_UP -> PAYMENT_PENDING -> WON
```

Additional terminal or control states:

```text
FAILED, PAUSED, REJECTED, DO_NOT_CONTACT
```

Every visible transition is logged as an agent event with timestamp, input summary, output summary, estimated cost and retry status.

## Compliance Gates

- Mock mode never contacts real businesses.
- No real call is placed without explicit human approval.
- The AI caller identifies itself in the simulated script.
- Do Not Contact immediately blocks outbound actions.
- Calling hours are configurable in settings.
- Generated websites mark missing or unverifiable information as placeholders.
- Stripe integration never stores raw card data.

## Live Provider Configuration

Copy `.env.example` to `.env.local` and fill the keys you want to connect:

```bash
cp .env.example .env.local
```

The app remains in mock mode unless `NEXT_PUBLIC_DEMO_MODE=false` and all required live provider keys are present:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_AGENT_ID`
- `STRIPE_SECRET_KEY`

The live adapters are intentionally scaffolded behind interfaces so each provider can be implemented independently.

### Real Prospect Finder Agent

The first real agent is implemented. If `GOOGLE_PLACES_API_KEY` is present, `/api/prospects/discover` uses Google Places instead of seeded mock prospects.

If no Google key is present, the app now uses **OpenStreetMap Overpass** as the fully free real provider. No API key and no billing account are required.

Free provider behavior:

- Searches OpenStreetMap business tags in Singapore
- Works without `.env.local`
- Returns real OSM-listed businesses
- Checks OSM website/contact tags
- Runs the same no-website/weak-website homepage probe
- Does not invent ratings or review counts, because OSM does not provide them

Recommended no-key trial:

```bash
npm run dev
```

Open `/prospects`, choose:

```text
Category: Salon
Location: Singapore
Max prospects: 10
Website status: Either
```

The provider badge should show **OpenStreetMap Overpass**.

Overpass is free but public infrastructure. Keep testing light and do not run aggressive loops. The app rate-limits discovery requests and uses only a Singapore category query.

```bash
GOOGLE_PLACES_API_KEY=your_key_here
```

Then run:

```bash
npm run dev
```

Open `/prospects`, choose a category and location, then click **Start discovery**.

What the real Prospect Finder does:

- Runs a Google Places Text Search for the chosen category and location
- Fetches Place Details for candidates
- Reads official website URLs returned by Google Places
- Checks only the homepage URL, without crawling the site
- Classifies businesses as `no_website`, `weak_website` or `healthy_website`
- Scores leads using rating, review count, contact availability, website gap and category fit
- Stores evidence in each prospect workspace

First trial target:

```text
Category: Salon
Location: Singapore
Max prospects: 10
Minimum rating: 4.2
Website status: Either
```

Pass criteria:

- At least 3 real prospects returned
- Every returned lead has clear evidence for no/weak website status
- No generated website or call is triggered automatically
- The operator can inspect the prospect before moving to agent 2

## Database

Supabase migration:

```bash
supabase db push
```

Seed:

```bash
supabase db reset
```

Tables include prospects, research, opportunity scores, generated websites, sales strategies, calls, transcripts, offers, payments, agent runs, agent events, operating costs, user settings and Do Not Contact entries.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Hackathon Pitch

RevenueLoop is not just an AI dashboard. It is an autonomous revenue loop:

- Finds a customer
- Builds the product
- Prepares the sale
- Requests approval
- Runs the conversation
- Creates payment
- Tracks profit
- Reinvests into the next cycle

That is the difference between an agent that completes tasks and an agent that can operate like a tiny AI business.

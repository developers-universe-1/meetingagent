# MeetingAgent

![Next.js](https://img.shields.io/badge/Next.js_15-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

An AI-powered sales observability platform that reads every call, updates the pipeline, drafts follow-ups, and coaches reps — automatically.

**Demo mode works without API keys.** Clone, `npm install`, `npm run dev`, and explore the full dashboard instantly.

## Why This Exists

Sales teams lose hours every week to manual work: listening to recordings, writing follow-ups, updating CRM stages, and coaching from memory. MeetingAgent automates the full post-call workflow with an AI-native pipeline that integrates with the tools teams already use.

## Integrations

No rip-and-replace. Connect what you already use:

| Category | Tools |
|---|---|
| Call Recorders | **Gong**, **Fathom**, **Fireflies**, **Otter** |
| CRM | **Salesforce**, **HubSpot** |
| Mailbox | **Gmail** (OAuth), **Outlook** (OAuth) |
| Calendar | **Google Calendar**, **Outlook Calendar** |
| Notifications | **Slack** (webhooks + bot) |
| LLM | **OpenAI GPT-4o / Claude 3.5 Sonnet** |

## Six Capabilities

### 1. Call Intelligence
Every recording analyzed for sentiment, stage inference, next-step extraction, and objection classification. 16-bucket objection classifier with automatic clustering.

### 2. Auto Pipeline
Deal stages move when the call says they should. Kanban with drag-to-pin overrides, full call timeline on every card, and per-rep pipeline views.

### 3. AI Follow-ups
Drafted post-call from actual conversation content. Sent from the rep's real mailbox. Sequence pauses automatically on reply. Anti-fabrication rules — no fake names, no invented promises.

### 4. Pre-Call Briefs
Reads the calendar every morning. For every meeting with a prior call, surfaces: last call summary, open commitments, recurring objections, and the winning pattern from a similar closed deal.

### 5. Rep Coaching
Per-position scorecards with talk-time ratios, objection-resolution rates, and the moves that correlate with closed-won. Side-by-side comparisons let managers coach the specific gap, not the average.

### 6. Industry Benchmarks
Your funnel plotted against comparable orgs across 28 industry segments. Know whether 38% is actually good.

## Architecture

```
src/
├── app/
│   ├── api/analyze/        # REST + SSE streaming endpoints
│   ├── dashboard/          # 9 interactive dashboard views
│   └── page.tsx            # Landing page
├── components/             # Reusable UI components
├── lib/
│   ├── agent/
│   │   └── analyzer.ts     # Pipeline analysis engine with async generators
│   ├── demo/               # Rich mock data for zero-config demo mode
│   ├── integrations/       # Production-ready CRM API clients
│   │   ├── salesforce.ts   # OAuth2 + SOQL client with backoff
│   │   ├── hubspot.ts      # Private app token + Search API client
│   │   ├── slack.ts        # Webhook + Block Kit formatting
│   │   ├── gong.ts         # Call data + transcript + stats client
│   │   └── index.ts        # Integration registry pattern
│   ├── cache.ts            # In-memory TTL cache with expiration logic
│   ├── logger.ts           # Structured namespace-based logging
│   └── errors.ts           # Typed error hierarchy
```

### Pipeline Flow

```
Gong / Fathom / Fireflies / Otter
              ↓
       Webhook Ingest
              ↓
      GPT-4o / Claude 3.5 Sonnet + Zod Analysis
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
Salesforce  Gmail     Coaching
HubSpot     Outlook   Scorecard
    ↓         ↓         ↓
 Pipeline  Follow-up  Benchmark
  Kanban    Sequence    Radar
```

### Engineering Decisions

- **Structured LLM output** with Zod schemas — eliminates free-form JSON parsing and prompt-injection vulnerabilities
- **Server-Sent Events (SSE)** streaming — UI receives live progress during multi-stage analysis
- **In-memory TTL cache** with typed error hierarchy — production-ready resilience patterns
- **Zero-config demo mode** — entire dashboard works without API keys, making it instantly demoable
- **Production CRM integrations** — type-safe Salesforce (OAuth2 refresh flow, SOQL), HubSpot (private app tokens, Search API), Gong (pagination), and Slack (Block Kit) clients with Zod validation, rate-limit handling, and typed error hierarchies
- **Multi-stage Dockerfile** — optimized production build with standalone output
- **GitHub Actions CI** — lint, typecheck, and test with coverage on every push

## Tech Stack

- **Framework:** Next.js 15 App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Charts:** Recharts (line, bar, radar charts)
- **Animation:** Framer Motion
- **Validation:** Zod (structured LLM output parsing)
- **LLM:** OpenAI GPT-4o / Claude 3.5 Sonnet via streaming completions
- **Database:** PostgreSQL via Prisma ORM
- **Testing:** Jest + ts-jest
- **CI/CD:** GitHub Actions (lint, typecheck, test with coverage)
- **Deployment:** Multi-stage Docker build

## Dashboard Views

| View | What It Shows |
|---|---|
| **Overview** | Pipeline value, calls analyzed, win rate, deals closed, top performer |
| **Call Intelligence** | Expandable call cards with transcripts, sentiment, objections, talk ratios |
| **Pipeline** | Kanban board across 7 stages with deal value, probability, and stall warnings |
| **Follow-ups** | AI-drafted emails with copy-to-clipboard, sent/replied/paused status |
| **Pre-Call Briefs** | Last call summary, open commitments, recurring objections, winning patterns |
| **Coaching** | Per-rep scorecards with weekly trend lines, team comparison bar charts |
| **Benchmarks** | 8 industry segments with win rate/show rate comparison and radar chart |
| **Loss Autopsy** | Objection clustering behind stalled deals with suggested counter-moves |
| **Integrations** | Connected status for Gong, Salesforce, HubSpot, Gmail, Slack with sync health |

## Quick Start

```bash
# Clone and install
npm install

# Zero-config demo mode — works without any API keys
cp .env.example .env
npm run dev
```

Open `http://localhost:3000` and click **Open Dashboard**.

## Demo Mode

The app ships with rich mock data so it works instantly without configuration:

- **6 analyzed calls** with full transcripts, sentiment labels, and objection classifications
- **10 deals** across 7 pipeline stages ($2.3M total pipeline)
- **4 rep scorecards** with weekly trend charts and coaching gaps
- **4 AI-drafted follow-ups** with realistic email copy
- **2 pre-call briefs** with open commitments and winning patterns
- **8 industry benchmarks** for segment comparison

## Testing

```bash
npm test
```

Covers cache expiration, analysis engine streaming, error hierarchy, and loss autopsy clustering.

## Deployment

```bash
docker build -t meetingagent .
docker run -p 3000:3000 meetingagent
```

## License

MIT

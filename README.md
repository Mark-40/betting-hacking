# HackVote — Live Hackathon Voting

A Polymarket-inspired, dark-mode, real-time voting arena for hackathons. Three teams, three categories, live leaderboards, animated counters, and a simple admin panel — built on Next.js App Router with JSON file storage so you can spin it up in 60 seconds.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Framer%20Motion](https://img.shields.io/badge/Framer%20Motion-11-ff0055)

---

## Features

- **3 voting categories** — Most Innovative, Most Organized, Best Pitch
- **3 fixed teams** with names, taglines, and members
- **One vote per category per device** (enforced via `localStorage` and server-side state)
- **Vote for the same team across multiple categories** (allowed by design)
- **Voting window** is gated by the admin: opens/closes/resets from `/admin`
- **Live leaderboards** with animated counter transitions and rank re-ordering
- **Polymarket-style dark UI** — neon gradients, glow, subtle grid, smooth Framer Motion
- **Mobile responsive** down to ~360px wide
- **No auth, no DB** — JSON file persistence + in-memory fallback for serverless

---

## Project Structure

```
betting/
├── app/
│   ├── layout.tsx                # Root layout, metadata, dark mode
│   ├── page.tsx                  # Voting page (tabs, team cards, leaderboards)
│   ├── globals.css               # Tailwind base + grid/gradient backdrop
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard (open/close/reset/live)
│   └── api/
│       ├── vote/route.ts         # POST: cast a vote
│       ├── results/route.ts      # GET:  current state (polled by clients)
│       └── admin/
│           ├── toggle/route.ts   # POST: open/close voting
│           └── reset/route.ts    # POST: reset all counts
├── components/
│   ├── Header.tsx                # Sticky header + live status badge
│   ├── StatusBadge.tsx           # "Voting Live" pulse pill
│   ├── CategoryTabs.tsx          # Animated category selector
│   ├── TeamCard.tsx              # Team + vote button + animated count
│   ├── Leaderboard.tsx           # Per-category ranked standings
│   ├── AnimatedCounter.tsx       # Framer Motion counter that tweens to value
│   ├── Toast.tsx                 # Bottom-right notifications
│   └── hooks.ts                  # useResultsPolling, useLocalVotes, useToasts
├── lib/
│   ├── types.ts                  # Shared TS types
│   ├── teams.ts                  # Sample teams + category metadata
│   └── storage.ts                # JSON file storage utility
├── data/
│   └── votes.json                # Vote state (auto-created if missing)
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install

```bash
npm install
# or
pnpm install
# or
yarn
```

### 2. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Open the admin panel

Go to [http://localhost:3000/admin](http://localhost:3000/admin) and click **Open Voting**. The voter view will instantly switch to "Voting Live" and votes can be cast.

> 💡 The admin panel is intentionally unauthenticated for hackathon use. Don't expose it on the open internet without adding a check (see "Hardening" below).

### 4. Cast votes

On `/`, choose a category, pick a team, click **Cast Vote**. Counts and leaderboards animate in real time. One vote per category per browser is enforced via `localStorage`.

---

## How It Works

### Storage

`lib/storage.ts` reads/writes `data/votes.json` on disk and keeps an in-memory mirror. The in-memory mirror is the source of truth for the lifetime of the server process — on Vercel (read-only FS), disk writes silently fail and the in-memory store still works for the duration of a warm function instance.

State shape:

```ts
{
  isOpen: boolean,
  votes: {
    innovative: { "team-nova": 4, "team-quantum": 7, "team-orbit": 2 },
    organized:  { ... },
    pitch:      { ... }
  },
  totalVotes: 13,
  updatedAt: "2026-05-22T18:04:23.001Z"
}
```

### API Routes

| Method | Path                  | Purpose                                |
|--------|-----------------------|----------------------------------------|
| GET    | `/api/results`        | Full state for polling                  |
| POST   | `/api/vote`           | `{ categoryId, teamId }` — increments  |
| POST   | `/api/admin/toggle`   | `{ isOpen: true \| false }` (or empty to flip) |
| POST   | `/api/admin/reset`    | Zeroes all counts                       |

### Real-time updates

Clients poll `/api/results` every **2s** (voter) and **1.5s** (admin). The poll is paused when the tab is hidden and re-fires immediately on focus. No WebSocket dependency — perfect for the hackathon timeframe.

### Vote enforcement

- **Client-side:** `useLocalVotes()` stores `{ innovative, organized, pitch } → teamId | null` in `localStorage` under `hackvote.votes.v1`. The UI disables vote buttons in any category the user has already voted in.
- **Server-side:** the `/api/vote` route refuses requests when `isOpen === false`. There is no per-user server enforcement (no auth) — combine with the localStorage gate for typical hackathon-room scenarios.

---

## Customize

### Teams

Edit `lib/teams.ts`:

```ts
export const TEAMS: Team[] = [
  {
    id: "team-nova",
    name: "Team Nova",
    tagline: "Bending pixels into product.",
    emoji: "🌌",
    members: [
      { name: "Ava Chen", role: "Product / Frontend" },
      ...
    ],
  },
  // ...
];
```

The 3 IDs that already exist (`team-nova`, `team-quantum`, `team-orbit`) match the keys in `data/votes.json`. If you rename IDs, also wipe `data/votes.json` (or just hit Reset in the admin panel after restart — `storage.ts` self-heals missing keys).

### Categories

Edit `lib/teams.ts → CATEGORIES`. If you change the `id`s, update `types.ts → CategoryId` to match.

### Styling

- Color palette and shadows live in `tailwind.config.ts`
- Backdrop gradients + grid overlay in `app/globals.css`

---

## Deploying to Vercel

1. Push to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset auto-detects **Next.js**. No env vars required.
4. Deploy.

### About JSON persistence on Vercel

Vercel's serverless filesystem is **read-only** at runtime, and each invocation may land on a different cold function — so `data/votes.json` is **not** durable across restarts in production. `storage.ts` is built to handle that gracefully:

- On boot it reads the seeded `data/votes.json` (your starting state).
- All mutations are kept in an **in-memory store** that survives for the life of a warm function instance.
- File writes are attempted but failures are swallowed.

**Recommendation for a real event:** run on a single long-lived host (one Vercel function will typically stay warm during a 60-min voting window), or swap `storage.ts` for Upstash Redis / Vercel KV — the interface (`readState` / `updateState` / `resetVotes`) is the only thing the rest of the app touches.

### One-host alternative

If you want guaranteed persistence with this exact code:

```bash
npm run build
npm run start
```

…on any node host (Railway, Fly, Render, a VPS). Disk writes will succeed and `data/votes.json` will persist across restarts.

---

## Hardening (optional)

The admin panel is wide open by default. Easiest lock-down:

1. Add `ADMIN_TOKEN=...` to your env.
2. Wrap `/api/admin/*` routes:

   ```ts
   if (req.headers.get("x-admin-token") !== process.env.ADMIN_TOKEN) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

3. Have the admin page read the token from a prompt + send it via header.

For a hackathon room demo, none of that is needed.

---

## Scripts

| Command         | Purpose                       |
|-----------------|-------------------------------|
| `npm run dev`   | Start the dev server          |
| `npm run build` | Production build              |
| `npm run start` | Serve the production build    |
| `npm run lint`  | Next.js lint                  |

---

## License

MIT — do whatever you want, just don't blame us if your hackathon ends in a controversial leaderboard finish. 🏆

# Obi — Personal Finance Dashboard

A modern, full-featured personal finance web application built with Next.js 14. Manage accounts, transfer funds, withdraw cash, and track transactions — all within a secure, responsive interface.

---

## Features

- **Multi-account dashboard** — view balances across all linked accounts in real time
- **Payment transfers** — local and international wire transfers with OTP verification
- **Withdrawals** — multi-step withdrawal flow with fee calculation and OTP confirmation
- **Transaction history** — filterable log of all account activity
- **Secure banner** — persistent security notice reminding users no official rep will request sensitive data
- **Responsive layout** — mobile sidebar with overlay backdrop, collapsible navigation
- **Demo mode** — fully functional without a backend; state persisted via localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Fonts | Inter + IBM Plex Serif (Google Fonts) |
| State | React `useState` / `useEffect` |
| Persistence | localStorage (via `getStoredAccounts` / `setStoredAccounts`) |

---

## Project Structure

```
app/
├── (root)/
│   ├── layout.tsx              # Root layout — sidebar, header, security banner
│   ├── page.tsx                # Dashboard home
│   ├── withdraw/
│   │   └── page.tsx            # Withdrawal flow (4-step)
│   ├── payment-transfer/
│   │   └── page.tsx            # Transfer flow (6-step)
│   └── transaction-history/
│       └── page.tsx            # Transaction log
├── globals.css
components/
├── ui/
│   ├── Sidebar.tsx
│   └── Header.tsx
└── shared/
    ├── Stepper.tsx             # Reusable step progress indicator
    ├── ActionButton.tsx        # Primary CTA button
    ├── BackButton.tsx          # Back / edit navigation button
    └── SummaryRow.tsx          # Label/value row used in review steps
lib/
└── utils.ts                    # formatAmount, getStoredAccounts, setStoredAccounts, etc.
types/
└── index.ts                    # Account, Transaction interfaces
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-username/obi.git
cd obi
npm install
```

---

## Launching the App

### Development (local)

```bash
npm run dev
```

Runs at `http://localhost:3000` with hot reload. Use this during development.

### Production (local)

```bash
npm run build
npm start
```

Builds an optimised bundle then serves it. Always test this before deploying.

---

## Deployment

### Vercel (recommended)

The fastest option — Vercel is purpose-built for Next.js.

**Option A — CLI:**
```bash
npm i -g vercel
vercel
```

**Option B — GitHub import:**
1. Push your repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo — Vercel auto-detects Next.js and deploys in ~1 minute

Free tier is generous and includes preview deployments on every push.

---

### Other Platforms

| Platform | Steps |
|---|---|
| Netlify | Connect GitHub repo → build command `npm run build`, publish dir `.next` |
| Railway | `npm i -g @railway/cli` then `railway up` |
| Docker | See below |

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t obi .
docker run -p 3000:3000 obi
```

---

## Troubleshooting

```bash
# Missing dependencies
npm install

# Port already in use
npm run dev -- -p 3001

# Clear Next.js cache
rm -rf .next && npm run dev
```

---

## Key Flows

### Withdrawal (`/withdraw`)

1. **Account** — select source account
2. **Amount** — enter amount (validated against balance + max limit of $50,000)
3. **Review** — summary of amount, fee ($2.50), and total
4. **Verify** — OTP confirmation (demo code: `123456`)
5. **Success** — confirmation screen with link to transaction history

### Payment Transfer (`/payment-transfer`)

1. **From** — select source account
2. **To** — enter recipient details; choose local (Ghana) or international bank
3. **Amount** — enter amount; select transfer speed (instant $1.50 / standard free) or international wire ($15.00)
4. **Review** — full transfer summary
5. **Verify** — choose OTP delivery (SMS or email); enter code (demo code: `482916`)
6. **Success** — confirmation with transaction reference

---

## Shared Components

### `<Stepper steps currentStep color />`

Renders a horizontal step progress bar. Accepts an array of `{ id, label }` step objects, the current active step id, and an accent color hex.

### `<ActionButton onClick disabled label />`

Primary branded button (yellow `#fff498` background). Used for all forward-navigation CTAs.

### `<BackButton onClick label? />`

Outlined secondary button for back/edit navigation. Label defaults to `"Back"`.

### `<SummaryRow label value highlight? />`

A single label/value row for review screens. Set `highlight` to `true` for the total row (renders with accent border).

---

## Security Notice

A persistent banner is rendered at the top of every page:

> **Secured** — No official representative will ever request your password, PIN, OTP, or card details.

This is a UI/demo safeguard. In production, pair this with proper auth (e.g. NextAuth, Clerk) and server-side validation.

---

## Demo Credentials

| Field | Value |
|---|---|
| Withdrawal OTP | `123456` |
| Transfer OTP | `482916` |

All account data is seeded into `localStorage` on first load and persists across sessions.

---

## Customisation

- **Banks** — edit `LOCAL_BANKS` and `INTERNATIONAL_BANKS` arrays in `payment-transfer/page.tsx`
- **Fees** — adjust `TRANSFER_FEE`, `INTL_FEE`, and `WITHDRAWAL_FEES` constants
- **Brand color** — the accent yellow (`#e6dc00` / `#fff498`) is applied inline via `style` props and Tailwind `yellow-*` classes
- **Fraud line number** — update the number in the security banner inside `app/(root)/layout.tsx`

---

## License

MIT License

Copyright (c) 2026 Expendable Codes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
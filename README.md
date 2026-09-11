# NOXXY — Enterprise Temporary Email Platform

## Overview
NOXXY adalah platform temporary email enterprise-grade dengan real-time delivery berbasis Cloudflare Email Worker, Vercel Serverless Functions, dan MongoDB Atlas.

## Architecture
```
Internet → Cloudflare Email Routing → Cloudflare Email Worker
→ Vercel API (/api/inbound-email) → MongoDB Atlas
→ Server-Sent Events (SSE) → Browser Inbox (real-time)
```

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JS (dark glassmorphism design)
- **Backend**: Node.js 22, Vercel Serverless Functions
- **Database**: MongoDB Atlas (Mongoose)
- **Real-time**: Server-Sent Events (SSE)
- **Email parsing**: mailparser
- **Email routing**: Cloudflare Email Worker → noxxyrorr.biz.id

## Folder Structure
```
/
├── api/
│   ├── inbound-email.js     ← Cloudflare Worker sends here
│   ├── inbox/index.js       ← Create & get inbox
│   ├── emails/[id].js       ← Get & delete email
│   ├── stream.js            ← SSE real-time stream
│   ├── domains.js           ← List active domains
│   └── admin/dashboard.js   ← Admin stats
├── lib/
│   ├── mongodb.js           ← DB connection (cached)
│   ├── mailparser.js        ← Raw email parser
│   ├── sseManager.js        ← SSE client registry
│   ├── utils.js             ← Helpers
│   └── models/
│       ├── Inbox.js
│       ├── Email.js
│       ├── Domain.js
│       └── Log.js
├── public/                  ← Static frontend
│   ├── index.html
│   ├── css/app.css
│   └── js/app.js
├── config.js                ← Central config (no .env)
├── server.js                ← Local dev server
└── vercel.json              ← Vercel deployment config
```

## Configuration (config.js)
All config is centralized in `config.js`. No .env files.
- **mongodb.uri** — MongoDB Atlas connection string
- **domains** — Array of active email domains
- **inbox.expirationHours** — Inbox TTL (default: 24h)
- **admin.username/password** — Admin panel credentials

## Cloudflare Worker
Deploy this worker to Cloudflare already set up at [https://noxxyrorr-worker.faymantap.workers.dev]:
```javascript
export default {
  async email(message, env, ctx) {
    const rawEmail = await new Response(message.raw).text();
    await fetch("https://YOUR_VERCEL_APP.vercel.app/api/inbound-email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Noxxy-Mail-Worker" },
      body: JSON.stringify({
        from: message.from, to: message.to,
        subject: message.headers.get("subject") || "",
        date: message.headers.get("date") || "",
        messageId: message.headers.get("message-id") || "",
        raw: rawEmail, receivedAt: new Date().toISOString()
      })
    });
  }
}
```
//

## Vercel Deployment
1. Push code to GitHub
2. Import repo to Vercel
3. Framework: Other
4. Build command: `npm install`
5. Output directory: `public`
6. After deploy, update Cloudflare Worker endpoint to your `.vercel.app` URL

## Admin Panel
- URL: `/api/admin/dashboard`
- Auth: HTTP Basic (username: `xxxx`, password: `xxxx`)

## User Preferences
- No emoji in UI
- Dark mode first
- Professional SaaS design (Linear/Stripe quality)
- No .env files — all config in config.js

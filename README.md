# Carenexa Diet

Next.js frontend for the Carenexa Diet module. It calls the existing backend under `/diet-app/*`.

## Setup

1. Create `.env.local` based on `.env.example`.
2. Install deps and run:

```bash
pnpm install
pnpm dev
```

## Environment

- `NEXT_PUBLIC_BACKEND_URL`: Base backend URL (example: `https://api.carenexa.life`).
- `NEXT_PUBLIC_MEDVISTA_API_KEY`: API key for `x-medvista-api-key` header.
- `MEDVISTA_API_KEY`: Server-only override if you want to keep the key off the client.

## Routes

- `/dashboard`
- `/diets`
- `/diets/new`
- `/diets/[id]`
- `/diets/[id]/edit`
- `/share/[token]`

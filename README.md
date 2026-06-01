AI Lead Qualifier Agent built with Next.js, TypeScript, Tailwind CSS, OpenAI-compatible chat, Supabase lead storage, CSV export, and optional email/WhatsApp notifications.

## Routes

- `/chat` - lead qualification experience
- `/dashboard` - saved leads dashboard
- `/api/chat` - spec-style chat endpoint
- `/api/evaluate` - final lead evaluation endpoint
- `/api/leads/export` - CSV export

## Environment

Use `/.env.local` for real values.

```bash
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EVAL_MODEL=gpt-4.1-mini

# Optional OpenRouter fallback
OPENROUTER_API_KEY=
APP_URL=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Optional notifications
RESEND_API_KEY=
SALES_TEAM_EMAIL=
SALES_FROM_EMAIL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
SALES_WHATSAPP_TO=
```

## Supabase Setup

Run [schema.sql](/C:/Users/Aneeb/Desktop/portfolio/ai-lead-qualifier/supabase/schema.sql) in the Supabase SQL editor.

The `leads` table stores:

- optional `name` and `email`
- conversation transcript JSON
- extracted business type, budget, timeline, and current status
- score, lead type, recommendation, and readiness for handoff
- summary and timestamps

## API Contract

### `POST /api/chat`

Request:

```json
{
  "message": "I need a website",
  "conversation_id": "123",
  "name": "Aneeb",
  "email": "aneeb@example.com"
}
```

Response:

```json
{
  "reply": "Great. What type of business do you run?",
  "conversation_id": "123",
  "conversation": [],
  "evaluation": {},
  "conversationComplete": false
}
```

### `POST /api/evaluate`

Request:

```json
{
  "conversation": []
}
```

Response:

```json
{
  "score": 8.5,
  "type": "Hot Lead",
  "summary": "Lead score: 8.5 / 10 ...",
  "recommendation": "Contact ASAP",
  "extracted": {},
  "evaluation": {}
}
```

## Features

- chat-based qualification flow
- live lead scoring panel
- saved leads dashboard
- CSV export
- optional email notification for sales
- optional WhatsApp notification for sales
- basic in-memory rate limiting and structured logging

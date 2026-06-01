AI Lead Qualifier Agent built with Next.js, TypeScript, Tailwind CSS, OpenAI-compatible chat, Supabase lead storage, CSV export, and optional email/WhatsApp notifications.

## Routes

- `/chat` - lead qualification experience
- `/dashboard` - saved leads dashboard
- `/api/chat` - spec-style chat endpoint
- `/api/evaluate` - final lead evaluation endpoint
- `/api/leads/export` - CSV export

## Environment

Create `/.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_CHAT_MODEL=gpt-4.1-mini
OPENAI_EVAL_MODEL=gpt-4.1-mini

# Optional OpenRouter fallback
OPENROUTER_API_KEY=your_openrouter_api_key
APP_URL=http://localhost:3000

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key

# Optional notifications
RESEND_API_KEY=your_resend_api_key
SALES_TEAM_EMAIL=sales@example.com
SALES_FROM_EMAIL=agent@example.com
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
SALES_WHATSAPP_TO=whatsapp:+15555555555
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

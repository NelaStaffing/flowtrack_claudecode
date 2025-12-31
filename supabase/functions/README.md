# Supabase Edge Functions

This directory contains Supabase Edge Functions for AI integration.

## Functions

### `ai-analyze`
Handles AI analysis requests using Claude API.

## Setup

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link your project:
```bash
supabase link --project-ref your-project-ref
```

3. Set secrets:
```bash
supabase secrets set CLAUDE_API_KEY=your-claude-api-key
```

4. Deploy functions:
```bash
supabase functions deploy ai-analyze
```

## Local Development

1. Start functions locally:
```bash
supabase functions serve
```

2. Test with:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-analyze' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"type":"analyze","data":{"name":"Test","brief":"Test project"}}'
```

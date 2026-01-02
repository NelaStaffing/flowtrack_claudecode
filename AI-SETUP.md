# AI Project Wizard - Setup Guide

## Current Status ✅

Your AI Project Wizard is **already working** with mock data! The wizard displays:

- ✅ **Step 3**: Core deliverables analysis
  - Student bio collection form
  - Automated data pipeline
  - Image processing workflow
  - Admin dashboard

- ✅ **Step 4**: Tech Stack Recommendations organized by category:
  - **Form Builder**: Tally (with alternatives: Typeform, Google Forms, JotForm)
  - **Automation**: Make.com (with alternatives: Zapier, n8n, Integromat)
  - **Image Processing**: Cloudinary (with alternatives: imgix, Uploadcare, ImageKit)
  - **Data Storage**: Airtable (with alternatives: Notion, Supabase, Firebase)

- ✅ **Step 5**: AI-Generated Project Plan with milestones and confidence scores
- ✅ **Step 6**: Potential Blockers with severity indicators

## To Enable REAL AI (Claude Integration)

### Prerequisites

You need:
1. **Supabase Project** credentials (from [app.supabase.com](https://app.supabase.com))
2. **Claude API Key** (from [console.anthropic.com](https://console.anthropic.com))

### Option 1: Automated Deployment (Recommended)

1. **Update `.env` file** with your credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-actual-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key
   VITE_CLAUDE_API_KEY=sk-ant-your-actual-key
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy-ai.sh
   ```

3. **Enable AI in .env**:
   ```bash
   VITE_USE_AI_EDGE_FUNCTION=true
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

### Option 2: Manual Deployment

1. **Install Supabase CLI** (if not using npx):
   ```bash
   # See: https://supabase.com/docs/guides/cli
   ```

2. **Login to Supabase**:
   ```bash
   npx supabase login
   ```

3. **Link your project**:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   *Get PROJECT_REF from your Supabase URL: `https://YOUR_PROJECT_REF.supabase.co`*

4. **Set Claude API key as secret**:
   ```bash
   npx supabase secrets set CLAUDE_API_KEY=sk-ant-your-key
   ```

5. **Deploy the Edge Function**:
   ```bash
   npx supabase functions deploy ai-analyze
   ```

6. **Enable in `.env`**:
   ```bash
   VITE_USE_AI_EDGE_FUNCTION=true
   ```

7. **Restart dev server**:
   ```bash
   npm run dev
   ```

## How It Works

### Mock Data Mode (Current)
- Uses pre-defined responses in `src/lib/ai.js`
- No API calls needed
- Perfect for development and testing
- Displays realistic data matching the screenshots

### Real AI Mode (After Deployment)
- Frontend calls Supabase Edge Function (`supabase/functions/ai-analyze/index.ts`)
- Edge Function authenticates user via Supabase Auth
- Edge Function calls Claude API server-side (no CORS issues)
- Claude analyzes project and returns structured JSON
- Frontend displays real AI-generated recommendations

## API Response Format

The Edge Function accepts 4 request types:

### 1. Analysis (`type: 'analyze'`)
```json
{
  "summary": "Project summary...",
  "deliverables": [
    { "title": "...", "description": "..." }
  ]
}
```

### 2. Tech Stack (`type: 'techStack'`)
```json
{
  "recommendations": [
    {
      "category": "Form Builder",
      "recommended": "Tally",
      "reason": "Multi-entry fields...",
      "alternatives": ["Typeform", "Google Forms"]
    }
  ]
}
```

### 3. Project Plan (`type: 'plan'`)
```json
{
  "milestones": [
    {
      "name": "Requirements Lock",
      "tasks": ["Task 1", "Task 2"],
      "confidence": 95,
      "daysFromStart": 7
    }
  ]
}
```

### 4. Blockers (`type: 'blockers'`)
```json
{
  "blockers": [
    {
      "title": "Blocker title",
      "description": "Why this needs attention",
      "severity": "high"
    }
  ]
}
```

## Troubleshooting

### Edge Function not deploying?
- Check you're logged into Supabase CLI: `npx supabase login`
- Verify project is linked: `npx supabase projects list`

### AI returning errors?
- Check Claude API key is valid and has credits
- Check Supabase Edge Function logs: `npx supabase functions logs ai-analyze`

### Still seeing mock data after enabling?
- Verify `.env` has `VITE_USE_AI_EDGE_FUNCTION=true`
- Restart dev server completely (`Ctrl+C` then `npm run dev`)
- Check browser console for errors

### Graceful Fallback
Even with real AI enabled, the system falls back to mock data if:
- Edge Function is unreachable
- Claude API returns an error
- Authentication fails

This ensures the wizard always works!

## Cost Considerations

- **Mock Data**: FREE (no API calls)
- **Real AI**: ~$0.003 per analysis (Claude Sonnet 3.5 pricing)
  - Each project wizard = 4 AI calls = ~$0.012
  - Very affordable for production use

## Next Steps

Currently using mock data, which is working perfectly. When you're ready for real AI:
1. Get your Supabase and Claude credentials
2. Run `./deploy-ai.sh`
3. Enable in `.env`
4. Enjoy AI-powered project analysis!

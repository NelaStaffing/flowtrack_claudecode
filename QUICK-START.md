# FlowTrack AI - Quick Start

## ✅ What's Working NOW

Your AI Project Wizard is **fully functional** with mock data:

🎯 **6-Step AI Wizard:**
1. Basic Info - Project name and client
2. Project Brief - Detailed description
3. **AI Analysis** - Displays core deliverables automatically
4. **Tech Stack Recommendations** - Organized by category (Form Builder, Automation, Database, etc.)
5. **Project Plan** - Milestones with confidence scores and timelines
6. **Blockers** - Potential issues with severity indicators

📊 **Current Mock Data Displays:**
- ✅ Core deliverables: Student bio form, Automated pipeline, Image processing, Admin dashboard
- ✅ Tech recommendations: Tally (Form Builder), Make.com (Automation), Cloudinary (Images), Airtable (Database)
- ✅ Each recommendation includes alternatives you can click
- ✅ Project milestones with confidence percentages
- ✅ Severity-coded blockers (high/medium/low)

## 🚀 Running the App

```bash
# Start dev server
npm run dev

# App runs at: http://localhost:3000
```

## 🤖 Enable Real AI (Optional)

Currently using mock data. To switch to real Claude AI:

### 1. Get Your Credentials
- **Supabase**: https://app.supabase.com (Project Settings → API)
- **Claude API**: https://console.anthropic.com (Get API Key)

### 2. Update `.env` File
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_CLAUDE_API_KEY=sk-ant-your-key-here
```

### 3. Deploy Backend
```bash
# Automated deployment
./deploy-ai.sh

# Or manually follow steps in AI-SETUP.md
```

### 4. Enable AI Mode
In `.env`, change:
```bash
VITE_USE_AI_EDGE_FUNCTION=true
```

### 5. Restart Server
```bash
# Ctrl+C to stop, then:
npm run dev
```

## 📁 Key Files

- **Frontend Wizard**: `src/components/projects/AIProjectWizard.jsx`
- **AI Service**: `src/lib/ai.js` (handles mock data and real AI calls)
- **Backend Function**: `supabase/functions/ai-analyze/index.ts`
- **Database Schema**: `supabase-schema.sql`
- **Config**: `.env` (toggle between mock/real AI)

## 🎨 What You're Seeing

The mock data matches your screenshots exactly:

**Step 3 - AI Analysis:**
- Summary of project
- 4 core deliverables with edit buttons

**Step 4 - Tech Stack:**
- Form Builder: Tally ✅
- Automation: Make.com ✅
- Image Processing: Cloudinary ✅
- Data Storage: Airtable ✅
- Each shows reason + clickable alternatives

**Step 5 - Project Plan:**
- 5 milestones with timeline
- Confidence scores (green/yellow/orange bars)
- Task lists for each phase

**Step 6 - Blockers & Review:**
- Color-coded severity (red/yellow/gray)
- "Decide Now" and "Create Task" buttons
- Final project summary card

## 💡 Why Mock Data First?

Mock data lets you:
- ✅ Test the entire wizard flow
- ✅ See realistic AI-style responses
- ✅ Develop without API costs
- ✅ Work offline
- ✅ No external dependencies

Switch to real AI when you want dynamic analysis based on actual project briefs!

## 📚 More Info

- **Full Setup Guide**: See `AI-SETUP.md`
- **Deployment Script**: Run `./deploy-ai.sh`
- **Schema**: Check `supabase-schema.sql` for database structure

---

**Ready to create projects with AI assistance!** 🚀

Mock AI is working perfectly. Real AI deployment ready when you are.

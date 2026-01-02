#!/bin/bash

echo "🚀 FlowTrack AI Backend Deployment"
echo "=================================="
echo ""

# Check if .env has real credentials
if grep -q "your-project.supabase.co" .env; then
    echo "❌ Please update .env with your actual Supabase credentials first!"
    echo ""
    echo "You need to set:"
    echo "  1. VITE_SUPABASE_URL (from https://app.supabase.com/project/YOUR_PROJECT/settings/api)"
    echo "  2. VITE_SUPABASE_ANON_KEY (from same page)"
    echo "  3. VITE_CLAUDE_API_KEY (from https://console.anthropic.com/)"
    echo ""
    exit 1
fi

echo "Step 1: Installing Supabase CLI (using npx)..."
echo ""

# Get project ref from Supabase URL
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://||' | sed 's|.supabase.co||')

echo "Step 2: Linking to Supabase project: $PROJECT_REF"
echo "You'll need to login with your Supabase credentials..."
npx supabase link --project-ref $PROJECT_REF

echo ""
echo "Step 3: Setting Claude API key as secret..."
CLAUDE_KEY=$(grep VITE_CLAUDE_API_KEY .env | cut -d '=' -f2)
npx supabase secrets set CLAUDE_API_KEY=$CLAUDE_KEY

echo ""
echo "Step 4: Deploying Edge Function..."
npx supabase functions deploy ai-analyze

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Final step: Update .env to enable AI"
echo "Change: VITE_USE_AI_EDGE_FUNCTION=false"
echo "To:     VITE_USE_AI_EDGE_FUNCTION=true"
echo ""
echo "Then restart your dev server: npm run dev"

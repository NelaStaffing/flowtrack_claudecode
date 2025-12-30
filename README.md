# FlowTrack - Project Management System

A comprehensive project management system built with React and Supabase.

## Features

- 📊 **Dashboard** - Overview of all projects, metrics, and activity
- 📁 **Project Management** - Full project lifecycle with 6-phase wizard
- ✅ **Task Tracking** - Detailed task management with time tracking
- ⚠️ **Blocker Management** - Track and resolve project blockers
- 📅 **Timeline View** - Visual project timelines and resource planning
- 👥 **Team Management** - User roles and permissions
- 📄 **Documentation** - Notion-like document editor for tasks
- 🤖 **AI Copilot** - AI-powered assistance for project insights

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd flowtrack
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Get your project URL and anon key from Project Settings > API

4. Create a `.env` file:
```bash
cp .env.example .env
```

5. Add your Supabase credentials to `.env`:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, TopBar, etc.)
│   ├── dashboard/       # Dashboard components
│   ├── projects/        # Project management components
│   ├── tasks/           # Task management components
│   ├── blockers/        # Blocker management components
│   ├── timeline/        # Timeline view components
│   ├── users/           # User management components
│   ├── documents/       # Document editor components
│   ├── activity/        # Activity feed components
│   └── shared/          # Reusable UI components
├── lib/                 # Library code (Supabase client, utilities)
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## Database Schema

The database schema includes tables for:
- Users (with roles and permissions)
- Projects
- Milestones
- Tasks
- Blockers
- Documents
- Activity logs
- Comments
- Attachments

See `supabase-schema.sql` for the complete schema.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow Tailwind CSS utility-first approach
- Keep components focused and reusable
- Use proper TypeScript types (when migrating to TS)

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

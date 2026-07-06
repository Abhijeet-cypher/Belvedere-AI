# Belvedere AI - AI Growth Advisor

Belvedere AI is a highly sophisticated, generative AI-powered business consultant web application. It is designed to learn about a business's goals, constraints, and resources, and then instantly generate a comprehensive, actionable growth roadmap spanning across multiple domains like Marketing, SEO, Public Relations, and Product Strategy.

## Key Features

1. **Intelligent Onboarding**: A dynamic, multi-step form that captures deep context about a business (industry, employee count, marketing budget, goals, and growth challenges).
2. **AI-Powered Roadmap Generation**: Utilizing advanced large language models (LLMs), Belvedere acts as a seasoned marketing consultant, producing structured JSON roadmaps. 
3. **Interactive Strategy Dashboard (Advisor Page)**: 
   - View an **Executive Summary** with automatically generated visual priority charts and KPIs.
   - Explore detailed, categorized action plans across 8+ growth categories (e.g., Marketing & Sales, Brand Positioning, SEO).
   - Each action plan is rated by **Priority** and **Impact**.
4. **Live Consultation Chat**: A real-time, streaming AI chat interface that retains the full context of the generated roadmap. Users can ask follow-up questions, request specific implementation steps, or dive deeper into any recommended strategy.
5. **PDF Export**: Generate and download a polished PDF report of the entire roadmap to share with stakeholders.
6. **Session History**: Instantly jump back into any past generated roadmaps via the "My Roadmaps" modal.
7. **Admin Control Panel**: A dedicated `/admin` portal to monitor usage metrics, view all generated sessions across users, and dynamically edit the AI System Prompts on the fly without changing code.

## Tech Stack

* **Frontend**: Next.js 14 (App Router), React, CSS Modules (Vanilla CSS with a premium glassmorphism aesthetic).
* **Backend**: Next.js API Routes.
* **Database**: Supabase (PostgreSQL) for storing user sessions, AI roadmaps, and chat histories.
* **AI Integration**: Google Generative AI (`gemini-2.5-flash`) utilizing both structured JSON generation and streaming chat generation.
* **Charts**: Chart.js / `react-chartjs-2` for data visualization.
* **PDF Generation**: `html2canvas` and `jspdf` for exporting reports.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

To run this project locally, you will need to set up the following environment variables in a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Architecture Notes

- The app uses a highly modular UI system with custom glassmorphism styling (`glass-card`, CSS variables) for a premium look and feel.
- AI interactions are heavily optimized to return strict JSON data using complex system prompting.
- The Admin dashboard allows dynamic prompt engineering, stored directly in Supabase and fetched during generation.

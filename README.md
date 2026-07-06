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

## Architecture Overview

Belvedere AI is built on a modern, decoupled serverless architecture to ensure high performance, security, and scalability:

- **Client-Side Rendering (CSR) & Server-Side Rendering (SSR)**: The application leverages Next.js App Router for optimal rendering strategies. The dynamic dashboard heavily utilizes React hooks (`useState`, `useEffect`) and Context for state management, while API routes run securely on the edge/server.
- **Data Persistence Layer**: Supabase acts as the primary data store. User sessions, generated JSON roadmaps, and chat message histories are stored in PostgreSQL tables. Supabase is accessed via its RESTful client SDK, ensuring data integrity and fast retrieval for historical sessions.
- **AI Orchestration**: The `/api/generate-roadmap` and `/api/chat` endpoints act as orchestration layers. They securely hold the `GEMINI_API_KEY` (preventing frontend leakage), construct complex system prompts (fetched dynamically from the Supabase `config` table), and handle the asynchronous communication with the Google Generative AI models.
- **Dynamic Prompt System**: Rather than hardcoding system instructions into the source code, the application fetches the core AI persona and instruction sets from the database at runtime. This allows administrators to tweak the AI's behavior via the `/admin` portal without requiring a full application rebuild or redeployment.

## Assumptions

- **Single Tenant / Open Access**: Currently, the application is designed to be accessible without user authentication (no login walls for the main flow) to reduce friction during demonstrations and onboarding. Session IDs (UUIDs) act as secure, unique identifiers for retrieving past data.
- **LLM Reliability**: The roadmap generation heavily relies on the assumption that the underlying LLM (`gemini-2.5-flash`) will consistently adhere to the strictly defined JSON schema enforced by the system prompts.
- **Browser Capabilities**: PDF export functionality assumes the user's browser supports HTML5 Canvas (`html2canvas`) rendering for client-side document generation.

## Future Improvements

While fully functional, there are several areas planned for future enhancement:

1. **User Authentication (Auth)**: Implementing Supabase Auth (OAuth / Email) to allow users to have a permanent, authenticated profile where all their business sessions and roadmaps are securely tied to an account rather than local browser state or direct links.
2. **Streaming Roadmap Generation**: Currently, the initial roadmap generation waits for the entire JSON payload to complete before rendering. Implementing a streaming JSON parser would allow the UI to build out progressively, reducing perceived latency.
3. **Multi-Model Support**: Abstracting the AI orchestration layer to support falling back to or switching between multiple models (e.g., GPT-4o, Claude 3.5 Sonnet) based on availability or specific task suitability.
4. **Interactive Action Items**: Allowing users to check off specific action items on their roadmap, tracking their progress over time directly in the dashboard, rather than just viewing a static plan.
5. **Team Collaboration**: Enabling users to invite team members to view and comment on specific roadmap strategies within the platform.

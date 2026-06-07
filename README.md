<div align="center">

<img src="https://img.shields.io/badge/status-MVP-6366f1?style=flat-square" />
<img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" />
<img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" />
<img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql" />
<img src="https://img.shields.io/badge/pgvector-enabled-6366f1?style=flat-square" />
<img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />

<br /><br />

# OSSCopilot

**AI-powered open source contribution assistant.**

OSSCopilot analyses your GitHub profile, extracts your skills, and recommends real open-source issues that match your experience — using vector embeddings and semantic search.

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Flow](#2-user-flow)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture](#5-architecture)
6. [Database Design](#6-database-design)
7. [API Overview](#7-api-overview)
8. [Installation & Setup](#8-installation--setup)
9. [Screenshots](#9-screenshots)
10. [Future Work](#10-future-work)
11. [Contributing](#11-contributing)
12. [License](#12-license)

---

## 1. Overview

Finding the right open-source issue to work on is harder than it should be. Searching GitHub for "good first issues" returns thousands of results with no sense of whether they match your skill level or tech stack.

OSSCopilot solves this by doing three things automatically:

1. **Reads your GitHub profile** — analyses your public repositories to extract real skills (languages, frameworks, domains)
2. **Collects and embeds issues** — fetches open issues from repositories you select, then embeds them using OpenAI
3. **Matches you to issues** — runs cosine similarity between your skill embedding and issue embeddings, returning ranked recommendations with explanations

The result is a personalised issue feed based on what you actually know, not what you type into a search box.

---

## 2. User Flow

```
GitHub OAuth Login
        ↓
Profile Analysis
(repos fetched, skills extracted via Claude API)
        ↓
Skills Detected
(skill cards shown with confidence scores)
        ↓
Repository Selection
(search or pick from examples: fastapi/fastapi, langchain-ai/langchain …)
        ↓
Repository Scanning
(issues fetched from GitHub API + embedded via OpenAI)
        ↓
Issue Recommendations
(ranked by vector similarity to your skill profile)
```

Each step is a distinct page in the UI. No manual skill entry — the entire profile is built from your existing GitHub activity.

---

## 3. Features

### Currently Implemented

| Feature | Description |
|---|---|
| GitHub OAuth login | Sign in with GitHub — no password stored |
| Profile analysis | Fetches public repos and sends them to Claude for skill extraction |
| Skill detection | Returns skills with confidence scores (e.g. Python 96%, FastAPI 91%) |
| Repository selection | Search `owner/repo` or pick from curated examples |
| Repository scanning | Fetches open issues from selected repo via GitHub REST API |
| Issue embedding | Embeds each issue (title + body + labels) using `text-embedding-3-small` |
| User embedding | Embeds user skill profile using the same model |
| Recommendations | Cosine similarity search via pgvector returns ranked issues |
| Recommendations dashboard | Displays matched issues with match score and skill reasoning |
| JWT authentication | All API routes protected with signed JWTs |
| Persistent storage | Users, repos, skills, and embeddings stored in PostgreSQL (Neon) |

### Not yet implemented (see [Future Work](#10-future-work))

- Contribution plan generation
- Saved issues list
- Advanced re-ranking beyond vector similarity
- Issue difficulty prediction
- PR assistance

---

## 4. Tech Stack

### Frontend

| Tool | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Geist / Bricolage Grotesque | Typography |

### Backend

| Tool | Purpose |
|---|---|
| FastAPI | Python API framework |
| SQLAlchemy 2.x (async) | ORM |
| Alembic | Database migrations |
| Pydantic v2 | Request / response validation |
| Python-Jose | JWT creation and verification |
| Httpx | Async GitHub API client |

### Database

| Tool | Purpose |
|---|---|
| PostgreSQL 16 (Neon) | Primary database |
| pgvector | Vector similarity search extension |

### AI / LLM

| Tool | Purpose |
|---|---|
| Claude API (`claude-sonnet-4-20250514`) | Skill extraction from repo READMEs |
| OpenAI (`text-embedding-3-small`) | Generating 1536-dim embeddings |
| pgvector `<=>` operator | Cosine distance similarity search |

### Infrastructure

| Tool | Purpose |
|---|---|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Neon | Serverless Postgres |
| Docker Compose | Local development |

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Next.js Frontend                   │
│               (Vercel · App Router)                 │
└────────────────────────┬────────────────────────────┘
                         │ REST + JWT
┌────────────────────────▼────────────────────────────┐
│                  FastAPI Backend                     │
│                  (Render · Python)                  │
│                                                     │
│  ┌──────────────┐   ┌──────────────┐               │
│  │   Routers    │   │   Services   │               │
│  │  auth/users  │──▶│ github_svc   │               │
│  │  issues/recs │   │ skill_svc    │               │
│  └──────────────┘   │ embed_svc    │               │
│                     │ rec_svc      │               │
│                     └──────┬───────┘               │
└────────────────────────────┼────────────────────────┘
                             │
         ┌───────────────────┼──────────────────┐
         ▼                   ▼                  ▼
  ┌─────────────┐    ┌──────────────┐   ┌─────────────┐
  │ PostgreSQL  │    │  GitHub API  │   │ OpenAI API  │
  │   + pgvec   │    │  REST v3     │   │ embeddings  │
  │   (Neon)    │    └──────────────┘   └─────────────┘
  └─────────────┘
         ▲
  ┌─────────────┐
  │ Claude API  │
  │ skill extr. │
  └─────────────┘
```

### Request lifecycle

```
HTTP request
  → JWT middleware (verify token, load user)
    → Router (thin — just HTTP)
      → Service (business logic)
        → SQLAlchemy ORM → Neon PostgreSQL
        → GitHub API (httpx)
        → Claude / OpenAI API
      → Pydantic schema (serialise response)
  → HTTP response
```

All heavy work (GitHub fetching, Claude calls, embedding generation) happens synchronously within the service layer for the MVP. A background queue (Celery + Redis) is planned for production scale.

---

## 6. Database Design

### Tables

```
users
├── id (uuid, PK)
├── github_id (bigint, unique)
├── username (varchar)
├── avatar_url (varchar)
├── bio (text)
├── skill_vector (jsonb)          -- ["Python", "FastAPI", ...]
├── experience_level (varchar)    -- beginner / intermediate / advanced
├── user_embedding (vector 1536)  -- pgvector column
└── created_at / updated_at

repositories
├── id (uuid, PK)
├── github_repo_id (bigint, unique)
├── user_id (FK → users)
├── name / full_name
├── language / stars / forks
├── description
└── last_synced_at

issues
├── id (uuid, PK)
├── github_issue_id (bigint, unique)
├── repo_id (FK → repositories)
├── title (varchar)
├── body (text)
├── labels (jsonb)
├── is_open (boolean)
└── github_created_at

issue_embeddings
├── id (uuid, PK)
├── issue_id (FK → issues, unique)
└── embedding (vector 1536)       -- pgvector column

user_feedback
├── id (uuid, PK)
├── user_id (FK → users)
├── issue_id (FK → issues)
├── liked (boolean)
└── created_at
```

### How vector search works

```sql
-- Find issues closest to this user's skill embedding
SELECT
  i.id,
  i.title,
  i.body,
  1 - (ie.embedding <=> :user_embedding) AS similarity_score
FROM issues i
JOIN issue_embeddings ie ON ie.issue_id = i.id
WHERE i.is_open = true
ORDER BY ie.embedding <=> :user_embedding   -- cosine distance
LIMIT 20;
```

`<=>` is pgvector's cosine distance operator. Lower distance = higher similarity. We return `1 - distance` as the match percentage shown in the UI.

---

## 7. API Overview

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/github` | Exchange GitHub OAuth code for JWT | — |
| `GET` | `/auth/me` | Return current user from JWT | ✓ |

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/users/me` | Current user profile + skills | ✓ |
| `GET` | `/users/me/repos` | User's GitHub repositories | ✓ |
| `POST` | `/users/me/sync` | Re-analyse profile + regenerate embedding | ✓ |

### Repositories & Issues

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/repos/scan` | Fetch issues from `owner/repo` + embed them | ✓ |
| `GET` | `/issues` | List collected issues (paginated) | ✓ |

### Recommendations

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/recommendations` | Ranked issues by vector similarity to user | ✓ |
| `POST` | `/recommendations/{id}/feedback` | Thumbs up / down | ✓ |

### Example response — `GET /recommendations`

```json
[
  {
    "issue_id": "a1b2c3d4-...",
    "title": "Add async connection pool support",
    "repo_name": "tiangolo/sqlmodel",
    "github_url": "https://github.com/tiangolo/sqlmodel/issues/123",
    "labels": ["enhancement", "good first issue"],
    "similarity_score": 0.91,
    "match_explanation": "Matches your SQLAlchemy and async Python experience"
  }
]
```

---

## 8. Installation & Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker (for local Postgres)
- A GitHub OAuth App ([create one here](https://github.com/settings/developers))

### 1. Clone and configure

```bash
git clone https://github.com/your-username/ossCopilot.git
cd ossCopilot
```

**Frontend** — create `frontend/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-32-char-string

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** — create `backend/.env`:

```env
SECRET_KEY=any-random-32-char-string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

DATABASE_URL=postgresql+asyncpg://osscopilot:osscopilot@localhost/osscopilot

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Start Postgres

```bash
docker-compose up -d
# Starts PostgreSQL with pgvector on port 5432
```

### 3. Run the backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:3000`

### GitHub OAuth callback URL

In your GitHub OAuth App settings, set the callback URL to:
```
http://localhost:3000/api/auth/callback/github
```

---

## 9. Screenshots

> _Screenshots to be added after final UI polish._

| Page | Description |
|---|---|
| Landing | Dark hero with GitHub login |
| Onboarding | Welcome screen showing avatar, username, repo count |
| Analysis progress | Animated pipeline — skill extraction → embedding → recommendations |
| Skills detected | Skill cards with confidence percentages |
| Repository selection | Search input + example repos + recently analysed |
| Recommendations | Issue cards ranked by match score with reasoning |

---

## 10. Future Work

These features are planned but not yet implemented:

| Feature | Description |
|---|---|
| Contribution plan generation | Claude generates step-by-step plan for a selected issue |
| Saved issues | Bookmark issues to revisit later |
| Issue difficulty prediction | Classify issues beyond label-based heuristics |
| Advanced re-ranking | Incorporate repo health, maintainer activity, issue age |
| Background job queue | Celery + Redis for async embedding at scale |
| Codebase Q&A (RAG) | Ask natural language questions about any repo |
| PR assistance | Draft PR descriptions and commit messages |
| Contribution streak tracking | Gamification and activity history |
| Repository health scoring | Star velocity, merge rate, responsiveness |

---

## 11. Contributing

Contributions are welcome.

```bash
# Fork and clone
git clone https://github.com/your-username/ossCopilot.git
git checkout -b feat/your-feature-name

# Backend tests
cd backend && pytest tests/ -v

# Frontend checks
cd frontend && npm run type-check && npm run lint
```

**Commit format** — follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add repository health scoring
fix: handle GitHub 429 rate limit response
docs: update API endpoint table
```

**PR checklist:**
- [ ] Tests pass locally
- [ ] New env vars added to `.env.example`
- [ ] DB changes include an Alembic migration

---

## 12. License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for the Elite Coders Hackathon · June 2025</sub><br />
  <sub>
    <a href="../../issues">Report a bug</a> ·
    <a href="../../issues">Request a feature</a>
  </sub>
</div>
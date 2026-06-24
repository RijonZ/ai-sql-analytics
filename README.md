# AI SQL Analytics

A natural language analytics platform — ask questions in plain English and get SQL queries, charts, and AI insights automatically.

**Stack:** React · Node.js · PostgreSQL (Docker) · OpenAI GPT-4o · Recharts

---

## How It Works

1. User types a question in plain English (e.g. *"What were total sales last month?"*)
2. Backend sends the database schema + question to **OpenAI GPT-4o**
3. GPT-4o generates the correct **PostgreSQL query**
4. Query executes against the database and returns results
5. Frontend displays **charts**, **tables**, and an **AI-generated insight**

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [OpenAI API Key](https://platform.openai.com/)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/RijonZ/ai-sql-analytics.git
cd ai-sql-analytics
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Install and seed the backend

```bash
npm install
npm run seed    # loads 3,000 orders, 200 customers, 25 products into PostgreSQL
npm run dev     # starts on http://localhost:3001
```

### 5. Install and start the frontend

```bash
cd ../frontend
npm install
npm run dev     # starts on http://localhost:5173
```

### 6. Open the app

Go to **http://localhost:5173** and start asking questions.

---

## Example Questions

| Question | What it tests |
|---|---|
| `What were total sales last month?` | Date filtering |
| `Show me top 5 products by revenue in 2025` | JOIN + ORDER BY |
| `How many orders per region?` | GROUP BY |
| `What is the average order value by category?` | JOIN + AVG |
| `Show monthly sales trend for 2025` | DATE_TRUNC + GROUP BY |
| `Which customers spent the most?` | JOIN + SUM + ORDER BY |
| `What is the refund rate by product category?` | CASE + GROUP BY |
| `How many customers have placed more than 10 orders?` | HAVING clause |

---

## Architecture

```
Frontend (React + Vite)        Backend (Node.js + Express)       Database
┌─────────────────────┐        ┌─────────────────────────┐       ┌──────────────┐
│                     │        │                         │       │              │
│  QueryInput         │──────► │  POST /api/query        │──────►│ PostgreSQL   │
│  SQLPreview         │        │    ↓ OpenAI GPT-4o      │       │   (Docker)   │
│  ChartView          │◄───────│    ↓ Generate SQL       │◄──────│ orders       │
│  ResultTable        │        │    ↓ Execute query      │       │ products     │
│  SchemaPanel        │◄───────│  GET /api/schema        │       │ customers    │
└─────────────────────┘        └─────────────────────────┘       └──────────────┘
```

---

## Database Schema

| Table | Rows | Description |
|---|---|---|
| `orders` | 3,000 | Sales orders from 2024–2025 with date, amount, status, region |
| `customers` | 200 | Customer profiles with city and region |
| `products` | 25 | Product catalog across 5 categories |

---

## Data Pipeline

The seed script (`backend/scripts/seed.js`) reads three CSV files from `backend/data/` and loads them into PostgreSQL inside a transaction. To reload with fresh or custom data:

```bash
cd backend
npm run seed
```

You can replace the CSV files with your own data — the seed script handles schema creation automatically.

---

## Project Structure

```
ai-sql-analytics/
├── backend/
│   ├── src/
│   │   ├── index.js              Express server entry point
│   │   ├── routes/
│   │   │   ├── query.js          POST /api/query — text-to-SQL endpoint
│   │   │   └── schema.js         GET /api/schema — database explorer
│   │   └── services/
│   │       ├── database.js       PostgreSQL connection pool
│   │       └── openai.js         GPT-4o SQL generation + insights
│   ├── scripts/seed.js           Data pipeline (CSV → PostgreSQL)
│   ├── data/                     CSV datasets
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── QueryInput.jsx    Natural language input + suggestions
│       │   ├── SQLPreview.jsx    Generated SQL + execution stats
│       │   ├── ChartView.jsx     Bar / Line / Pie charts (Recharts)
│       │   ├── ResultTable.jsx   Paginated data table
│       │   └── SchemaPanel.jsx   Database schema explorer
│       └── services/api.js       Axios API client
└── docker-compose.yml
```

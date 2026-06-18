# AI SQL Analytics

Natural language analytics platform — ask questions in plain English, get SQL + charts automatically.

**Stack:** React · Node.js · PostgreSQL (Docker) · OpenAI GPT-4o · Recharts

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

### 2. Setup backend

```bash
cd backend
npm install
npm run seed        # loads 3000 orders into PostgreSQL
npm run dev         # starts on http://localhost:3001
```

### 3. Setup frontend

```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

### 4. Open browser

Go to **http://localhost:5173** and start asking questions.

## Example Questions

- `What were total sales last month?`
- `Show me top 5 products by revenue in 2025`
- `How many orders per region?`
- `What is the average order value by product category?`
- `Show monthly sales trend for 2025`
- `Which customers spent the most?`
- `What is the refund rate by category?`

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

## Database Schema

| Table       | Rows  | Description              |
|-------------|-------|--------------------------|
| `orders`    | 3,000 | Sales orders 2024-2025   |
| `customers` | 200   | Customer profiles        |
| `products`  | 25    | Product catalog          |

## Data Pipeline

The seed script (`backend/scripts/seed.js`) reads CSV files from `backend/data/` and loads them into PostgreSQL. You can replace the CSVs with real data and re-run `npm run seed`.

## Environment Variables

Create `backend/.env`:

```env
PORT=3001
OPENAI_API_KEY=your_key_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=analytics
DB_USER=analytics_user
DB_PASSWORD=analytics_pass
```

# AI SQL Assistant ⚡

**AI SQL Assistant** is a professional, developer-grade SQL workspace powered by Google Gemini 3.7. It bridges the gap between natural language and database query engineering—allowing engineers, data analysts, and students to generate, explain, debug, optimize, and practice SQL queries across **PostgreSQL**, **MySQL**, **SQLite**, **SQL Server (T-SQL)**, and **Oracle**.

---

## 🌟 Key Features

### 1. Natural Language → SQL Generator
- Describe database requirements in plain English (e.g., *"Find the top 5 employees with the highest salary"*).
- Generates dialect-accurate, production-ready SQL queries.
- Lists assumed tables, columns, and relationship mappings.
- Provides concise query explanations and best-practice dialect tips.
- **Copy SQL** with 1-click clipboard feedback and instant transfer to Explainer, Debugger, or Optimizer.

### 2. Beginner-Friendly SQL Explainer
- Paste any complex SQL query.
- Breaks down the query into clause-by-clause segments (`SELECT`, `FROM & JOIN`, `WHERE`, `GROUP BY`, `ORDER BY`, etc.).
- Explains the **logical execution order** of the SQL engine vs. the written syntax.
- Identifies core database concepts and provides computational complexity assessments.

### 3. Intelligent SQL Debugger & Diagnostics
- Paste broken SQL queries along with optional database error messages.
- Detects syntax errors, ambiguous column references, unaggregated `GROUP BY` columns, and subquery scalar traps.
- Explains the **Root Cause** of why the database rejected the query.
- Outputs **1-click Corrected SQL** with detailed fix explanations and prevention tips.

### 4. Performance & Query Optimizer
- Evaluates query performance and isolates potential table scans and correlated subquery loops.
- Provides refactored high-performance SQL rewrites.
- Suggests concrete **`CREATE INDEX`** DDL statements with 1-click copy.
- Highlights redundant operations and presents alternative execution strategies (such as `EXISTS` vs. `IN` or Window Functions).

### 5. Interactive SQL Practice Arena & Interview Arena
- Practice SQL challenges across three tiers: **Beginner**, **Intermediate**, and **Advanced**.
- Realistic problems paired with normalized relational schemas and sample records.
- In-browser interactive SQL code editor with syntax highlighting and line numbers.
- Automated AI code evaluation:
  - **Score out of 10**
  - Constructive feedback and edge case gap analysis
  - Optimal reference solution with explanatory notes
- **"Generate New AI Problem"** button to dynamically create unlimited custom challenges.

### 6. Relational Database Schema Scratchpad
- Inspect pre-loaded database schemas (*E-Commerce & Orders*, *HR & Salaries*).
- View table structures, data types, primary keys (PK), foreign keys (FK), and sample rows.
- Copy full or per-table DDL (`CREATE TABLE`) statements with 1 click.

### 7. Query Session History & Bookmarks
- Automatically caches past generated, explained, debugged, and optimized queries in local storage.
- Search and filter history by operation and dialect.
- 1-click restore or export as JSON.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / API Gateway**: Node.js, Express, tsx, esbuild
- **AI Model**: Google Gemini 3.7 Flash (`gemini-3.7-flash` via `@google/genai`)
- **Security**: Server-side API key containment, rate limiting, and request validation

---

## 📸 Screenshots

```
+-------------------------------------------------------------------------+
| [AI SQL Assistant]   Dialect: PostgreSQL   [Schemas] [History] [Theme] |
+-------------------------------------------------------------------------+
| [Sidebar]       |  Natural Language -> SQL Generator                    |
| - Dashboard     |  [ Describe what you want to query...               ] |
| - Generate SQL  |  "Find the top 5 employees with the highest salary"   |
| - Explain SQL   |                                                       |
| - Debug SQL     |  +--------------------------------------------------+ |
| - Optimize SQL  |  | 1 SELECT name, salary FROM employees             | |
| - Practice      |  | 2 ORDER BY salary DESC LIMIT 5;                  | |
|                 |  +--------------------------------------------------+ |
|                 |  Explanation: Orders records by salary descending...  |
|                 |  Assumed: employees(name, salary, department_id)      |
+-------------------------------------------------------------------------+
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **Gemini API Key**: Get a free API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-sql-assistant.git
cd ai-sql-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (copied from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=AIzaSy...your_actual_api_key_here
PORT=3000
```

### 4. Run Locally in Development Mode

```bash
npm run dev
```

The application will start at **`http://localhost:3000`**.

---

## 📦 Production Build & Deployment

To compile and package the app for production:

```bash
# 1. Build client bundle and bundle server with esbuild
npm run build

# 2. Start the production server
npm start
```

---

## 🔒 Security & Key Protection

- **Server-Side Containment**: All communication with the Gemini API is routed through the Express gateway (`/api/sql/*`).
- **Zero Client Leakage**: The `GEMINI_API_KEY` is never bundled into client JavaScript assets.
- **Sliding-Window Rate Limiting**: Built-in middleware limits IP request frequency to prevent accidental quota exhaustion.
- **Input Sanitization**: Request bodies are strictly validated against maximum character limits and supported dialect whitelists.

---

## 🌐 Supported SQL Dialects

| Dialect | Dialect Highlights |
| :--- | :--- |
| **PostgreSQL** | CTEs, `ILIKE`, Window Functions, JSONB operators, `LIMIT / OFFSET` |
| **MySQL** | `LIMIT`, Backtick quoting, `GROUP_CONCAT`, `ON DUPLICATE KEY UPDATE` |
| **SQLite** | Lightweight standard ANSI SQL, `ROWID`, standard date functions |
| **SQL Server** | `TOP`, `OFFSET-FETCH`, `ISNULL()`, `STRING_AGG()`, bracket quoting |
| **Oracle** | `FETCH FIRST n ROWS ONLY`, `ROWNUM`, `NVL()`, `DUAL` table |

---

## 🤝 Pushing Directly to GitHub

```bash
git init
git add .
git commit -m "feat: initial release of AI SQL Assistant"
git branch -M main
git remote add origin https://github.com/your-username/ai-sql-assistant.git
git push -u origin main
```

---

## 📄 License

MIT License &copy; 2026 AI SQL Assistant Authors.

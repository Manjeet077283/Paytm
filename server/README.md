# Paytm WorkMate - Backend Server

Autonomous AI Teammates: Backend API, Agent Orchestration & Deterministic Analytics Engine.

## Tech Stack
- **Runtime:** Node.js + Express (TypeScript)
- **Database:** MongoDB / Mongoose
- **Real-time:** Socket.IO
- **AI / LLM:** Google Gemini API (`@google/genai`)
- **Analytics:** Deterministic CSV Analytics Engine (Streaming CSV parsing, PDF/Excel generation)

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 2. Setup Environment
Copy the example environment file and configure your credentials:
```bash
cp .env.example .env
```
Fill in the required values:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT auth
- `GEMINI_API_KEY`: Google Gemini API key

### 3. Install Dependencies
```bash
npm install
```

### 4. Build TypeScript
```bash
npm run build
```

### 5. Run the Server
```bash
# Development mode (with live reload)
npm run dev

# Production mode
npm start
```

### 6. Run Integration Tests
```bash
npm test
```

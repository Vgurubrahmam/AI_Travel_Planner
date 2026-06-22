# AI Travel Planner — Backend API

This is the production-ready backend service for the **AI Travel Planner** application. It provides secure user authentication, stores personalized trip itineraries in MongoDB, validates inputs, and integrates with the Google Gemini API to generate travel plans, hotel recommendations, budget estimates, packing lists, and custom itineraries.

---

## 🛠️ Technology Stack

- **Core**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **AI Integration**: Google Gen AI SDK (Gemini models)

---

## 📁 Architecture Overview

```text
src/
├── config/          # Database connection & env variable validation
├── models/          # MongoDB schemas (User, Trip)
├── middleware/       # Auth guard, error handler, rate limiters, validation
├── services/        # Business logic (Auth, Trips, Gemini AI)
├── controllers/     # Route controller endpoints
├── routes/          # Express route routers mounting
├── utils/           # ApiError, ApiResponse, prompt templates, constants
├── types/           # TypeScript interface definitions
├── app.ts           # Middleware config & API route assemblies
└── server.ts        # App runner with database loaders & graceful shutdown
```

---

## 🔐 Security & Optimization

- **User Isolation**: All queries query against `userId` parsed from incoming JWTs, ensuring absolute data privacy.
- **AI Resiliency**: Uses exponential retry backoffs and falls back sequentially (`gemini-2.0-flash` ➡️ `gemini-2.0-flash-lite` ➡️ `gemini-flash-latest`) if rate/quota limit errors (429) occur.
- **Input Validation**: Uses validator middleware to sanitize and validate requests before database executions.
- **Graceful Shutdown**: Intercepts `SIGINT` / `SIGTERM` signals to cleanly close database pools.

---

## 🚀 Getting Started

### 1. Requirements
Ensure you have **Node.js (v18+)** and **MongoDB** installed (or a MongoDB Atlas connection string).

### 2. Configure Environment Variables
Create a `.env` file in the root `Backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.lkgshfk.mongodb.net/ai-travel-planner?appName=Cluster0
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
NODE_ENV=development
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server (with nodemon)
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints (17 Endpoints)

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT token

### User
- `GET /api/users/profile` *(Auth Required)* — Retrieve user details

### Trips
- `POST /api/trips` *(Auth Required)* — Generate a new trip using Gemini AI
- `GET /api/trips` *(Auth Required)* — List all saved trips for the authenticated user
- `GET /api/trips/:id` *(Auth Required)* — Get details of a single trip
- `PUT /api/trips/:id` *(Auth Required)* — Update details of a trip
- `DELETE /api/trips/:id` *(Auth Required)* — Delete a saved trip

### Activities (Itinerary Editing)
- `POST /api/trips/:id/days/:day/activities` *(Auth Required)* — Add a custom activity to a day
- `PUT /api/trips/:id/days/:day/activities/:actIdx` *(Auth Required)* — Update an activity at index
- `DELETE /api/trips/:id/days/:day/activities/:actIdx` *(Auth Required)* — Remove an activity at index
- `POST /api/trips/:id/days/:day/regenerate` *(Auth Required)* — AI-regenerate details for a specific day

### Packing List Assistant
- `PATCH /api/trips/:id/packing/:itemIdx` *(Auth Required)* — Toggle packed status of an item
- `POST /api/trips/:id/packing` *(Auth Required)* — Add a custom item to the packing list
- `DELETE /api/trips/:id/packing/:itemIdx` *(Auth Required)* — Remove an item from the packing list

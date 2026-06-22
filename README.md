# AI Travel Planner

A comprehensive, full-stack, AI-powered travel planning application that automatically generates personalized day-by-day itineraries, hotel recommendations, budget estimates, and packing lists based on user destination, duration, budget class, and interests.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Chosen Tech Stack & Justifications](#%EF%B8%8F-chosen-tech-stack--justifications)
3. [Setup & Installation Instructions](#-setup--installation-instructions)
   - [Local Development Setup](#local-development-setup)
   - [Cloud Deployment Setup](#cloud-deployment-setup)
4. [High-Level Architecture](#%EF%B8%8F-high-level-architecture)
5. [Authentication & Authorization Approach](#-authentication--authorization-approach)
6. [AI Agent Design & Purpose](#-ai-agent-design--purpose)
7. [Creative & Custom Features](#-creative--custom-features)
8. [Key Design Decisions & Trade-Offs](#-key-design-decisions--trade-offs)
9. [Known Limitations](#-known-limitations)

---

## 🌟 Project Overview

Planning a trip can be overwhelming, involving hours of researching sights, comparing hotels, and organizing packing lists. The **AI Travel Planner** solves this by automating the process. Users can specify:
- **Destination**: Any city/country worldwide.
- **Duration**: Sliding scale from 1 to 30 days.
- **Budget Tier**: Economy/Budget, Moderate, or Luxury.
- **Interests**: Up to 10 selected tags (e.g. food, history, nightlife, beaches, adventure).

Within seconds, the AI compiles a complete travel package, saving it to the user's dashboard. Users can then view details, add/edit/delete individual activities, check items off their packing list, and trigger AI regenerations for specific days.

---

## 🛠️ Chosen Tech Stack & Justifications

### Backend
- **Express.js (TypeScript)**: Highly modular, lightweight, and fast. TypeScript provides type safety for data models and request validation.
- **MongoDB & Mongoose**: Structured travel itineraries contain deeply nested documents (Trips contain Days, which contain multiple Activities). Storing this hierarchy as single document trees is much more performant than complex relational SQL queries.
- **JWT & bcrypt**: Stateless authentication tokens with encrypted password hashing (12 salt rounds) ensuring security.

### Frontend
- **React (TypeScript) & Vite**: Fast Hot Module Replacement (HMR) and highly responsive page updates.
- **Tailwind CSS v4**: Utility-first CSS with modern custom theme variables, resulting in extremely fast build sizes.
- **shadcn/ui**: Premade, highly customizable accessible UI components (Tabs, Accordions, Dialogs, Sliders, Badges) built on Radix UI.

---

## ⚙️ Setup & Installation Instructions

### Local Development Setup

#### 1. Configure the Backend
1. Open your terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.lkgshfk.mongodb.net/ai-travel-planner?appName=Cluster0
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_google_gemini_api_key_here
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

#### 2. Configure the Frontend
1. In a new terminal window, navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:3001` (or `http://localhost:3000`).

---

### Cloud Deployment Setup

#### 🌐 Deploying the Backend on Render
1. Sign in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your Github repository (`Vgurubrahmam/AI_Travel_Planner`).
3. Set the following options in the deployment configuration:
   - **Name**: `ai-travel-planner-backend` (or your preferred name)
   - **Root Directory**: `Backend`
   - **Language**: `Node`
   - **Branch**: `master` (or your active branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under the **Environment** tab, click **Add Environment Variable** and copy over all keys from your local `.env`:
   - `PORT` = `5000` (Render will override this, but standard to define)
   - `MONGODB_URI` = `mongodb+srv://...` (your MongoDB Atlas connection string)
   - `JWT_SECRET` = `your_jwt_secret_key`
   - `JWT_EXPIRES_IN` = `7d`
   - `GEMINI_API_KEY` = `your_google_gemini_api_key`
   - `NODE_ENV` = `production`
5. Click **Deploy Web Service** and copy your service's live URL (e.g., `https://ai-travel-planner-backend-vguru.onrender.com`).

#### 📐 Deploying the Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your Github repository (`Vgurubrahmam/AI_Travel_Planner`).
3. Set the following configuration settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`Frontend`**.
4. In the **Build and Output Settings** tab:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Configuring the Proxy Rewrite**:
   Inside the [vercel.json](file:///c:/Users/vguru/Desktop/internships/ai-travel-planner/Frontend/vercel.json) file in your `Frontend` folder, update the destination URL with your live Render backend URL so API calls route correctly:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://your-render-backend-url.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
6. Click **Deploy**. Vercel will build the frontend client and host the single-page application.

---

## 🏗️ High-Level Architecture

The project implements a clean separation of concerns with an **MVC + Service Layer** architecture:

```text
ai-travel-planner/
├── Backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── config/              # MongoDB connection & Env validation
│   │   ├── models/              # Mongoose schemas (User, Trip)
│   │   ├── middleware/          # JWT Auth guard, Rate limits, Validate middleware
│   │   ├── services/            # Auth services, Trip CRUD logic, Gemini API services
│   │   ├── controllers/         # REST Route handler controllers
│   │   └── routes/              # Mounted endpoint routers
│   └── README.md
│
└── Frontend/                    # React SPA
    ├── src/
    │   ├── context/             # Auth status & token storage context
    │   ├── lib/                 # Axios client configuration with JWT interceptors
    │   ├── pages/               # Views (Home, Login, Dashboard, Details, etc.)
    │   └── components/          # Reusable layout and custom shadcn UI components
    └── README.md
```

---

## 🔒 Authentication & Authorization Approach

- **Stateless Tokens**: On successful authentication, users receive a signed JWT token containing their user ID, allowing stateless route authentication.
- **JWT Interceptor**: The frontend Axios client (`api.ts`) automatically intercepts and injects the stored JWT token into the `Authorization` header of all requests.
- **Route Protection**: The backend route handlers apply the `auth` validation middleware on all private API endpoints.
- **User Data Isolation**: Queries to MongoDB strictly enforce ownership verification (e.g., `Trip.findOne({ _id: id, userId: req.user.id })`), preventing unauthorized read or write operations.

---

## 🤖 AI Agent Design & Purpose

The Gemini service calls Google's Generative AI SDK, formatting structured prompt inputs to ensure a strict JSON output matching our typescript interfaces.

To prevent API failures due to rate/quota limits on free-tier keys, the AI agent implements a **Multi-Model Fallback Chain**:
1. First, attempts generation using **`gemini-2.0-flash`**.
2. If a `429` (Quota/Rate Limit Exceeded) error occurs, it skips remaining retries for that model and falls back to **`gemini-2.0-flash-lite`**.
3. If that also hits a limit, it falls back to **`gemini-flash-latest`** (Gemini 1.5 Flash alias), ensuring generation success.

---

## ✨ Creative & Custom Features

1. **AI Single-Day Regeneration**:
   Instead of regenerating an entire trip when a user wants changes, they can click "AI Regenerate Day". The backend requests a single replacing day from Gemini matching the destination and interests, updates it in MongoDB, and reloads the state.
2. **Visual Cost Allocation Progress Bars**:
   Under the Budget Tab, cost categories (accommodation, transport, sightseeing, dining, emergencies) are rendered with calculated percentages and visual progress bars.
3. **Resilient API Rate-Limit Fallback**:
   Dynamically reroutes rate-limited requests through multiple models, providing rate-limit resiliency.
4. **Dark Premium Theme & Glassmorphism**:
   Built on custom Tailwind v4 properties, offering a sleek, modern, fully-responsive dark user experience.

---

## ⚖️ Key Design Decisions & Trade-Offs

- **Embedded Itinerary Arrays**: Storing day itineraries directly inside the `Trip` collection (rather than referencing separate collections) makes data retrieval faster, but places a theoretical 16MB document limit on trips (limiting itineraries to ~45 days max under extreme size rules).
- **Full-Document Responses**: Edit actions (like adding/deleting activities) return the fully updated `trip` or `packingList` object. This simplifies frontend state management (single source of truth) at the expense of a slightly larger HTTP payload size.

---

## ⚠️ Known Limitations

- **Free-Tier Limits**: Under heavy concurrent requests, users might experience slight generation delays as the system cascades down the model fallback chain.
- **Static Weather context**: Weather is estimated based on historical regional averages for the select travel month.
- **Mock Booking**: Recommended hotels redirect to external booking platforms rather than booking reservations.

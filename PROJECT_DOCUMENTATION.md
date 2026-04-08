# MindGuide - Personal Wellness Companion

## A Complete Guide to Understanding, Building, and Deploying MindGuide

---

## Table of Contents

1. [What is MindGuide?](#what-is-mindguide)
2. [How Does It Work?](#how-does-it-work)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [How the Backend Works](#how-the-backend-works)
6. [How the Frontend Works](#how-the-frontend-works)
7. [Key Features Explained](#key-features-explained)
8. [The AI Counselor - How It Works](#the-ai-counselor)
9. [Database & Storage](#database--storage)
10. [Security](#security)
11. [How to Run Locally](#how-to-run-locally)
12. [How to Deploy](#how-to-deploy)
13. [API Endpoints](#api-endpoints)
14. [Common Issues & Solutions](#common-issues--solutions)

---

## What is MindGuide?

MindGuide is a **personal digital wellness companion** - essentially a website/app that helps people take care of their mental health. Think of it like having a friendly wellness assistant available 24/7.

### What can users do with MindGuide?

- **Track their mood daily** - Rate stress, focus, happiness, energy levels
- **Chat with an AI counselor** - Get support and guidance when feeling down
- **See their wellness trends** - View charts showing how they're doing over time
- **Simulate future scenarios** - See how lifestyle changes could improve their wellbeing
- **Get personalized insights** - Discover patterns in their emotional health

### Who is it for?

- Anyone who wants to track their mental wellness
- People who want a supportive AI to talk to
- Those curious about how habits affect their mood
- Anyone who prefers digital mental health tools

---

## How Does It Work?

Think of MindGuide as having two parts working together:

```
┌─────────────────┐         ┌─────────────────┐
│    FRONTEND     │◄───────►│    BACKEND      │
│   (User sees)   │  API    │   (Logic lives) │
│                 │  Calls   │                 │
│  - Buttons      │         │  - Auth          │
│  - Forms        │         │  - AI Chat       │
│  - Charts       │         │  - Data Storage  │
│  - Pages        │         │  - Calculations  │
└─────────────────┘         └─────────────────┘
```

1. **User visits the website** - They see the login/signup page
2. **User creates account** - Backend creates user and returns a token
3. **User logs in** - Backend verifies and returns token
4. **User interacts** - Dashboard, check-ins, chat, etc.
5. **Frontend talks to Backend** - Via API calls (like a messenger service)
6. **Backend processes & stores** - Saves data, runs AI, returns results

---

## Project Structure

```
Mind-Guide/
│
├── README.md                 # This document
│
├── mind-guide/
│   │
│   ├── backend/            # Server-side code (Python/FastAPI)
│   │   ├── main.py         # Main API server - all routes live here
│   │   ├── ai_engine.py    # AI counselor logic
│   │   ├── auth.py         # User authentication (login/signup)
│   │   ├── utils.py        # Helper functions (date formatting, file saving)
│   │   ├── requirements.txt # List of Python packages needed
│   │   ├── vercel.json     # Deployment settings for Vercel
│   │   │
│   │   └── storage/        # JSON files where user data is saved
│   │       ├── users.json   # User accounts
│   │       ├── checkins.json # Daily mood check-ins
│   │       └── chats.json    # Chat messages
│   │
│   ├── frontend/           # Client-side code (React/JavaScript)
│   │   ├── public/         # Static files (favicon, images)
│   │   ├── src/            # Main source code
│   │   │   ├── App.jsx     # Main app component with routing
│   │   │   ├── main.jsx    # Entry point - starts the app
│   │   │   ├── index.css   # Global styles
│   │   │   │
│   │   │   ├── pages/      # Different pages of the app
│   │   │   │   ├── Login.jsx      # Login page
│   │   │   │   ├── Signup.jsx     # Signup page
│   │   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   │   ├── Checkin.jsx     # Daily mood check-in
│   │   │   │   ├── Chat.jsx       # AI counselor chat
│   │   │   │   ├── Simulate.jsx   # Future mirror
│   │   │   │   ├── Insights.jsx   # Analytics & trends
│   │   │   │   └── Profile.jsx    # User profile
│   │   │   │
│   │   │   ├── components/  # Reusable UI components
│   │   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   │   └── ProtectedRoute.jsx # Guards routes that need login
│   │   │   │
│   │   │   ├── contexts/    # React state management
│   │   │   │   └── AuthContext.jsx  # Handles user login/logout state
│   │   │   │
│   │   │   └── services/    # External services
│   │   │       └── api.js   # API calls to backend
│   │   │
│   │   ├── package.json     # List of JavaScript packages needed
│   │   ├── index.html       # HTML entry point
│   │   ├── vite.config.js   # Build configuration
│   │   ├── tailwind.config.js # CSS styling configuration
│   │   └── vercel.json      # Deployment settings
│   │
│   └── README.md            # Original project readme
│
└── .gitignore              # Files to ignore in git
```

---

## Technology Stack

### Frontend Technologies

| Technology | Purpose | Simple Explanation |
|------------|---------|-------------------|
| **React** | UI Framework | Library for building interactive user interfaces |
| **Vite** | Build Tool | Fast way to bundle and serve React apps |
| **React Router** | Navigation | Handles URL changes and page navigation |
| **Tailwind CSS** | Styling | Pre-made CSS classes for rapid UI development |
| **Chart.js** | Charts | Library for displaying data as charts/graphs |
| **Lucide React** | Icons | Collection of free icons |

### Backend Technologies

| Technology | Purpose | Simple Explanation |
|------------|---------|-------------------|
| **FastAPI** | Web Framework | Python framework for building APIs quickly |
| **Uvicorn** | Server | Runs the FastAPI app |
| **Python-JOSE** | JWT Tokens | Creates secure login tokens |
| **BCrypt** | Password Hashing | Secures user passwords |
| **Pydantic** | Data Validation | Ensures data coming in is correct |
| **Groq** | AI/LLM | Provides AI responses for the counselor |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosts the frontend (free) |
| **GitHub** | Stores the code |
| **Render/Railway** | Alternative for backend hosting |

---

## How the Backend Works

The backend is like the **brain** of the application. It receives requests, processes them, and sends back responses.

### Entry Point: main.py

The `main.py` file is where everything starts. It contains:

1. **API Routes** - Endpoints like `/signup`, `/login`, `/checkin`, `/chat`
2. **Data Models** - Definition of what data looks like (User, Checkin, etc.)
3. **Middleware** - CORS (allows frontend to talk to backend)
4. **Storage Functions** - Reading and writing to JSON files

### Authentication Flow

```
User signs up with email/password
         │
         ▼
Backend receives signup request
         │
         ▼
Password is "hashed" (converted to unreadable string)
         │
         ▼
User info saved to users.json
         │
         ▼
JWT token created (special login ticket)
         │
         ▼
Frontend stores token in localStorage
         │
         ▼
All future requests include this token
         │
         ▼
Backend verifies token before processing
```

### Key Files Explained

#### auth.py - Handles Security

```python
# What it does:
# 1. hash_password(password) - Converts "mypassword123" to "hash#@$%^&*"
# 2. verify_password(password, hash) - Checks if password matches the hash
# 3. create_access_token(user_id) - Creates a login ticket
# 4. get_current_user_id(token) - Reads the login ticket
```

#### utils.py - Helper Functions

```python
# What it does:
# 1. load_json(filename, default) - Reads data from file
# 2. save_json(filename, data) - Writes data to file
# 3. utc_now_iso() - Gets current date/time in standard format
```

#### ai_engine.py - The AI Counselor

```python
# What it does:
# 1. detect_crisis(text) - Checks if user mentions self-harm/suicide
# 2. detect_mood(text) - Understands if user is sad/anxious/happy
# 3. generate_counselor_reply(message, user_profile) - Creates AI response
# 4. simulate_future(habits, months, baseline) - Calculates habit impact
```

---

## How the Frontend Works

The frontend is what the **user sees and interacts with**. It's built with React, which uses a component-based architecture.

### React Components

Think of components as **building blocks**:

```
App
  ├── AuthContext (manages login state)
  ├── Routes
  │   ├── /login → Login.jsx
  │   ├── /signup → Signup.jsx
  │   ├── /dashboard → Dashboard + Navbar
  │   ├── /checkin → Checkin + Navbar
  │   ├── /chat → Chat (no Navbar - immersive)
  │   ├── /simulate → Simulate + Navbar
  │   ├── /insights → Insights + Navbar
  │   └── /profile → Profile + Navbar
```

### State Management

**AuthContext.jsx** keeps track of:
- Is user logged in?
- What is the user's name/email?
- Functions to login, signup, logout

### API Communication

The frontend never talks directly to the database. It sends requests to the backend via `api.js`:

```javascript
// Example: How login works
api.auth.login({ email, password })
  .then(data => {
    // Backend verified credentials
    // Returns token and user profile
    localStorage.setItem('token', data.token);
    // Redirect to dashboard
  })
  .catch(error => {
    // Show error message
  });
```

---

## Key Features Explained

### 1. Daily Check-in

Users rate themselves on a scale of 0-100 for:
- **Stress** - How stressed do you feel?
- **Focus** - How well can you concentrate?
- **Happiness** - How happy are you?
- **Energy** - How energetic do you feel?
- **Sleep** - How many hours did you sleep?

These numbers get saved and used to show trends over time.

### 2. AI Counselor

The chat feature uses AI to:
- Detect the user's mood (sad, anxious, stressed, happy)
- Respond empathetically
- Ask follow-up questions
- Provide helpful suggestions
- Detect crisis situations (self-harm mentions) and show helplines

### 3. Future Mirror

This feature shows users what could happen if they changed habits:

```
Current Lifestyle:
  Stress: 65 | Energy: 45 | Happiness: 50

If you add "Meditation" for 6 months:
  Stress: 45 | Energy: 51 | Happiness: 62
```

### 4. Insights Dashboard

Shows:
- Average stress levels
- Best day ever
- Weekly/monthly trends (charts)
- Sleep patterns

---

## The AI Counselor

### How It Understands You

1. **Mood Detection** - Looks for keywords:
   - "sad", "down", "depressed" → sad
   - "anxious", "worried", "panic" → anxious
   - "stressed", "overwhelmed" → stressed
   - "happy", "excited", "grateful" → happy

2. **Crisis Detection** - Looks for dangerous words:
   - "suicide", "kill myself", "self harm"
   - If found → Shows crisis helpline immediately

### How It Responds

The AI uses **Groq's LLM (Large Language Model)** - a powerful AI that understands and generates human-like text.

The AI is given a **system prompt** that tells it:
- Be empathetic and supportive
- Ask follow-up questions
- Offer practical suggestions
- Never be judgmental

### Fallback Responses

If the AI isn't working (no internet/API issue), the app has pre-written empathetic responses for each mood type. These are still helpful but less personalized.

---

## Database & Storage

MindGuide uses **JSON files** for storage. This is simpler than a database but works well for small-scale applications.

### users.json Structure
```json
[
  {
    "id": "unique-user-id",
    "email": "user@example.com",
    "password_hash": "$2b$12$hashedpassword...",
    "name": "John Doe",
    "age": 25,
    "intro": "Software developer...",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

### checkins.json Structure
```json
[
  {
    "id": "unique-checkin-id",
    "user_id": "user-id",
    "timestamp": "2024-01-01T10:30:00",
    "stress": 65,
    "focus": 70,
    "happiness": 55,
    "energy": 45,
    "sleep_hours": 6.5,
    "note": "Had a tough day at work"
  }
]
```

### chats.json Structure
```json
[
  {
    "id": "unique-message-id",
    "user_id": "user-id",
    "timestamp": "2024-01-01T10:30:00",
    "role": "user",
    "message": "I feel really sad today"
  },
  {
    "id": "unique-message-id",
    "user_id": "user-id",
    "timestamp": "2024-01-01T10:30:05",
    "role": "assistant",
    "message": "I'm sorry you're feeling this way...",
    "mood": "sad",
    "is_crisis": false
  }
]
```

---

## Security

### Password Security
- Passwords are **hashed** using BCrypt
- Hashing = One-way encryption (can't reverse)
- Even if someone steals the database, they can't read passwords

### Authentication
- JWT (JSON Web Tokens) used for login
- Token contains user ID, expires after time
- Token must be sent with every request

### CORS (Cross-Origin Resource Sharing)
- The backend allows requests from the frontend domain
- Prevents other websites from accessing your data

---

## How to Run Locally

### Prerequisites
- Python 3.9+ installed
- Node.js installed
- Git installed

### Step 1: Clone the Repository
```bash
git clone https://github.com/samradhiii/Mind-guide.git
cd Mind-guide
```

### Step 2: Set Up Backend

```bash
cd mind-guide/backend

# Create virtual environment
python -m venv .venv

# Activate it
# On Windows:
.venv\Scripts\activate

# On Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

### Step 3: Set Up Frontend

```bash
# Open new terminal
cd mind-guide/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Step 4: Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## How to Deploy

### Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repo
5. Set Root Directory to: `mind-guide/backend`
6. Add Environment Variable:
   - Name: `GROQ_API_KEY`
   - Value: your-groq-api-key
7. Click "Deploy"

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Set Root Directory to: `mind-guide/frontend`
5. Update `api.js` with your backend URL
6. Click "Deploy"

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/signup` | Create new account | `{email, password, name, age, intro}` |
| POST | `/login` | Login to account | `{email, password}` |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user info |
| PUT | `/profile` | Update user info |

### Wellness

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/checkin` | Submit daily check-in |
| GET | `/insights` | Get wellness insights |

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Send message to AI |
| GET | `/chat` | Get chat history |

### Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/simulate` | Simulate habit changes |

---

## Common Issues & Solutions

### Issue: "Failed to Fetch"
**Cause:** Frontend can't reach backend
**Fix:** Check that `API_BASE` in `api.js` matches your deployed backend URL

### Issue: "CORS Error"
**Cause:** Backend not allowing frontend domain
**Fix:** Update `allow_origins` in main.py to include your domain

### Issue: AI not responding
**Cause:** `GROQ_API_KEY` not set or invalid
**Fix:** Add the environment variable in Vercel backend settings

### Issue: 404 Not Found
**Cause:** Wrong root directory in deployment
**Fix:** Set root directory to `mind-guide/backend` or `mind-guide/frontend`

---

## Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - How two programs talk to each other |
| **JWT** | JSON Web Token - A secure way to verify user identity |
| **Frontend** | The part of an app users see and interact with |
| **Backend** | The server-side logic that processes data |
| **React** | A JavaScript library for building user interfaces |
| **FastAPI** | A Python web framework for building APIs |
| **CORS** | Cross-Origin Resource Sharing - Security feature for web requests |
| **LLM** | Large Language Model - AI that understands and generates text |
| **JSON** | JavaScript Object Notation - Format for storing data |
| **Vercel** | Cloud platform for deploying web apps |

---

## Credits

Built with love for mental wellness 💜

- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- AI: Groq LLM (llama-3.1-8b-instant)
- Icons: Lucide React
- Charts: Chart.js

---

*Last Updated: April 2026*

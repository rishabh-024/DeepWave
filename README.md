# DeepWave

DeepWave is a full-stack emotional wellness platform that helps people slow down, reflect on how they feel, and listen to soundscapes that match their current state of mind.

At its core, the project asks a simple question: what if music and ambient sound could respond to emotion in a more personal way? Instead of making users scroll through a generic list of tracks, DeepWave begins with mood, reflection, and conversation, then turns that into a guided listening experience.

## What DeepWave Does

DeepWave combines sound therapy, mood tracking, and lightweight AI support in one experience.

Users can:

- create an account and log in securely
- explore a library of calming tracks and soundscapes
- log their mood with optional notes
- receive music recommendations based on how they feel
- chat with a wellness companion that suggests supportive tracks
- view recent mood history and simple well-being stats
- listen to audio directly inside the app with a built-in player

Admins can:

- upload new audio files and cover images
- manage the track library
- remove tracks that are no longer needed
- monitor basic platform activity from the profile/admin area

## Why This Project Matters

A lot of wellness products either feel too clinical or too generic. DeepWave tries to sit in the middle. It is designed to feel calm, human, and accessible while still using real engineering to personalize the experience.

This project is not trying to replace therapy or medical care. It is a supportive digital experience built around emotional awareness, reflection, and intentional listening.

## How The Experience Works

### 1. A user starts with how they feel

Inside the dashboard, the user selects a mood such as happy, calm, stressed, angry, or sad. They can also add notes about what is on their mind.

### 2. DeepWave responds with something useful

The backend stores the mood entry, selects matching tags, and returns a short set of recommended tracks plus a motivational quote.

### 3. The user can go deeper through chat

Authenticated users can open the wellness companion and type messages like:

- "I am feeling stressed"
- "I need to focus"
- "Suggest something calming"

The system analyzes that message, identifies likely intent or emotion, and replies with supportive text plus playable recommendations.

### 4. Audio becomes part of the wellness loop

Tracks can be streamed directly in the app. The player supports play/pause, seeking, volume, playlist context, shuffle, and repeat.

### 5. The dashboard closes the loop

Users can review recent mood history and see simple stats such as:

- moods logged
- calm score
- longest streak
- weekly average

## Key Features

### Emotion-first recommendations

The app does not treat sound as a static library. It maps moods and chat intent to relevant tags, then recommends tracks that fit the user's emotional context.

### Wellness companion chat

DeepWave includes a chat assistant for logged-in users. It offers supportive replies and track suggestions based on emotional cues in the user's message.

### Hybrid NLP approach

The NLP service can use an OpenAI API key when available, but the system also includes fallback keyword and rule-based logic. That means the feature still works in a basic form even if the external AI provider is unavailable.

### Sound library and streaming

Tracks are stored in MongoDB with metadata such as title, category, tags, artist, and media location. Uploaded audio can be streamed through the backend using GridFS.

### Admin content management

DeepWave includes an admin-only workflow for uploading new tracks, attaching cover art, searching the catalog, and deleting tracks safely.

### Calm, modern interface

The frontend is built with React, Vite, Tailwind CSS, and Framer Motion. The visual design aims to feel soft, immersive, and emotionally aligned with the product idea.

## Architecture

DeepWave is organized as three main services:

### Frontend

- React 19 + Vite
- Runs on port `5173`
- Handles the public website, dashboard, player, profile, community page, and admin UI

### Backend API

- Node.js + Express
- Runs on port `4000`
- Manages authentication, mood logs, tracks, chat orchestration, stats, uploads, and audio streaming

### NLP Service

- Node.js + Express
- Runs on port `5001`
- Handles text analysis for emotional intent
- Supports Socket.IO and HTTP-based analysis endpoints

### Database

- MongoDB
- Stores users, moods, tracks, and uploaded media references

## Tech Stack

**Frontend**

- React
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

**Backend**

- Node.js
- Express
- MongoDB / Mongoose
- JWT authentication
- Joi validation
- bcrypt password hashing
- Helmet
- express-rate-limit
- Winston logging

**NLP / AI**

- OpenAI API (optional)
- node-nlp
- custom keyword and intent fallback logic
- Socket.IO

## Project Structure

```text
DeepWave/
|-- frontend/       # React client
|-- backend/        # Express API + MongoDB integration
|-- nlp-service/    # Emotion analysis microservice
|-- README.md
```

## Main User Flows

### Public visitor

- lands on the home page
- explores the sound library
- reads the community page
- signs up or logs in to unlock personalized features

### Logged-in user

- opens the dashboard
- logs a mood and optional notes
- receives recommended tracks and a quote
- uses the wellness chatbot for more guided suggestions
- listens through the built-in player
- checks history and profile stats

### Admin

- opens the admin console
- uploads new sound files and metadata
- manages the content library
- monitors high-level platform activity

## Important API Areas

Here are the main route groups in the backend:

- `/api/auth` - register, login, current user
- `/api/tracks` - list tracks and track details
- `/api/mood` - log mood and fetch history
- `/api/recommendations` - mood-aware recommendations
- `/api/chat` - supportive chat replies with track suggestions
- `/api/stats` - dashboard and profile statistics
- `/api/sounds` - admin upload, streaming, and deletion
- `/api/process` - audio processing simulation endpoint
- `/healthz` - health check

The NLP service exposes:

- `/api/analyze-text`
- `/healthz`

## Local Setup

### Prerequisites

Make sure you have these installed:

- Node.js
- npm
- MongoDB

### 1. Install dependencies

Run these commands from the project root:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../nlp-service
npm install
```

### 2. Create environment files

This repository currently uses local `.env` files for each service.

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/deepwave
JWT_SECRET=replace_with_a_strong_secret
CORS_ORIGINS=http://localhost:5173
NLP_SERVICE_URL=http://localhost:5001
NLP_SERVICE_TIMEOUT=3000
```

Create `nlp-service/.env`:

```env
PORT=5001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4000
OPENAI_API_KEY=your_openai_key_optional
LOG_LEVEL=info
```

If `OPENAI_API_KEY` is not provided, the NLP service will still run using fallback logic.

### 3. Start MongoDB

Make sure your local MongoDB server is running before starting the backend.

### 4. Run the services

Start the backend:

```bash
cd backend
npm run dev
```

Start the NLP service:

```bash
cd nlp-service
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

### 5. Open the app

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/healthz`
- NLP health check: `http://localhost:5001/healthz`

## What Makes DeepWave Interesting For Judges

DeepWave is more than a landing page or a basic CRUD project. It demonstrates:

- full-stack integration across frontend, backend, database, and AI/NLP layers
- a real product idea with clear emotional and user-centered intent
- protected user flows with authentication and role-based admin access
- media upload and audio streaming, not just text-based records
- graceful fallback design when AI services are unavailable
- a polished interface that tries to match the emotional purpose of the product

In short, this project combines product thinking, user empathy, and practical engineering.

## Current Scope And Future Improvements

The current version already supports the main experience, but there is room to grow. Good next steps would be:

- more advanced mood analysis and personalization
- richer user profiles and listening insights
- stronger community interaction features
- playlist saving and favorites
- test coverage across frontend and backend
- deployment-ready environment templates and production docs

## Final Note

DeepWave was built around a simple belief: technology can feel more caring when it starts by listening.

That is the idea behind the whole project. Not just playing audio, but creating a space where emotion, reflection, and sound work together in a way that feels personal.

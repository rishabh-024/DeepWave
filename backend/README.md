# DeepWave Backend - Starter

## Overview
Express + Mongoose backend for DeepWave (sound-therapy).
Designed to run locally without paid services.

## Quick start (local MongoDB)
1. Install Node >= 16, and MongoDB Community (or use MongoDB Atlas free tier)
2. Copy `.env.example` -> `.env` and edit values
3. `npm install`
4. `npm run seed` (loads sample tracks)
5. `npm run dev` (requires nodemon) or `npm start`

## Endpoints (summary)
- `POST /api/auth/register` - register { name, email, password }
- `POST /api/auth/login` - login { email, password }
- `GET  /api/tracks` - list tracks (query: category, q, limit)
- `GET  /api/tracks/:id` - track details
- `POST /api/mood/analyze` - protected: { text }
- `POST /api/recommendations` - protected: { emotion }

## Notes
- This starter uses a simple rule-based mood analyzer; swap in an ML service later.
- No paid services required: run MongoDB locally or use free MongoDB Atlas.
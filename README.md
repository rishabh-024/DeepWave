# DeepWave

A full-stack sound therapy application with mood tracking, music recommendations, and AI-powered chat for mental well-being.

## Architecture

- **Frontend**: React + Vite with liquid glass design (Port 5173)
- **Backend**: Node.js + Express + MongoDB with clustering (Port 4000)
- **NLP Service**: Node.js + OpenAI API for real-time emotion analysis (Port 5001)
- **Mobile**: React Native + Expo for Android/iOS
- **Database**: MongoDB with optimized schemas (Port 27017)

## Production Deployment

### Prerequisites
- Docker & Docker Compose
- Domain and SSL certificates
- Cloud storage for files (e.g., AWS S3)
- Redis for caching (optional)

### Environment Setup
1. Copy `.env.example` to `.env` in each service directory.
2. Fill in production values:
   - Database URI
   - JWT secrets
   - API keys (OpenAI, etc.)
   - CORS origins

### Docker Deployment
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling
- Backend uses clustering for multi-core utilization.
- NLP service has rate limiting and Socket.IO for real-time.
- Use load balancer (e.g., Nginx) for multiple instances.

## Mobile App

### Setup
1. Install Expo CLI: `npm install -g @expo/cli`
2. Navigate to `mobile/`: `npm install`
3. Run: `expo start`

### Build
- Android: `expo build:android`
- iOS: `expo build:ios`

## Features

- User authentication with JWT
- Mood logging with intensity tracking
- Personalized music recommendations
- Audio streaming with GridFS
- AI chat for emotional support
- Real-time NLP analysis
- Liquid glass UI design
- PWA support for mobile web

## API Documentation

See `backend/README.md` for API endpoints.

## Security

- Helmet for security headers
- Rate limiting
- Input validation with Joi
- CORS configuration
- Password hashing with bcrypt

## Monitoring

- Winston logging with daily rotation
- Health checks at `/healthz`
- Error tracking (integrate with Sentry)
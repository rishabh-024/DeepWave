FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --only=production

# Copy source code + model
COPY . .

# Expose NLP service port
EXPOSE 5001

# Start service
CMD ["node", "src/app.js"]

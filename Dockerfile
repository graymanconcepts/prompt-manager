# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Create volume for SQLite database
VOLUME ["/app/data"]

# Expose ports for Vite and Express
EXPOSE 5173 3000

# Start the application
CMD ["npm", "start"]

# Use Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create data directory for SQLite database and sessions
RUN mkdir -p /app/data /app/sessions

# Expose port
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8888

# Start the application
CMD ["node", "app.js"]

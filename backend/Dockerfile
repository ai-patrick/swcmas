# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies based on package.json
COPY package.json package-lock.json* ./
RUN npm ci --production

# Bundle app source
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
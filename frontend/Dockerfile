# Frontend Dockerfile for Fly.io
# Stage 1: Build React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Stage 2: Serve with Express
FROM node:18-alpine

WORKDIR /app

# Install serve or create simple Express server
RUN npm install express compression

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create simple Express server
RUN echo 'const express = require("express");\n\
const compression = require("compression");\n\
const path = require("path");\n\
const app = express();\n\
const PORT = process.env.PORT || 3000;\n\
\n\
app.use(compression());\n\
app.use(express.static("dist"));\n\
\n\
app.get("*", (req, res) => {\n\
  res.sendFile(path.join(__dirname, "dist", "index.html"));\n\
});\n\
\n\
app.listen(PORT, () => {\n\
  console.log(`Frontend running on port ${PORT}`);\n\
});' > server.js

EXPOSE 3000

CMD ["node", "server.js"]

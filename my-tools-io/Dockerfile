# ---- Stage 1: Build the Application ----
# Use an official Node.js runtime as the base image. 
# 'alpine' is a lightweight version of Linux.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# This step is cached by Docker, so 'npm install' only runs when dependencies change.
COPY package*.json ./

# Install project dependencies
# 'npm ci' is often preferred in CI/CD for faster, more reliable builds
RUN npm ci

# Copy the rest of your application's source code
COPY . .

# Build the application for production
# This will create a 'dist' folder with your static files.
RUN npm run build

# ---- Stage 2: Serve the Application with Nginx ----
# Use a lightweight Nginx server as the final base image
FROM nginx:stable-alpine

# Copy the build output from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom Nginx configuration file
# This is crucial for making React Router work correctly.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Cloud Run
EXPOSE 8080

# The command to start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
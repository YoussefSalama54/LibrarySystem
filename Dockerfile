# Use official Node.js LTS image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Ensure the exports folder exists inside container
RUN mkdir -p exports

# Expose Node.js server port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]

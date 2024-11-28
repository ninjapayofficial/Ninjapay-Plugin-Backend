# Use an official Node.js runtime as the base image
FROM node:20.17.0

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application (if applicable)
# RUN npm run build

# Expose the port your app runs on (e.g., 3000)
EXPOSE 3000

# Define the command to run your app
CMD ["npm", "start"]

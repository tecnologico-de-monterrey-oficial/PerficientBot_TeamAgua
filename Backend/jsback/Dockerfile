# Specify the base image
FROM node:18.15.0

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Start the application
CMD [ "npm", "start" ]

# Expose the port
EXPOSE 3000
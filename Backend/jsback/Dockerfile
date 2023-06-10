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

# Expose the port
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]

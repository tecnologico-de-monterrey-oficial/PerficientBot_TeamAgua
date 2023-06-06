# # Specify the base image
# FROM node:18.15.0

# # Set working directory in the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Bundle app source
# COPY . .

# # Start the application
# CMD [ "npm", "start" ]

# # Expose the port
# EXPOSE 3000

FROM debian:bullseye

RUN apt-get update
RUN apt-get install -y curl make g++
RUN curl -sL http://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

ADD . /

RUN npm install
EXPOSE 8080

CMD ["npm", "start"]
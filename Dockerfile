# Select OS/Environment
FROM node:22-alpine AS build

# Choose working directory inside docker
WORKDIR /app

# copy package.json to install npm packages inside docker
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 
#download nginx
FROM nginx:stable-alpine


# port Exposure
EXPOSE 5050

# ENTRY point
CMD ["node", "server.js"]

# docker build -t backend-app .
# docker run -d -p 5006:5050 --name backend backend-app
# docker ps -a
# docker stop CONTAINER_ID
# docker rm CONTAINER_ID

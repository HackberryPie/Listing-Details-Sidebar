FROM node:8

# Create app directory
WORKDIR /client/src

#install app dependencies
# A wildcard is used to ensure both pack.json AND
# packge-lock.json are copies
# where available
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3012

CMD ["npm", "start"]


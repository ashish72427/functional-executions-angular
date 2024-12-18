FROM node:latest
 
WORKDIR /usr/src/app
 
COPY ./ /usr/src/app
 
RUN npm i cors --legacy-peer-deps
 
EXPOSE 3500
 
CMD ["node","/usr/src/app/oauth-server/server.js"]
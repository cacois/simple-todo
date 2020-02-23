FROM node:13.8.0

ADD node_modules /opt/simple-todo/node_modules
ADD public /opt/simple-todo/public
ADD app.js /opt/simple-todo

WORKDIR /opt/simple-todo
USER 1001
CMD node app.js

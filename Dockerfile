FROM jakechampion/heroku-nodejs
RUN npm i -g bower
RUN bower install --allow-root 
RUN gulp build

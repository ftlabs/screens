## Screens

### Development

#### Prerequisites
- [NodeJS](nodejs.org)
- [Bower](https://www.npmjs.com/package/bower)
- [Heroku Toolbelt](https://toolbelt.heroku.com/)

#### Setting up development environment
- Clone the repository -- `git clone git@github.com:ftlabs/screens.git`
- Change in repository directory -- `cd screens`
- Install project dependencies -- `bower install && npm install`
- Start the web server -- `npm start`
- Open the website in your browser of choice -- `open "localhost:3010"`

### Deploying
We are using [Haikro](https://github.com/matthew-andrews/haikro) for deployment (avoids having to push developer tools to Heroku).

- Deploy a new release to test using -- `npm run deploy:test`
- Deploy a new release to production using -- `npm run deploy:prod`

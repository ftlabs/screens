## Screens

### Development

#### Prerequisites
- [NodeJS](nodejs.org)
- [Bower](https://www.npmjs.com/package/bower)
- [Heroku Toolbelt](https://toolbelt.heroku.com/)
- [Java Development Kit](http://www.oracle.com/technetwork/java/javase/downloads/index.html) -- Used for testing.

#### Setting up development environment
- Clone the repository -- `git clone git@github.com:ftlabs/screens.git`
- Change in repository directory -- `cd screens`
- Install project dependencies -- `bower install && npm install`
- Start the web server -- `npm start`
- Open the website in your browser of choice -- `open "localhost:3010"`

#### Tests

*Warning* Some tests may fail due to flakiness in the integration tests. This makes them unreliable for finding intermittent bugs, e.g. due to the clock or race conditions. 

You may have to run the tests again to get them to pass.

If they fail a second time run them a third and any consistently failing tests probably indicate an error and will need further investigation.

The integration tests have been written as robustly as possible but due to complexities in performing web driver tests over two tabs at the same time.

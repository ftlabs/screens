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


#### Deployment to live

... having deployed to test, and tested there

##### prep

- announce via #ftlabs that we are updating the Screens system
- open /admin view in a laptop browser tab
   - ditto a /viewer view
- open/check the Labs' Intel Compute Stick instance (electron instance)

##### deploy!

- deploy to Heroku (early in the working day so we can spot and pick up any pieces)
   - check heroku is happy
   - look for reconnects in logs

##### check

- side by side, open up 2nd /admin view, compare
   - refresh the /viewer via the new /admin view
   - assign new content to the /viewer
   - connect a new /viewer via incognito mode, assign content
- check the IntelComputeStick
   - refresh the screen via /admin, check
   - power off/on the IntelComputeStick, check
   - refresh the screen via /admin, check
- take a laptop/smartphone to the nearest lift lobby
   - refresh the lobby screen via /admin, check
   - power on/off the lobby screen, check
   - refresh the lobby screen via /admin, check
- refresh all screens
   - check all the lift lobby and entrance screens
- fret

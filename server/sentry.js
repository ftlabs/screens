const isProduction = process.env.NODE_ENV === 'production';
const SENTRY_DSN = process.env.SENTRY_DSN;
const raven = require('raven');
const client = new raven.Client(isProduction && SENTRY_DSN);

client.patchGlobal();

module.exports = client;
module.exports.requestHandler = raven.middleware.express.requestHandler(isProduction && SENTRY_DSN);
module.exports.errorHandler = raven.middleware.express.errorHandler(isProduction && SENTRY_DSN);

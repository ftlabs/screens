'use strict';
/**
 * redis.js
 *
 * Used to store Audit logs.
 */

const Redis   = require("redis");
const screens = require('./screens');

const MAX_LOG_LENGTH   = process.env.REDIS_LOG_LENGTH || 5000;
const LOG_KEY          = process.env.REDIS_LOG_KEY    || 'FTLABS_SCREENS_LOG';
const VIEW_LIST_LENGTH = 500;

const eventTypes = {
	screenDisconnected:      { id:  0, longDesc: 'Viewer Disconnected' },
	screenConnected:         { id:  1, longDesc: 'Viewer Connected' },
	screenReloaded:          { id:  2, longDesc: 'Viewer Reloaded' },
 	screenRenamed:           { id:  4, longDesc: 'Viewer Renamed' },
	screenContentAssignment: { id:  8, longDesc: 'New content has been added to the screen' },
	screenContentRemoval:    { id: 16, longDesc: 'Content has been removed from the screen' },
	screenContentCleared:    { id: 32, longDesc: 'All content has been cleared from the screen' },
	allScreensReloaded:      { id: 64, longDesc: 'All viewers were reloaded' }
};
let redis;

module.exports = {
	eventTypes, // Object
	logApi,     // Function
	logConnect, // Function
	renderView  // Function
};

if (process.env.REDISTOGO_URL || process.env.REDIS_PORT) {
	const rtg = require('url').parse(process.env.REDISTOGO_URL || process.env.REDIS_PORT);
	redis = Redis.createClient(rtg.port, rtg.hostname);
	if (rtg.auth) redis.auth(rtg.auth.split(":")[1]);
} else {
	redis = Redis.createClient();
}

function getTypeDescription(options) {
	const eventType = options.eventType;
	const screenId  = options.screenId;
	const username  = options.username;

	const event = Object.keys(eventTypes)
		.map(k => eventTypes[k])
		.filter(event => event.id === eventType)[0];

	let longDesc;

	if (!event) {
		longDesc = `No Description for request with eventType ${eventType}`;
	} else {
		longDesc = event.longDesc;
	}


	if (screenId) {
		longDesc = longDesc + `, on screen ${screenId}`;
		const data = screens.get(screenId);
		if (data && data.name) {
			longDesc += ` (${data.name})`;
		}
	}

	if (username) {
		longDesc = longDesc + `, by '${username}'`;
	}

	return longDesc;
}


function getMessageWrapper(options) {
	const eventType = options.eventType;
	const screenId  = options.screenId;
	const username  = options.username;

	return {
		timestamp: Date.now(),
		eventType,
		eventDesc: getTypeDescription({eventType, screenId, username}),
		screenId,
		username,
		details: {}
	};
}

function handleConnectErr(err) {
	if (/ECONNREFUSED/.test(err.message)) {
		console.error("Error connecting to redis, logs will be unavailable.");

		// stop reporting further errors.
		redis.removeListener("error", handleConnectErr);
		redis.end();
		redis = null;
	} else {
		console.log(err.message);
	}
}

redis.addListener("error", handleConnectErr);

function pushMessageAndTrimList(messageStr) {
	if (redis) {
		// as recommended in http://redis.io/commands/LTRIM
		redis.lpush(LOG_KEY, messageStr);
		redis.ltrim(LOG_KEY, 0, MAX_LOG_LENGTH - 1);
	}
}

function logApi(options) {
	const eventType = options.eventType;
	const screenId  = options.screenId;
	const username  = options.username;
	const details   = options.details;
	const message   = getMessageWrapper({
		eventType,
		screenId,
		username
	});
	message.details = details;
	pushMessageAndTrimList( JSON.stringify(message) );
	console.log(message.eventDesc);
}

function logConnect(options) {
	const eventType = options.eventType;
	const screenId  = options.screenId;
	const details   = options.details;
	const message   = getMessageWrapper({eventType, screenId});
	message.details = details;
	pushMessageAndTrimList( JSON.stringify(message) );
	console.log(message.eventDesc);
}

function renderView(req, res) {
	redis.lrange(LOG_KEY, 0, VIEW_LIST_LENGTH -1, function (error, logEntries) {

		if (error) {
			console.log(error);
			return res.render('error', {error, app: 'admin'});
		}

		const logs = logEntries.map(JSON.parse);

		logs.forEach(log => {

			// Don't use the stored one in case we update the descriptions.
			log.eventDesc = getTypeDescription(log);
		});

		logs.reverse();

		res.render('logs', {
			logs,
			app: 'logs'
		});
	});
}

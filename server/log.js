'use strict';
/**
 * redis.js
 *
 * Used to store Audit logs.
 */

const Redis = require("redis");
const logLength = 5000;
const logTrimInterval = 1000*3600; //Trim the logs hourly
const LOG_KEY = 'FTLABS_SCREENS_LOG';
const screens = require('./screens');

const eventTypes = {
	screenDisconnected: {
		id: 0,
		longDesc: 'Viewer Disconnected'
	},
	screenConnected: {
		id: 1,
		longDesc: 'Viewer Connected'
	},
	screenReloaded: {
		id: 2,
		longDesc: 'Viewer Reloaded'
	},
	screenRenamed: {
		id: 4,
		longDesc: 'Viewer Renamed'
	},
	screenContentAssignment: {
		id: 8,
		longDesc: 'New content has been added to the screen'
	},
	screenContentRemoval: {
		id: 16,
		longDesc: 'Content has been removed from the screen'
	},
	screenContentCleared: {
		id: 32,
		longDesc: 'All content has been cleared from the screen'
	},
	allScreensReloaded: {
		id: 64,
		longDesc: 'All viewers were reloaded'
	}
};
let redis;

module.exports = {
	eventTypes, // Object
	emptyLogs, // Function
	trimLogs, // Function
	logApi, // Function
	logConnect, // Function
	renderView // Function
};

if (process.env.REDISTOGO_URL) {
	const rtg   = require("url").parse(process.env.REDISTOGO_URL);
	redis = Redis.createClient(rtg.port, rtg.hostname);
	if (rtg.auth) redis.auth(rtg.auth.split(":")[1]);
} else {
	redis = Redis.createClient();
}

function getTypeDescription({eventType, screenId, username}) {
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


function getMessageWrapper({eventType, screenId, username}) {
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

function emptyLogs(cb) {
	if (redis) redis.del(LOG_KEY, cb || function () {});
}

function trimLogs(cb) {
	if (redis) redis.ltrim(LOG_KEY, 0, logLength - 1, cb || function () {});
}

setInterval(trimLogs, logTrimInterval);
trimLogs();


function logApi({
	eventType,
	screenId,
	username,
	details
}) {

	const message = getMessageWrapper({
		eventType,
		screenId,
		username
	});
	message.details = details;
	const messageStr = JSON.stringify(message);
	if (redis) redis.rpush(LOG_KEY, messageStr);
	console.log(message.eventDesc);
}

function logConnect({
	screenId,
	eventType
}) {

	const message = getMessageWrapper({eventType, screenId});
	const messageStr = JSON.stringify(message);
	if (redis) redis.rpush(LOG_KEY, messageStr);
	console.log(message.eventDesc);
}

function renderView(req, res) {
	redis.lrange(LOG_KEY, -500, -1, function (error, logs) {
		if (error) {
			return res.render('error', {error, app: 'admin'});
		}
		res.render('logs', {
			logs: logs.reverse().map(JSON.parse),
			app: 'logs'
		});
	});
}

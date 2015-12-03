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
const eventTypes = {
	SCREEN_DISCONNECTED: 0,
	SCREEN_CONNECTED: 1,
	SCREEN_CONTENT_ASSIGNMENT: 2,
	SCREEN_CONTENT_REMOVAL: 4
};
let redis;

if (process.env.REDISTOGO_URL) {
	const rtg   = require("url").parse(process.env.REDISTOGO_URL);
	redis = Redis.createClient(rtg.port, rtg.hostname);
	if (rtg.auth) redis.auth(rtg.auth.split(":")[1]);
} else {
	redis = Redis.createClient();
}

module.exports = {
	emptyLogs,
	trimLogs,
	eventTypes,
	log
}

function getTypeDescription(type) {
	switch (type) {
		case 0:
			return 'Viewer Disconnected';
		case 1:
			return 'Viewer Connected';
		case 2:
			return 'New content has been added to the screen.';
		case 4:
			return 'Content has been removed from the screen.';
	}
}

function getMessageWrapper(type, id) {
	return {
		timestamp: Date.now(),
		type,
		typeDesc: getTypeDescription(type, id),
		id,
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


function log({
	id,
	type
}) {

	const message = getMessageWrapper(type, id);
	console.log(message);
	// if (redis) redis.rpush(LOG_KEY, JSON.stringify(message));
}


/* global process, console */
'use strict';

const router = require('express').Router();
const debug = require('debug')('screens:api');
const screens = require('../screens');
const moment = require('moment');
const fetch = require('node-fetch');
const transform = require('../../client/common/js/urls');
const transformedUrls = {};
const log = require('../log');
const pages = require('../pages');

function cachedTransform( url, host ){
	var promise;
	if (url in transformedUrls) {
		console.log("cachedTransform: cache hit: url=", url);
		promise = Promise.resolve( transformedUrls[url] );
	} else {
		console.log("cachedTransform: cache miss: url=", url);
		promise = transform( url, host)
			.then(function(transformedUrl){
				transformedUrls[url] = transformedUrl;
				return transformedUrl;
			})
		;
	}

	return promise;
}

function getScreenIDsForRequest(req) {
	return req.body.screens.split(',').map(function(n) { return parseInt(n, 10); });
}

router.post('/getShortUrl', function (req, res) {
	if (!req.body.id) return res.status(400).send("Missing ID");

	var longUrl = 'http://' + req.get('host') + '/admin?filter=' + req.body.id + '&redirect=true';
	var responsePromise = Promise.resolve({});

	if (process.env.BITLY_LOGIN && process.env.BITLY_API_KEY) {
		var postdata = {
			login: process.env.BITLY_LOGIN,
			apiKey: process.env.BITLY_API_KEY,
			longUrl: longUrl
		};
		var qs = Object.keys(postdata).reduce(function(a,k){ a.push(k+'='+encodeURIComponent(postdata[k])); return a }, []).join('&');
		responsePromise = fetch('https://api-ssl.bitly.com/v3/shorten', {
			method: 'POST',
			headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: qs
		}).then(function (respStream) {
			return respStream.json();
		}).then(function (data) {
			return data.data || {};
		});
	}

	return responsePromise.then(function(resp) {
		var response = {
			url: resp.url || longUrl
		};
		res.json(response);
	});
});

router.get('/transformUrl/:url', function(req, res, next){
	cachedTransform( req.params.url, req.get('host'))
	.then(function(tfmd_url){
		res.send(tfmd_url);
	})
	;
});

router.post('*', function (req, res, next) {
	if (!req.cookies.s3o_username) return res.status(403).send("Not logged in.");
	next();
});

router.post('/addUrl', function(req, res, next) {
	if (!req.body.url) return res.status(400).send("Missing url");
	cachedTransform(req.body.url, req.get('host'))
		.then(function(url){

			const ids = getScreenIDsForRequest(req);
			const dur = parseInt(req.body.duration, 10);

			// Ensure items with no schedule appear before each other but after scheduled content
			const dateTimeSchedule = req.body.dateTimeSchedule || parseInt(Date.now()/100, 10);

			// if dateTimeSchedule is not set have it expire after a certain amount of time
			// if the client or server time is incorrect then this will be wrong.
			screens.pushItem(ids, {
				url: url,
				expires: (dur !== -1) ? (req.body.dateTimeSchedule ? moment(dateTimeSchedule, 'x') : moment()).add(dur, 'seconds').valueOf() : undefined,
				dateTimeSchedule: dateTimeSchedule
			});

			debug(req.cookies.s3o_username + ' added URL '+req.body.url+' to screens '+ids);
			ids.forEach(id => {
				log.logApi({
					eventType: log.eventTypes.screenContentAssignment.id,
					screenId: id,
					username: req.cookies.s3o_username,
					details: {
						url: req.body.url
					}
				});
			});


			res.json(true);

		})
	;

});

router.post('/clear', function(req, res, next) {
	var ids = getScreenIDsForRequest(req);
	screens.clearItems(ids);
	debug(req.cookies.s3o_username + ' cleared screens ' + ids);
	ids.forEach(id => {
		log.logApi({
			eventType: log.eventTypes.screenContentCleared.id,
			screenId: id,
			username: req.cookies.s3o_username
		});
	});
	res.json(true);
});

router.post('/rename', function(req, res, next) {
	var name = req.body.name;
	var screen = screens.get(id)[0];
	var oldName = screen ? screen.name : 'No screen present';
	var id = getScreenIDsForRequest(req);
	debug(req.cookies.s3o_username + ' renamed screen ' + id[0] + ' to ' + name);
	log.logApi({
		eventType: log.eventTypes.screenRenamed.id,
		screenId: id[0],
		username: req.cookies.s3o_username,
		details: {
			newName: name,
			oldName
		}
	});
	screens.set(id, {name});
	res.json(true);
});

router.post('/remove', function(req, res, next) {

	const oldUrl = screens.get(req.body.screen)[0].items[req.body.idx].url;
	log.logApi({
		eventType: log.eventTypes.screenContentRemoval.id,
		screenId: req.body.screen,
		username: req.cookies.s3o_username,
		details: {
			item: req.body.idx,
			itemTitle: pages(oldUrl).getTitle(),
			itemUrl: oldUrl
		}
	});
	screens.removeItem(req.body.screen, req.body.idx);
	res.json(true);
});

router.post('/reload', function(req, res, next) {

	if(Object.keys(req.body).length !== 0){
		var ids = getScreenIDsForRequest(req);
		screens.reload(ids);
		ids.forEach(id => {
			log.logApi({
				eventType: log.eventTypes.screenReloaded.id,
				screenId: id,
				username: req.cookies.s3o_username
			});
		});
	} else {
		debug(req.cookies.s3o_username + ' reloaded all screens');
		screens.reload();
		log.logApi({
			eventType: log.eventTypes.allScreensReloaded.id,
			username: req.cookies.s3o_username
		});
	}

	res.json(true);
});

module.exports = router;

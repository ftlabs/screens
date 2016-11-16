'use strict'; //eslint-disable-line strict
const cache = require('lru-cache')({
	max: 10*1024*1024,
	length: function(n) { return n.length; },
	maxAge: 7*24*60*60*1000
});
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const debug = require('debug')('screens:pages');

module.exports = function(url) {

	let $;
	let source;

	function getTitle() {
		return null;
	}

	source = cache.get(url);
	if (!source) {
		fetch(url)
			.then(function(resp) { return resp.text(); })
			.then(function(body) {
				debug('Loaded URL '+url+' ('+body.length+'b)');
				cache.set(url, body);
				$ = cheerio.load(body);
			})
		;
	} else {
		$ = cheerio.load(source);
	}

	return {
		getTitle: getTitle
	};
};

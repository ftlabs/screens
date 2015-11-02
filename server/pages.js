'use strict';

var cache = require('lru-cache')({
	max: 10*1024*1024,
	length: function(n) { return n.length; },
	maxAge: 7*24*60*60*1000
});
var cheerio = require('cheerio');
var fetch = require('node-fetch');
var debug = require('debug')('screens:pages');

module.exports = function(url) {

	var $;
	var source;

	function getTitle() {
		return $ ? $('title').text() : null;
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

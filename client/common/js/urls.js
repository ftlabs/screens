'use strict';
var parseQueryString = require('query-string').parse,
	fetch = require('node-fetch');
var http = require('http');
var https = require('https');
var imageType = require('image-type');
var parseUrl = require('url').parse;

function isGenerator(url) {
	var isGeneratorRegex = /^(https?:\/\/[^\/]*(localhost:\d+|herokuapp.com))?\/generators\/.+/;
	return isGeneratorRegex.test(url);
}

function isYoutube(url) {
	var isYoutubeRegex = /^(https?:\/\/)?(www\.)youtube\.com/;
	return isYoutubeRegex.test(url);
}

function isImage(url){

	const isHttps = parseUrl(url).protocol === 'https:';
	const get = isHttps ? https.get.bind(https) : http.get.bind(http);

	return new Promise(function(resolve, reject) {

		get(url, function (res) {
			res.once('data', function (chunk) {
				res.destroy();
				const imageMimeType = imageType(chunk) ? imageType(chunk).mime : '';
				const isImage = imageMimeType ? imageMimeType.indexOf('image') > -1 : false;
				resolve(isImage);
			});
		})
		.on('error', function(e) {
  		console.log('Got error: ' + e.message);
			reject(e);
		});
	});
}

function isSupportedByImageService(url){
	var isAnImageRegex =/\.(jpg|jpeg|tiff|png)$/i;
	return isAnImageRegex.test(url);
}

function isFTVideo(url) {
	var isFTVidRegex = /^(https?:\/\/)?video\.ft\.com\/(\d{7,})(\/.*)?$/;
	return isFTVidRegex.test(url);
}

function transformYoutubePlaylist(queryParams) {
	return "https://www.youtube.com/embed/videoseries?autoplay=1&controls=0&loop=1&html5=1&showinfo=0&listType=playlist&list=" + queryParams.list;
}

function transformYoutubeVideo(queryParams) {
	return "https://www.youtube.com/embed/" + queryParams.v + "?autoplay=1&controls=0&loop=1&html5=1&showinfo=0&playlist=" + queryParams.v;
}

function transformYoutubeURL(queryParams, host){

	var resourceURI = queryParams.list || queryParams.v,
		mediaType = (queryParams.list) ? "playlist" : "video";

	return "http://" + host + "/generators/youtube?mediaURI=" + resourceURI + "&mediaType=" + mediaType;
}

function transformImageWithImageService(url, host) {
	var title = url.match(/[^/]+$/)[0];
	return "http://" + host + "/generators/image/?" + encodeURIComponent("https://image.webservices.ft.com/v1/images/raw/" + encodeURIComponent(url) + "?source=screens") + '&title=' + title;
}

function transformImage(url, host) {
	var title = url.match(/[^/]+$/)[0];
	return "http://" + host + "/generators/image/?" + encodeURIComponent(url) + '&title=' + title;
}

function tranformFTVideo(url, host) {
	var id = url.match(/\.com\/(\d{7,})/)[1];
	return "http://" + host + "/generators/ftvideo/?id=" + id;
}

module.exports = function transform (url, host) {
	var promise;

	if (isGenerator(url)) {
		console.log("transform: isGenerator, url=", url);
		promise = Promise.resolve(url);
	} else if (isYoutube(url)) {
		console.log("transform: isYoutube, url=", url);
		var queryParams = parseQueryString(url.split("?")[1]);

		if (queryParams.list || queryParams.v) {
			console.log("transform: isYoutube, url=", url);
			promise = Promise.resolve(transformYoutubeURL(queryParams, host));
		}  else {
			console.log("transform: isYoutube but not valid, url=", url);
			promise = Promise.resolve(url);
		}
	} else if (isFTVideo(url)){
		console.log("transform: isFTVideo, url=", url);
		promise = Promise.resolve(tranformFTVideo(url, host));
	} else {
		console.log("transform: unknown so checking isImage, url=", url);
		promise = isImage(url)
				.then(function(isImage){
					if(isImage){
						if (isSupportedByImageService(url)) {
							console.log("transform: isImage.isSupportedByImageService, url=", url);
							url = transformImageWithImageService(url, host);
						} else {
							console.log("transform: isImage not.isSupportedByImageService, url=", url);
							url = transformImage(url, host);
						}
					} else {
						console.log("transform: not isImage, url=", url);
					}

					return url;
					})
					.catch(err => {
						console.log(err);
					})
				;
	}

	return promise;
};

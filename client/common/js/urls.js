'use strict';
var parseQueryString = require('query-string').parse,
	fetch = require('node-fetch');

function isGenerator(url) {
	var isGeneratorRegex = /^(https?:\/\/[^\/]*(localhost:\d+|herokuapp.com))?\/generators\/.+/;
	return isGeneratorRegex.test(url);
}

function isYoutube(url) {
	var isYoutubeRegex = /^(https?:\/\/)?(www\.)youtube\.com/;
	return isYoutubeRegex.test(url);
}

function isImage(url){
	var isAnImageRegex =/\.(gif|jpg|jpeg|tiff|png)$/i;

	var lookup = {
		"ffd8ffe0": "jpeg",
		"ffd8ffe1": "jpeg",
		"47494638": "gif",
		"89504e47": "png"
	};

	return fetch(url)
			.then(function(responseStream){

				return new Promise(function(resolve, reject){

					var buff = undefined;

					responseStream.body.on('data', function(chunk){
						buff = new Buffer(chunk, 'utf8').toString('hex');
						responseStream.body.end(function(){
							if(buff !== undefined){
								resolve(buff.substring(0,8));
							} else {
								resolve();
							}
						});
					});

					responseStream.body.on('error', function(err){
						console.log(err);
						resolve();
					});

				});

			})
			.then(function(hexChunk) {
				if(hexChunk !== undefined){
					return (hexChunk.substring(0, 8) in lookup);
				} else {
					return false;
				}
			})
			.catch(err => {
				console.log(err);
			})
		;

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

'use strict'; //eslint-disable-line strict
const parseQueryString = require('query-string').parse;
const	fetch = require('node-fetch');

function isGenerator(url) {
	const isGeneratorRegex = /^(https?:\/\/[^\/]*(localhost:\d+|herokuapp.com))?\/generators\/.+/;
	return isGeneratorRegex.test(url);
}

function isYoutube(url) {
	const isYoutubeRegex = /^(https?:\/\/)?(www\.)youtube\.com/;
	return isYoutubeRegex.test(url);
}

function isImage(url){
	const lookup = {
		'ffd8ffe0': 'jpeg',
		'ffd8ffe1': 'jpeg',
		'47494638': 'gif',
		'89504e47': 'png'
	};

	return fetch(url)
			.then(function(responseStream){

				return new Promise(function(resolve){
					responseStream.body.on('data', function(chunk){
						const buff = new Buffer(chunk, 'utf8').toString('hex');
						responseStream.body.end(function(){
							if(buff !== undefined){
								resolve(buff.substring(0,8));
							} else {
								resolve();
							}
						});
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
		;

}

function isSupportedByImageService(url){
	const isAnImageRegex =/\.(jpg|jpeg|tiff|png)$/i;
	return isAnImageRegex.test(url);
}

function isFTVideo(url) {
	const isFTVidRegex = /^(https?:\/\/)?video\.ft\.com\/(\d{7,})(\/.*)?$/;
	return isFTVidRegex.test(url);
}

function transformYoutubeURL(queryParams, host){

	const resourceURI = queryParams.list || queryParams.v;
	const mediaType = (queryParams.list) ? 'playlist' : 'video';

	return 'http://' + host + '/generators/youtube?mediaURI=' + resourceURI + '&mediaType=' + mediaType;
}

function transformImageWithImageService(url, host) {
	const title = url.match(/[^/]+$/)[0];
	return 'http://' + host + '/generators/image/?' + encodeURIComponent('https://image.webservices.ft.com/v1/images/raw/' + encodeURIComponent(url) + '?source=screens') + '&title=' + title;
}

function transformImage(url, host) {
	const title = url.match(/[^/]+$/)[0];
	return 'http://' + host + '/generators/image/?' + encodeURIComponent(url) + '&title=' + title;
}

function tranformFTVideo(url, host) {
	const id = url.match(/\.com\/(\d{7,})/)[1];
	return 'http://' + host + '/generators/ftvideo/?id=' + id;
}

module.exports = function transform (url, host) {
	let promise;

	if (isGenerator(url)) {
		console.log('transform: isGenerator, url=', url);
		promise = Promise.resolve(url);
	} else if (isYoutube(url)) {
		console.log('transform: isYoutube, url=', url);
		const queryParams = parseQueryString(url.split('?')[1]);

		if (queryParams.list || queryParams.v) {
			console.log('transform: isYoutube, url=', url);
			promise = Promise.resolve(transformYoutubeURL(queryParams, host));
		} else {
			console.log('transform: isYoutube but not valid, url=', url);
			promise = Promise.resolve(url);
		}
	} else if (isFTVideo(url)){
		console.log('transform: isFTVideo, url=', url);
		promise = Promise.resolve(tranformFTVideo(url, host));
	} else {
		console.log('transform: unknown so checking isImage, url=', url);
		promise = isImage(url)
				.then(function(isImage){
					if(isImage){
						if (isSupportedByImageService(url)) {
							console.log('transform: isImage.isSupportedByImageService, url=', url);
							url = transformImageWithImageService(url, host);
						} else {
							console.log('transform: isImage not.isSupportedByImageService, url=', url);
							url = transformImage(url, host);
						}
					} else {
						console.log('transform: not isImage, url=', url);
					}

					return url;
					})
				;
	}

	return promise;
};

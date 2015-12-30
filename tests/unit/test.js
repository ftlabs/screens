'use strict'; //eslint-disable-line strict
/* global describe, it, before */

const expect = require('chai').expect;
const sinon = require('sinon');
const mockery = require('mockery');

describe('Detecting a Youtube URL and transform it into a generator URL', function(){

	let requestMock;
	const youtubeURLs = {
		video : 'https://www.youtube.com/watch?v=IXxZRZxafEQ',
		playlist : 'https://www.youtube.com/watch?v=sNhhvQGsMEc&list=PLFs4vir_WsTzcfD7ZE8uO3yX-GCKUk9xZ'
	};

	let transform;
	const host = 'ftlabs-screens.herokuapp.com';

	before(function () {
		requestMock = sinon.stub();
		mockery.registerMock('../request', requestMock);
		mockery.registerAllowable('../server/urls');
		mockery.enable({
			useCleanCache: true
		});
		transform = require('../../server/urls');
	});

	it('Should detect a Youtube video URL and create a URL to the Youtube generator specifying that it\'s a video', function(done){

		//^(https?:\/\/[^\/]*(ftlabs-herokuapp.com))?\/generators\/youtube\?mediaURI=*([a-zA-z]{11}|[a-zA-z_-]{34})

		transform(youtubeURLs.video, host).then(function(url){
			// console.log(url);
			expect(url).to.match(/^(https?:\/\/[^\/]*(ftlabs-screens.herokuapp.com))?\/generators\/youtube\?mediaURI=([A-Za-z]{11})\&mediaType=video$/);
			done();
		});

	});

	it('Should detect a Youtube playlist URI and create a URL to the Youtube generator specifying that it\'s a playlist', function(done){

		transform(youtubeURLs.playlist, host).then(function(url){
			// console.log(url);
			expect(url).to.match(/^(https?:\/\/[^\/]*(ftlabs-screens.herokuapp.com))?\/generators\/youtube\?mediaURI=([-_A-Za-z0-9]{34})\&mediaType=playlist$/);
			done();
		});

	});

});

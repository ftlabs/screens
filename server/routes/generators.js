const router = require('express').Router(); // eslint-disable-line new-cap
const showdown = require('showdown');
const converter = new showdown.Converter();
const cheerio = require('cheerio');
const fetch = require('node-fetch');

function applyCSP(res) {
	res.set('content_security_policy', 'default-src \'none\'; script-src \'self\'; connect-src \'self\'; img-src \'self\'; style-src \'self\';');
}

// List generators
router.get('/', function(req, res) {
  res.render('generators-home', {
		app:'admin'
	});
});

// Render a generator

const auth = require('../middleware/auth/'+(process.env.AUTH_BACKEND || 'ft-s3o'));

router.route('/').all(auth);
router.get('/layout', function(req, res) {
	if (req.query.layout !== undefined) {
		applyCSP(res);
		res.render('generators-layout-view', {
			title: req.query.title || 'Layout'
		});
	} else {
		res.render('generators-layout-admin', {
			app:'admin'
		});
	}
});

router.get('/carousel', function(req, res) {
	if (req.query.u !== undefined || req.query.d !== undefined ) {
		applyCSP(res);
		res.render('generators-carousel-view', {
			title: req.query.title || 'Carousel'
		});
	} else {
		res.render('generators-carousel-admin', {
			app:'generator-carousel-admin'
		});
	}
});

router.get('/markdown', function(req, res) {
	if (req.query.md !== undefined) {
		applyCSP(res);
		req.query.title = cheerio.load('<body>' + converter.makeHtml(decodeURIComponent(req.query.md)) + '</body>')('body').text();
		res.render('generators-markdown-view', req.query);
	} else {
		res.render('generators-markdown-admin', {
			app:'admin'
		});
	}
});

router.get('/image', function(req, res) {
	applyCSP(res);
	res.render('generators-image-viewer', {
		title: req.query.title || 'Image'
	});
});


router.get('/ftvideo', function(req, res) {
	if (req.query.id !== undefined) {
		applyCSP(res);
		fetch('http://next-video.ft.com/'+req.query.id)
			.then(function(respStream) {
				return respStream.json();
			})
			.then(function(data) {
				const largestRendition = data.renditions.sort(function(a, b) {
					return a.frameWidth < b.frameWidth;
				})[0];
				res.render('generators-ftvideo-viewer', {
					title: data.name,
					src: largestRendition.url
				});
			})
		;
	} else {
		res.send('To use FT video simply assign a video URL to the screen and the generator will be used automatically');
	}
});

router.get('/standby', function(req, res) {
	applyCSP(res);
	res.render('generators-standby-viewer', {
		title: req.query.title
	});
});

router.get('/ticker', function(req, res) {
	if (req.query.src !== undefined || req.query.msg !== undefined) {
		res.render('generators-ticker-viewer');
	} else {
		res.render('generators-ticker-admin', {
			app:'admin'
		});
	}
});

router.get('/rtc', function(req, res) {

	if (req.query.room !== undefined && req.query.id !== undefined) {
		res.render('generators-rtc-viewer', {
			app: 'generator-rtc-view'
		});
	} else {
		res.render('generators-rtc-creator', {
			app: 'generator-rtc-admin'
		});
	}

});

router.get('/empty-screen', function(req, res) {
	if (req.query.id !== undefined) {
		res.render('generators-id-viewer', {
			hostname: req.headers.host,
			id: req.query.id
		});
	}
});

router.get('/youtube', function(req, res) {
	res.render('generators-youtube-player', {
		vidID: req.query.mediaURI
	});
});

module.exports = router;

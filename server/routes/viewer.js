'use strict';

var router = require('express').Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('viewer', {
		app: 'viewer',
		hostname: req.headers.host,
		title: req.query.title
	});
});

module.exports = router;

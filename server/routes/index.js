'use strict';

var router = require('express').Router();

// GET home page
router.get('/', function(req, res, next) {
	res.render('viewer', {
		app: 'viewer',
		hostname: req.headers.host,
		title: req.query.title
	});
});

// Vanity redirect for screen filtering
router.get('/:id(\\d{3,5})', function(req, res) {
	res.redirect('/admin?filter='+req.params.id);
});

module.exports = router;

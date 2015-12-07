'use strict';

var router = require('express').Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('listen', {
		app : "listen"
	});
});

module.exports = router;

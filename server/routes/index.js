'use strict';

var router = require('express').Router();
var auth = require('../middleware/auth');
var renderAdminPage = require('../renderAdminPage');

router.route('/').all(auth);

// GET home page
router.get('/', renderAdminPage);

// Vanity redirect for screen filtering
router.get('/:id(\\d{3,5})', function(req, res) {
	res.redirect('/admin?filter='+req.params.id);
});

module.exports = router;

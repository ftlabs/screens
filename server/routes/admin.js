'use strict';

var router = require('express').Router();

var auth = require('../middleware/auth');

var renderAdminPage = require('../renderAdminPage');

router.route('/').all(auth);
router.get('/', renderAdminPage);

module.exports = router;

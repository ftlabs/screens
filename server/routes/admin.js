const router = require('express').Router(); // eslint-disable-line new-cap

const auth = require('../middleware/auth');

const renderAdminPage = require('../renderAdminPage');

router.route('/').all(auth);
router.get('/', renderAdminPage);

module.exports = router;

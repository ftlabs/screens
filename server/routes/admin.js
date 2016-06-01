const router = require('express').Router(); // eslint-disable-line new-cap

const auth = require('../middleware/auth/'+(process.env.AUTH_BACKEND || 'ft-s3o'));

const renderAdminPage = require('../renderAdminPage');

router.route('/').all(auth);
router.get('/', renderAdminPage);

module.exports = router;

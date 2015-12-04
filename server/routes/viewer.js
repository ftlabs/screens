const router = require('express').Router(); // eslint-disable-line new-cap

/* GET home page. */
router.get('/', function(req, res) {
	res.render('viewer', {
		app: 'viewer',
		hostname: req.headers.host,
		title: req.query.title
	});
});

module.exports = router;

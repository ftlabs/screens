const authS3O = require('s3o-middleware');

module.exports = function(req, res, next) {
	if (req.originalUrl.indexOf('/generators/') === 0 && Object.keys(req.query).length !== 0) {
		next();
	} else if (req.query.redirect === 'true') {
		next();
	} else {
		authS3O(req, res, next);
	}
};

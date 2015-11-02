"use strict";
var screens = require('./screens');

module.exports = function renderAdminPage(req, res, next) {
	var title = '';

	if (req.query.filter) {
		var name = screens.get(req.query.filter).map(function(screen) {
			return screen.name || screen.id;
		})[0];

		if (name) {
			title = name + ' : FT Screens';
		}
	}

	res.render('admin', {
		app:'admin',
		screens: screens.get().sort(function(a,b) {
			a = a.name || "Screen #" + a.id;
			b = b.name || "Screen #" + b.id;

			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		}),
		filter: req.query.filter,
		title: title,
		redirect: req.query.redirect
	});
};

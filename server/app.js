/* global __dirname */
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const morganLogger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const moment = require('moment');
const debug = require('debug')('screens:app');
const cookie = require('cookie');
const pages = require('./pages');
const screens = require('./screens');

const app = express();

// Create Socket.io instance
app.io = require('socket.io')();
screens.setApp(app);

// Use Handlebars for templating
const hbs = exphbs.create({
	defaultLayout: 'main',
	helpers: {
		ifEq: function(a, b, options) { return (a === b) ? options.fn(this) : options.inverse(this); },
		join: function(arr) { return [].concat(arr).join(', '); },
		htmltitle: function(url) { return pages(url).getTitle() || url; },
		revEach: function(context, options) { return context.reduceRight(function(acc, item) { acc += options.fn(item); return acc; }, ''); },
		relTime: function(time) { return moment(time).fromNow(); },
		toLower: function(str) { return String(str).toLowerCase(); },
	}
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.hbs = hbs;

// Write HTTP request log using Morgan
app.use(morganLogger('dev'));

// Parse requests for body content and cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files
app.use(favicon(path.join(__dirname, '../public/favicon.ico')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/bower_components', express.static(path.join(__dirname, '../bower_components')));

// Serve routes
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));
app.use('/viewer', require('./routes/viewer'));
app.use('/generators', require('./routes/generators'));

app.all('*', function(req, res, next) {
	res.set('Access-Control-Allow-Origin', '*');
	res.set('Access-Control-Allow-Methods', 'GET, POST');
	res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
	res.set('Strict-Transport-Security', 'max-age=0;');
	next();
});

const previouslySeenScreens = {};

// Serve websocket connections
app.io.on('connection', function(socket) {

	if(socket.handshake.headers.cookie !== undefined){

		const cookies = cookie.parse(socket.handshake.headers.cookie);

		if (cookies.electrondata !== null && cookies.electrondata !== undefined) {
			const id = JSON.parse(cookies.electrondata).id;

			console.log(id);
			if (id in previouslySeenScreens) {
				console.log('seen', id);
			} else {
				console.log('not seen', id, 'reloading screen');
				socket.emit('reload');
				previouslySeenScreens[id] = true;
			}
		};

	}

});

app.io.of('/screens').on('connection', function(socket) {
	screens.add(socket);
	socket.emit('heartbeat');
	debug('connection started');
	socket.on('heartbeat',function() {
		socket.emit('heartbeat');
	});
});

app.io.of('/admins').on('connection', function(socket) {
	screens.generateAdminUpdate().then(function(updates) {
		socket.emit('allScreensData', updates);
	});
});

// Catch anything not served by a defined route and return a 404
app.use(function(req, res, next) {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;

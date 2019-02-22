/* global console */
'use strict'; //eslint-disable-line strict
const fs = require('fs');
const gulp = require('gulp');
const obt = require('origami-build-tools');
const spawn = require('child_process').spawn;
let node;

gulp.task('serve', gulp.series(done => {
	if (node) node.kill();
	node = spawn('bin/www', [], {stdio: 'inherit'});
	console.log('Spawned server as PID '+node.pid);
	node.on('exit', function (code, signal) {
		console.log('Service exit. '+code+' '+signal);
		done()
	});
	node.on('close', function (code, signal) {
		console.log('Service close I/O. '+code+' '+signal);
	});
}));

function build(app) {
	const obtConfig = {
		buildFolder: `public/build/${app}`
	};

	const jsPath = `./client/${app}/js/main.js`
	if (fs.existsSync(jsPath)) {
		obtConfig.js = jsPath;
		obtConfig.buildJs = 'bundle.js';
	}

	const sassPath = `./client/${app}/scss/main.scss`
	if (fs.existsSync(sassPath)) {
		obtConfig.sass = sassPath
		obtConfig.buildCss = 'bundle.css';
	}

	return obt.build(gulp, obtConfig);
}

gulp.task('buildLogs', done => {
	build('logs');
	done();
});

gulp.task('buildAdmin', done => {
	build('admin');
	done();
});

gulp.task('buildViewer', done => {
	build('viewer');
	done();
});

gulp.task('buildGeneratorLayoutView', done => {
	build('generator-layout-view');
	done();
});

gulp.task('buildGeneratorLayoutAdmin', done => {
	build('generator-layout-admin');
	done();
});

gulp.task('buildGeneratorCarouselView', done => {
	build('generator-carousel-view');
	done();
});

gulp.task('buildGeneratorCarouselAdmin', done => {
	build('generator-carousel-admin');
	done();
});

gulp.task('buildGeneratorRtcView', done => {
	build('generator-rtc-view');
	done();
});

gulp.task('buildGeneratorRtcAdmin', done => {
	build('generator-rtc-admin');
	done();
});

gulp.task('buildGeneratorYoutube', done => {
	build('generator-youtube-player');
	done();
});

gulp.task('buildGenerators', gulp.parallel('buildGeneratorLayoutView', 'buildGeneratorLayoutAdmin', 'buildGeneratorCarouselView', 'buildGeneratorCarouselAdmin', 'buildGeneratorRtcView', 'buildGeneratorRtcAdmin', 'buildGeneratorYoutube'));

gulp.task('build', gulp.parallel('buildLogs', 'buildAdmin', 'buildViewer', 'buildGenerators'));

gulp.task('verify', done => {
	obt.verify(gulp, {

		// Files to exclude from Origami verify
		excludeFiles: [
			'!server/**',  // Server side code
			'!client/admin/scss/lib/**' //
		]
	});
	done();
});

gulp.task('watch', gulp.series('build', 'serve', done => {
	gulp.watch('./client/**/*', ['build']);
	gulp.watch('./server/**/*', ['serve']);
	gulp.watch('./views/**/*', ['serve']);
	done();
}));

gulp.task('default', gulp.series('verify', done => {
	gulp.run('watch');
	done();
}));

/* global console */
'use strict';

var gulp = require('gulp');
var obt = require('origami-build-tools');
var spawn = require('child_process').spawn;
var node;

gulp.task('serve', function() {
	if (node) node.kill();
	node = spawn('bin/start', [], {stdio: 'inherit'});
	console.log("Spawned server as PID "+node.pid);
	node.on('exit', function (code, signal) {
		console.log('Service exit. '+code+' '+signal);
	});
	node.on('close', function (code, signal) {
		console.log('Service close I/O. '+code+' '+signal);
	});
});

function build(app) {
	return obt.build(gulp, {
		js: './client/'+app+'/js/main.js',
		sass: './client/'+app+'/scss/main.scss',
		buildJs: 'bundle.js',
		buildCss: 'bundle.css',
		buildFolder: 'public/build/'+app
	});
}
gulp.task('buildAdmin', function() {
	return build('admin');
});

gulp.task('buildViewer', function() {
	return build('viewer');
});

gulp.task('buildListen', function() {
	return build('listen');
});

gulp.task('buildGeneratorLayoutView', function () {
	return build('generator-layout-view');
});

gulp.task('buildGeneratorLayoutAdmin', function () {
	return build('generator-layout-admin');
});

gulp.task('buildGeneratorCarouselView', function () {
	return build('generator-carousel-view');
});

gulp.task('buildGeneratorCarouselAdmin', function () {
	return build('generator-carousel-admin');
});

gulp.task('buildGeneratorRtcView', function () {
	return build('generator-rtc-view');
});

gulp.task('buildGeneratorRtcAdmin', function () {
	return build('generator-rtc-admin');
});

gulp.task('buildGeneratorYoutube', function () {
	return build('generator-youtube-player');
});

gulp.task('buildGenerators', ['buildGeneratorLayoutView', 'buildGeneratorLayoutAdmin', 'buildGeneratorCarouselView', 'buildGeneratorCarouselAdmin', 'buildGeneratorRtcView', 'buildGeneratorRtcAdmin', 'buildGeneratorYoutube']);

gulp.task('build', ['buildAdmin', 'buildViewer', 'buildListen', 'buildGenerators']);

gulp.task('verify', function() {
	return obt.verify(gulp, {

		// Files to exclude from Origami verify
		excludeFiles: [
			'!server/**',  // Server side code
			'!client/admin/scss/lib/**' //
		]
	});
});

gulp.task('watch', ['build', 'serve'], function() {
	gulp.watch('./client/**/*', ['build']);
	gulp.watch('./server/**/*', ['serve']);
	gulp.watch('./views/**/*', ['serve']);
});

gulp.task('default', ['verify'], function() {
	gulp.run('watch');
});

/* global console */
'use strict'; //eslint-disable-line strict
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const {spawn, execFile} = require('child_process');
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
	const obtArgs = [
		`--build-folder=${path.resolve('public', 'build', app)}`
	]

	const jsPath = path.resolve('client', app, 'js', 'main.js');
	if (fs.existsSync(jsPath)) {
		obtArgs.push(`--js=${jsPath}`);
		obtArgs.push(`--build-js=bundle.js`);
	}

	const sassPath = path.resolve('client', app, 'scss', 'main.scss');
	if (fs.existsSync(sassPath)) {
		obtArgs.push(`--sass=${sassPath}`);
		obtArgs.push(`--build-css=bundle.css`);
	}

	return new Promise((resolve, reject) => {
		execFile('obt', ['build', ...obtArgs], (error, stdout, stderr) => {
			console.log(stdout)
			process.stderr.write(stderr)
			if (error) {
				return reject(error)
			}
			resolve(stdout)
		})
	})
}

gulp.task('buildLogs', async done => {
	await build('logs');
	done();
});

gulp.task('buildAdmin', async done => {
	await build('admin');
	done();
});

gulp.task('buildViewer', async done => {
	await build('viewer');
	done();
});

gulp.task('buildGeneratorLayoutView', async done => {
	await build('generator-layout-view');
	done();
});

gulp.task('buildGeneratorLayoutAdmin', async done => {
	await build('generator-layout-admin');
	done();
});

gulp.task('buildGeneratorCarouselView', async done => {
	await build('generator-carousel-view');
	done();
});

gulp.task('buildGeneratorCarouselAdmin', async done => {
	await build('generator-carousel-admin');
	done();
});

gulp.task('buildGeneratorRtcView', async done => {
	await build('generator-rtc-view');
	done();
});

gulp.task('buildGeneratorRtcAdmin', async done => {
	await build('generator-rtc-admin');
	done();
});

gulp.task('buildGeneratorYoutube', async done => {
	await build('generator-youtube-player');
	done();
});

gulp.task('buildGenerators', gulp.parallel('buildGeneratorLayoutView', 'buildGeneratorLayoutAdmin', 'buildGeneratorCarouselView', 'buildGeneratorCarouselAdmin', 'buildGeneratorRtcView', 'buildGeneratorRtcAdmin', 'buildGeneratorYoutube'));

gulp.task('build', gulp.parallel('buildLogs', 'buildAdmin', 'buildViewer', 'buildGenerators'));

gulp.task('watch', gulp.series('build', 'serve', done => {
	gulp.watch('./client/**/*', ['build']);
	gulp.watch('./server/**/*', ['serve']);
	gulp.watch('./views/**/*', ['serve']);
	done();
}));

gulp.task('default', done => {
	gulp.run('watch');
	done();
});

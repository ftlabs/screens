'use strict';

module.exports = function(client) {

	const handles = {};

	// set the current tab to the admin page.
	const loaded = client
	.getCurrentTabId()
	.then(handle => handles.about = handle)
	.newWindow('/admin')
	.getUrl().then(url => console.log('New tab with url: ' + url))
	.waitForExist('h1.o-header__title')
	.getCurrentTabId()
	.then(handle => handles.admin = handle)
	.newWindow('/viewer')
	.getUrl().then(url => console.log('New tab with url: ' + url))
	.waitForExist('#hello .screen-id')
	.getCurrentTabId()
	.then(handle => handles.viewer = handle)
	.then(() => console.log(handles));

	console.log(loaded);
	
	// open a new tab set it to the viewer
	return {
		admin() {
			return loaded
			.getCurrentTabId()
			.then(id => {
				if (id !== handles.admin) {
					return loaded
					.switchTab(handles.admin)
					.getUrl().then(url => console.log('Switching to tab with url: ' + url));
				}
			});
		},
		viewer() {
			return loaded
			.getCurrentTabId()
			.then(id => {
				if (id !== handles.viewer) {
					return loaded
					.switchTab(handles.viewer)
					.getUrl().then(url => console.log('Switching to tab with url: ' + url));
				}
			});
		},
		about() {
			return loaded
			.getCurrentTabId()
			.then(id => {
				if (id !== handles.about) {
					return loaded
					.switchTab(handles.about)
					.getUrl().then(url => console.log('Switching to tab with url: ' + url));
				}
			});
		}
	}
};

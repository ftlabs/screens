'use strict';

module.exports = function(client) {

	const handles = {};

	// set the current tab to the admin page.
	const loaded = client
	.getCurrentTabId()
	.then(handle => handles.about = handle)
	.newWindow('/admin')
	.waitForExist('h1.o-header__title')
	.getCurrentTabId()
	.then(handle => handles.admin = handle)
	.newWindow('/viewer')
	.waitForExist('#hello .screen-id')
	.getCurrentTabId()
	.then(handle => handles.viewer = handle);

	function loadTab(name) {
		return loaded
		.getCurrentTabId()
		.then(id => {

			// if you try to switch to the current tab it will switch to the
			// first tab :/
			if (id !== handles[name]) {
				return loaded
				.switchTab(handles[name]);
			}
		});
	}
	
	// open a new tab set it to the viewer
	return {
		admin() {
			return loadTab('admin');
		},
		viewer() {
			return loadTab('viewer');
		},
		about() {
			return loadTab('about');
		}
	}
};

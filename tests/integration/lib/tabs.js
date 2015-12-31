'use strict';

module.exports = function(client) {

	const handles = {};

	// set the current tab to the admin page.
	const loaded = client
	.getCurrentTabId()
	.then(handle => handles.about = handle)
	.newWindow('/viewer')
	.getCurrentTabId()
	.then(handle => handles.viewer = handle)
	.newWindow('/admin')
	.getCurrentTabId()
	.then(handle => handles.admin = handle);

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
	
	const fnInterface = {
		admin() {
			return loadTab('admin');
		},
		viewer() {
			return loadTab('viewer');
		},
		about() {
			return loadTab('about');
		}
	};

	module.exports = function () {
		return fnInterface;
	}

	return fnInterface;
};

'use strict';

module.exports = function(client) {

	// set the current tab to the admin page.
	const tabs = {};
	let loaded = client;

	class Tab {
		constructor(name, {
			url,
			handle
		}) {
			if (url) loaded = loaded
			.newWindow(url)
			.getCurrentTabId()
			.then(handle => this.handle = handle);

			if (handle) {
				this.handle = handle;
			}

			tabs[name] = this;
		}

		ready() {
			return loaded();
		}

		switchTo() {
			loaded = switchTab(this.handle);
			return loaded;
		}

		close () {
			loaded = loaded.close(this.handle);
			return loaded;
		}
	}

	function switchTab(handle) {
		return loaded
		.getCurrentTabId()
		.then(id => {

			// if you try to switch to the current tab it will switch to the
			// first tab :/
			if (id !== handle) {
				return loaded
				.switchTab(handle);
			}
		});
	}

	const single = {
		Tab,
		tabs
	};

	module.exports = function () {
		return single;
	}

	return single;
};

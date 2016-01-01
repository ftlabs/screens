'use strict';

module.exports = function(client) {

	// set the current tab to the admin page.
	const tabs = {};
	let loaded = client;

	class Tab {
		constructor(name, options) {

			const url = options.url;
			const handle = options.handle;

			if (url) loaded = loaded
			.newWindow(url)
			.getCurrentTabId()
			.then(handle => {
				this.handle = handle;
			});

			if (handle) {
				this.handle = handle;
			}

			this.name = name;

			tabs[name] = this;
		}

		ready() {
			return loaded;
		}

		switchTo() {

			loaded = loaded
			.then(() => {
				console.log('Switching to ' + this.name + ': ' + this.handle);
			})
			.getCurrentTabId()
			.then(id => {
				if (id !== this.handle) {
					return client.switchTab(this.handle);
				}
			});

			return loaded;
		}

		close () {
			loaded = loaded.close(this.handle);
			delete(tabs[this.name]);
			return loaded;
		}
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

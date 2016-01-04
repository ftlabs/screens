'use strict';

function TabsController(client) {

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
			return loaded
			.then(() => this);
		}

		switchTo() {

			loaded = loaded
			.getCurrentTabId()
			.then(id => {
				if (id !== this.handle) {
					return client.switchTab(this.handle);
				}
			});

			return loaded
			.then(() => this);
		}

		close () {
			loaded = this.switchTo()
			.window()
			.then(() => {
				delete tabs[this.name];
			})
			.switchTab(); // go to next tab
			return loaded;
		}
	}

	const single = {
		Tab,
		tabs
	};

	return single;
};


let tabController;
function getTabController(client) {
	if (!tabController) {
		tabController = new TabsController(client);
	}
	return tabController;
}

module.exports = {
	getTabController
};

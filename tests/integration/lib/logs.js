'use strict';

module.exports = function(client) {
	return function () {
		return client.log('browser')
		.then(function (logs) {
			console.log('\nBROWSER LOGS:\n' + logs.value.map(v => `${v.timestamp}: ${v.message}`).join('\n'));
			return logs;
		});
	};
};

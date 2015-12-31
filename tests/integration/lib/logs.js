'use strict';

module.exports = function(client) {
	return function () {
		return client.log('browser')
		.then(function (logs) {
			return logs.value.map(v => `${(new Date(Number(v.timestamp))).toTimeString()}: ${v.message}`).join('\n');
		});
	};
};

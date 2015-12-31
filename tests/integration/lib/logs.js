'use strict';

module.exports = function(client) {
	return function () {
		return client.log('browser')
		.then(function (logs) {
			return logs.
				value
				.filter(i => !!i.message.trim())
				.map(v => `${(new Date(Number(v.timestamp))).toTimeString()}: ${v.message}`)
				.join('\n');
		});
	};
};

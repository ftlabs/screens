'use strict';

module.exports = function(client) {
	return function () {
		client.log("browser")
		.then(function (logs) {
			console.log(logs.value.map(v => `${v.timestamp}: ${v.message}`).join('\n'));
			return logs;
		});
	};
};

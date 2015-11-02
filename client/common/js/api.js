/* global fetch */
'use strict';

module.exports = function api(method, data) {
	var qs = Object.keys(data).reduce(function(a,k){ a.push(k+'='+encodeURIComponent(data[k])); return a }, []).join('&');
	return fetch('/api/'+method, {
		method: 'POST',
		headers: { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: qs,
		credentials: 'same-origin'
	}).then(function(resp) {
		return resp.json();
	});
};

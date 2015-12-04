'use strict';

const timestampEls = [].slice.call(document.querySelectorAll('.convert-timestamp'));
const moment = require('moment');

(function updateTime(){ 
	timestampEls.forEach(function (el) {
		var now = moment(el.dataset.timestamp, 'x').fromNow();
		el.innerHTML = now;
	});
	setTimeout(updateTime, 5000);
})();

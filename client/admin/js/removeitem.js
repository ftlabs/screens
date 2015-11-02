'use strict';

exports.init = function($) {

	var api = require('../../common/js/api');

	$('.screens')
		.on('click', '.action-remove', function() {
			var $li = $(this).closest('li');
			var $list = $li.closest('ol').find('li');
			var idx = $list.index($li);
			api('remove', {
				screen: $(this).closest('.screen').attr('data-id'),
				idx: idx
			});
		})
	;
};

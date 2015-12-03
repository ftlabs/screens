exports.init = function($) {

	const api = require('../../common/js/api');

	$('.screens')
		.on('click', '.action-remove', function() {
			const $li = $(this).closest('li');
			const $list = $li.closest('ol').find('li');
			const idx = $list.index($li);
			api('remove', {
				screen: $(this).closest('.screen').attr('data-id'),
				idx: idx
			});
		})
	;
};

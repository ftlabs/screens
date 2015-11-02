'use strict';

exports.init = function($) {

	var keys = require('./keycodes');
	var api = require('../../common/js/api');

	$('.screens')
		.on('click', '.action-rename', function() {
			$(this).closest('.screen').addClass('rename-mode').find('input').val(
				$(this).closest('.screen').find('label').attr('title')
			).focus();
		})
		.on('keyup', '.rename-group input', function(e) {
			if (e.keyCode === keys.ESC) {
				$('.screen').removeClass('rename-mode');
			}
		})
		.on('submit', '.rename-group', function(e) {
			var newname = $(this).find('input').val();
			e.preventDefault();
			$(this).closest('.screen').removeClass('rename-mode').find('label').attr('title', newname).html(newname);
			api('rename', {
				screens: $(this).closest('.screen').attr('data-id'),
				name: newname
			});
		})
	;
};

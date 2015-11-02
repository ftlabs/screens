'use strict';

var $;
var timer;
var $txt;

function applyFilters() {
	clearTimeout(timer);
	timer = setTimeout(function() {
		if ($txt.val()) {
			var regex = new RegExp("^(.*?)("+$txt.val()+")(.*?)$", 'ig');
			var $matching = $('.screen[data-filter*="'+$txt.val().toLowerCase()+'"]');
			$matching.show().find('.screen-name').each(function() {
				$(this).html(this.title.replace(regex, '$1<span class="highlight">$2</span>$3'));
			});
			$('.screen').not($matching).hide();
			if ($matching.length === 1 && !$matching.find('.screen-select').prop('checked')) {
				$matching.find('.screen-select').prop('checked', true);
			}
		} else {
			$('.screen').show().find('.screen-name').each(function() {
				$(this).html(this.title);
			});
		}
	}, 200);
}

exports.init = function(jQuery) {
	$ = jQuery;
	$txt = $('#txtfilter');
	$txt.on('keyup', function(e) {
		e.preventDefault();
		applyFilters();
	});
	applyFilters();
};

exports.apply = applyFilters;

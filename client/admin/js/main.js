/* eslint-env browser */
/* global io, console */

const $ = require('jquery');
const api = require('../../common/js/api');
let socket;
const filters = require('./filter');
const renamescreens = require('./renamescreens');
const removeitem = require('./removeitem');
const moment = require('moment');

const HierarchicalNav = require('o-hierarchical-nav');
const nav = document.querySelector('.o-hierarchical-nav');
new HierarchicalNav(nav);

const troubleURLS = [];

function pointOutTroubleMakers(){
	const activeLinks = Array.from(document.querySelectorAll('.screen-page'));

	activeLinks.forEach(function(activeLink){

		const link = activeLink.getAttribute('href');

		troubleURLS.forEach(function(url){
			if(url === link){
				activeLink.setAttribute('data-troublesome-url', 'true');
			}
		});


	})

}

function updateScreen(data) {
	const $el = $('#screen-'+data.id);
	console.log('Screen update: ' + data.id, $el);
	if (data.content && $el.length) {
		const checkstate = $el.find('input.screen-select').prop('checked');

		const panelDom = $(data.content)
		panelDom.find('input.screen-select').prop('checked', checkstate);
		$el.replaceWith(panelDom);
		filters.apply();
	} else if (data.content) {
		$('#screens tbody').append(data.content);
		filters.apply();
	} else if ($el.length) {
		markOffline($el.toArray());
		filters.apply();
	}
	updateCloneList();
	resizeTable();
	dateTime();
	orderTable();
	pointOutTroubleMakers();
}

function orderTable() {
	let rows = Array.prototype.slice.call(document.querySelectorAll('tr'));
	rows = rows.sort(function(a,b) {

		a = a.querySelector('label').title.toLowerCase();

		b = b.querySelector('label').title.toLowerCase();

		if(a < b) return -1;
		if(a > b) return 1;
		return 0;
	});

	const tableBody = document.querySelector('tbody');

	tableBody.innerHTML = '';

	rows.forEach(function(row){
		tableBody.appendChild(row);
	});
}

function markOffline(els) {
	els.forEach(el => {
		console.log(typeof el, el);
		el.classList.add('screen-offline');
	});
}

function dateTime() {
	$('.item-info-scheduled').toArray().forEach(el => {
		const sched = moment(el.dataset.dateTimeSchedule, 'x');
		const happensToday = sched.isSame(new Date(), 'day');
		const happenedAlready = sched.isBefore(new Date());

		if (happenedAlready) return;
		if (happensToday) {
			el.innerHTML = 'Scheduled for ' + sched.format('HH:mm');
		} else {
			el.innerHTML = 'Scheduled for ' + sched.toLocaleString();
		}
	});
}

function updateAllScreens(data) {
	let touched = $();
	data.forEach(function(update) {
		updateScreen(update);
		touched = touched.add('#screen-'+update.id);
	});
	markOffline($('.screen').not(touched).toArray());
}

function updateCloneList() {
	let li;
	const outHTML = $('.screens tr').toArray()
	.map(row => '<option value="' + row.dataset.id + '">' +
					row.querySelector('label').innerText +
					((li = row.querySelector('.queue li')) ? ' - ' + li.innerText : '') +
					'</option>'
	).join('');
	const screenSelector = document.querySelector('#selscreen');
	if (screenSelector) screenSelector.innerHTML = outHTML;
}

function resizeTable() {
	[].slice.call(document.querySelectorAll('.screen td:last-child')).forEach(td => {
		td.style.maxWidth = document.querySelector('.page h1').offsetWidth - td.previousElementSibling.offsetWidth + 'px';
	});
}

function getSelectedScreens() {
	return $('.screen-select:checked').map(function() {
		return this.value;
	}).get();
}

function screensInit() {

	const port = location.port ? ':'+location.port : '';
	socket = io.connect('//'+location.hostname+port+'/admins');
	socket.on('screenData', updateScreen);
	socket.on('allScreensData', updateAllScreens);

	$('#actions_set-content, #actions_clear, #actions_clone, #actions_reload, #actions_hold, #actions_reload_some').on('submit', function(e) {
		e.preventDefault();
		const screens = getSelectedScreens();
		if (!screens.length && !$(this).is('#actions_reload')) return window.alert('Choose some screens first');
		const data = {screens: screens.join(',')};
		if ($(this).is('#actions_set-content')) {
			data.url = $('#txturl').val();
			data.duration = $('#selurlduration').val();

			if ($('#date').val() || $('#time').val()) {
				data.dateTimeSchedule = moment(`${$('#date').val() || moment().format('YYYY-MM-DD')} ${$('#time').val() || moment().format('HH:mm')}`).valueOf();
			}

			api('addUrl', data)
				.then(function(res){
					const canBeViewed = res.viewable;

					if(!canBeViewed){

						if(troubleURLS.indexOf(data.url) === -1){
							troubleURLS.push(data.url);
						}

					}
				})
			;
		} else if ($(this).is('#actions_clear')) {
			api('clear', data);
		} else if ($(this).is('#actions_clone')) {
			const fromId = $('#selscreen').val();
			const dataCache = [].slice.call(document.querySelectorAll('tr[data-id="' + fromId + '"] a'))
			.map(a => ({
				screens: data.screens,
				url: a.href,
				duration: a.dataset.expires ? (a.dataset.expires - Date.now()) / 1000 : -1,
				dateTimeSchedule: a.dataset.dateTimeSchedule
			}));
			api('clear', data)
			.then(function () {
				(function recurse() {
					if (dataCache.length) api('addUrl', dataCache.pop()).then(recurse);
				}());
			});
		} else if($(this).is('#actions_reload')){
			api('reload', {});
		} else if( $(this).is('#actions_reload_some') ){
			api('reload', {screens: screens.join(',')});
		} else if($(this).is('#actions_hold')){
			data.url = 'http://'+location.hostname+port+'/generators/standby?title=Holding%20Page';
			data.duration = $('#selholdduration').val();
			api('addUrl', data);
		}

	});

	$('#selection').on('change', function() {
		$('.action-options').removeAttr('aria-selected');
		$('#actions_'+this.value).attr('aria-selected', true);
	});

	$('#chkselectall').on('click', function() {
		$('input.screen-select:visible').prop('checked', this.checked);
	});
	$('.screens').on('click', 'input.screen-select', function() {
		if (!this.checked) $('#chkselectall').prop('checked', false);
	});

	filters.init($);
	renamescreens.init($);
	removeitem.init($);

	const txturl = document.getElementById('txturl');
	if (txturl) txturl.onblur = function checkURL (urlField) {
		let url = urlField.target.value;
		if (!url.match(/^\w+:/)) {
			url = 'http://' + url;
		}
		urlField.target.value = url;
		return urlField;
	};
};

// Initialise Origami components when the page has loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
}

document.addEventListener('DOMContentLoaded', function() {

	// Dispatch a custom event that will tell all required modules to initialise
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
window.addEventListener('resize', resizeTable);

window.screensInit = screensInit;

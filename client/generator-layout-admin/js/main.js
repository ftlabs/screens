"use strict";
var output_link = document.querySelector('#output_link');
var submit      = document.querySelector('button');
var demo        = document.querySelector('#demo');

submit.addEventListener("click", function(e) {
	var customLayoutForm = document.querySelector('#custom_layout');
	e.preventDefault();
	e.stopPropagation();
	createCustomLayoutPage(customLayoutForm);
});

function updateDemo(demoElement, url) {
	removeChildren(demo);
	var iframe = document.createElement('iframe');
	iframe.src = url;
	demo.appendChild(iframe);
}

function removeChildren(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function createCustomLayoutPage(form) {
	var h = document.querySelector('#H');
	var l = document.querySelector('#L');
	var r = document.querySelector('#R');
	var f = document.querySelector('#F');

	var section_sizes = [
		h.querySelector('[name=height]').value,
		l.querySelector('[name=height]').value,
		l.querySelector('[name=width]' ).value,
		f.querySelector('[name=height]').value
	];

	var url = "/generators/layout?" + [
		"title=" + document.querySelector('[name=title]').value,
		"layout=[" + section_sizes.join(",") + "]",
		"layoutNotes=[HeaderHeight,LeftHeight,LeftWidth,FooterHeight]",
		"H=" + encodeURIComponent(h.querySelector('[name=url]').value),
		"L=" + encodeURIComponent(l.querySelector('[name=url]').value),
		"R=" + encodeURIComponent(r.querySelector('[name=url]').value),
		"F=" + encodeURIComponent(f.querySelector('[name=url]').value)
	].join('&');

	var item = document.createElement('LI');
	var link = document.createElement('a');
	link.href = url;
	link.innerHTML = link.href;
	item.appendChild(link);
	output_link.appendChild(item);
	var iframe = document.createElement('iframe');
	iframe.src = url;
	item.appendChild(iframe);

	// updateDemo(demo, url);
}

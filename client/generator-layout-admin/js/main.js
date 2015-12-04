/* eslint-env browser*/
const output_link = document.querySelector('#output_link');
const submit = document.querySelector('button');

submit.addEventListener('click', function(e) {
	const customLayoutForm = document.querySelector('#custom_layout');
	e.preventDefault();
	e.stopPropagation();
	createCustomLayoutPage(customLayoutForm);
});

function createCustomLayoutPage() {
	const h = document.querySelector('#H');
	const l = document.querySelector('#L');
	const r = document.querySelector('#R');
	const f = document.querySelector('#F');

	const section_sizes = [
		h.querySelector('[name=height]').value,
		l.querySelector('[name=height]').value,
		l.querySelector('[name=width]' ).value,
		f.querySelector('[name=height]').value
	];

	const url = '/generators/layout?' + [
		'title=' + document.querySelector('[name=title]').value,
		'layout=[' + section_sizes.join(',') + ']',
		'layoutNotes=[HeaderHeight,LeftHeight,LeftWidth,FooterHeight]',
		'H=' + encodeURIComponent(h.querySelector('[name=url]').value),
		'L=' + encodeURIComponent(l.querySelector('[name=url]').value),
		'R=' + encodeURIComponent(r.querySelector('[name=url]').value),
		'F=' + encodeURIComponent(f.querySelector('[name=url]').value)
	].join('&');

	const item = document.createElement('LI');
	const link = document.createElement('a');
	link.href = url;
	link.innerHTML = link.href;
	item.appendChild(link);
	output_link.appendChild(item);
	const iframe = document.createElement('iframe');
	iframe.src = url;
	item.appendChild(iframe);

	// updateDemo(demo, url);
}

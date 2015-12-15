/* eslint-env browser */
'use strict';

const Carousel = require('ftlabs-screens-carousel');
const carousel = new Carousel(location.toString(), window.location.origin);
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
carousel.on('change', url => iframe.src = url);

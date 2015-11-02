'use strict';

exports.parse = function(str) {

	if(str === undefined){
		return {};
	}

	var parsedParams = {},
		splitString = str.split('&');

	splitString.forEach(function(s){

		s = s.split("=");

		parsedParams[s[0]] = s[1];

	});

	return parsedParams;

};

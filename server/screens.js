'use strict'; //eslint-disable-line strict

const extend = require('lodash').extend;
const debug = require('debug')('screens:screens');
const logs = require('./log');
const assignedIDs = new Map();
const _ = require('lodash');

let app;

function socketsForIDs(ids) {
	const clients = app.io.of('/screens').connected;
	return Object.keys(clients).filter(function(sockID) {
		return (clients[sockID].data && (!ids || !ids.length || ids.indexOf(clients[sockID].data.id) !== -1));
	}).map(function(sockID) {
		return clients[sockID];
	});
}

function syncDown(sock) {
	sock.emit('update', sock.data);

	updateAdmins(sock);
}

function updateAdmins(sock) {
	// Tell all admin users about the update
	generateAdminUpdate(sock).then(function(data) {
		app.io.of('/admins').emit('screenData', data);
	});
}

function generateAdminUpdate(sock) {
	return app.hbs.render('views/screen.handlebars', sock.data).then(function(content) {
		return {
			id: sock.data.id,
			content: content
		};
	});
}

function decideWhichScreenGetsToKeepAnID(screenA, screenB){


	// Emit an event to the screens to reassign using the ID and the timestamp 
	// of when that id was assigned as the identifier for the screen that needs
	// to reassign. The original screen (and the rest) can ignore this message.
	// screens without idUpdated assigned count as being older than the ones
	// with, this is so that old clients which don't support reassign won't 
	// be expected to change.
	const screenToChange = (screenA.idUpdated || 0) > (screenB.idUpdated || 0) ? screenA : screenB ;

	app.io.of('/screens').emit('reassign', { 
		id : screenToChange.id,
		idUpdated : screenToChange.idUpdated,
		newID : generateID()
	});

}


function checkForConflictingId(id){

	return assignedIDs.has(id);

}

function checkForConflictingScreens(data){

	if (assignedIDs.has(data.id)) {
		const existingScreen = assignedIDs.get(data.id);
		if (existingScreen.idUpdated !== data.idUpdated) {
			return true;
		}
	}
	return false;
}

function generateID(){

	let newID = parseInt(Math.random() * 99999 | 0, 10);

	while(checkForConflictingId(newID) === true){
		newID = parseInt(Math.random() * 99999 | 0, 10);
	}

	return newID;
}

module.exports.setApp = function(_app) {
	app = _app;
};

module.exports.add = function(socket) {

	// Store metadata against the socket.
	// While we're using the socket list as a data store, all sockets are
	// considered online, because we'll forget about them as soon as they disconnect.
	socket.data = {
		id: null,
		items: []
	};

	debug(`New screen connected on socket ${socket.id}`);

	// Request registration on connect so that registration is done on reconnects as well as the initial connect
	socket.emit('requestUpdate');

	socket.on('update', function(data) {
		const newData = _.cloneDeep(data);
		// If screen has not cited a specific ID, assign one
		if (!newData.id || !parseInt(newData.id, 10)) {
			newData.id = generateID();
		}

		const thereIsAConflict = checkForConflictingScreens(newData);

		if (thereIsAConflict) {
			decideWhichScreenGetsToKeepAnID(newData, assignedIDs.get(newData.id) );
			return;
		} else {
			// Only save the screen as existing if it is using the new api
			if (newData.id && newData.idUpdated) {
				assignedIDs.set(newData.id, {id : newData.id, idUpdated : newData.idUpdated});
			}
		}

		if (!socket.data.id) {
			debug('New screen on socket '+socket.id+' now identifies as '+newData.id+' ('+newData.name+')');
		}

		logs.logConnect({
			eventType: logs.eventTypes.screenConnected.id,
			screenId: newData.id,
			details: {
				name: newData.name,
			}
		});

		// Record the updated newData against the socket
		extend(socket.data, newData);
		
		if (!_.isEqual(data, newData)) {
			syncDown(socket);
		} else {
			updateAdmins(socket);
		}

	});

	socket.on('disconnect', function() {
		debug('Screen disconnected: '+this.data.id+ ' from socket '+this.id);
		logs.logConnect({
			eventType: logs.eventTypes.screenDisconnected.id,
			screenId: this.data.id,
			details: {
				name: this.data.name,
			}
		});

		app.io.of('/admins').emit('screenData', { id: this.data.id });
	});
};

module.exports.set = function(ids, data) {
	data = data || {};
	socketsForIDs(ids).forEach(function(sock) {
		extend(sock.data, data);
		syncDown(sock);
	});
};

module.exports.get = function(ids) {
	return socketsForIDs(ids).map(function(sock) {
		return sock.data;
	});
};

module.exports.pushItem = function(ids, item) {
	socketsForIDs(ids).forEach(function(sock) {
		sock.data.items.push(item);
		syncDown(sock);
	});
};

module.exports.removeItem = function(id, idx) {
	const sock = socketsForIDs([parseInt(id, 10)])[0];
	if (sock) {
		sock.data.items.splice(idx, 1);
		syncDown(sock);
	}
};

module.exports.clearItems = function(ids) {
	socketsForIDs(ids).forEach(function(sock) {
		sock.data.items = [];
		syncDown(sock);
	});
};

module.exports.generateAdminUpdate = function(ids) {
	return Promise.all(socketsForIDs(ids).map(generateAdminUpdate));
};

module.exports.reload = function(ids){

	if(ids === undefined){
		app.io.of('/screens').emit('reload');
	} else {
		socketsForIDs(ids).map(function(socket){
			socket.emit('reload');
		})
	}



};

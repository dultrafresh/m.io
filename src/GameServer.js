// External package imports
var uws = require('uws');
var io = require('socket.io');

// Local imports
var MessageHandler = require('./MessageHandler');
var Player = require('./Player');
var log = require('./Logger');

class GameServer {
	start() {
		var me = this;
		me.io = io(me.config.port);
		// Set the server websocket engine to uws, for massive performance gain
		me.io.engine.ws = new uws.Server({
			noServer: true,
			clientTracking: false,
			perMessageDeflate: false
		});
		log.info('Started GameServer on port ' + me.config.port);
		me.io.on('connection', socket => {
			log.all('New connection accepted.');
			socket.player = new Player(socket);
			me.players.push(socket);
			socket.on('1', data => {
				// Player spawn packet, the data is an object with one property
				return me.msgHandler.call(me, socket, data);
			});
		});
	}
	constructor(config) {
		if (!config) {
			throw new Error('Gameserver must be constructed with a configuration object.');
			return;
		} else if (!config.port || typeof config.port !== 'number') {
			throw new Error('Gameserver config requires a valid port.');
			return;
		} else {
			this.config = config;
			if (config.logLevel) { // Update log level
				log.lvl = config.logLevel;
			}
			this.io = null; // The socket.io server
			this.msgHandler = new MessageHandler(this);
			this.players = [];
		}
	}
}

module.exports = GameServer;
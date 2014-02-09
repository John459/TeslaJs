var COLOR = {'blue','green','red','yellow'};
var SPECIAL = {'skip', 'draw two', 'reverse', 'wild', 'wild draw four'};

function Card(num, color, special) {
	this.num = num;
	this.color = color;
	this.special = special;

	var self = this;

	this.toString = function() {
		if (num === null) {
			if (color === null) {
				return SPECIAL[self.special]; 
			}
			return COLOR[self.color] + ' ' + SPECIAL[self.special];
		}
		return COLOR[self.color] + ' ' + self.num;
	};
}

function Deck() {
	this.cards = [];

	var self = this;

	this.addCard = function (card, amount) {
		for (var i = 0; i < amount; i++) {
			self.cards.push(card);
		}
	};

	this.removeCard = function (rCard) {
		self.cards = self.cards.reduce(function (acc, card) {
			if (card === rCard) {
				return acc;
			} else {
				return acc.concat(card);
			}
		}, []);
	};

	this.createDeck = function() {
		//add cards 0 through 9 of all colors
		for (var i = 0; i <= 9; i++) {
			for (var j = 0; j < COLOR.length; j++) {
				var card = new Card(i, j, null);
				self.addCard(card, i == 0 ? 1 : 2);
			}
		}
		//add skip, draw two, and reverse cards
		for (var i = 0; i < SPECIAL.length - 2; i++) {
			for (var j = 0; j < COLOR.length; j++) {
				var card = new Card(null, j, i);
				self.addCard(card, 2);
			}
		}
		//add wild cards
		self.addCard(new Card(null, null, SPECIAL.length - 2), 4);
		self.addCard(new Card(null, null, SPECIAL.length - 1), 4);
	};

	this.drawCard = function() {
		var index = Math.floor(Math.random() * self.cards.length);
		var card = self.cards[index];
		self.removeCard(card);
		return card;
	};

	this.toString = function() {
		var output = '';
		for (var i = 0; i < self.cards.length - 1; i++) {
			output = output + self.cards[i].toString() + ', ';
		}
		output = output + self.cards[self.cards.length - 1].toString();
		return output;
	};
}

function Player(nick) {
	this.HAND_SIZE = 7;
	this.nick = nick;
	this.hand = new Deck();

	var self = this;

	this.createHand = function(deck) {
		for (var i = 0; i < self.HAND_SIZE; i++) {
			self.hand.addCard(deck.drawCard());
		}
	};

}

function Game(channel) {
	this.channel = channel;
	this.players = [];
	this.blacklist = [];
	this.card = null;
	this.deck = new Deck();
	
	var self = this;

	this.init = function() {
		self.deck.createDeck();
		self.card = deck.drawCard();
		var len = players.length;
		for (var i = 0; i < len; i++) {
			self.players[i].createHand();
		}
	};
	
	this.addPlayer = function (nick) {
		var player = new Player(nick);
		self.players.push(player);
		return player;
	};
	
	this.getPlayer = function(nick) {
		var l = self.players.length;
		for (var i = 0; i < l; i++) {
			if (self.players[i].nick === nick) {
				return self.players[i];
			}
		}
		return null;
	};
	
	this.isBlacklisted = function(nick) {
		var l = self.blacklist.length;
		for (var i = 0; i < l; i++) {
			if (self.blacklist[i] === nick) {
				return true;
			}
		}
		return false;
	};
}

function Uno(ircbot) {
	this.ircbot = ircbot;
	this.games = [];
}

Uno.prototype.command = function(ircmsg) {
	var command = ircmsg.getUserCommand();
	if (command === null || command !== "u") {
		return;
	}
    	var param = ircmsg.getUserParam();
    	if (param === null) {
        	return;
    	}
	var spacePos = param.indexOf(' ');
	if (spacePos === -1) {
		this.handleGameCommand(param, null, ircmsg.params[0], ircmsg.getNick());
	} else {
		this.handleGameCommand(param.substring(0, spacePos), param.substring(spacePos).trim(), ircmsg.params[0], ircmsg.getNick());
	}
    
}

Uno.prototype.getGame = function(channel) {
	return this.games.reduce(
		function (acc, game) {
			if (game.channel === channel) {
				return game;
			} else {
				return acc;
			}
		}, null);
}

Uno.prototype.removeGame = function(channel) {
	this.games = this.games.reduce(function(acc, game) {
		if (game.channel === channel) {
			return acc;
		} else {
			return acc.concat(game);
		}
	}, []);
}

Uno.prototype.showHand = function (player) {
		this.ircbot.writeIrcMessage(null, 'PRIVMSG', player.nick, player.hand.toString());
}

Uno.prototype.handleGameCommand = function(command, param, channel, nick) {
    	if (command === 'play') {
		if (this.getGame(channel)) {
			this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, 'A game is already going on in this channel!');
			return;
		}
		var game = new Game(channel);
		game.addPlayer(nick);
		this.games.push(game);
	} else {
		var game = this.getGame(channel);
		if (!game || game.isBlacklisted(nick)) {
			return;
		}
		if (command === 'start') {
			game.init();
			this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, 'Uno game started!');
		}
	}
}

module.exports = Uno;

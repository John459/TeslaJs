function Player(nick) {
	this.nick = nick;
	this.guesses = 0;
}

function Game(channel) {
	this.channel = channel;
	this.word = 'word wtih a space';
	this.guessedChars = [];
	this.players = [];
	this.blacklist = [];
	this.MAX_GUESSES = 5;
	
	var self = this;
	
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
	
	this.encodeWord = function(guess, word, encodedWord) {
		var encoded = '';
		var len = word.length;
		for (var i = 0; i < len; i++) {
			var encodedChar = encodedWord.charAt(i);
			if (i < encodedWord.length && encodedChar !== '*' && encodedChar !== ' ' && encodedChar !== '-') {
				encoded += encodedChar;
			} else {
				var wordChar = word.charAt(i);
				if (wordChar === guess) {
					encoded += guess;
				} else if (wordChar === ' ' || wordChar == '-') {
					encoded += wordChar;
				} else {
					encoded += '*';
				}
			}
		}
		return encoded;
	};
	
	this.encodedWord = this.encodeWord('', this.word, '');
}

function Hangman(ircbot) {
	this.ircbot = ircbot;
	this.games = [];
}

Hangman.prototype.command = function(ircmsg) {
	var command = ircmsg.getUserCommand();
	if (command === null || command !== "hm") {
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

Hangman.prototype.getGame = function(channel) {
	return this.games.reduce(
		function (acc, game) {
			if (game.channel === channel) {
				return game;
			} else {
				return acc;
			}
		}, null);
}

Hangman.prototype.removeGame = function(channel) {
	this.games = this.games.reduce(function(acc, game) {
		if (game.channel === channel) {
			return acc;
		} else {
			return acc.concat(game);
		}
	}, []);
}

Hangman.prototype.handleGameCommand = function(command, param, channel, nick) {
    	if (command === 'start') {
		if (this.getGame(channel)) {
			this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, 'A game is already going on in this channel!');
			return;
		}
		var game = new Game(channel);
		game.addPlayer(nick);
		this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, game.encodedWord);
		this.games.push(game);
	}
	else
	{
		var game = this.getGame(channel);
		if (!game || game.isBlacklisted(nick)) {
			return;
		}
		var player = game.getPlayer(nick);
		if (!player) {
			player = game.addPlayer(nick);
		}
		var guess = command.charAt(0);
		var newEncodedWord = game.encodeWord(guess, game.word, game.encodedWord);
		if (newEncodedWord === game.encodedWord) {
			player.guesses += 1;
			if (player.guesses >= game.MAX_GUESSES) {
				this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, nick + ' has used up all his guesses!');
				game.blacklist.push(player.nick);
			} else {
				this.ircbot.writeIrcMessage(null, 'NOTICE', nick, 'You have used ' + player.guesses + ' of ' + game.MAX_GUESSES + ' guesses');
			}
			return;
		}
		this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, newEncodedWord);
		if (newEncodedWord === game.word) {
			this.ircbot.writeIrcMessage(null, 'PRIVMSG', channel, nick + ' wins!');
			this.removeGame(channel);
			return;
		}
		game.encodedWord = newEncodedWord;
	}
}

module.exports = Hangman;

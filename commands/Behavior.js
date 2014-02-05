/**
 * Basic bot behavior as it relates to the server.
 * This includes mostly joining/parting channels for various reasons.
 **/

function Behavior(ircbot) {
	this.ircbot = ircbot;
}

Behavior.prototype.serverCommand = function(command, ircmsg) {
	var command = ircmsg.command;
	switch (command.toUpperCase()) {
		case 'PING':
			this.ircbot.writeIrcMessage(null, 'PONG', null, ircmsg.trailing);
		break;
		case 'INVITE':
			this.ircbot.writeIrcMessage(null, 'JOIN', ircmsg.trailing, null);
		break;
		case 'KICK':
			var kickedNick = ircmsg.params[1].trim();
			if (kickedNick !== this.ircbot.NICK) {
				break;
			}
			var channel = ircmsg.params[0].trim();
			this.ircbot.writeIrcMessage(null, 'JOIN', channel, null);
		break;
		default:
		break;
	}
}

Behavior.prototype.userCommand = function(command, ircmsg) {
	switch (command.toUpperCase()) {
		case 'PART':
			this.ircbot.writeIrcMessage(null, 'PART', ircmsg.params[0].trim(), 'Leaving');
		break;
		default:
		break;
	}
}

Behavior.prototype.command = function(ircmsg) {
	var command = ircmsg.command;
	var usrCommand = ircmsg.getUserCommand();
	if (command !== null) {
		this.serverCommand(command, ircmsg);
	}
	if (usrCommand !== null) {
		this.userCommand(usrCommand, ircmsg);
	}
}

module.exports = Behavior;

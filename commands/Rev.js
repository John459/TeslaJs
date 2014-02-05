function Rev(ircbot) {
	this.ircbot = ircbot;
}

Rev.prototype.command = function(ircmsg) {
	var command = ircmsg.getUserCommand();
	if (command === null || command !== "rev") {
		return;
	}
        this.ircbot.writeIrcMessage(null, 'PRIVMSG', ircmsg.params, ircmsg.getNick() + ': ' + ircmsg.getUserParam().split('').reverse().join(''));
}

module.exports = Rev;

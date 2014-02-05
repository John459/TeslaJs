function Echo(ircbot) {
	this.ircbot = ircbot;
}

Echo.prototype.command = function(ircmsg) {
	var command = ircmsg.getUserCommand();
	if (command === null || command !== "echo") {
		return;
	}
        this.ircbot.writeIrcMessage(null, 'PRIVMSG', ircmsg.params, ircmsg.getNick() + ': ' + ircmsg.getUserParam());
}

module.exports = Echo;

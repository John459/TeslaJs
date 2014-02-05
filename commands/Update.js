function Update(ircbot) {
	this.ircbot = ircbot;
}

Update.prototype.command = function(ircmsg) {
	var command = ircmsg.getUserCommand();
	if (command === null || command !== 'update') {
		return;
	}
	this.ircbot.deleteCommands();
	this.ircbot.loadCommands();
	this.ircbot.writeIrcMessage(null, 'PRIVMSG', ircmsg.params, 'Command modules updated!');
}

module.exports = Update;

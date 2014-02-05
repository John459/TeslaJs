function IRCMessage(input) {
    this.prefix = null;
    this.command = null;
    this.params = null;
    this.trailing = null;
    this.IDENTIFIER = '@';
    this.parseInput(input);
}

IRCMessage.prototype.parseInput = function (input) {
    var prefixEnd = -1,
        trailingStart;
    
    if (/^:/.test(input)) {
        prefixEnd = input.indexOf(' ');
        this.prefix = input.substring(1, prefixEnd);
    }
    
    trailingStart = input.indexOf(' :');
    if (trailingStart >= 0) {
        this.trailing = input.substring(trailingStart+2);
    } else {
        trailingStart = input.length;
    }
    
    var cmdAndParams = input.substring(prefixEnd+1, trailingStart).split(' ');
    this.command = cmdAndParams[0];
    
    if (cmdAndParams.length > 1) {
        this.params = cmdAndParams.slice(1, cmdAndParams.length);
    }
}

IRCMessage.prototype.getNick = function() {
    var index = this.prefix.indexOf('!');
    if (index === -1) {
        return null;
    }
    return this.prefix.substring(0, index);
}

IRCMessage.prototype.getUserCommand = function () {
    if (this.trailing === null || this.trailing.indexOf(this.IDENTIFIER) !== 0) {
        return null;
    }
    var noIndent = this.trailing.substring(1).trim();
    var index = noIndent.indexOf(' ');
    if (index === -1) {
        index = noIndent.length;
    }
    return noIndent.substring(0, index).toLowerCase().trim();
}

IRCMessage.prototype.getUserParam = function () {
    var command = this.getUserCommand();
    if (command === null || command.length + 2 >= this.trailing.length) {
        return null;
    }
    return this.trailing.substring(command.length + 2).trim();
}

module.exports = IRCMessage;
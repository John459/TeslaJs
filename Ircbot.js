var IRCMessage = require('./IRCMessage'),
    fs = require('fs');
    
/**
 * Removes a module from the cache
 */
require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};

var Ircbot = function () {
    this.NICK = 'teslajs';
    this.USER = 'jb';
    this.channels = ['#rscemulation'];
    this.message = null;
    this.commands = null;
    this.sock = require('net').Socket();
}

Ircbot.prototype.write = function (output) {
    this.sock.write(output + '\r\n');
}

Ircbot.prototype.writeIrcMessage = function (prefix, command, params, trailing) {
    if (command === null) {
        throw new Error('Command CANNOT be null');
    }
    prefix = (prefix !== null) ? ':'+prefix : '';
    params = (params !== null) ? params : '';
    trailing = (trailing !== null) ? ':'+trailing : '';
    this.write(prefix + ' ' + command + ' ' + params + ' ' + trailing);
}

Ircbot.prototype.deleteCommands = function() {
    this.commands = null;
    fs.readdir('./commands/',
        function(err, files) {
            for (var i = 0; i < files.length; i++) {
                require.uncache(require.resolve('./commands/' + files[i]));
            }
        }
    );
}

Ircbot.prototype.loadCommands = function() {
    var self = this;
    
    fs.readdir('./commands/',
        function(err, files) {
            var commands = [];
            var Command;
            for (var i = 0; i < files.length; i++) {
                Command = require('./commands/' + files[i]);
                commands.push(new Command(self));
            }
            self.commands = commands;
        }
    );
}

Ircbot.prototype.init = function() {
    var self = this;
    
    self.loadCommands();

    self.sock.connect(6667, 'irc.rizon.net');
    
    self.writeIrcMessage(null, 'NICK', self.NICK, null);
    self.writeIrcMessage(null, 'USER', 'USER * *', self.NICK);
    self.writeIrcMessage(null, 'PRIVMSG', 'NICKSERV', 'IDENTIFY *');
    self.channels.forEach(function (channel) { self.writeIrcMessage(null, 'JOIN', channel, null); });

    self.sock.on('data', function(data) {
        data = data.toString();
        message = new IRCMessage(data);
        console.log(data);
        if (self.commands !== null) {
            var len = self.commands.length;
            for (var i = 0; i < len; i++) {
                if (self.commands === null) break;
                self.commands[i].command(message);
            }
        }
    });
}

var johnbot = new Ircbot();
johnbot.init();

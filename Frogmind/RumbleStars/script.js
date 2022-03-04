'use strict';

var cache = {
	modules: {},
	options: {}
};

var base = Process.findModuleByName('libsmash_android.so').base;
var ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
var inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

function setup() {
	Interceptor.attach(Module.findExportByName('libc.so', 'getaddrinfo'), {
		onEnter: function(args) {
			let hoster = args[0].readUtf8String();
			console.log(hoster);
			if (hoster === 'game.prod.rumblestars.com') {
				let newhost = cache.options.redirectHost;
				args[0].writeUtf8String(newhost);
			}
		}
	});
}

// startup
rpc.exports = {
	init: function(stage, options) {
		cache.options = options || {};
		cache.base = Process.findModuleByName('libsmash_android.so').base;
		cache.options.redirectHost = "game.stage.rumblestars.com";
		
		setup();
		//Interceptor.detachAll();
	}
};
// command to run listen: frida -U Gadget -l script.js --no-pause --runtime=v8
'use strict';

let cache = {
	modules: {},
	options: {}
};

let base = Process.findModuleByName('libbadlandbrawl.so').base;
let ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
let inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

function setup() {
	Interceptor.attach(Module.findExportByName('libc.so', 'getaddrinfo'), {
		onEnter: function(args) {
			let connecthost = args[0].readUtf8String();
			console.log(connecthost);
			if (connecthost === 'game.badlandapi.com') {
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
		cache.base = Process.findModuleByName('libbadlandbrawl.so').base;
		cache.options.redirectHost = "127.0.0.1";
		
		setup();
		//Interceptor.detachAll();
	}
};
// command to run listen: frida -U Gadget -l script.js --no-pause --runtime=v8

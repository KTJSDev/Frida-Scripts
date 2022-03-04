'use strict';
const attach = Interceptor.attach
let cache = {
	modules: {},
	options: {}
};

let base = Process.findModuleByName('libsmash_android.so').base;
let ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
let inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

function lol(){
	
	attach(cache.base.add(0x1AB47C), {
		onEnter: function(args) {
			args[1] = ptr(0) // enemy ai (0-3) fr::ai::init
		}
	});
	attach(cache.base.add(0x1B2DA8), {
		onEnter: function(args) {
			args[0] = ptr(0) // SppedUpGemCost (gotcha boxes)
		}
	});
	
	attach(cache.base.add(0x1B25BC), {
		onEnter: function(args) {
			args[0] = ptr(0) // How many seconds remain? (Boxes, shop) LogicMath::max
		}
	});

	attach(cache.base.add(0x1B2124), {
		onEnter: function(args) {
			args[1] = ptr(1) // isDev
		}
	});
}

// startup
rpc.exports = {
	init: function(stage, options) {
		cache.options = options || {};
		cache.base = Process.findModuleByName('libsmash_android.so').base;
		setup();
		lol()
		toast("Welcome to RumbleHockey (KTJSCLIENT)")
		
	}
};

function setup() {
	Interceptor.attach(Module.findExportByName('libc.so', 'connect'), {
		onEnter: function(args) {
			if (ntohs(Memory.readU16(args[1].add(2))) === 9339) {
				var host = Memory.allocUtf8String(cache.options.redirectHost);
				Memory.writeInt(args[1].add(4), inet_addr(host));
			}
		}
	});
}
function toast(toastText) {
    Java.perform(function() { 
        var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
        Java.scheduleOnMainThread(function() {
                var toast = Java.use("android.widget.Toast");
                toast.makeText(context, Java.use("java.lang.String").$new(toastText), 1).show();
        });
    });
}
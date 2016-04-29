(function(w, undefined) {
	var app = new Object;
	app.modules  = {
	};
	app.modules.prototype = app.modules;
	app.extend = app.modules.extend = function(module) {
		var i = 0,
		target = this,
		deep = false,
		length = arguments.length,
		obj, empty, items, x;
		typeof arguments[0] === 'boolean' ? (deep = true, i = 1, length > 2 ? (i = 2, target = arguments[1]) : void 0) : (length > 1 ? (i = 1, target = arguments[0]) : void 0);
		for (x = i; x < length; x++) {
			obj = arguments[x];
			for (items in obj) {
				if (obj[items] === target) continue;
				deep && typeof obj[items] === 'object' && obj[items] !== null ? (empty = Array === obj[items].constructor ? [] : {},
				target[items] = app.extend(deep, target[items] || empty, obj[items])) : target[items] = obj[items]
			}
		};
		return target
	};
	app.version = '0.0.1';
	app.use = function(module, fn) {
		var type=function(val) {return null == val ? val + "": Array == val.constructor ? "array": typeof val};
		module=type(module)==='array'?module:[module];
		var exports=[];
		for(var i=0;i<module.length;i++)exports[i]=app.modules[module[i]];
		fn&&fn.apply(app, exports);
	};
	app.require = function(module) {
		var exports=app.modules[module];
		return exports
	};
	app.define = function(module, fn) {
		return app.modules[module] = fn(app.require)
	};
	w.app = w.APP = app
})(window);

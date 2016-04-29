(function(w, undefined) {
	var app = new Object;
	app.version = '0.0.1';
	app.modules = {};
	app.extend = function(module) {
		var i = 0,target = this,deep = false,length = arguments.length,obj, empty, items, x;
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
	app.extend({
		define : function(id, fn ,type) {
			var err="module:[" + id + "] already defined";
			return app.modules[id]=app.modules[id]?(type?fn(app.require):((w.console?console.warn(err):alert(err)),app.modules[id])):fn(app.require);
		},
		require : function(id) {
			return app.modules[id]
		},
		use : function(id, fn) {
			var exports = [];
			id = Array == id.constructor? id: [id];
			for (var i = 0; i < id.length; i++) exports[i] = app.modules[id[i]];
			fn && fn.apply(app, exports)
		}
	});
	w.app = w.APP = app
})(window);

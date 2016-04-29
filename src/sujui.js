(function(w, undefined) {
	var app ={},
	cache = {},
	type = function(val) {return null == val ? val + "": Array == val.constructor ? "array": typeof val},
	isAarray = function(val) {return type(val) === 'array'},
	isBoolean = function(val) {return type(val) === 'boolean'},
	isObject = function(val) {return type(val) === 'object'},
	isFunction = function(val) {return type(val) === 'function'},
	isEmptyObject = function(val) {for (var val in val) return false;return true};
	app.version = '0.0.1';
	app.modules = {};
	app.extend = function(module) {
		var i = 0,target = this,deep = false,length = arguments.length,obj, empty, items, x;
		isBoolean(arguments[0]) ? (deep = true, i = 1, length > 2 ? (i = 2, target = arguments[1]) : void 0) : (length > 1 ? (i = 1, target = arguments[0]) : void 0);
		for (x = i; x < length; x++) {
			obj = arguments[x];
			for (items in obj) {
				if (obj[items] === target) continue;
				deep && isObject(obj[items]) && obj[items] !== null ? (empty = isAarray(obj[items]) ? [] : {},
				target[items] = app.extend(deep, target[items] || empty, obj[items])) : target[items] = obj[items]
			}
		};
		return target
	};
	app.extend({
		define: function(id, factory, cover) {
			cache[id] = {};
			var build = function() {
				return isFunction(factory) ? factory(app.require, cache[id], module) : factory
			},
			module = {
				id: id,
				cover: cover ? cover: false,
				type: type(factory)
			},
			err = "module:[" + id + "] already defined";
			app.modules[id] = app.modules[id] ? (type ? build() : ((w.console ? console.warn(err) : alert(err)), app.modules[id])) : build()
		},
		require: function(id) {
			return app.modules[id]
		},
		use: function(id, factory) {
			var exports = [],cached = cache[id],i = 0,x,length = id.length;
			id = isAarray(id) ? id: [id];
			for (x = i; x < length; x++) exports[i] = isEmptyObject(cached) ? app.modules[id[i]] : [cached][0];
			factory && factory.apply(app, exports)
		}
	});
	w.app = w.APP = app
})(window);

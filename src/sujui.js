(function(w, undefined) {
	var app ={},
	doc=document,
	head=doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement=head.getElementsByTagName('base')[0],
	scripts = doc.getElementsByTagName('script'),
	loaderScript = scripts[scripts.length - 1],
	type = function(val) {return null == val ? val + '': Array == val.constructor ? 'array': typeof val},
	isArray = function(val) {return type(val) === 'array'},
	isString = function(val) {return type(val) === 'string'},
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
				deep && isObject(obj[items]) && obj[items] !== null ? (empty = isArray(obj[items]) ? [] : {},
				target[items] = app.extend(deep, target[items] || empty, obj[items])) : target[items] = obj[items]
			}
		};
		return target
	};
	
	var cmd={
		cache : {},
		config:{
			main:loaderScript.getAttribute("app-main"),
			base:loaderScript.getAttribute("app-base")||location.href
		},
		getCurrentScript:function(){
			if (doc.currentScript) return doc.currentScript.src;
			var stack;
			try {
				x.x.x.x()
			} catch(e) {
				stack = e.stack;
				if (!stack && window.opera) stack = (String(e).match(/of linked script \S+/g) || []).join(' ')
			}
			if (stack) {
				stack = stack.split(/[@ ]/g).pop();
				stack = stack[0] == '(' ? stack.slice(1, -1) : stack;
				return stack.replace(/(:\d+)?:\d+$/i, '')
			}
			var nodes = head.getElementsByTagName('script');
			for (var i = 0,node; node = nodes[i++];) if (node.readyState === 'interactive') return node.className = node.src
		},
		uid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},
		getDirname : function(path){
			return path.match(/[^?#]*\//)[0]
		},
		getRealPath:function(path) {
			path = path.replace(/\/\.\//g, '/');
			path = path.replace(/([^:\/])\/\/+/g, '$1/');
			while (path.match(/\/[^/]+\/\.\.\//g)) {
				path = path.replace(/\/[^/]+\/\.\.\//g, '/')
			}
			return path
		},
		getSuffix:function(uri) {
			uri = cmd.getRealPath(uri);
			/#$/.test(uri)?uri = uri.slice(0, -1):!/\?|\.(?:css|js)$|\/$/.test(uri) && (uri += '.js');
			return uri.replace(':80/', '/')
		},
		getUri:function (id) {
			var isExtend=/^(extend|ext):\/\//i;
			var isPlugins=/^(plugins|plu):\/\//i;
			return id?(id.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1)?id.replace(/([^:])\/+/g, '$1/'):
			cmd.getSuffix((cmd.getDirname(cmd.config.base)+(isExtend.test(id)?('extend.'+id.replace(isExtend, '')):
			isPlugins.test(id)?('plugins.'+id.replace(isPlugins, '')):id))):
			cmd.getCurrentScript()
		},
		loadScript:function(url, callback,charset) {
			var isCss=/\.css(?:\?|$)/i.test(url),
			node = doc.createElement(isCss ? 'link' : 'script');
			node.charset = charset||'UTF-8'
			isCss? (node.rel = 'stylesheet',node.href = url):(node.async = true, node.src = url ,node.id = url);
			node.onload = node.onerror = function(events) {
				if (/^(?:loaded|complete|undefined)$/.test(node.readyState)) {
					var parent = node.parentNode;
					node.onload = node.onerror = node.onreadystatechange = null;
					if (!isCss&&parent) parent.removeChild(node);
					node = null;
					callback&&callback(url, events);
				}
			};
			baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
		},
		loadDeps : function(module) {
			for(var i =0; i<module.deps.length; i++) {
				var uri = cmd.getUri(module.deps[i]);
				if( !cmd.cache[uri] ) cmd.loadScript(uri);
			};
		},
		loadModule : function () {
			var modules=cmd.cache;	
			for (var key in modules) {
				var params = [];
				var module = modules[key];
				if (module.status === 'loaded')continue;
				if (module.status === 'initial')cmd.loadDeps(module),module.status = 'loading';
				if (module.status === 'loading') {
					
				
					for (var i = 0; i < module.deps.length; i++) {
						var uri = cmd.getUri(module.deps[i]);
						console.log(module.deps)
						if (cmd.cache[uri] && modules[uri].status === 'loaded')params.push(modules[uri].exports);
					};
					if (module.deps.length === params.length&&isFunction(module.exports)) {
						module.exports = module.exports.apply(modules,params);
						app.modules=modules;
						
						module.status = 'loaded';
						cmd.loadModule();
					}
				}
			}
		},
		define: function(id,deps,factory) {
			var module,modNam,status,exports;
			var req= /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g; 
			if (!isString(id))factory=deps,deps=id,id=null;
			if (!isArray(deps)) factory = deps,deps = [];	 
			if (isFunction(factory)) factory.toString().replace(req, function (match, dep) {deps.push(dep);});
			deps.length===0?(status='loaded',exports=factory()):(status='initial',exports=factory);
			modName =cmd.getUri(id);
			module={uri:modName,deps:deps,status:status,exports:exports};
			cmd.cache[modName] = module;
			return cmd.loadModule();
		}/*,
		require: function(id,callback){
			cmd.define.apply([], Array.prototype.slice.call(arguments).concat(cmd.uid()));
		}*/
	};
	if(cmd.config.main)cmd.define([cmd.config.main],function(){});
	app.extend({
		module: cmd.define,
		config:function(config){
			var base=config.base;
			cmd.config.base=base
		}
	});
	w.app = w.APP = app
})(window);


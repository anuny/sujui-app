(function(w, undefined) {
	var app ={},
	doc=document,
	docUrl = location.href,
	head=doc.getElementsByTagName("head")[0] || doc.documentElement,
	baseElement=head.getElementsByTagName("base")[0];
	type = function(val) {return null == val ? val + "": Array == val.constructor ? "array": typeof val},
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
			debug:false
		},
		log:function(msg){
			cmd.config.debug&&(w.console ? console.warn(msg) : alert(msg))
		},
		getCurrentScript:function(){
			if (doc.currentScript) return doc.currentScript.src;
			var stack;
			try {
				a.b.c()
			} catch(e) {
				stack = e.stack;
				if (!stack && window.opera) stack = (String(e).match(/of linked script \S+/g) || []).join(" ")
			}
			if (stack) {
				stack = stack.split(/[@ ]/g).pop();
				stack = stack[0] == "(" ? stack.slice(1, -1) : stack;
				return stack.replace(/(:\d+)?:\d+$/i, "")
			}
			var nodes = head.getElementsByTagName("script");
			for (var i = 0,node; node = nodes[i++];) if (node.readyState === "interactive") return node.className = node.src
		},
		getDirname : function(path){
			return path.match(/[^?#]*\//)[0]
		},
		getRealPath:function(path) {
			path = path.replace(/\/\.\//g, "/");
			path = path.replace(/([^:\/])\/\/+/g, "$1/");
			while (path.match(/\/[^/]+\/\.\.\//g)) {
				path = path.replace(/\/[^/]+\/\.\.\//g, "/")
			}
			return path
		},
		getSuffix:function(uri) {
			uri = cmd.getRealPath(uri);
			/#$/.test(uri)?uri = uri.slice(0, -1):!/\?|\.(?:css|js)$|\/$/.test(uri) && (uri += '.js');
			return uri.replace(":80/", "/")
		},
		getUri:function (id) {
			return id?(id.search(/^(http:\/\/|https:\/\/|\/\/)/) !== -1)?id.replace(/([^:])\/+/g, '$1/'):cmd.getSuffix(cmd.getDirname(docUrl)+id):cmd.getCurrentScript();
		},
		Module:function Module(uri, deps, factory ,cover) {
			var module={
				uri:uri||null,
				deps:deps||[],
				factory:factory||{},
				status:'loaded',
				exports:null
			};
			return module;
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
		loadModule: function(uri,callback) {
			var mod;
			if (cmd.cache[uri]) {
				mod = cmd.cache[uri];	
				if (mod.status == 'loaded') {
					callback(mod.factory())
				} else {
					//如果未到加载状态直接往onLoad插入值，在依赖项加载好后会解除依赖
					mod.callback.push(callback);
				}
			}else{
				cmd.saveModule(uri, callback);
			}	
		},
		saveModule: function(uri,callback){
			var mod;
			if (cmd.cache.hasOwnProperty(uri)) {
				mod = cmd.cache[uri];
				mod.exports = mod.factory ? mod.factory() : null;
			} else {
				cmd.loadScript(uri,function(){
					cmd.loadScript(uri);
					callback && callback(cmd.cache[uri].factory());
				});
				
				
			}
		},
		define: function(id,deps,factory,cover) {
			var modName;
			var req= /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g; 
			if (isArray(id)) cover=factory;	
			if (!isString(id))factory=deps,deps=id,id=null;
			if (!isArray(deps)) cover=factory,factory = deps,deps = [];	 
			if (isFunction(factory)) factory.toString().replace(req, function (match, dep) {deps.push(dep);});
			modName =cmd.getUri(id);
			var creatModule = cmd.Module(modName,deps,factory,cover);
			var err = "module:[" + modName + "] already defined";
			cmd.cache[modName] = cmd.cache.hasOwnProperty(modName) ? (cover ? creatModule : (cmd.log(err), cmd.cache[modName])) : creatModule
		},
		require: function(id,callback){
			isArray(id) || (id = [id]);
			if(id.length==0)return;
			var exports = [];
			var uriCount = 0;
			for (var i=0,len=id.length;i<len;i++) {
				var uri = cmd.getUri(id[i]);
				(function (i) {
					uriCount++;
					cmd.loadModule(uri,function (exps) {
						exports[i] = exps;
						uriCount--;
						if (uriCount == 0) {
							callback && callback.apply(callback, exports);
						}
					})
				})(i);
			}
		}
	};
	
	app.extend({
		define: cmd.define,
		require: cmd.require,
		config: cmd.config
	});
	w.app = w.APP = app
})(window);


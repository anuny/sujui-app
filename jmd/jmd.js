(function(w, undefined) {
	var doc=document,
	head=doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement=head.getElementsByTagName('base')[0],
	scripts = doc.getElementsByTagName('script'),
	appScripts = scripts[scripts.length - 1];
	var app = {
		version:'0.0.1',
		type:function(obj,types){
			function type(obj){return null == obj ? obj + '': Array == obj.constructor ? 'array': typeof obj};
			return types?type(obj) === types: type(obj);
		},
		trim: function(obj) {
			return (obj || '').replace(/\s+/g, '')
		},
		extend:function(module) {
			var i = 0,target = this,deep = false,length = arguments.length,obj, empty, items, x;
			app.type(arguments[0],'boolean') ? (deep = true, i = 1, length > 2 ? (i = 2, target = arguments[1]) : void 0) : 
			(length > 1 ? (i = 1, target = arguments[0]) : void 0);
			for (x = i; x < length; x++) {
				obj = arguments[x];
				for (items in obj) {
					if (obj[items] === target) continue;
					deep && app.type(obj[items],'object') && obj[items] !== null ? (empty = app.type(obj[items],'array') ? [] : {},
					target[items] = app.extend(deep, target[items] || empty, obj[items])) : target[items] = obj[items]
				}
			};
			return target
		},
		log:function(type,msg){
			return cmd.data.config.debug&& (w.console ? console[type](msg) : alert(type + ' : ' + msg)),false;
		}
	};
	
	function Module(uri, deps, factory) {
        this.uri = uri;
		this.deps = deps;
		this.factory = factory;
		this.exports = {};
		this.created = false;
	}

	Module.prototype.create = function() {
		if(this.created) return;
		this.created = true;
		cmd.emit('complete', this);
		var exports = this.factory(this.getExports, this.exports ,this);
		if(exports)this.exports=exports;
		cmd.emit(this.uri, this);
	};

	Module.prototype.getExports = function(uri) {
		var alias=cmd.data.config.alias[uri];
		if(alias != null){uri = alias};
		uri = cmd.getUri(uri);
		return cmd.data.modules[uri].exports;
	};
	
	var cmd={
		data : {
			modules : {},
			callbacks : {},
			status : {},
			config : {
				main:appScripts.getAttribute("app-main"),
				debug:appScripts.getAttribute('app-debug'),
				base:appScripts.getAttribute("app-base")||location.href,
				charset:'utf-8',
				alias : {},
				strict:false,
				cache:true
			}
		},
		debug : function (id, callback){
			var fn = cmd.data.callbacks[id];
			if(fn == null){
				cmd.data.callbacks[id] = [];
			}
			cmd.data.callbacks[id].push(callback);
			
		},
		bind : function(ids, callback){
			var count = 0;
			for(var i=0; i<ids.length; i++){
				var id = ids[i];
				var fn = cmd.data.callbacks[id];
				if(fn == null){
					cmd.data.callbacks[id] = [];
				}
				cmd.data.callbacks[id].push(function (result){
					if((++count) === ids.length){
						return callback(result);
					}else{
						return null;
					}
				});
			}
		},
		emit : function(id, event){
			var fn = cmd.data.callbacks[id];
			if(fn){
				for(var i=0; i<fn.length; i++){
					fn[i](event);
				}
			}
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
			cmd.getSuffix((cmd.getDirname(cmd.data.config.base)+(isExtend.test(id)?('extend.'+id.replace(isExtend, '')):
			isPlugins.test(id)?('plugins.'+id.replace(isPlugins, '')):id))):
			cmd.getCurrentScript()
		},
		loadScript:function(url) {
			var time = (new Date).getTime();
			if(cmd.data.status[url] != null) return; 
			cmd.data.status[url] = true;
			cmd.emit('loading', url);
			var isCss=/\.css(?:\?|$)/i.test(url),
			node = doc.createElement(isCss ? 'link' : 'script');
			node.charset = cmd.data.config.charset||'utf-8'
			isCss? (node.rel = 'stylesheet',node.href = url+='?nocache='+time):(node.async = true, node.src = url+='?nocache='+time);
			baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
			node.onload = function() {
				cmd.emit('loaded', url);
			};
			var parent = node.parentNode;
			if (!isCss&&parent) parent.removeChild(node);
			node.onload = node.onerror = node.onreadystatechange = null;
			node = null;
		},
		loadDeps : function(module,deps) {		
			var loadDeps = [];
			for(var i = 0,len=deps.length; i < len; i++) {
				var dep = deps[i];
				if(!cmd.data.modules[dep]){
					loadDeps.push(dep);
				}
			}	
			if(loadDeps.length == 0){
				module.create();
			}else{
				cmd.bind(loadDeps, function(){
					module.create();
				});
	
				for(var i = 0, len = loadDeps.length; i < len; i++) {
					cmd.loadScript(loadDeps[i]);
				}
			}
		},
		define: function(id,factory) {
			//获取依赖
			var deps=[],realId=id,	
			req= /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g; 
			
			//无模块名
			if (!app.type(id,'string'))factory=id,id=null;
			
			//检查依赖	 		
			if (app.type(factory,'function')) factory.toString().replace(req, function (match, dep) {	
				if(cmd.data.config.alias[dep] != null){dep = cmd.data.config.alias[dep]};
				deps.push(cmd.getUri(dep))
			});

			//格式化模块名
			id =cmd.getUri(id);
				
			if(cmd.data.config.strict&&cmd.data.modules[id]){
				return app.log('warn','module:["' + realId + '"] already defined');
			}
			
			//创建模块
			var module = new Module(id, deps, factory);
			//保存模块
			cmd.data.modules[id] = module;
			//保存状态
			cmd.emit('loaded', module);
			//加载依赖
			cmd.loadDeps(module,deps)
		}
	};
	app.extend({
		define: cmd.define,
		module: cmd.data.modules,
		config:function(config){
			for(var i in config){
				cmd.data.config[i] = config[i];
			}
			
		}
	});
	var appMain=cmd.data.config.main;
	if(appMain){
		appMain=cmd.getUri(appMain);
		cmd.loadScript(appMain)
	}
	
	
	cmd.debug('loading', function (uri){
		console.log('\t\t%c' + '-> load file: "%c' + uri + '"', 'color:green', 'color:black');
	});
	cmd.debug('loaded', function (module) {
		var uri = module.uri;
		var deps = module.deps;
		console.log('%cmodule : %c' + uri,'color:green', "color:red;font-weight:bold");
		console.log('\t%c-> deps: %c[' + deps + ']', 'color:green', 'color:blue');
	});
	
	cmd.debug('complete', function (module) {
		console.log('%ccomplete: %c ' + module.uri, 'color:green', 'color:green');
	});


	w.app = w.APP = app;
})(window);
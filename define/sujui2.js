(function(w, undefined) {
	var appScripts=document.getElementsByTagName('script');
	var debug = false;
	var module={}
	function trim(obj) {
		return (obj || '').replace(/\s+/g, '')
	} 
	
	function type(o,t){
		function _t(o){return null == o ? o + '': Array == o.constructor ? 'array': typeof o};
		return t?(_t(o) === t): _t(o);
	}
	
	function log(type, msg){
		return debug ? (w.console ? console[type](msg) :alert(type + " : " + msg)):false;
	}

	
	
	function define(id,factory,cover,pid){
		var _define,_require,thisPid,_module,curSrc,doc=document;
		if(!arguments[0]||!type(arguments[0],'string'))return log('error','no module ID defined');
		id = trim(id);
		cover= cover == undefined ? false: cover;
		thisPid='pid='+ id;
		_define=function(id,factory,cover){
			define(id,factory,cover,thisPid)
		};
		_require=function(id,callback){
			require(id,callback,thisPid)
		};
		
		curSrc = function(){
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
			var nodes = doc.getElementsByTagName('script');
			for (var i = 0,node; node = nodes[i++];) if (node.readyState === 'interactive') return node.className = node.src
		};
		_module={
			id:id,
			exports:factory,
			cover: cover,
			type: type(factory),
			module:{},
			define:_define,
			require:_require,
			uri:curSrc()||location.href
		};
		
		var tip='module:[' + id + '] already defined';
		if(pid){
			pid = pid.split('pid=')[1];
			var parentModule=module[pid];
			if(parentModule){
				_module.uri=parentModule.uri;
				parentModule.module[id]&&!cover?app.log('warn',tip):parentModule.module[id] = _module;
			}
		}else{
			module[id]&&!cover?log('warn',tip):module[id] = _module;
		}	
	}
	
	function loadjs(url, callback,charset){
		var isCss=/\.css(?:\?|$)/i.test(url),
		head=document.getElementsByTagName('head')[0] || doc.documentElement,
		baseElement=head.getElementsByTagName('base')[0],
		node = document.createElement(isCss ? 'link' : 'script');
		node.charset = charset||'UTF-8';
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
	}
	
	function require(id,callback,pid){
		type(id,'array')||(id = [id]);
		if(id[0]==undefined)return log('error','no module ID required');
		var exports=[],_module,getExports;
		getExports = function(id,module){
			var exports=[],mod,uri,pod,pid,cid;
			for(var i = 0, len=id.length; i < len; i++){
				uri=trim(id[i]);
				pod=uri.split('=>');
				pid=pod[0];
				cid=pod[1];
				//判断子模块
				if(pid&&cid){
					mod=module[pid]['module'][cid];
				}else{
					mod=module[uri];
				}
				//判断模块是否存在
				if(mod) {
					exports[i] = type(mod.exports,'function')?mod.exports():mod.exports	
				}else{
					return log('error', 'module:[' + id + '] is not defined');
				}
			};
			return exports;
		};
		pid=pid&&pid.split('pid=')[1];
		if(pid){
			if(module[pid]){
				_module=module[pid].module
			}else{
				return log('error', 'module:[' + pid + '] is not defined');
			}
		}else{
			_module=module
		};
		exports = getExports(id,_module);
		return type(callback,'function')?callback.apply(null,exports): exports[0]
	}
	w.debug = function(type){
		debug = type
	};
	w.module = module;
	w.define = define;
	w.require = require;
})(window);


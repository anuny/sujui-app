(function(w, undefined) {
	var appScripts=document.getElementsByTagName('script');
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
		debug:appScripts[appScripts.length - 1].getAttribute('app-debug'),
		log:function(type,msg){
			return app.debug=='true' && (w.console ? console[type](msg) : alert(type + ' : ' + msg)),false;
		}
	};
	var cmd={
		module:{},
		define:function(id,factory,cover,pid){
			var define,require,thisPid,module,curSrc,doc=document;
			if(!arguments[0]||!app.type(arguments[0],'string'))return app.log('error','no module ID defined');
			id = app.trim(id);
			cover= cover == undefined ? false: cover;
			thisPid='pid='+ id;
			define=function(id,factory,cover){
				app.define(id,factory,cover,thisPid)
			};
			require=function(id,callback){
				app.require(id,callback,thisPid)
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
			module={
				id:id,
				exports:factory,
				cover: cover,
				type: app.type(factory),
				module:{},
				define:define,
				require:require,
				uri:curSrc()||location.href
			};
			
			var tip='module:[' + id + '] already defined';
			if(pid){
				pid = pid.split('pid=')[1];
				var parentModule=cmd.module[pid];
				if(parentModule){
					module.uri=parentModule.uri;
					parentModule.module[id]&&!cover?app.log('warn',tip):parentModule.module[id] = module;
				}
			}else{
				cmd.module[id]&&!cover?app.log('warn',tip):cmd.module[id] = module;
			}	
		},
		loadjs:function(url, callback,charset){
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
		},
		require:function(id,callback,pid){
			app.type(id,'array')||(id = [id]);
			if(id[0]==undefined)return app.log('error','no module ID required');
			var exports=[],module,getExports;
			getExports = function(id,module){
				var exports=[],mod,uri,pod,pid,cid;
				for(var i = 0, len=id.length; i < len; i++){
					uri=app.trim(id[i]);
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
						exports[i] = app.type(mod.exports,'function')?mod.exports():mod.exports	
					}else{
						return app.log('error', 'module:[' + id + '] is not defined');
					}
				};
				return exports;
			};
			pid=pid&&pid.split('pid=')[1];
			if(pid){
				if(cmd.module[pid]){
					module=cmd.module[pid].module
				}else{
					return app.log('error', 'module:[' + pid + '] is not defined');
				}
			}else{
				module=cmd.module
			};
			exports = getExports(id,module);
			return app.type(callback,'function')?callback.apply(null,exports): exports[0]
		}
	};
	app.extend(cmd);
	w.app = w.APP = app;
})(window);


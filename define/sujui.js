(function(w, undefined) {
	var doc = document,
		dom = document.getElementsByTagName('*'),
		module = {},
		handlerMap = {
			dom:[],
			model:[]
		};

	// 构造模块
    function Module(id, factory) {
		this.id      = id;
        this.factory = factory;
		module [id]  = this;
    }
	
	//获取模块返回值
    function getExp(id) {
        var mod = module[id]
		var factory = mod.factory
		if('function' === typeof factory){
			return factory()
		}else{
			return factory
		}
    }
	
	//定义模块
	function define(id,factory){
		if(!id||'string' !== typeof id)return;
		var deps = [];
		new Module(id,factory)
		deps = null;
	}
	
	//获取模块
	function require(id,callback){
		if('function' == typeof id)return id();
		Array == id.constructor||(id = [id]);
		var exports=[];
		for(var i=0,len=id.length;i<len;i++){
			var exp = getExp(id[i])
			exports.push(exp)
		}
		if('function' == typeof callback){
			callback.apply(null,exports)
		}else{
			return exports[0]
		}
		
	}
	
	// 创建唯一ID
	function getUID() {
		return "0101100101011010".replace(/[01]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == '0' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}
	
	// 保存
	function saveHandler(dom,model){
		var uuid           = getUID(),
			appDom         = {},
			appModel       = {};
			appDom[uuid]   = dom;
			appModel[uuid] = model;
			handlerMap.dom.push(appDom);
			handlerMap.model.push(appModel);	
	}

	each(dom,function(){
		var appModel = this.getAttribute('app-model');
		if(appModel){
			saveHandler(this,appModel)
		}	
	})

	function each(object, callback) {
		var name, i = 0, length = object.length;
		if ( length == undefined ) {
				for ( name in object )if ( callback.call( object[ name ], name, object[ name ] ) === false )break;
			} else{
				for ( var value = object[0];i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
			}
		return object;
	}
	
	
	function init(modelName,callback){
		var doms = handlerMap.dom,models = handlerMap.model;
		if(!doms||!models) return;
		each(doms,function(i,dom){
			var model;
			each(dom,function(uid,ele){
				var self = [];
				model = models[i][uid];
				self['element'] = this;
				self['uid'] = uid;
				self['model'] = model;
				if(model == modelName)callback.call(self,this);
				self = null;
			})
		})
	}
	
	var app = {
		ready: function (fn) {
            /in/.test(document.readyState) ? setTimeout(fn, 9) : fn()
        },
		init:init
	}
	w.define = define;
	w.require = require;
	w.app = app;
})(window);


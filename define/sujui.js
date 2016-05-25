(function(w, undefined) {
	var module={};

	// 构造模块
    function Module(id, factory) {
		this.id      = id;
        this.factory = factory;
		module [id]  = this;
    }

    function getExp(id) {
        var mod = module[id]
		var factory = mod.factory
		if('function' === typeof factory){
			return factory()
		}else{
			return factory
		}
    }
	
	
	function define(id,factory){
		if(!id||'string' !== typeof id)return;
		var deps = [];
		new Module(id,factory)
		deps = null;
	}

	function require(id,callback){
		if('function' == typeof id)return id();
		'array' == typeof id||(id = [id]);
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
	w.module = module;
	w.define = define;
	w.require = require;
})(window);


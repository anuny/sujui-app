app.define(function() {
	function type(obj){
		return null == obj ? obj + "": Array == obj.constructor ? "array": typeof obj
	}
	type.prototype.isObject=function(){
		
	}
	
	var stype={
		of:function(val) {return null == val ? val + "": Array == val.constructor ? "array": typeof val},
		isObject: function(val) {return "object" === type.of(val);},
		isFunction: function(val) {return "function" === type.of(val)},
		isArray: function(val) {return "array" === type.of(val)},
		isString: function(val) {return "string" === type.of(val)},
		isIE: reg.MSIE.test(reg.agent)
	}
	
	return {
		type:type
	}
})

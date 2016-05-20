app.define(function() {
	var type={
		is:function(obj){return null == obj ? obj + "": Array == obj.constructor ? "array": typeof obj},
		isString:function(obj){return "string" === this.is(obj)},
		isFunction:function(obj){return "function" === this.is(obj)},
		isObject:function(obj){return "object" === this.is(obj)},
		isArray:function(obj){return "array" === this.is(obj)},
		isBoolean:function(obj){return "boolean" === this.is(obj)},
		isNumber:function(obj){return "number" === this.is(obj)},
		isEmpty:function(obj){return obj.length==0?true:false},
		isPlainObject:function(obj){return "isPrototypeOf" in obj && this.isObject(obj)},
		isEmptyObject:function(obj){for (var i in obj) {return false};return true}
	};
	var _agent=navigator.userAgent.toLowerCase()
	var browser={
		version:(_agent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
		isWebKit: /webKit/i.test(_agent),
		isChrome: /chrome/i.test(_agent),
		isOpera: /opera/.test(_agent),
		isIE: /msie/i.test(_agent),
		isSafari: /webkit/.test(_agent),
		isAndroid: /(android)\s+([\d.]+)/.test(_agent),
		isIpad: /(ipad).*OS\s([\d_]+)/.test(_agent),
		isIphone: /(iphone\sOS)\s([\d_]+)/.test(_agent),
		isBlackberry: /(blackBerry|bb10|playbook).*version\/([\d.]+)/.test(_agent),
		isFirefoxOS: /(mozilla).*mobile[^\/]*\/([\d\.]*)/.test(_agent),
		isWebOS: /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/.test(_agent)
	};
	var check = {
		isEmail: function(val) {return /^(?:[\w-]+\.?)*[\w-]+@(?:[\w-]+\.)+[\w]{2,3}$/.test(val)},
		isUrl: function(val) {return /^http:\/\/(?:[\w-\.]{0,255})(?:(?:\/?[^\s]{0,255}){0,255})/g.test(val)},
		isEnglish:function(val) {return /^[A-Za-z]+$/.test(val)},
		isQQ:function(val) {return /^[1-9]\d{4,9}$/.test(val)&& parseInt(this)<=4294967294},
		isMobile:function(val) {return /^1[3458]\d{9}$/.test(val)},
		isTel:function(val) {return /^[+]{0,1}(\d){1,3}[]?([-]?((\d)|[]){1,12})+$/.test(val)}
	};
	
	var array={
		indexof : function(array,obj){	
			for (var i = 0, len = array.length; i<len; i++)if(array[i] == obj)return i;
			return -1;  
		},
		remove:function(array,obj){
			var i = this.indexof(array,obj);
			if (i > -1)array.splice(i, 1);
			return array
		},
		each:function(array,callback){
			for (var i = 0,len = array.length; i<len;i++) type.isFunction(callback) && callback(i, array[i])
		}
	}
	
	var exports={
		type:type,
		browser:browser,
		check:check,
		array:array
	};

	return exports
})

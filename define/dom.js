define("dom",
function() {
	var w = window,
	doc = w.document,
	parentsExp = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/gi,
	simpleExp = /^[\w\-_#]+$/,
	trimExp = /^\s*|\s*$/g,
	classExp = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
	idExp = /^(?:[\w\-_]+)?#([\w\-_]+)/,
	tagExp = /^([\w\*\-_]+)/,
	NAN = [null, null];
	var dom = function(selector, context) {
		return new dom.fn.init(selector, context)
	};
	dom.fn = dom.prototype = {
		constructor: dom,
		init: function(selector, context) {
			var elements = query(selector, context);
			this.length = 0;
			this.context = context || doc;
			this.selector = selector;
			[].push.apply(this, elements);
			return this
		},
		each: function(callback) {
			return each(this, callback);
		},
		find: function(selector) {
			var ele = [];
			this.each(function(i, _ele) {
				_ele = _ele.nodeType == 1? _ele : _ele[0]
				ele.push(dom(selector, _ele))
			});
			return dom(ele[0])
		},
		data: function(name, value) {
			var node = this[0];
			return value ? node && node.dataset && node.dataset[name] || 
			node && this.attr("data-" + name) : 
			node && (node.dataset && (node.dataset[name] = value) || 
			this.attr("data-" + name, value))
		},
		eq: function(i) {
			return dom([this[i]])
		},
		first: function() {
			return this.eq(0)
		},
		last: function() {
			return this.eq(this.length - 1)
		},
		attr: function(key, value) {
			return value ? this.each(function(k, v) {
				v.setAttribute(key, value)
			}) : this[0].getAttribute(key)
		},
		html: function(html) {
			return html ? this.each(function(k, v) {
				v.innerHTML = html
			}) : this[0].innerHTML
		},
		text: function(text) {
			return text ? this[0].innerText ? this.each(function(k, v) {
				v.innerText = text
			}) : this.each(function(k, v) {
				v.textContent = text
			}) : this[0].hasOwnProperty("innerText") ? this[0].innerText: this[0].textContent
		},
		val: function(val) {
			return val ? this.each(function(k, v) {
				v.value = val
			}) : this[0].value
		},
		css: function(prop, val){
			var self = this;
			typeof prop == 'string'?this.each(function(i,ele){ele.style[prop] = val;}):each(prop,function(k,key){self.css(k,key);});
			return this;
		},
		hasClass: function(className){
			return hasClass(className,this[0]);
		},
		addClass: function(className){
			return this.each(function(i,ele){
				if (!dom(this).hasClass(className)) ele.className = [ ele.className, className].join(' ').replace(/(^\s+)|(\s+$)/g, '');
			}) ; 
		},
		removeClass: function(className){
			return this.each(function(i,ele){
				var salf=dom(this);
				if (salf.hasClass(className)) ele.className =  ele.className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)', 'g'), ' ').replace(/(^\s+)|(\s+$)/g, '');
			});
		},
		create: function (html) {
            var div = document.createElement('div'),
                els = [];
            div.innerHTML = html;
            ele = div.childNodes;
            return ele.length == 1 ? ele[0] : ele
        },
        append: function (elem) {
            elem = this.create(elem);
            this[0].appendChild(elem);
            return this
        }
	};
	function getIdName(node) {
		return (node.match(idExp) || NAN)[1]
	}
	function getClassName(node) {
		return (node.match(classExp) || NAN)[1]
	}
	function getTagName(node) {
		return (node.match(tagExp) || NAN)[1]
	}
	
	function each(object, callback) {
		var name, i = 0, length = object.length;
		if ( length == undefined ) {
				for ( name in object )if ( callback.call( object[ name ], name, object[ name ] ) === false )break;
			} else{
				for ( var value = object[0];i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
			}
		return object;
	}
	
	function hasClass(className, node) {
		return new RegExp('(\\s|^)' + className + '(\\s|$)').test(node.className);
	}
	
	function getByClassName(className, context) {
		var ele, temps = [];
		if (context.getElementsByClassName) {
			ele = context.getElementsByClassName(className)
		} else {
			var nodes = context.getElementsByTagName("*");
			for (var i = 0,
			len = nodes.length; i < len; i++) {
				var hasclass = hasClass(className,nodes[i]);
				if (hasclass) temps.push(nodes[i])
			}
			ele = temps;
			temps = null
		}
		return ele
	}
	function getElement(selector, context) {
		var IdName = getIdName(selector),
		TagName = getTagName(selector),
		ClassName = getClassName(selector),
		ele;
		if (selector === "body"){
			ele = doc.body
		} else if (IdName && context === doc) {
			ele = [context.getElementById(IdName)]
		} else if (ClassName && TagName) {
			var _node = getByClassName(ClassName, context);
			var classEle = [];
			each(_node,function(i, ele) {
				if (ele.tagName.toLowerCase() == TagName) {
					classEle.push(ele)
				}
			});
			ele = classEle;
			classEle = null;
			_node = null
		} else if (ClassName) {
			ele = getByClassName(ClassName, context)
		} else if (TagName) {
			ele = context.getElementsByTagName(TagName)
		}
		return ele
	}
	function makeArray(array) {
		var ret = [];
		if (array != null) {
			var len = array.length;
			if (len == null || array.split || array.setInterval || array.call) {
				ret[0] = array
			} else {
				each(array,
				function(i, arr) {
					ret[i] = arr
				})
			}
		}
		return ret
	}
	function query(selector, context) {
		var ele;
		selector = selector || doc;
		context = context || doc; (selector === w || selector === doc) && (context = selector);
		if ("string" == typeof selector) {
			selector = selector.replace(trimExp, "");
			var simple = simpleExp.test(selector);
			if (simple) {
				ele = getElement(selector, context)
			} else {
				if (context.querySelectorAll) {
					ele = context.querySelectorAll(selector)
				} else {
					selector = selector.match(parentsExp);
					var node = [context],
					_ele = [];
					each(selector,function(i, selector) {
						var IdName = getIdName(selector);
						_ele = [];
						if (IdName) {
							_ele.push(getElement(selector, document)[0])
						} else {
							each(node,function(i, node) {
								var temps = getElement(selector, node);
								each(temps,function(i, temp) {
									_ele.push(temp)
								})
							})
						}
						node = _ele
					});
					ele = _ele;
					node = null;
					_ele = null
				}
			}
		} else {
			ele = selector
		}
		return makeArray(ele)
	}
	dom.fn.init.prototype = dom.fn;
	return dom
});
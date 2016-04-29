app.define('extend://dom',function() {
	var exports = (function(selector, context) {
		var dom = function(selector, context) {
			return new dom.fn.init(selector, context)
		};
		dom.readyList=[];
		dom.fn = dom.prototype;
		dom.fn = {
			//初始化对象
			constructor: dom,
			//通过this.query返回对象
			init: function(selector, context) {
				var ret=this.selector(selector, context);
				return 	this.set(ret, selector, context)
			}
		};
		dom.fn.init.prototype = dom.fn;
		dom.fn.set= function(elements, selector, context) {
			this.length = 0;
			this.context = context||document;
			this.selector = selector;
			[].push.apply(this, elements);		
			return this
		};
		dom.fn.push= Array.prototype.push;
		dom.fn.sort= [].sort;
		dom.fn.splice= [].splice;
		dom.fn.selector = (function() {
			var snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
			exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
			exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
			exprNodeName = /^([\w\*\-_]+)/,
			na = [null, null];
			function _find(selector, context) {
				selector=selector||document;
				context = context || document;
				if(selector.nodeType){
					this[0] = selector;
					this.length = 1;
					this.selector = selector;
					return [this];
				};
				(selector === window || selector === document)&&(context=selector);
				
				var simple = /^[\w\-_#]+$/.test(selector);
				if (!simple && context.querySelectorAll) {
					return realArray(context.querySelectorAll(selector))
				}
				if (selector.indexOf(',') > -1) {
					var split = selector.split(/,/g),
					ret = [],
					sIndex = 0,
					len = split.length;
					for (; sIndex < len; ++sIndex)ret = ret.concat(_find(split[sIndex], context));
					return unique(ret)
				}
				var parts = selector.match(snack),
				part = parts.pop(),
				id = (part.match(exprId) || na)[1],
				className = !id && (part.match(exprClassName) || na)[1],
				nodeName = !id && (part.match(exprNodeName) || na)[1],
				collection;
				if (className && !nodeName && context.getElementsByClassName) {
					collection = realArray(context.getElementsByClassName(className))
				} else {
					collection = !id && realArray(context.getElementsByTagName(nodeName || '*'));
					if (className) {
						collection = filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'))
					}
					if (id) {
						var byId = context.getElementById(id);
						return byId ? [byId] : []
					}
				}
				return parts[0] && collection[0] ? filterParents(parts, collection) : collection
			}
			function realArray(c) {
				try {
					return Array.prototype.slice.call(c)
				} catch(e) {
					var ret = [],
					i = 0,
					len = c.length;
					for (; i < len; ++i)ret[i] = c[i];
					return ret
				}
			}
			function filterParents(selectorParts, collection, direct) {
				var parentSelector = selectorParts.pop();
				if (parentSelector === '>') {
					return filterParents(selectorParts, collection, true)
				}
				var ret = [],
				r = -1,
				id = (parentSelector.match(exprId) || na)[1],
				className = !id && (parentSelector.match(exprClassName) || na)[1],
				nodeName = !id && (parentSelector.match(exprNodeName) || na)[1],
				cIndex = -1,
				node,
				parent,
				matches;
				nodeName = nodeName && nodeName.toLowerCase();
				while ((node = collection[++cIndex])) {
					parent = node.parentNode;
					do {
						matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
						matches = matches && (!id || parent.id === id);
						matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
						if (direct || matches)break;
					} while (( parent = parent . parentNode ));
					if (matches) ret[++r] = node;
				}
				return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret
			}
			var unique = (function() {
				var uid = +new Date();
				var data = (function() {
					var n = 1;
					return function(elem) {
						return !elem[uid]?(elem[uid] = n++,true):false;
					}
				})();
				return function(arr) {
					var length = arr.length,
					ret = [],
					r = -1,
					i = 0,
					item;
					for (; i < length; ++i) {
						item = arr[i];
						if (data(item)) ret[++r] = item;
					}
					uid += 1;
					return ret
				}
			})();
			function filterByAttr(collection, attr, regex) {
				var i = -1,
				node, r = -1,
				ret = [];
				while ((node = collection[++i])) {
					if (regex.test(node[attr])) ret[++r] = node;
				}
				return ret
			};
			return _find
		})();
		dom.fn.each= function(fn) {
			for (var i = 0,len = this.length; i < len; ++i) {
				if (fn.call(this[i], i, this[i]) === false)break;
			};
			return this
		};
		dom.fn.find= function(selector) {
			return dom(selector,this[0])
		};
		dom.fn.eq=function(a) {return dom([this[a]])};
		dom.fn.first= function(a) {return this.eq(0)};
        dom.fn.last= function() {return this.eq(this.length - 1)};
		
		function create(html) {
			var div = document.createElement('div'),els = [];div.innerHTML = html;
			ele = div.childNodes;
			return ele.length == 1 ? ele[0] : ele
		};

		dom.fn.append= function(elem) {
			elem=create(elem);
			this[0].appendChild( elem);
		};
		dom.fn.ready= function(fn) {
			/in/.test(document.readyState)?setTimeout(fn,9):fn()
		};
		return dom(selector, context)
	});
	return exports
})

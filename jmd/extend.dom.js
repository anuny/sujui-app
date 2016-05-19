app.define(function (require,exports,module) {
    var dom = function (selector, context) {
        return new dom.fn.init(selector, context)
    };
    dom.fn = dom.prototype;
	var each=function (object, callback, args){
		var name, i = 0, length = object.length;
			if ( args ) {
				if ( length == undefined ) {
					for ( name in object )if ( callback.apply( object[ name ], args ) === false )break;
				} else{
					for ( ; i < length; )if ( callback.apply( object[ i++ ], args ) === false )break;
				}
			} else {
				if ( length == undefined ) {
					for ( name in object )if ( callback.call( object[ name ], name, object[ name ] ) === false )break;
				} else{
					for ( var value = object[0];i < length && callback.call( value, i, value ) !== false; value = object[++i] ){}
				}
			}
			return object;
		
	},
	indexof=function(array,obj){	
		if (![].indexOf) {  
			for (var i = 0; i < array.length; i++)if(array[i] == obj)return i;
			return -1;  
		};
		return array.indexOf(obj) 
	},
	extend={
		constructor: dom,
        init: function (selector, context) {
            var ret = this.selector(selector, context);
            return this.format(ret, selector, context)
        },
        format: function (elements, selector, context) {
            this.length = 0;
            this.context = context || document;
            this.selector = selector;
            [].push.apply(this, elements);
            return this
        },
        each: function (callback, args) {
            return each(this, callback, args);

        },
        find: function (selector) {
            return dom(selector, this[0])
        },
		data : function(name, value){
			var node=this[0];
			if(value !== undefined){
				node && ((node.dataset && (node.dataset[name] = value)) || (node.setAttribute('data-' + name, value)));
				return this
			}else{
				return (node && node.dataset && node.dataset[name]) || (node && node.getAttribute('data-' + name));
			}
		},
        eq: function (a) {
            return dom([this[a]])
        },
        first: function (a) {
            return this.eq(0)
        },
        last: function () {
            return this.eq(this.length - 1)
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
        },
        ready: function (fn) {
            /in/.test(document.readyState) ? setTimeout(fn, 9) : fn()
        },
		css: function(prop, val){
			var self = this;
			typeof prop == 'string'?this.each(function(i,ele){ele.style[prop] = val;}):each(prop,function(k,key){self.css(k,key);});
			return this;
		},
		hasClass: function(className){
			return new RegExp('(\\s|^)' + className + '(\\s|$)').test(this[0].className);
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
		attr: function(key,value){
			return typeof value == 'undefined'?this[0].getAttribute(key):this.each(function(k,v){v.setAttribute(key,value);})
		},
		html: function(html){
			return typeof html == 'undefined'?this[0].innerHTML:this.each(function(k,v){v.innerHTML = html})
		},
		text: function(text){
			return typeof text == 'undefined'?this[0].hasOwnProperty('innerText')?this[0].innerText:this[0].textContent:this[0].innerText?
			this.each(function(k,v){v.innerText = text;}):this.each(function(k,v){v.textContent = text;})
		},
		val: function(val){
			return typeof val == 'undefined'?this[0].value:this.each(function(k,v){v.value = val})
		},
        push: Array.prototype.push,
        sort: [].sort,
        splice: [].splice,
        selector: (function () {
            var snack = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
                exprClassName = /^(?:[\w\-_]+)?\.([\w\-_]+)/,
                exprId = /^(?:[\w\-_]+)?#([\w\-_]+)/,
                exprNodeName = /^([\w\*\-_]+)/,
                na = [null, null];

            function _find(selector, context) {
                selector = selector || document;
                context = context || document;
                if (selector.nodeType) {
                    this[0] = selector;
                    this.length = 1;
                    this.selector = selector;
                    return this
                };
                (selector === window || selector === document) && (context = selector);
                var simple = /^[\w\-_#]+$/.test(selector);
                if (!simple && context.querySelectorAll) {
                    return realArray(context.querySelectorAll(selector))
                }
                if (indexof(selector,',') > -1) {
                    var split = selector.split(/,/g),
                        ret = [],
                        sIndex = 0,
                        len = split.length;
                    for (; sIndex < len; ++sIndex) ret = ret.concat(_find(split[sIndex], context));
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
                } catch (e) {
                    var ret = [],
                        i = 0,
                        len = c.length;
                    for (; i < len; ++i) ret[i] = c[i];
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
                    node, parent, matches;
                nodeName = nodeName && nodeName.toLowerCase();
                while ((node = collection[++cIndex])) {
                    parent = node.parentNode;
                    do {
                        matches = !nodeName || nodeName === '*' || nodeName === parent.nodeName.toLowerCase();
                        matches = matches && (!id || parent.id === id);
                        matches = matches && (!className || RegExp('(^|\\s)' + className + '(\\s|$)').test(parent.className));
                        if (direct || matches) break
                    } while ((parent = parent.parentNode));
                    if (matches) ret[++r] = node
                }
                return selectorParts[0] && ret[0] ? filterParents(selectorParts, ret) : ret
            }
            var unique = (function () {
                var uid = +new Date();
                var data = (function () {
                    var n = 1;
                    return function (elem) {
                        return !elem[uid] ? (elem[uid] = n++, true) : false
                    }
                })();
                return function (arr) {
                    var length = arr.length,
                        ret = [],
                        r = -1,
                        i = 0,
                        item;
                    for (; i < length; ++i) {
                        item = arr[i];
                        if (data(item)) ret[++r] = item
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
                    if (regex.test(node[attr])) ret[++r] = node
                }
                return ret
            };
            return _find
        })()
    };
	dom.fn = extend;
    dom.fn.init.prototype = dom.fn;
	dom.extend=function(mod){
		for(var id in mod)dom.fn[id]=mod[id] ;   
		return dom;
	};
	return dom
});
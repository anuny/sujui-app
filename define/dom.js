define('dom',function(){
	var dom = function (selector, context) {
        return new dom.fn.init(selector, context)
    };
	var classExp = /^\.([\w-]+)$/,
	idExp = /^#[\w\d-]+$/,
	tagExp = /^[\w-]+$/,
	partsExp = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
	nanExp = [null, null];
			
	dom.fn = dom.prototype = {
		init:function(selector, context){
			var elements = this.query(selector, context);
			this.length = 0;
            this.context = context || document;
            this.selector = selector;
            [].push.apply(this, elements);
            return this
		},
		query:function(selector, context){
			
			var ele;
			selector=selector || document;
			context=context||document;
			(selector === window || selector === document)&&(context=selector);
			if('string' == typeof selector){
				selector=selector.replace(/^\s*|\s*$/g,'')
				if ( selector === 'body' ) {
					ele = doc.body;
				} else {
					ele = this.find( selector, context );
				}
			};
			
			
			return ele
		},
		find:function( selector, context){
			var ele;
			
				
			//判断class类型
			if(classExp.test(selector)){
				
				return context.getElementsByClassName(selector.replace(".", ""))
			//判断Tag类型
			}else if(tagExp.test(selector)){
				console.log(context)
				return context.getElementsByTagName(selector)
			//判断Id类型
			}else if(idExp.test(selector) && context === document) {
				return context.getElementById(selector.replace("#", ""));
			}else if('object' ===typeof selector || Array ===selector.constructor) {
				return selector
			}else{
				var parts = selector.match(partsExp),
				part = parts.pop(),
				idName = (part.match(idExp) || nanExp)[1],
				className = !idName && (part.match(classExp) || nanExp)[1],
				TagName = !idName && (part.match(tagExp) || nanExp)[1];
				return this.filter(parts,part,idName,className,TagName,context)	
			};
		
		},
		filter:function(parts,part,idName,className,TagName,context){
			
			function realArray(array) {
                try {
                    return Array.prototype.slice.call(array)
                } catch (e) {
                    var ret = [];
                    for (var i=0, len = c.length;i<len; ++i) ret[i] = array[i];
                    return ret
                }
            }
			
			function filterByAttr(collection, attr, regex) {
                var i = -1,node, r = -1,ret = [];
                while ((node = collection[++i])) {
                    if (regex.test(node[attr])) ret[++r] = node
                }
                return ret
            };
			
			 function filterParents(selectorParts, collection, direct) {
                var parentSelector = selectorParts.pop();
				
                if (parentSelector === '>') {
                    return filterParents(selectorParts, collection, true)
                }
                var ret = [],
                    r = -1,
                    id = (parentSelector.match(idExp) || nanExp)[1],
                    className = !id && (parentSelector.match(classExp) || nanExp)[1],
                    nodeName = !id && (parentSelector.match(tagExp) || nanExp)[1],
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
				
            };
			
			
			
			var collection;
			if (className && !TagName && context.getElementsByClassName) {
				collection = realArray(context.getElementsByClassName(className))
			} else {
				collection = !idName && realArray(context.getElementsByTagName(TagName || '*'));
				if (className) {
					collection = filterByAttr(collection, 'className', RegExp('(^|\\s)' + className + '(\\s|$)'))
				}
				if (idName) {
					var byId = context.getElementById(idName);
					return byId ? [byId] : []
				}
			}
			
			if(parts[0] && collection[0]){
				

				return filterParents(parts,collection)
				
			}else{
				return collection
			}
			
			
			
		},
		each:function(fn){
			for(var i=0,len=this.length;i<len;i++){
				fn(i,this[i])
			}
			return this
		},
		html:function(html){
			return html?this.each(function(i,ele){
				ele.innerHTML = html
			}):this[0].innerHTML
		}
		
	};
    dom.fn.init.prototype = dom.fn;
	return dom
})
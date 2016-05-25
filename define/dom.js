define('dom',function(){
	
	var w =window,
	doc =w.document,
	parentsExp = /(?:[\w\-\\.#]+)+(?:\[\w+?=([\'"])?(?:\\\1|.)+?\1\])?|\*|>/ig,
	trimExp = /^\s*|\s*$/g,
	classExp = /^\.([\w-]+)$/,
	idExp = /^#[\w\d-]+$/,
	tagExp = /^[\w-]+$/,
	NAN = [null, null];

	
	var dom = function (selector, context) {
        return new dom.fn.init(selector, context)
    };
	
	dom.fn = dom.prototype = {
		init:function(selector, context){
			var elements = find(selector, context);
			this.length = 0;
            this.context = context || doc;
            this.selector = selector;
            [].push.apply(this, elements);
            return this
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
	

	function getIdName(node){
		return (node.match(/^(?:[\w\-_]+)?#([\w\-_]+)/) || NAN)[1]
	}
	
	function getClassName(node){
		return (node.match(/^(?:[\w\-_]+)?\.([\w\-_]+)/) || NAN)[1]
	}
	
	function getTagName(node){
		return (node.match(/^([\w\*\-_]+)/) || NAN)[1]
	}
	function each(array,fn){
		for(var i=0,len=array.length;i<len;i++ ){
			fn(i,array[i])
		}
	}

	
	function filter(selector, context){
		var selectorArray = selector.match(parentsExp);
		var parent,child,parentTagName,parentClassName,_node,parentNodes=[];
		for (var i=0,len=selectorArray.length;i<len;i++){
			parent = selectorArray[i]
			parentIdName = getIdName(parent)
			parentTagName = getTagName(parent)
			parentClassName= getClassName(parent)
			
			if(parentIdName){
				_node = find('#'+parentIdName,context)
			}else if(parentTagName&&parentClassName){
				_node = find('.'+parentClassName,context)
				var classEle = [];
				each(_node,function(i,ele){
					if(ele.tagName.toLowerCase() == parentTagName){
						classEle.push(ele)
					}
				});
				_node = classEle;
			}else if(parentTagName){
				var tagEle = [];
				_node = find(parentTagName,context)
				each(_node,function(i,ele){
					tagEle.push(ele)
				});
				_node = tagEle
			};
			parentNodes.push(_node)
		}
		return filterParents(parentNodes,context)		
	}
	
	function filterParents(parentNodes, context){
		each(parentNodes,function(i,ele){
			console.log(ele)
		})
		
	}

	
	function hasClass(elem, cls){
		cls = cls || '';
		if(cls.replace(/\s/g, '').length == 0) return false;
		return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
	}
	
	function find(selector, context){
		var ele;
		selector=selector || doc;
		context=context||doc;
		(selector === w || selector === doc)&&(context=selector);
		if('string' == typeof selector){
			selector=selector.replace(trimExp,'')
			if ( selector === 'body' ) {
				ele = doc.body;
			} else {
				if(classExp.test(selector)){
					ele =  context.getElementsByClassName(selector.replace(".", ""))
				//判断Tag类型
				}else if(tagExp.test(selector)){
					ele =  context.getElementsByTagName(selector)
				//判断Id类型
				}else if(idExp.test(selector) && context === doc) {
					ele =  [context.getElementById(selector.replace("#", ""))];
				}else if('object' ===typeof selector || Array ===selector.constructor) {
					ele =  selector
				}else{
					ele = filter(selector,context)					
				}
			}
		};
		return ele
	}


	


    dom.fn.init.prototype = dom.fn;
	return dom
})
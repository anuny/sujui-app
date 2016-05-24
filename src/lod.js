;(function (w) {
    'use strict';
    var doc       = w.document, 
	head          = getTagName("head", doc)[0] || doc.documentElement, 
	baseElement   = getTagName("base", head)[0], 
	scripts       = getTagName("script", doc), 
	loaderScripts = scripts[scripts.length - 1], 
	loaderSrc     = loaderScripts.hasAttribute ? loaderScripts.src :attr("src", 4);
		
    function attr(name, idx) {
        return loaderScripts.getAttribute(name, idx);
    }
    function getTagName(name, root) {
        return root.getElementsByTagName(name);
    }
    /**
     * 配置数据
     * @base    {string}  根路径
	 * @paths   {Object}  文件目录
	 * @charset {string}  编码
	 * @cover   {boolean} 是否允许模块重定义
	 * @alias   {Object}  模块路径
     */
    var configs  = {
        base      : attr("app-base", 0) || loaderSrc,
        paths     : {},
        charset   : "utf-8",
		cache     : true,
        cover     : false,
        alias     : {}
    };
	
	
    /**
     * 缓存数据
     * @modules   {Object}  模块缓存
	 * @loadings  {Object}  加载队列
	 * @configUrl {string}  配置文件路径
	 * @configUrl {string}  配置文件路径
	 * @curUri    {string}  加载文件模块名
	 * @curScript {string}  加载文件node
	 * @actScript {string}  加载文件node
	 * @uuid      {string}  禁止缓存UUID
     */

	var data = {
        modules   : [],
        modMap    : [],
        configUrl : attr("app-config", 0),
		curUri    : null,
		curScript : null,
		actScript : null,
		uuid      : getUID()
    };
	

	
	/**
     * 模块状态
     * @READY   {number}  文件准备
	 * @LOADING {number}  文件已加载
	 * @LOADED  {number}  文件已执行
	 * @ERROR   {number}  文件加载错误
     */
    var STATUS = {
        READY   : 'interactive',
        LOADING : 'loading',
        LOADED  : 'loaded',
		ERROR   : 'error'
    };
	
	var app = {
        version : "0.0.1",
		
        /**
		 * APP静态扩展
		 * app.extend( { moduleName : factory } )
		 * @factory { anything... }
		 */
        extend  : function(module) {
            var i = 0, target = this, deep = false, length = arguments.length, obj, empty, items, x;
            "boolean" === typeof arguments[0] ? (deep = true, i = 1, length > 2 ? (i = 2, target = arguments[1]) :void 0) :length > 1 ? (i = 1, target = arguments[0]) :void 0;
            for (x = i; x < length; x++) {
                obj = arguments[x];
                for (items in obj) {
                    if (obj[items] === target) continue;
                    deep && "object" === typeof obj[items] && obj[items] !== null ? (empty = Array == obj[items].constructor ? [] :{}, 
                    target[items] = app.extend(deep, target[items] || empty, obj[items])) :target[items] = obj[items];
                }
            }
            return target;
        },
		
		 /**
		 * 调试
		 * app.log(type,msg)
		 * @type { string }
		 * @msg  { string }
		 */
        log:function(type, msg) {
            return w.console ? console[type](msg) :alert(type + " : " + msg), false;
        }
    };

    function getUID() {
        return "xyxxyxxxyx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
    }
	
	function loadFile(uri, callback) {
        var type,isCss = /\.css(?:\?|$)/i.test(uri), node = doc.createElement(isCss ? "link" :"script");
        isCss ? (node.rel = "stylesheet", node.href = uri,type = 'css') :(node.async = true, node.src = uri,type = 'js');
        node.charset = configs.charset || "utf-8";
        node.onload = node.onerror = node.onreadystatechange = function(events) {
            if (/loaded|complete|undefined/.test(node.readyState)) {	
                // 释放内存
                node.onload = node.onerror = node.onreadystatechange = null;
                if (!isCss && node.parentNode) node.parentNode.removeChild(node);
                node = null;
				
				/**
				 * 加载完成后回调
				 * @type  { string } css||js
				 * @state { string } error||load 
				 */
                callback && callback({type:type,status:events.type});
            }
        };
		data.curScript = node;
        baseElement ? head.insertBefore(node, baseElement) :head.appendChild(node);
		data.curScript = null;
    }

	
	// 获取当前加载文件地址
    function getCurrentScript() {
		if (doc.currentScript) return doc.currentScript.src;
        if (data.curScript) return data.curScript.src;
        if (data.actScript && data.actScript.readyState === STATUS.READY)  return data.actScript.src;
		var nodes = getTagName("script", head);
        var scripts = head.getElementsByTagName("script");
		for (var i =  nodes.length - 1; i >=0; i--)
		if (nodes[i].readyState === STATUS.READY)return data.actScript = nodes[i],data.actScript.src; 
    }
    // 获取文件目录
    function getDirname(path) {
        return path.match(/[^?#]*\//)[0];
    }
    // 获取配置Paths
    function getPaths(id) {
        var paths = configs.paths;
        var matchd;
        if (paths && (matchd = id.match(/^([^\/:]+)(\/.+)$/)) && "string" === typeof paths[matchd[1]]) {
            id = paths[matchd[1]] + matchd[2];
        }
        return id;
    }
    // 过滤目录中的./ ../
    function getRealPath(path) {
        path = path.replace(/\/\.\//g, "/").replace(/([^:\/])\/\/+/g, "$1/");
        while (path.match(/\/[^\/]+\/\.\.\//g)) {
            path = path.replace(/\/[^\/]+\/\.\.\//g, "/");
        }
        return path;
    }
    // 补全文件名.js后缀
    function getSuffix(uri) {
        uri = getRealPath(uri);
        /#$/.test(uri) ? uri = uri.slice(0, -1) :!/\?|\.(?:css|js)$|\/$/.test(uri) && (uri += ".js");
        return uri.replace(":80/", "/");
    }
    // 根据id获取uri，完整的绝对路径
    function getUri(id) {
        var base   = getDirname(configs.base), 
		isExtend   = /^(extend|ext):\/\//i, 
		isPlugins  = /^(plugins|plu):\/\//i, 
		isHttp     = /^(http:\/\/|https:\/\/|\/\/)/, 
		isAbsolute = /:\//, 
		isRoot     = /^\//, 
		http_re    = /([^:])\/+/g, 
		root_re    = /^.*?\/\/.*?\//;
        if (configs.alias[id] != null) id = configs.alias[id];
        if (id) {
            id = getPaths(id);
            // 网址文件
            if (id.search(isHttp) !== -1) {
                id = id.replace(http_re, "$1/");
            } else if (isExtend.test(id)) {
                id = base + "extend." + id.replace(isExtend, "");
            } else if (isPlugins.test(id)) {
                id = base + "plugins." + id.replace(isPlugins, "");
            } else if (isAbsolute.test(id)) {
                id = id;
            } else if (isRoot.test(id)) {
                id = (base.match(root_re) || [ "/" ])[0] + id.substring(1);
            } else {
                id = base + id;
            }
            id = getSuffix(id);
        } else {
            id = getCurrentScript();
        }

		if (configs.cache) {
			id += id.indexOf('?')>-1?(id.indexOf('nocache=')==-1?'&nocache=' + data.uuid:''):'?nocache=' + data.uuid;           
        }
        return id;
    }
	
	
	 function execMod(id, callback, params) {
		 var exports;

        //判断定义的是函数还是非函数
        if (!params) {
			if(data.modules[id]){
				data.modules[id].exports = data.modMap[id].factory;
			}else{
				exports = 'this module no exports';
			}
        } else {
            data.curUri = id;
			
            //commonjs
            var exp = data.modMap[id].factory.apply(null, params);
            data.curUri = null;
			
            //amd和返回值的commonjs
            if (exp) {
                data.modules[id].exports = exp;
            }
			exports =  data.modules[id].exports
        }

        //执行回调函数
        callback(exports);

        //执行complete队列
        execComplete(id);
    }
	

    function execComplete(id) {
        //模块定义完毕 执行load函数,当加载失败时，会不存在module
        for (var i = 0; i < data.modMap[id].oncomplete.length; i++) {
            data.modMap[id].oncomplete[i](data.modules[id] && data.modules[id].exports);
        }
        //释放内存
        data.modMap[id].oncomplete = [];
    }
    function loadMod(id, callback, option) {
		
		
        //commonjs
        if(id === 'require') {
           return  callback(require);
        }
        if (id === 'exports') {
            var exports = data.modules[option.uri].exports = {};
            return callback(exports);
        }
        if (id === 'module') {
            return callback(data.modules[option.uri]);
        }
        id = getUri(id);
		
		

		//未加载
        if (!data.modMap[id]) {
            data.modMap[id] = {
                status: 'loading',
                oncomplete: []
            };

			
            return loadFile(id, function (params) {
				if(params.status=='load'){	
					
					//如果define的不是函数
					if ('function' !== typeof data.modMap[id].factory) {
						return execMod(id, callback);
					}
	
					//define的是函数
					return use(data.modMap[id].deps, function () {
						execMod(id, callback, [].slice.call(arguments, 0));
					}, {uri: id});
				}
				
				if(params.status=='error'){
					data.modMap[id].status === 'error';
					callback();
					execComplete(id);//加载失败执行队列
				}
				
            });
            return;
        }

       

        //加载失败
        if (data.modMap[id].status === STATUS.ERROR) {
            return callback();
        }
        //正在加载
        if (data.modMap[id].status === STATUS.LOADING) {
			
            return data.modMap[id].oncomplete.push(callback);
        }

        //加载完成
        //尚未执行完成
        if (!data.modules[id].exports) {
            //如果define的不是函数
            if ('function' !== typeof data.modMap[id].callback ) {
               return  execMod(id, callback);
            } 

            //define的是函数
            return use(data.modMap[id].deps, function () {
                execMod(id, callback, [].slice.call(arguments, 0));
            },{uri: id});
        }

        //已经执行过
        return callback(data.modules[id].exports);
    }
   
	
	// 构造模块
    function Module(id, deps, factory) {
		this.id            = id;
        this.deps          = deps;
        this.factory       = factory;
		this.status        = STATUS.LOADED; 
		this.oncomplete    = [];
		data.modMap [id]   = this;
		data.modules[id]   = {};
		data.modules[id].id  = id;
    }
	
	 // 遍历依赖
    function getDeps(factory, callback) {
        var req = /[^.]\s*.require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
        factory = factory.toString();
        factory.replace(req, function(match, dep) {
            callback(dep);
        });
    }
	
	
    function define(id, deps, factory) {
		
		//省略模块名
        if (typeof id !== 'string') {
            factory = deps;
            deps = id;
            id = null;
			
        }
		 
		
		// define('123' || [1,2,3] )
		if(arguments.length==1 && (Array == arguments[0].constructor || 'string' == typeof arguments[0])){
			deps = []
			factory = arguments[0]
			id = null
		}
		
		// define('test', [123] ) => [123]
		if(arguments.length==2  && 'string' == typeof arguments[0] && Array == arguments[1].constructor && !factory){
			deps = []
			factory = arguments[1]
		}
		
		
		// 无依赖
		if (Array !== deps.constructor) {
            factory = deps;
            deps = [];
        }
		
		
		// 遍历依赖
        if (deps.length === 0 && factory && 'function' === typeof factory && factory.length) {
			getDeps(factory, function(dep) {
                deps.push(dep);
            });
			var arr = ['require'];
            if (factory.length > 1) {
                arr.push('exports');
            }
            if (factory.length > 2) {
                arr.push('module');
            }
            deps = arr.concat(deps);
        }

        id = getUri(id);
		
		new Module(id,deps,factory)
    }
	
	 function use(deps, callback) {
		var option = arguments[2];

        if (typeof deps === 'string') {
            deps = [deps];
        }

        if (callback && 'function' !== typeof callback) {
            return app.log("error", 'app.use arguments type error');
        }

		//默认为当前脚本的路径或baseurl
        if ('object'!==typeof option) {
            option = {};
        }
        option.uri = option.uri || loaderSrc;
		
        if (deps.length === 0) {
            return callback();
        }
        var depsCount = deps.length;
        var exports = [];
		for(var i = 0,len= deps.length; i < len; i++) {
            (function (k) {
                loadMod(deps[k], function (param) {
                    depsCount--;
                    exports[k] = param;
                    if (depsCount === 0) {
                       callback && callback.apply(null, exports);
                    }
                }, option);
            }(i));
        }
    }
	
	function require(id) {
        id = getUri(id);
        return data.modules[id] && data.modules[id].exports;
    }
	
	/**
     * 配置
     * @config  app.config(params)
	 * @params  {Object}  配置参数
	 * @app.config({
		base:'http://xxx.com/static/', 模块根路径
		paths:{ 模块目录
			js : 'js/'   => http://xxx.com/static/js/
			css: 'css/'  => http://xxx.com/static/css/
		},
		alias:{ 模块别名
			style: 'css/style.css', => http://xxx.com/static/css/style.css
			mod1 : 'js/mod1.min',   => http://xxx.com/static/js/mod1.min.js
			mod2 : 'js/mod2.min'    => http://xxx.com/static/js/mod2.min.js
		},
		charset:'utf-8', 编码方式
		cover  : true,   是否允许模块重定义,默认为否|false
		debug  : ture    是否开启调试模式,默认为否|false
		})
     */
	function config(params) {
        for (var i in params) {
            var param = params[i],_param;
            if ("string" === typeof param) {
                var _param = param.replace(/\s+/g, "");
                _param && (configs[i] = _param);
            } else {
                configs[i] = param;
            }
        }
        return configs;
    };

	
	if(data.configUrl){
		use(configs.base + data.configUrl)
	};
	app.config = config
	app.use = use
	app.load = loadFile
	app.require = require
	app.define = w.define = define;
    w.app = w.APP = app;
}(window));
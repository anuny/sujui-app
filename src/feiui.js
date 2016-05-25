;(function (w) {
    'use strict';
    var doc       = w.document, 
	head          = getTagName("head", doc)[0] || doc.documentElement, 
	baseElement   = getTagName("base", head)[0], 
	scripts       = getTagName("script", doc), 
	loaderScripts = scripts[scripts.length - 1], 
	loaderSrc     = loaderScripts.hasAttribute ? loaderScripts.src :attr("src", 4),
	baseSrc       = attr("app-base", 0) || loaderSrc,
	configSrc     = attr("app-config", 0);

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
	 * @alias   {Object}  模块路径
     */
    var configs  = {
        base      : baseSrc,
        paths     : {},
        charset   : "utf-8",
		cache     : true,
		debug     : false,
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
		uri       : {},
		curUri    : null,
		curScript : null,
		actScript : null,
		configUrl : configSrc,
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
            return configs.debug ? (w.console ? console[type](msg) :alert(type + " : " + msg)):false;
        }
    };

    function getUID() {
        return "0101.1001.0101.1010".replace(/[01]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == '0' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
    }
	
	function loadFile(uri, callback) {
        var status,isCss = /\.css(?:\?|$)/i.test(uri), node = doc.createElement(isCss ? "link" :"script");
        isCss ? (node.rel = "stylesheet", node.href = uri) :(node.type="text/javascript", node.async = true, node.src = uri);
        node.charset = configs.charset;
		
		if ('onload' in node) {
            node.onload = function(){
				cbk('load')
			};
            node.onerror = function(){
				cbk('error')
			};
        } else {
          node.onreadystatechange = function() {
            if (/loaded|complete|undefined/.test(node.readyState)) {
                cbk('load');
            }
          }
        }
		function cbk(status){
			callback && callback(status);
			if (!isCss && node.parentNode) node.parentNode.removeChild(node);
			node.onload = node.onerror = node.onreadystatechange = null;
			node = null;
		}
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
		for (var i =  nodes.length - 1; i >=0; i--){
			if (nodes[i].readyState === STATUS.READY){
				data.actScript = nodes[i];
				return data.actScript.src;
			}
		} 
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
		// 无ID，获取当前currentScript地址
		if(!id){
			id = getCurrentScript();
		}
		// 读取缓存，减少内存开销
		if(data.uri[id]){
			return data.uri[id];
		}
		
		// 没有缓存，写入缓存
        var base   = getDirname(configs.base), 
		uri		   = id,
		isExtend   = /^(extend|ext):\/\//i, 
		isPlugins  = /^(plugins|plu):\/\//i, 
		isHttp     = /^(http:\/\/|https:\/\/|\/\/)/, 
		isAbsolute = /:\//, 
		isRoot     = /^\//, 
		http_re    = /([^:])\/+/g, 
		root_re    = /^.*?\/\/.*?\//;
		
        if (configs.alias[id] != null){
			uri = configs.alias[uri]
		}
		
		uri = getPaths(uri);
		// 网址文件
		if (uri.search(isHttp) !== -1) {
			uri = uri.replace(http_re, "$1/");
		} else if (isExtend.test(id)) {
			uri = base + "extend." + uri.replace(isExtend, "");
		} else if (isPlugins.test(id)) {
			uri = base + "plugins." + uri.replace(isPlugins, "");
		} else if (isAbsolute.test(id)) {
			uri = uri;
		} else if (isRoot.test(id)) {
			uri = (base.match(root_re) || [ "/" ])[0] + uri.substring(1);
		} else {
			uri = base + uri;
		}
		uri = getSuffix(uri);

		if (!configs.cache) {
			var nocache = 'nocache=' + data.uuid;
			uri += uri.indexOf('?')>-1?(uri.indexOf('nocache=')==-1?'&'+nocache:''):'?' + nocache;           
        }
		data.uri[id] = uri;
        return uri;
    }
	
	
	 function execMod(id, callback, params) {
		 var exports;

        //判断定义的是函数还是非函数
        if (!params) {
			if(data.modules[id]){
				data.modules[id].exports = data.modMap[id].factory;
				exports = data.modules[id].exports
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
		exports = null;
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
		var modName = id;
        //commonjs
        if(id === 'require') {
           return  callback(require);
        }
        if (id === 'exports') {
            var exports = data.modules[option.uri].exports = {};
            return callback(exports);
        }
        if (id === 'module') {
			data.modules[option.uri].require = require
            return callback(data.modules[option.uri]);
        }
        id = getUri(id);
		
		
		//未加载
        if (!data.modMap[id]) {
			
            data.modMap[id] = {
                status: 'loading',
                oncomplete: []
            };

			
            loadFile(id, function (status) {
				if(status=='load'){	
					//如果define的不是函数
					if ('function' !== typeof data.modMap[id].factory) {
						return execMod(id, callback);
					}
	
					//define的是函数
					return use(data.modMap[id].deps, function () {
						execMod(id, callback, [].slice.call(arguments, 0));
					}, {uri: id});
				}
				
				if(status=='error'){
					data.modMap[id].status === 'error';
					callback();
					execComplete(id);//加载失败执行队列
					return app.log("error", 'Module ["'+ modName +'"] is not defined');
				}
            });
            return;
        }

       

        //加载失败
        if (data.modMap[id].status === STATUS.ERROR) {
            return callback('error');
        }
        //正在加载
        if (data.modMap[id].status === STATUS.LOADING) {
            return data.modMap[id].oncomplete.push(callback);
        }

        //加载完成
        //尚未执行完成
        if (!data.modules[id].exports) {
            //如果define的不是函数
            if ('function' !== typeof data.modMap[id].factory ) {
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
			
        }else{
			if(!deps&&!factory){
				factory = id
				deps = []
				id = null
			}
		}

		if ((Array !== deps.constructor)|| (!id && !factory) || (id&&Array == deps.constructor&&!factory)) {
            factory = deps;
            deps = [];
        }

		
		// 遍历依赖
        if (deps.length === 0 && factory && 'function' === typeof factory && factory.length) {
			getDeps(factory, function(dep) {
                deps.push(dep);
            });
			var cmdArr = ['require'];
            if (factory.length > 1) cmdArr.push('exports')
            if (factory.length > 2)  cmdArr.push('module')
            deps = cmdArr.concat(deps);
        }
        id = getUri(id);
		new Module(id,deps,factory)
		deps = null;
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
					   exports = null;deps=null;option=null;
                    }
                }, option);
            }(i));
        }
    }
	
	function require(id) {
        id = getUri(id);
		var mod=data.modules[id];
        return mod && mod.exports;
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
		var base   = getDirname(configs.base);
		use(base + data.configUrl)
	};
	app.config = config
	app.use = use
	app.define = w.define = define;
    w.app = w.APP = app;
}(window));
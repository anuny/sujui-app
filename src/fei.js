(function(w, undefined) {
	// 
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
    var config  = {
        base      : attr("app-base", 0) || loaderSrc,
        paths     : {},
        charset   : "utf-8",
        cover     : false,
        alias     : {}
    };
    /**
     * 缓存数据
     * @modules   {Object}  模块缓存
	 * @loadings  {Object}  加载队列
	 * @configUrl {string}  配置文件路径
     */
    var data = {
        modules   : {},
        loadings  : {},
		queues    : [],
        configUrl : attr("app-config", 0)
    };
	
	/**
     * 模块状态
     * @READY   {number}  文件准备
	 * @LOADING {number}  文件已加载
	 * @LOADED  {number}  文件已执行
     */
    var STAT = {
        READY     : -1,
        LOADING   : 0,
        LOADED    : 1
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
    // 获取当前加载文件地址
    function getCurrentScript() {
        if (doc.currentScript) return doc.currentScript.src;
        var stack;
        try {
            x.x.x.x();
        } catch (e) {
            stack = e.stack;
            if (!stack && w.opera) stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
		
		// 兼容ie
        if (stack) {
            stack = stack.split(/[@ ]/g).pop();
            stack = stack[0] == "(" ? stack.slice(1, -1) :stack;
            return stack.replace(/(:\d+)?:\d+$/i, "");
        }
        var nodes = getTagName("script", head);
        for (var i = 0, len = nodes.length; i < len; i++) if (nodes[i].readyState === "interactive") return nodes[i].className = nodes[i].src;
    }
    // 获取文件目录
    function getDirname(path) {
        return path.match(/[^?#]*\//)[0];
    }
    // 获取配置Paths
    function getPaths(id) {
        var paths = config.paths;
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
        var base   = getDirname(config.base), 
		isExtend   = /^(extend|ext):\/\//i, 
		isPlugins  = /^(plugins|plu):\/\//i, 
		isHttp     = /^(http:\/\/|https:\/\/|\/\/)/, 
		isAbsolute = /:\//, 
		isRoot     = /^\//, 
		http_re    = /([^:])\/+/g, 
		root_re    = /^.*?\/\/.*?\//;
        if (config.alias[id] != null) id = config.alias[id];
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
        return id;
    }
    /**
	 * 加载文件
	 * app.log(type,msg)
	 * @type { string }
	 * @msg  { string }
	 */
    function loadFile(uri, callback) {
        var type,isCss = /\.css(?:\?|$)/i.test(uri), node = doc.createElement(isCss ? "link" :"script");
        isCss ? (node.rel = "stylesheet", node.href = uri,type = 'css') :(node.async = true, node.src = uri,type = 'js');
        node.charset = config.charset || "utf-8";
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
                callback && callback({type:type,state:events.type});
            }
        };
        baseElement ? head.insertBefore(node, baseElement) :head.appendChild(node);
    }
    // 构造模块
    function Module(id, deps, factory) {
		addLoading(deps);
		this.id           = id;
        this.deps         = deps;
        this.factory      = factory;
        this.require      = getExports; 
		
        data.modules[id]  = this;
        data.loadings[id] = STAT.LOADED;
    }
    // 编译模块
    Module.prototype.compile = function() {
        return "function" === typeof this.factory ? this.factory({
            require:this.require
        }) :this.factory;
    };
	

    // 导出模块
    function getExports(id) {
        var mod;
        id  = getUri(id);
        mod = data.modules[id];
		
        return mod.exports || (mod.exports = mod.compile());
    }
	
	// 添加加载队列
    function addLoading(deps) {
        Array == deps.constructor || (deps = [ deps ]);
        for (var i = 0; i < deps.length; i++) {
            var id = deps[i], stat = data.loadings[id];
            data.loadings[id] = stat ? stat :STAT.READY;
        }
        deps = null;
    }
	
	// 检查加载状态
    function checkLoading() {
        for (var id in data.loadings) {
            if (data.loadings[id] < STAT.LOADED) return false;
        }
        return true;
    }
	// 加载依赖模块
    function loadDeps() {
        for (var id in data.loadings) {
            if (data.loadings[id] < STAT.LOADING) loadModule(id);
        }
    }
	// 加载模块
    function loadModule(id) {
        data.loadings[id] = STAT.LOADING;
        loadFile(id, function() {	
            if (checkLoading()) {
                var queueLen = data.queues.length;
                while (queueLen) {
                    data.modules[data.queues.shift()].compile();
                    queueLen--;
                }
                if (queueLen == 0) {
                    data.modules  = null;
					data.loadings = null;
					data.queues   = null;
                }
            } else {
                loadDeps();
            }
        });
    }
	
	 // 遍历依赖
    function getDeps(factory, callback) {
        var req = /[^.]\s*.require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
        factory = factory.toString();
        factory.replace(req, function(match, dep) {
            callback(getUri(dep));
        });
    }
	
    // 定义方法
    function define(id, factory) {
        var deps = [], idName = id;
        // 无模块名
        if ("string" !== typeof id) factory = id, id = null;
        // 获取模块完整路径
        id = getUri(id);
        if (data.modules[id] && !config.cover) {
            return app.log("warn", 'module:["' + idName + '"] already defined in ' + getUri());
        }
        // 获取依赖
        if ("function" === typeof factory) {
            getDeps(factory, function(dep) {
                deps.push(dep);
            });
        }
        // 保存模块
        new Module(id, deps, factory);
        // 释放内存
        deps = null;
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
	
    app.config = function(params) {
        for (var i in params) {
            var param = params[i];
            if ("string" === typeof param) {
                var _param = param.replace(/\s+/g, "");
                _param && (config[i] = _param);
            } else {
                config[i] = param;
            }
        }
        return config;
    };
	
	if(data.configUrl){
		var configs = getUri(data.configUrl);
		data.queues.push(configs),
		addLoading(configs),
		loadDeps();
	};

    app.define = define;
    w.app = w.APP = app;
})(window);
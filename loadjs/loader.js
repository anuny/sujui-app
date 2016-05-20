(function(w, undefined) {
    var cache = {}, 
	loadings = {}, 
	queue = [], 
	ready=-1,
	loading=0,
	loaded=1,
	doc = w.document, 
	head = doc.getElementsByTagName("head")[0] || doc.documentElement, 
	baseElement=head.getElementsByTagName('base')[0],
	scripts = doc.getElementsByTagName("script"), 
	loaderScripts = scripts[scripts.length - 1], 
	loaderSrc = loaderScripts.hasAttribute ? loaderScripts.src :loaderScripts.getAttribute("src", 4);
	var config={
		run:loaderScripts.getAttribute("app-run"),
		base:loaderScripts.getAttribute("app-base")||loaderSrc,
		charset:'utf-8',
		alias : {}
	};
    var app = {
        version:"0.0.1",
        extend:function(module) {
            var i = 0, target = this, deep = false, length = arguments.length, obj, empty, items, x;
            'boolean' === typeof arguments[0] ? (deep = true, i = 1, length > 2 ? (i = 2, target = arguments[1]) :void 0) :length > 1 ? (i = 1, target = arguments[0]) :void 0;
            for (x = i; x < length; x++) {
                obj = arguments[x];
                for (items in obj) {
					if(items==='define'||items==='config'||items==='run'||items==='version') return app.log('error','[extend => '+items+'] is basic module, can’t repeated')
                    if (obj[items] === target) continue;
                    deep && 'object' === typeof obj[items] && obj[items] !== null ? (empty = (Array == obj[items].constructor) ? [] :{}, 
                    target[items] = app.extend(deep, target[items] || empty, obj[items])) :target[items] = obj[items];
                }
            }
            return target;
        },
        log:function(type, msg) {
            return (w.console ? console[type](msg) :alert(type + " : " + msg)), 
            false;
        }
    };
    function getCurrentScript() {
        if (doc.currentScript) return doc.currentScript.src;
        var stack;
        try {
            x.x.x.x();
        } catch (e) {
            stack = e.stack;
            if (!stack && w.opera) stack = (String(e).match(/of linked script \S+/g) || []).join(" ");
        }
        if (stack) {
            stack = stack.split(/[@ ]/g).pop();
            stack = stack[0] == "(" ? stack.slice(1, -1) :stack;
            return stack.replace(/(:\d+)?:\d+$/i, "");
        }
        var nodes = head.getElementsByTagName("script");
        for (var i = 0, len=nodes.length; i<len;i++ ) if (nodes[i].readyState === "interactive") return nodes[i].className = nodes[i].src;
    }
    function getDirname(path) {
        return path.match(/[^?#]*\//)[0];
    }
    function getRealPath(path) {
        path = path.replace(/\/\.\//g, "/").replace(/([^:\/])\/\/+/g, "$1/");
        while (path.match(/\/[^\/]+\/\.\.\//g)) {
            path = path.replace(/\/[^\/]+\/\.\.\//g, "/");
        }
        return path;
    }
    function getSuffix(uri) {
        uri = getRealPath(uri);
        /#$/.test(uri) ? uri = uri.slice(0, -1) :!/\?|\.(?:css|js)$|\/$/.test(uri) && (uri += ".js");
        return uri.replace(":80/", "/");
    }
    function getUri(id) {
        var uri;
        var base = getDirname(loaderSrc);
        var isExtend = /^(extend|ext):\/\//i;
        var isPlugins = /^(plugins|plu):\/\//i;
        var isHttp = /^(http:\/\/|https:\/\/|\/\/)/;
        if (id) {
            if (id.search(isHttp) !== -1) {
                uri = id.replace(/([^:])\/+/g, "$1/");
            } else if (isExtend.test(id)) {
                uri = base + "extend." + id.replace(isExtend, "");
            } else if (isPlugins.test(id)) {
                uri = base + "plugins." + id.replace(isPlugins, "");
            } else if (/:\//.test(id)) {
                uri = id;
            } else if (/^\//.test(id)) {
                uri = (base.match(/^.*?\/\/.*?\//) || [ "/" ])[0] + id.substring(1);
            } else {
                uri = base + id;
            }
            uri = getSuffix(uri);
        } else {
            uri = getCurrentScript();
        }
        return uri;
    }
    function loadScript(uri, callback) {
		var isCss=/\.css(?:\?|$)/i.test(uri),
		node = doc.createElement(isCss ? 'link' : 'script');
		node.charset = config.charset||'utf-8'
		isCss? (node.rel = 'stylesheet',node.href = uri):(node.async = true, node.src = uri);
		node.onload = node.onerror = node.onreadystatechange = function () {
			if (/loaded|complete|undefined/.test(node.readyState)) {
                node.onload = node.onerror = node.onreadystatechange = null;
				if (!isCss&&node.parentNode) node.parentNode.removeChild(node);
                node = null;
                callback && callback();
            }
		};
		baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
    };
	 function Module(id, deps, factory) {
        this.id = id;
        this.deps = deps;
        this.factory = factory;
		this.require = require;
        addLoading(this.deps);
        cache[id] = this;
        loadings[id] = loaded;
    }
    Module.prototype.compile = function() {
        return 'function' === typeof this.factory?this.factory({require:require}):this.factory;
    };
    function addLoading(deps) {
        for (var i = 0; i < deps.length; i++) {
            var id = deps[i], stat = loadings[id];
            loadings[id] = stat ? stat :ready;
        }
    }
    function require(id) {
        id = getUri(id);
        var mod = cache[id];
        return mod.exports || (mod.exports = mod.compile());
    }
    function checkLoading() {
        for (var id in loadings) {
            if (loadings[id] < loaded) return false;
        }
        return true;
    }
    function loadDeps() {
        for (var id in loadings) {
            if (loadings[id] < loading)loadMod(id);
        }
    }
    function loadMod(id) {
        loadings[id] = loading;
        loadScript(id, function() {
            if (checkLoading()) {
                while (queue.length) {
					cache[queue.shift()].compile();
                }
            } else {
                loadDeps();
            }
        });
    }

    function define(id, factory) {
        //获取依赖
        var deps = [], req = /[^.]\s*.require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
        //无模块名
        if ('string' !== typeof id) factory = id, id = null;
        //检查依赖	 		
        if ('function'=== typeof factory) factory.toString().replace(req, function(match, dep) {
			if(config.alias[dep] != null){dep = config.alias[dep]};
			dep=getUri(dep);
            deps.push(dep);
        });
		
        id = getUri(id);
		
        //创建模块
        new Module(id, deps, factory);
    }
	function run(id) {
		id = getUri(id);
		queue.push(id);
		addLoading([id]);
		loadDeps(id)	
    }
	 app.define = define
	 app.run = run
	 app.config = function(params) {
		for (var i in config) config[i] = params[i];
	}
	 
	var apps=config.run;
	apps&&app.run(apps);
	
    w.app = w.APP = app;
})(window);
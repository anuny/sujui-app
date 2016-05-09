app.define('plugins://validator',function(require, exports, module) {
	var validator = function(opt) {
		return new validator.fn.init(opt)
	};
	var win=window;
	var doc=win.document;
	validator.fn = validator.prototype;
	var extend = {
		'init': function(opt) {
			var form=doc.getElementById(opt.formId);
			this.selector=opt.formId;
			this.form = form;
			this.checked = false;
			this.rules={};
			this.configs={
				Prefix:'sujui-validator',
				Submit:true
			};
			if(form)this.instantiate(opt.rules,opt.config)
		},
		_checked:[],
		_element:[],
		//获取对象
		_getRule : function(rules, fn) {
			for (i in rules) fn && fn(i, rules[i])
		},
		//循环方法
		_each : function(array, fn) {
			for (var i = 0,len = array.length; i<len;i++) fn && fn(i, array[i])
		},
		//强制string
		_toString : function(val) {
			if ("" == val) return '""';
			if (!isNaN(val)) return /^0[0-9]+$/.test(val) ? '"' + val + '"': val;
			var _val = val.toLowerCase;
			return "false" == _val || "true" == _val || "null" == _val ? val: '"' + val + '"'
		},
		//兼容indexOf
		_indexOf : function(array,obj){	
			for (var i = 0, len = array.length; i<len; i++)if(array[i] == obj)return i;
			return -1;  
		},
		//删除数组元素
		_delArr:function(array,obj){
			var i = this._indexOf(array,obj);
			if (i > -1)array.splice(i, 1);
		},
		//ajax POST
		_post : function(url,fn){
			var xmlhttp=win.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
			xmlhttp.onreadystatechange=function(){
				if (xmlhttp.readyState==4 && xmlhttp.status==200)fn&&fn(xmlhttp.responseText)
			};
			xmlhttp.open("POST",url,true);
			xmlhttp.send();
		},
		//渲染提示文字
		_toMsg : function(msg,str) {
			return msg?msg.replace(/{(\w+)}/g, function(tpl, obj) {
				return str[obj] || '';   
			}):''; 
		},
		//创建span
		_insert : function(id, ele, prefix, msg) {
			var parent = ele.parentNode,
			span = doc.createElement("span");
			span.id = id;
			span.className = prefix;
			span.innerHTML = msg;
			parent.lastChild == ele ? parent.appendChild(span, ele) : parent.insertBefore(span, ele.nextSibling);
		},

		//构建提示信息
		_tip : function(i, ele, msg, type) {
			if (ele.type=='hidden'||ele.type=='radio') return;
			var _this=this,
			prefix = _this.configs.Prefix,
			id = prefix + '-' + _this.selector + '-' + i,
			getTip = doc.getElementById(id),
			tipTpl = '<span class="' + prefix + '-msg ' + prefix + '-' + type + '">' + msg + '</span>';
			getTip ? getTip.innerHTML = tipTpl: _this._insert(id, ele, prefix, tipTpl);
			var checked=type == 'error' ? false: true;	
			this._checked[i] = checked;
			getTip=null;
			return checked;
		},
		//添加验证
		'add':function(rules){
			return this.form?this.instantiate(rules):this
		},
		//删除验证
		'del':function(name){
			var _this=this;
			if(_this.form){
				name=Array == name.constructor?name:[name];
				_this._each(name,function(i, ele){
					if(_this.rules[ele])delete _this.rules[ele];
					_this._delArr(_this._element,ele)
				});
			};
			return this
		},
		
		'instantiate': function(rules,config) {
			var _this = this;
			//保存对象
			if(config)_this.configs=config;
			_this._getRule(rules,function(name, rule) {
				_this._element.push(name);
				_this.rules[name]=rule;
			});

			_this._each(_this.form.elements,function(i, ele) {
				//判断实例名
				if (_this._indexOf(_this._element,ele.name) > -1) {
					//获得焦点
					ele.onfocus =function() {
						_this._getRule(_this.rules,function(name, rule) {
							if (name == ele.name && rule.Focus) _this._tip(i, ele, _this._toMsg(rule.Focus,{label:rule.label}), 'focus');
						})
					};
					//失去焦点
					ele.onblur = function() {
						_this._check(i, ele)
					};
					//默认提示
					_this._getRule(_this.rules,function(name, rule) {
						if (name == ele.name && rule.Default) _this._tip(i, ele, _this._toMsg(rule.Default,{label:rule.label}), 'default');
					});
				}
			});
			//提交拦截
			this.form.onsubmit = function() {
				_this._each(_this.form.elements,function(i, ele) {
					if (_this._indexOf(_this._element,ele.name) > -1) _this._check(i, ele)
				});
				var Submit=_this.configs.Submit;
				var checked=_this._indexOf(_this._checked,false)>-1?false:true;
				_this.checked=checked;
				return Submit?'function'==typeof Submit?Submit(_this)||false:Submit:checked;
			};
			return this;
		},
		_check:function(id, ele) {
			//当前对象名
			var _this = this,thisName = ele.name;
			//获取全部
			_this._getRule(_this.rules,function(name, rule) {
				if (thisName !== name||ele.type=='hidden') return;
				
				//必填验证
				if (rule.Required) {
					value=(ele.type=='checkbox'||ele.type=='radio')?ele.checked?true:false:ele.value;
					if (!value)return _this._tip(id, ele,_this._toMsg(rule.Required,{label:rule.label}), 'error');
				};
				//长度验证
				if (rule.Length) {
					if (ele.value.length < rule.Length.min||ele.value.length > rule.Length.max) {
						var msg = rule.Length.msg;
						msg=_this._toMsg(msg,{min:rule.Length.min,max:rule.Length.max,label:rule.label});
						return _this._tip(id, ele, msg, 'error');
					};
				};
				//正则匹配
				if (rule.Regexp) {
					var matchs = new RegExp(rule.Regexp.reg).test(ele.value);
					matchs = rule.Regexp.compare ? !matchs: matchs;
					if (!matchs) return _this._tip(id, ele, _this._toMsg(rule.Regexp.msg,{label:rule.label}) , 'error');
				};
				//相等验证
				if (rule.Equal) {
					var form = _this.form.elements;
					var to = form[rule.Equal.to];
					if(!to)return;
					to=to.length==2?to[0]:to;
					eval("compare = " + _this._toString(ele.value) + " " + rule.Equal.reg + " " + _this._toString(to.value) + " ? true : false;");
					if (!compare)return _this._tip(id, ele, _this._toMsg(rule.Equal.msg,{label:rule.label}), 'error');
				};
				//函数回调验证
				if (rule.Callback) {
					var fn = rule.Callback.fun;
					if (typeof fn !== 'function') return;
					var fun = fn(ele.value);
					if (!fun) return _this._tip(id, ele, _this._toMsg(rule.Callback.msg,{label:rule.label}), 'error');
				};
				//ajax验证
				if (rule.Ajax) {
					var url = rule.Ajax.url;
					_post(url,function(responseText){
						var reg=rule.Ajax.reg||'==';
						eval("compare = " + _this._toString(responseText) + " " + rule.Ajax.reg + " " + _this._toString(ele.value) + " ? true : false;");
						if (!compare)return _this._tip(id, ele, _this._toMsg(rule.Ajax.msg,{label:rule.label}), 'error');
					})
				};
				_this._tip(id, ele, '', 'success');
			});
		}
	};
	validator.fn = extend;
	validator.fn.init.prototype = validator.fn;
	return validator
});
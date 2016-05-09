前端轻量化插件 (持续造轮子中...)
=====================

> 杀鸡焉用牛刀，这些就够了！[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](./LICENSE)

sujui.core.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`
```javascript 

//定义一个模块
app.define('demo://test',function(require,exports,module){
	exports.test = 1
})

//使用一个模块
app.use('demo://test',function(exports){
	var test = exports.test //return 1
})

//全局加载模块
var test = app.require(demo://test) //return 1

//静态扩展
app.extend({
	test:test
});
var test = app.test //return 1

//使用缓存模块
var test = app.modules['demo://test'] //return 1

```



extend.dom.js
=========
类似jQuery，dom选择和操作 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`
```javascript 

//选择器
dom('#demo')
dom('#demo .test')
dom('#demo .test li')
dom('#demo').find('.test')
dom('#demo').find('.test li').first()
dom('#demo').find('.test li').eq(1)
....

```
API: `ready` `each` `find` `data` `eq` `first` `last` `append` `css` `hasClass`  `addClass`  `removeClass`  `attr`  `html`  `text`  `val`

可按需扩展




extend.ajax.js
=========
ajax插件 [文档](./doc/extend.ajax.md)  [源码](./src/extend.ajax.js)  `5kb`
```javascript 

//举个栗子

ajax({
	type:'POST',
	url:'api.json',
	async:true,
	success:function(ret){},
	error:function(){}
})

```


extend.cookie.js
=========
cookie 插件 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`
```javascript 

//举个栗子
cookie('test','123456',30)
cookie('test') //123456

```


extend.animate.js
=========
动画插件 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`
```javascript 

animate('#test',{width:100,height:100},1000,function(){
 ...
})

//依赖extend.dom.js
$('#test').animate({width:100,height:100},1000,function(){
 ...
})

```


extend.animate.tween.js
=========
动画增效插件。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`
```javascript 
var easeing=tween.Cubic.easeInOut
$('#test').animate({width:100,height:100},1000,easeing,function(){
 ...
})

```


plugins.validator.js
=========
表单验证插件。 [文档](./doc/plugins.validator.md)  [源码](./src/plugins.validator.js)  `2kb`
```javascript 
validator({
	formId:'form-1',
	rules:{
		username:{
			label    : '用户名',
			Default  : '请填写{label}',
			Required : '{label}不能为空',
			Focus    : '请填写{label}',
			Length   : {'min':6,'max':12,'msg':'{label}不能小于{min}位,不能大于{max}位'},
			Regexp   : {'reg':/^\w+$/, 'compare':false, 'msg':"{label}只能由数字、字母和下划线组成"},
			Ajax     : {'url':'ajax.php', 'reg':'!==', 'msg':"{label}已经存在"},
			Callback : {'fun':{}, 'msg':"{label}不能是6位数字，请另换一个"}
		}
})

```


plugins.layzr.js
=========
页面图片懒加载插件。 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`



plugins.router.js
=========
前端路由插件。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`



plugins.slider.js
=========
前端幻灯片插件。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `5kb`


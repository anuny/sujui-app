# sujui-app
===========

简化版的前端模块化框架(II)

-------
说明：
   移除了模块的url加载处理
   简化了模块的调用

用法
-------

定义一个模块
>define(id,factory);
id : 模块名 ，如 'core';
factory : 回调函数，即这个模块要实现的功能

```javascript 

//demo1:
定义一个空的模块 , 没有任何意思。
define('test');

//demo2:

/**
 * 定义一个标准的模块,取名为core
 */
define('core',function(require){
	
	//依赖模块的两种方法
	
	调用内部方法
	var $=require('dom')
	或者调用全局方法
	var $=app.require('dom')
	
 	var a=1;

 	// 返回模块:
 	return a
});

```

全局调用一个模块
>app.require(id);
id  : 之前用define定义的模块名


```javascript 
//demo3:
// 调用test模块将返回 undefined
var a = app.require('core'); 
console.log(a);// return 1



```

使用一个模块
>app.use(id,factory);
id  : 之前用define定义的模块名
factory : 回调函数，即这个模块要实现的功能

//demo 1

app.use('extend://dom',function($){
	$('demo').hide()
})

//demo 2

app.use(['extend://dom','plugins://slider'],function($,slider){
	slider({
		type:'fade',
		bind:'onmousedown',
		speed:3000
	})
})


```javascript 

// 
var a = app.require('core'); 
console.log(a);// return 1



//综合应用
//demo5:

/**
 *  定义一个有依赖的模块
 */

define('init',function(require,exports,module){
	//依赖core
	var core = require('core');
	//下面就可以使用core模块了
	console.log(core.name);
})


```
调用init模块
>require('init');
 

优点：
-------
1. 就是奔着模块化去的
2. 追求的就是简单易用
3. 最大限度的适应规范

License
-------

This work is licensed under the [MIT License](LICENSE).

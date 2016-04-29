###sujui app

===========

简化版的前端模块化框架

-------
说明：
   移除了模块的url加载处理
   简化了模块的调用

用法
-------

定义一个模块
>app.define(id,factory);
id : 模块名 ，如 'core';
factory : 回调函数，即这个模块要实现的功能

```javascript 

//demo1:
//定义一个空的模块 , 没有任何意思。
app.define('test');

//demo2:

/**
 * 定义一个标准的模块,取名为core
 */
app.define('core',function(require){
    
	//依赖模块的两种方法
	
	//调用内部方法
	var $=require('dom')
	//或者调用全局方法
	var $=app.require('dom')
	
 	var a=1;

 	// 返回模块:
 	return a
});




```

使用一个模块
>app.use(id,factory);
id  : 之前用define定义的模块名
factory : 回调函数，即这个模块要实现的功能

```javascript 
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



```



全局调用一个模块
>app.require(id);
id  : 之前用define定义的模块名


```javascript 

// 调用core模块将返回 1
var a = app.require('core'); 
console.log(a);// return 1

```

扩展APP静态方法
>app.extend({});

```javascript 
app.extend({
    mod1:1,
    mod2:2
});

console.log(app.mod1) //return 1
console.log(app.mod2) //return 2


```

使用缓存模块
>app.modules[id];
id  : 之前用define定义的模块名

```javascript 

var $=app.modules['extend://dom']
console.log($('#test'))


```
 综合应用

```javascript
app.define('extend://dom',function(require) {
    var dom=function(selector){
        return document.getElementById(selector)
    };
    return dom;
})


app.use('extend://dom',function(dom) {
    app.extend({
        $:dom
    });
    
    //app.$('test')
})



```

优点：
-------
1. 就是奔着模块化去的
2. 追求的就是简单易用
3. 最大限度的适应规范

License
-------

This work is licensed under the [MIT License](LICENSE).

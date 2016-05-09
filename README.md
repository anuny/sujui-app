开发资源总结 (持续整理中)
=====================


> *就像开发一样, 这篇文档如果没有人关心和维护, 里面的内容就会变得老旧, 过时而不再具有参考价值. 所以, 我希望所有看到并喜欢这篇文档的人都一起来维护它. 放心大胆的提交 Pull Request 和 Issue 吧!!*

这是对自己这几年开发的一个总结，各种项目、资源、书籍、博客等

喜欢么？或者对您有用？那就 Star 一下吧 ^_^


## Web 前端

#### Javascript



+ [sujui.core.js](#sujuicorejs): 前端模块化管理`gzip 5kb` [源码](./src/sujui.core.js)[文档](./doc/sujui.core.md)
+ extend.dom.js:  类似jQuery的选择器，`gzip 5kb` [源码](./src/sujui.dom.js)[文档](./doc/sujui.dom.md)
+ extend.ajax.js: ajax插件 `gzip 5kb` [源码](./src/sujui.ajax.js)[文档](./doc/sujui.ajax.md)
+ extend.cookie.js: cookie 插件`gzip 5kb` [源码](./src/sujui.cookie.js)[文档](./doc/sujui.cookie.md)
+ extend.animate.js: 动画插件`gzip 5kb` [源码](./src/sujui.animate.js)[文档](./doc/sujui.animate.md)
+ extend.animate.tween.js: 动画缓动增效插件 `gzip 5kb` [源码](./src/sujui.animate.tween.js)[文档](./doc/sujui.animate.tween.md)
+ plugins.validator.js: 表单验证插件`gzip 5kb` [源码](./src/sujui.validator.js)[文档](./doc/sujui.validator.md)
+ plugins.layzr.js: 页面图片懒加载插件`gzip 5kb` [源码](./src/sujui.layzr.js)[文档](./doc/sujui.layzr.md)
+ plugins.router.js: 前端路由插件`gzip 5kb` [源码](./src/sujui.router.js)[文档](./doc/sujui.router.md)
+ plugins.slider.js: 前端幻灯片插件`gzip 5kb` [源码](./src/sujui.slider.js)[文档](./doc/sujui.slider.md)


sujui.core.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`
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
类似jQuery，dom选择和操作 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`
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
ajax插件 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



extend.cookie.js
=========
cookie 插件 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



extend.animate.js
=========
动画插件 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



extend.animate.tween.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



plugins.validator.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



plugins.layzr.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。 [文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



plugins.router.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`



plugins.slider.js
=========
前端模块化管理,移除了模块的url加载处理,简化了模块的调用。[文档](./doc/validator.md)  [源码](./doc/validator.md)  `gzip 5kb`





ddd

## License

<A NAME="ROP_ON_ARM">Davi L, Dmitrienko A, Sadeghi A R, et al. [Return-oriented programming without returns on ARM](http://www.trust.informatik.tu-darmstadt.de/fileadmin/user_upload/Group_TRUST/PubsPDF/ROP-without-Returns-on-ARM.pdf)[J]. System Security Lab-Ruhr University Bochum, Tech. Rep, 2010.</a>

[![Creative Commons License](http://i.creativecommons.org/l/by/4.0/88x31.png)](http://creativecommons.org/licenses/by/4.0/)

This work is licensed under a [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/).


### 测试
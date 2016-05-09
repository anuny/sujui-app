# 欢迎使用 sujui.validator 表单验证插件
轻量级前端表单验证插件
`GZIP 2kb`

-------


基本用法
----
### 引入validator.js（原生JavaScript）
```html
<script type="text/javascript" src="./src/plugins.validator.js"></script>
```
`或`
```html
<script>
    app.use('plugins://validator',function(validator){
        ...
    })
</script>
```
页面表单
```html
<form id="form-1">
    <label>用户名：<input name="username" type="text" /></label>
    <label>密码：<input name="password" type="text" /></label>
    <label>重复密码：<input name="repassword" type="text" /></label>
    <label><input name="checkbox" type="checkbox"/>同意《注册协议》</label>
    <select name="select">
        <option>==性别==</option>
        <option>男</option>
        <option>女</option>
    </select>
    <input type="submit" value="提交">
</form>

```
页面样式
```css
<style>
	#form-1{}
	#form-1 input{}
	.sujui-validator{}
	.sujui-validator-msg{}
	.sujui-validator-default{}
	.sujui-validator-focus{}
	.sujui-validator-success{ color:#3C3}
	.sujui-validator-error{ color:#f00}
</style>

```

验证规则
```javascript
var form1=validator({
	formId:'form-1', //表单ID
	config:{
		Prefix:'sujui-validator' , //提示信息样式前缀
		Submit:true //表单提交拦截
	},
	rules:{
		username:{ //验证对象name值
			label    : '用户名',//当前名称
			Default  : '请填写{label}',//默认提示
			Required : '{label}不能为空',//必填提示
			Focus    : '请填写{label}',//获得焦点提示
			Length   : {'min':6,'max':12,'msg':'{label}不能小于{min}位,不能大于{max}位'},//长度验证
			Regexp   : {'reg':/^\w+$/, 'compare':false, 'msg':"{label}只能由数字、字母和下划线组成"},//正则验证
			Ajax     : {'url':'ajax.php', 'reg':'!==', 'msg':"{label}已经存在"},//ajax验证
			Callback : {'fun':{}, 'msg':"{label}不能是6位数字，请另换一个"}//函数回调验证
		},
		password:{
			label    : '密码',
			Default  : '请输入{label}',
			Required : '{label}不能为空',
			Focus    : '请输入6-12位{label}',
			Length   : {'min':6,'max':12,'msg':'{label}不能小于{min}位,不能大于{max}位'},
			Regexp   : {'reg':/^\w+$/,compare:false, 'msg':"{label}只能由数字、字母和下划线组成"},
			Equal    : {'reg':"!=", to:"username", 'msg':"{label}不能和用户名相同。"}
		},
		repassword:{
			label    : '重复密码',
			Default  : '请输入{label}',
			Required  : '{label}不能为空',
			Focus    : '{label}',
			Equal    : {'reg':"==", to:"password", 'msg':"{label}与密码不一致。"},
		},
		checkbox:{
			label    : '同意注册协议',
			Default  : '请填写{label}',
			Required : '{label}不能为空',
			Focus    : '请填写{label}'
		},
		select:{
			label    : '性别',
			Default  : '请选择{label}',
			Focus    : '请选择{label}',
			Regexp   : {'reg':/^==性别==$/,compare:true, 'msg':"没有选择{label}"}
		}
	}
})
.add({//添加验证
	username2:{
		label    : '用户名2',//当前字段名称
		Required : '{label}不能为空'//必填提示
	},
	username3:{
	    ...
	}
})
.del('username')//删除一个验证字段
.del(['username','password']) //删除多个验证字段


```
### 配置表单提交拦截
```javascript
//简单配置是否开启表单提交拦截，默认为true
config:{
	Submit:true //(true||false)||function
}

//函数回调

config:{
	Submit:function(params){
			alert('ajax 正在提交表单')
		}else{
			alert('表单填写错误')
		}
	}
}	

```

License
-------

This work is licensed under the [MIT License](LICENSE).

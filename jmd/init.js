app.config({
	base:'http://localhost/sujui.app/jmd/',
	alias:{
		'dom':'jquery/jquery.min.js',
		'demo':'demo/demo'
	},
	cache:true,
	charset:'utf-8',
	debug:false,
	strict:true //开启严格模式，模块不能重复定义
})
app.define('init',function(require, exports, module){
	var jquery=require('dom')
	console.log(jquery)
});

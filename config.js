app.config({
	base:'  ',
	paths:{
		extend : '../src',
		app    : '../app'
	},
	alias:{
		'util':'extend://util',
		'index':'app/index'
	},
	charset:'utf-8',
	cover : true
});


app.use(['util'],function(dom,css){
	console.log(dom)
})

app.use(['util'],function(dom,css){
	console.log(dom)
})





/*
app.init(function(module){
	var $ = this.require('extend://dom');
	var dialog = this.require('plugins://dialog');
	$('#test').click(function(){
		dialog({
			title:'hah'
		})
	})
	
})

*/
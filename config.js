
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
	cache: false,
	debug : true
});


app.use(['id','index','test.css'], function (test,index,css) {
	document.getElementById('test').innerHTML = test+index
});
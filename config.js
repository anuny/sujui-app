
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

app.define('demo',function(require,exports,module){
	var index = module.require('index')
	return index
})
app.use(['util','demos'], function (util,demo) {
    //alert(demo);
});
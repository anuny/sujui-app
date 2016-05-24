
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
	return 'demo'
})
app.use(['demo','util'], function (demo,util) {
	document.getElementById('test').innerHTML = demo+util
});

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

app.use(['test'], function (test,test2) {
    console.log(test);//输出 123
});


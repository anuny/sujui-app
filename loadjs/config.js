app.config({
	base:'',
	alias:{
		'dom':'jquery/jquery.min.js',
		'demo':'demo/demo'
	},
	charset:'utf-8'
})

app.define(function() {
    var util = this.require('extend://util');
	app.extend({define:util})
    console.log(app)
	
});

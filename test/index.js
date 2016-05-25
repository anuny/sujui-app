module('feiui');

app.config({
	base:'http://localhost/sujui.app/test/',
	paths:{
		id:'js/id',
		amd : 'js/amd',
		simple : 'js/simple',
		cmd : 'js/cmd'
	},
	alias:{
		'id':'id/id',
		'AMD':'amd/amd',
		'DATA-object':'simple/object',
		'DATA-array':'simple/array',
		'DATA-number':'simple/number',
		'DATA-string':'simple/string',
		'CMD-return':'cmd/return',
		'CMD-exports':'cmd/exports',
		'CMD-require':'cmd/require',
		'CMD-module-exports':'cmd/module-exports'
	},
	charset:'utf-8',
	cache: false,
	debug : true
});


QUnit.test( "SET ID", function(assert) {
    assert.expect(1);
    var done1 = assert.async();
    app.use('id', function (exp) {
        assert.ok(exp === 'id ok', 'id/id.js = > define("id",function(){return "id ok"})');
        done1();
    });
});

QUnit.test( "AMD", function(assert) {
    assert.expect(1);
    var done1 = assert.async();
    app.use('AMD', function (exp) {
        assert.ok(exp === 'dataAdataB', 'amd/amd.js = > define(["js/data/a","js/data/b"],function(a,b){return a+b})');
        done1();
    });
});

QUnit.test( "CMD", function(assert) {
    assert.expect(4);
    var done1 = assert.async();
    var done2 = assert.async();
	var done3 = assert.async();
    var done4 = assert.async();

    app.use('CMD-return', function (exp) {
        assert.ok(exp === 'cmd-return', 'cmd/return.js  = > define(function(require, exports, module){ return "return..." })');
        done1();
    });
    app.use('CMD-exports', function (exp) {
        assert.ok(exp.a === 'cmd-exports', 'cmd/exports.js  = > define(function(require, exports, module){ exports.a = " ... " })');
        done2();
    });
	app.use('CMD-require', function (exp) {
        assert.ok(exp === 'dataAdataB', 'cmd/require.js  = > define(function(require, exports, module){ return require("data/a") + require("data/b") })');
        done3();
    });
	app.use('CMD-module-exports', function (exp) {
        assert.ok(exp === 'dataA', 'cmd/module.exports.js  = > define(function(require, exports, module){ module.exports = "dataA" })');
        done4();
    });
	
});

QUnit.test( "DATA", function(assert) {
    assert.expect(4);
    var done1 = assert.async();
    var done2 = assert.async();
	var done3 = assert.async();
    var done4 = assert.async();

    app.use('DATA-object', function (exp) {
        assert.ok(exp.obj === 'simple-object', 'simple/object.js = > define({ ... })');
        done1();
    });
	app.use('DATA-array', function (exp) {
        assert.ok(exp[0] === 'simple-array', 'simple/array.js  = > define([ ... ])');
        done2();
    });
	app.use('DATA-number', function (exp) {
        assert.ok(exp === 123, 'simple/number.js  = > define(123)');
        done3();
    });
	app.use('DATA-string', function (exp) {
        assert.ok(exp === 'simple-string', 'simple/string.js  = > define("simple string...")');
        done4();
    });
});

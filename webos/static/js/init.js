seajs.config({
	paths: {
		'lib': 'http://localhost/webos/static/js/lib',
		'app': 'http://localhost/webos/static/js/app'
	},
	alias: {
		'jquery': 'lib/jquery/jquery-1.8.3.min'
	}
});
seajs.use(['jquery'],function() {
	seajs.use('app/desktop',function(desktop) {
		desktop.icons({
			width:100,
			height:100,
			animate:true,
			animateSpeed:300,
			hoverStyle:'current',
			clickStyle:'click',
			dbclickStyle:'dbclick'
		});
		desktop.background()
	})
});

// http://www.lanrentuku.com/down/js/qita-862/
app.define(function (module) {
	var dialog = function(opt) {
		return new dialog.fn.init(opt)
	};
	dialog.fn  = dialog.prototype = {
		init : function(opt) {
			this.title = opt.title;
			this.tip()
		},
		tip :function(){
			alert(this.title)
		}
	}
	dialog.fn.init.prototype = dialog.fn;
	return dialog
})
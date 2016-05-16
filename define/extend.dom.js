app.define('extend://dom',function(){
	var dom=function(obj){
		return document.getElementById(obj)
	}
	var html=function(obj){
		return obj.innerHTML
	}
	this.define('html',function(){
		return html;
	})
	return dom
})
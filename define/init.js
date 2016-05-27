require(['plugins::slider'],function(slider){

	app.init('test::demo',function(){
		this.element.innerHTML = 'HAHAHHA'
	})
	
	app.init('index::slider',function(){
		slider({
			element:this.element,
			type:'fade',
			bind:'onclick',
			speed:3000
		})
		
	})
	
	
})
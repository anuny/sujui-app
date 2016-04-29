app.define('plugins://slider',function(require) {
	function slider(options) {
		var $= require('extend://dom')
		var sliderMain = $(options.element);
		if (sliderMain.length===0) return;
		var sliderBox = sliderMain.find('ul'),
		sliderItem = sliderBox.find('li');
		sliderBox.append('<div class="slider-fix"></div>');
		var sliderFix = sliderBox.find(".slider-fix");
		var countBox = '<ul class="count">';
		countBox += '<li class="current"></li>';
		for (i = 2; i <= sliderItem.length; i++) countBox += '<li></li>';
		countBox += '</ul>';
		sliderMain.append(countBox);
		
		var countItem = sliderMain.find('ul.count li'),
		timer = play = null,
		i = index = 0,
		prevIndex = 0,
		fixHTML = '';
		countItem.each(function(i){
			this[options.bind || 'onmouseover']= function() {
				show(i);
				sliderFix[0].innerHTML = sliderItem[prevIndex].innerHTML;
				fade(sliderFix[0], 100);
				prevIndex = i
			}
		});

		sliderMain[0].onmouseover = function() {
			clearInterval(play)
		};
		sliderMain[0].onmouseout = function() {
			autoPlay()
		};
		
		function fade(ele, opacity) {
			ele.style.display = opacity == 0 ? 'none': 'block';
			ele.style.opacity = opacity / 100;
			ele.style.filter = "alpha(opacity = " + opacity + ")"
		};
		function autoPlay() {
			play = setInterval(function() {
				index++;
				index >= sliderItem.length && (index = 0);
				sliderFix[0].innerHTML = sliderItem[prevIndex].innerHTML;
				fade(sliderFix[0], 100);
				show(index);
				prevIndex = index
			},
			options.speed || 2000)
		};
		autoPlay();
		function show(index) {
			var opacityMin = 0,
			opacityMax = 100;
			for (i = 0; i < countItem.length; i++) countItem[i].className = "";
			countItem[index].className = "current";
			clearInterval(timer);
			for (i = 0; i < sliderItem.length; i++) fade(sliderItem[i], 0);
			timer = setInterval(function() {
				opacityMin += 2;
				opacityMax -= 2;
				opacityMin > 100 && (opacityMin = 100);
				fade(sliderFix[0], opacityMax);
				fade(sliderItem[index], opacityMin);
				opacityMin == 100 && clearInterval(timer)
			},
			20)
		}
	};
	return slider
});

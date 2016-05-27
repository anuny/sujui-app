define('plugins::slider',function() {
	function slider(options) {
		var defaultOptions = {
				element:null,
				type:'fade',
				bind:'onmouseover',
				speed:3000
			},
			options    = options||{},
			element    = options.element,
			sliderMain = element;
		
		if (!sliderMain) return;
		
		var sliderBox  = getTag('ul',sliderMain)[0],
			sliderItem = getTag('li',sliderBox),
			sliderFix  = appendTo(sliderBox,'<div class="slider-fix"></div>'),
			countBox   = '<ul class="count">';
			countBox  += '<li class="current"></li>';
			for (i = 2; i <= sliderItem.length; i++) countBox += '<li></li>';
			countBox  += '</ul>';
		
		var countItem  = appendTo(sliderMain,countBox),
			countItems = getTag('li',countItem),
			timer = play = null,
			i = index  = 0,
			prevIndex  = 0,
			fixHTML    = '';
		
		
		function autoPlay() {
			play = setInterval(function() {
				index++;
				index >= sliderItem.length && (index = 0);
				sliderFix.innerHTML = sliderItem[prevIndex].innerHTML;
				fade(sliderFix, 100);
				show(index);
				prevIndex = index
			},
			options.speed || defaultOptions.speed)
		};
		
		function show(index) {
			var opacityMin = 0,
			opacityMax = 100;
			each(countItems,function(i,ele){
				ele.className= "";
			})
			countItems[index].className = "current";
			clearInterval(timer);
			for (i = 0; i < sliderItem.length; i++) fade(sliderItem[i], 0);
			timer = setInterval(function() {
				opacityMin += 2;
				opacityMax -= 2;
				opacityMin > 100 && (opacityMin = 100);
				fade(sliderFix, opacityMax);
				fade(sliderItem[index], opacityMin);
				opacityMin == 100 && clearInterval(timer)
			},
			10)
		};
		function getTag (tagName,root) {
            return root.getElementsByTagName(tagName)
        }
		
		function create (html) {
            var div = document.createElement('div'),
            els = [];
            div.innerHTML = html;
            ele = div.childNodes;
			div = null;
            return ele.length == 1 ? ele[0] : ele
        }
		function appendTo(ele,html) {
           var elem = create(html);
		   ele.appendChild(elem);
		   return elem;
        }

	
		function each(array,fn){
			for(var i=0,len =array.length;i<len;i++){
				fn&&fn(i,array[i])
			}
			
		}
		
		
		
		function fade(ele, opacity) {
			ele.style.display = opacity == 0 ? 'none': 'block';
			ele.style.opacity = opacity / 100;
			ele.style.filter  = "alpha(opacity = " + opacity + ")"
		};
		
		each(countItems,function(i,counts){
			counts[options.bind || defaultOptions.bind]= function() {
				show(i);
				sliderFix.innerHTML = sliderItem[prevIndex].innerHTML;
				fade(sliderFix, 100);
				prevIndex = i
			}
		})
		
		sliderMain.onmouseover = function() {
			clearInterval(play)
		};
		sliderMain.onmouseout = function() {
			autoPlay()
		};
		
		
		autoPlay();
		
	};
	return slider
});



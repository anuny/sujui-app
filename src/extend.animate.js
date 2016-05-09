app.define('extend://animate',function(require, exports, module) {
	var animation = function(selector, props, duration, tween, callback) {
		return new animation.fn.init(selector[0], props, duration, tween, callback)
	};
	animation.fn = animation.prototype;
	var css = function(ele, attr, value) {
		if (arguments.length == 2) {
			return parseFloat(ele.currentStyle ? ele.currentStyle[attr] : getComputedStyle(ele, null)[attr])
		} else if (arguments.length == 3) {
			attr == "opacity" ? (ele.style.filter = "alpha(opacity=" + value + ")", ele.style.opacity = value / 100) : ele.style[attr] = value + "px"
		}
	};
	var extend = {
		init: function(selector, props, duration, tween, callback) {
			this.selector = selector;
			this.frames = 0;
			this.timmer = undefined;
			this.running = false;
			this.ms = [];
			this.fps = 36;
			this.curframe = 0;
			this.initstate = {};
			this.props = props;
			this.duration = duration || 1000;
			this.tween = tween ||function(t, b, c, d) {
				return t * c / d + b
			};
			this.frames = Math.ceil(this.duration * this.fps / 1000);
			for (var prop in this.props) {
				this.initstate[prop] = {
					from: parseFloat(css(this.selector, prop)),
					to: parseFloat(this.props[prop])
				}
			};
			this.play(callback)
		},
		start: function() {
			if (!this.running && this.hasNext()) {
				this.ms.shift().call(this)
			}
			return this
		},
		play: function(callback) {
			var that = this;
			this.running = true;
			if (this.timmer) {
				this.stop()
			};
			this.timmer = setInterval(function() {
				if (that.complete()) {
					that.stop();
					that.running = false;
					if (callback) {
						callback.call(that)
					}
					return
				}
				that.curframe++;
				that.enterFrame.call(that)
			},
			this.fps);
			return this
		},
		stop: function() {
			if (this.timmer) {
				clearInterval(this.timmer);
				this.timmer = undefined
			}
		},
		go: function(props, duration, tween) {
			var that = this;
			this.ms.push(function() {
				that.init.call(that, props, duration, tween);
				that.play.call(that, that.start)
			});
			return this
		},
		next: function() {
			this.stop();
			this.curframe++;
			this.curframe = this.curframe > this.frames ? this.frames: this.curframe;
			this.enterFrame.call(this)
		},
		prev: function() {
			this.stop();
			this.curframe--;
			this.curframe = this.curframe < 0 ? 0 : this.curframe;
			this.enterFrame.call(this)
		},
		gotoAndPlay: function(frame) {
			this.stop();
			this.curframe = frame;
			this.play.call(this)
		},
		gotoAndStop: function(frame) {
			this.stop();
			this.curframe = frame;
			this.enterFrame.call(this)
		},
		enterFrame: function() {
			var ds;
			for (var prop in this.initstate) {
				ds = this.tween(this.curframe, this.initstate[prop]['from'], this.initstate[prop]['to'] - this.initstate[prop]['from'], this.frames).toFixed(2);
				css(this.selector, prop, ds)
			}
		},
		hasNext: function() {
			return this.ms.length > 0
		},
		complete: function() {
			return this.curframe >= this.frames
		}
	};
	animation.fn = extend;
	animation.fn.init.prototype = animation.fn;
	if (this.app.modules['extend://dom']) {
		var $ = require('extend://dom');
		$.extend({
			animate: function(props, duration, tween, callback) {
				return animation(this, props, duration, tween, callback)
			}
		});
		return $
	} else {
		return animation
	}
});
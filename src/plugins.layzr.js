app.define('plugins://layzr', function (require,exports,module) {
	function Layzr(options) {
		this._lastScroll = 0;
		this._ticking = false;
		options = options || {};
		this._optionsContainer = document.querySelector(options.container) || window;
		this._optionsSelector = options.selector || '[data-layzr]';
		this._optionsAttr = options.attr || 'data-layzr';
		this._optionsAttrRetina = options.retinaAttr || 'data-layzr-retina';
		this._optionsAttrBg = options.bgAttr || 'data-layzr-bg';
		this._optionsAttrHidden = options.hiddenAttr || 'data-layzr-hidden';
		this._optionsThreshold = options.threshold || 0;
		this._optionsCallback = options.callback || null;
		this._retina = window.devicePixelRatio > 1;
		this._srcAttr = this._retina ? this._optionsAttrRetina: this._optionsAttr;
		this._nodes = document.querySelectorAll(this._optionsSelector);
		this._handlerBind = this._requestScroll.bind(this);
		this._create()
	}
	Layzr.prototype._requestScroll = function() {
		if (this._optionsContainer === window) {
			this._lastScroll = window.pageYOffset
		} else {
			this._lastScroll = this._optionsContainer.scrollTop + this._getOffset(this._optionsContainer)
		}
		this._requestTick()
	};
	Layzr.prototype._requestTick = function() {
		if (!this._ticking) {
			requestAnimationFrame(this.update.bind(this));
			this._ticking = true
		}
	};
	Layzr.prototype._getOffset = function(node) {
		return node.getBoundingClientRect().top + window.pageYOffset
	};
	Layzr.prototype._getContainerHeight = function() {
		return this._optionsContainer.innerHeight || this._optionsContainer.offsetHeight
	}
	Layzr.prototype._create = function() {
		this._handlerBind();
		this._optionsContainer.addEventListener('scroll', this._handlerBind, false);
		this._optionsContainer.addEventListener('resize', this._handlerBind, false)
	};
	Layzr.prototype._destroy = function() {
		this._optionsContainer.removeEventListener('scroll', this._handlerBind, false);
		this._optionsContainer.removeEventListener('resize', this._handlerBind, false)
	};
	Layzr.prototype._inViewport = function(node) {
		var viewportTop = this._lastScroll;
		var viewportBottom = viewportTop + this._getContainerHeight();
		var nodeTop = this._getOffset(node);
		var nodeBottom = nodeTop + this._getContainerHeight();
		var threshold = (this._optionsThreshold / 100) * window.innerHeight;
		return nodeBottom >= viewportTop - threshold && nodeTop <= viewportBottom + threshold && !node.hasAttribute(this._optionsAttrHidden)
	};
	Layzr.prototype._reveal = function(node) {
		var source = node.getAttribute(this._srcAttr) || node.getAttribute(this._optionsAttr);
		if (node.hasAttribute(this._optionsAttrBg)) {
			node.style.backgroundImage = 'url(' + source + ')'
		} else {
			node.setAttribute('src', source)
		}
		if (typeof this._optionsCallback === 'function') {
			this._optionsCallback.call(node)
		}
		node.removeAttribute(this._optionsAttr);
		node.removeAttribute(this._optionsAttrRetina);
		node.removeAttribute(this._optionsAttrBg);
		node.removeAttribute(this._optionsAttrHidden)
	};
	Layzr.prototype.updateSelector = function() {
		this._nodes = document.querySelectorAll(this._optionsSelector)
	};
	Layzr.prototype.update = function() {
		var nodesLength = this._nodes.length;
		for (var i = 0; i < nodesLength; i++) {
			var node = this._nodes[i];
			if (node.hasAttribute(this._optionsAttr)) {
				if (this._inViewport(node)) {
					this._reveal(node)
				}
			}
		}
		this._ticking = false
	};
	return Layzr
})
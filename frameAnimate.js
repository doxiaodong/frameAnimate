'use strict';

function frameAnimate(canvas, opts, callback) {

	this.canvas = canvas;

	this.width = opts.width;
	this.height = opts.height;
	this.frame = opts.frame;
	this.fps = opts.fps || 24;
	this.loop = opts.loop;
	this.loopCount = opts.loopCount;
	this.singleMode = opts.singleMode || false;

	this.callback = callback;

	this._currentFrame = 0;
	this.source = this.canvas.getAttribute('data-source');
	this._setInterval;
	this._onloadLength = 0;

	this._frames = [];

	this.init();

}

frameAnimate.prototype.init = function() {
	var self = this;
	console.log(self)
	this.canvas.width = this.width;
	this.canvas.height = this.height;

	this._ctx = this.canvas.getContext("2d");

	if (this.singleMode) {
		singleMode();
	} else {
		picsMode();
	}
	// 未完成
	function singleMode() {
		self._img = new Image();
		self._img.src = self.source;
		self._img.onload = function() {
			var img_WIDTH = self._img.width / self.width;
			var img_HEIGHT = self._img.height / self.height;
			for (var i = 0; i < img_HEIGHT; i++) {
				for (var j = 0; j < img_WIDTH; j++) {
					var frame = {
						x: (j % img_WIDTH) * self.width,
						y: i * self.height
					};
					self.frames.push(frame);
				}
			}
		};
	}

	function picsMode() {
		for (var i = 0; i < self.frame; i++) {
			var _img = new Image();
			_img.src = self.source + i + '.png';
			self._frames.push(_img);

			_img.onload = function() {
				self._onloadLength++;
			}
		}
	}
};

frameAnimate.prototype.draw = function() {
	var self = this;
	self._ctx.clearRect(0, 0, self.width, self.height);
	var f = self._frames[self._currentFrame];
	if (self.singleMode) {
		self._ctx.drawImage(self._img, f.x, f.y, self.width, self.height);
	} else {
		self._ctx.drawImage(f, 0, 0, self.width, self.height);
	}

	if (self._currentFrame === self.frame - 1) {

		self._currentFrame = 0;
		if (!self.loop) {
			// clearInterval(self._setInterval);
			self.pause();
		}
		if (self.loopCount) {
			if (self.loopCount > 1) {
				self.loopCount--;
			} else {
				// clearInterval(self._setInterval);
				self.pause();
			}
		}
	} else {
		self._currentFrame++;
	}
};

frameAnimate.prototype.checkLoad = function(next, n) {
	var self = this;
	self._setInterval = setInterval(function() {
		if (self._onloadLength === self.frame) {
			// console.log("==pics load complete==");
			clearInterval(self._setInterval);

			switch(next) {
				case 'draw':
					self.draw();
					break;
				case 'seekTo':
					self.seekTo(n);
					break;
				default:
					self.play();
			}
		}
	}, 1000/this.fps);
};

frameAnimate.prototype.play = function() {
	var self = this;
	self.pause();
	if (self._onloadLength < self.frame) {
		self.checkLoad('play');
	} else {
		self._setInterval = setInterval(function() {
			if (self._onloadLength === self.frame) {
				self.draw();
			}
		}, 1000/this.fps);
	}
};

frameAnimate.prototype.pause = function() {
	var self = this;
	if (self._setInterval) {
		clearInterval(self._setInterval);
	}
	if (self.callback) {
		self.callback();
	}
};

frameAnimate.prototype.stop = function() {
	var self = this;
	self.pause();
	self.seekTo(self.frame - 1);
};

frameAnimate.prototype.replay = function() {
	this.pause();
	this.seekTo(0);
	this.play();
};

frameAnimate.prototype.seekTo = function(n) {
	var self = this;

	self.pause();
	self._currentFrame = n;
	if (self._onloadLength < self.frame) {
		self.checkLoad('seekTo', n);
	} else {
		self.draw();
	}
};

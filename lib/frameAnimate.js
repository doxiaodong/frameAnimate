'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var frameAnimate = function () {
  _createClass(frameAnimate, [{
    key: 'seekTo',
    value: function seekTo(n) {
      this.pause();
      this._currentFrame = n;
      if (this._onloadLength < this.frame) {
        this.checkLoad('seekTo', n);
      } else {
        this.draw();
      }
    }
  }, {
    key: 'replay',
    value: function replay() {
      this.pause();
      this.seekTo(0);
      this.play();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.pause();
      this.seekTo(this.frame - 1);
    }
  }, {
    key: 'pause',
    value: function pause() {
      if (this._setInterval) {
        clearInterval(this._setInterval);
      }
    }
  }, {
    key: 'play',
    value: function play() {
      var _this = this;

      this.loopCount = this.optsLoopCount;
      this.pause();
      if (this._onloadLength < this.frame) {
        this.checkLoad('play');
      } else {
        this._setInterval = setInterval(function () {
          if (_this._onloadLength === _this.frame) {
            _this.draw();
          }
        }, 1000 / this.fps);
      }
    }
  }, {
    key: 'checkLoad',
    value: function checkLoad(next, n) {
      var _this2 = this;

      this._setInterval = setInterval(function () {
        if (_this2._onloadLength === _this2.frame) {
          // console.log("==pics load complete==");
          clearInterval(_this2._setInterval);

          switch (next) {
            case 'draw':
              _this2.draw();
              break;
            case 'seekTo':
              _this2.seekTo(n);
              break;
            default:
              _this2.play();
          }
        }
      }, 1000 / this.fps);
    }
  }, {
    key: 'draw',
    value: function draw() {
      this._ctx.clearRect(0, 0, this.width, this.height);
      var f = this._frames[this._currentFrame];
      if (this.singleMode) {
        this._ctx.drawImage(this._img, f.x, f.y, this.width, this.height);
      } else {
        this._ctx.drawImage(f, 0, 0, this.width, this.height);
      }

      if (this._currentFrame === this.frame - 1) {

        this._currentFrame = 0;
        if (!this.loop) {
          this.pause();
          if (this.callback) {
            this.callback();
          }
        }
        if (this.loopCount) {
          if (this.loopCount > 1) {
            this.loopCount--;
          } else {
            this.pause();
            if (this.callback) {
              this.callback();
            }
          }
        }
      } else {
        this._currentFrame++;
      }
    }
  }, {
    key: 'init',
    value: function init() {
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      this._ctx = this.canvas.getContext("2d");

      if (this.singleMode) {
        singleMode(this);
      } else {
        picsMode(this);
      }
      // 未完成
      function singleMode(self) {
        self._img = new Image();
        self._img.src = self.source;
        self._img.onload = function () {
          var img_WIDTH = self._img.width / self.width;
          var img_HEIGHT = self._img.height / self.height;
          for (var i = 0; i < img_HEIGHT; i++) {
            for (var j = 0; j < img_WIDTH; j++) {
              var frame = {
                x: j % img_WIDTH * self.width,
                y: i * self.height
              };
              self.frames.push(frame);
            }
          }
        };
      }

      function picsMode(self) {
        for (var i = 0; i < self.frame; i++) {
          var _img = new Image();
          _img.src = self.source + i + self.extension;
          self._frames.push(_img);

          _img.onload = function () {
            self._onloadLength++;
          };
        }
      }
    }
  }]);

  function frameAnimate(canvas, opts, callback) {
    _classCallCheck(this, frameAnimate);

    this.canvas = canvas;

    this.width = opts.width;
    this.height = opts.height;
    this.frame = opts.frame;
    this.fps = opts.fps || 24;
    this.loop = opts.loop;
    this.loopCount = opts.loopCount;
    this.optsLoopCount = opts.loopCount;
    this.singleMode = opts.singleMode || false;
    this.extension = opts.extension || '.png';

    this.callback = callback;

    this._currentFrame = 0;
    this.source = this.canvas.getAttribute('data-source');
    this._setInterval;
    this._onloadLength = 0;

    this._frames = [];

    this.init();
  }

  return frameAnimate;
}();
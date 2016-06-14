class frameAnimate {

  seekTo(n) {
    this.pause();
    this._currentFrame = n;
    if (this._onloadLength < this.frame) {
      this.checkLoad('seekTo', n);
    } else {
      this.draw();
    }
  }

  replay() {
    this.pause();
    this.seekTo(0);
    this.play();
  }

  stop() {
    this.pause();
	  this.seekTo(this.frame - 1);
  }

  pause() {
    if (this._setInterval) {
      clearInterval(this._setInterval);
    }
  }

  play() {
    this.loopCount = this.optsLoopCount;
    this.pause();
    if (this._onloadLength < this.frame) {
      this.checkLoad('play');
    } else {
      this._setInterval = setInterval(() => {
        if (this._onloadLength === this.frame) {
          this.draw();
        }
      }, 1000/this.fps);
    }
  }

  checkLoad(next, n) {
    this._setInterval = setInterval(() => {
      if (this._onloadLength === this.frame) {
        // console.log("==pics load complete==");
        clearInterval(this._setInterval);

        switch(next) {
          case 'draw':
            this.draw();
            break;
          case 'seekTo':
            this.seekTo(n);
            break;
          default:
            this.play();
        }
      }
    }, 1000/this.fps);
  }

  draw() {
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

  init() {
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
      self._img.onload = function() {
        var img_WIDTH = self._img.width / self.width;
        var img_HEIGHT = self._img.height / self.height;
        for (let i = 0; i < img_HEIGHT; i++) {
          for (let j = 0; j < img_WIDTH; j++) {
            let frame = {
              x: (j % img_WIDTH) * self.width,
              y: i * self.height
            };
            self.frames.push(frame);
          }
        }
      };
    }

    function picsMode(self) {
      for (let i = 0; i < self.frame; i++) {
        let _img = new Image();
        _img.src = self.source + i + self.extension;
        self._frames.push(_img);

        _img.onload = function() {
          self._onloadLength++;
        }
      }
    }

  }

  constructor(canvas, opts, callback) {
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
}

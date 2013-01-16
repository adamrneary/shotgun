// Generated by CoffeeScript 1.4.0
var Loader, Shotgun;

if (!Shotgun) {
  Shotgun = {};
}

Shotgun.Loader = Loader = (function() {

  Loader.prototype.template = '<div id="shotgun-loader-container">\n    <div id="shotgun-loader-label">\n        Loading...\n    </div>\n    <div class="progress progress-striped active">\n        <div id="shotgun-loader-bar" class="bar" style="width: 0%;"></div>\n    </div>\n</div>';

  function Loader(options) {
    this.options = options || {};
    this.level = 0;
  }

  Loader.prototype.log = function(from, msg) {
    if (from && msg) {
      if (this.options.debug) {
        return console.log("Shotgun.Loader " + from + ": " + msg);
      }
    } else if (from) {
      if (this.options.debug) {
        return console.log(from);
      }
    }
  };

  Loader.prototype.start = function() {
    var _this = this;
    this.log('start', 'options');
    this.log(this.options);
    this.render();
    this.progress(20, 'Loading libraries...');
    return this.load('script', this.options.urls.libs, 20, 'Loading libraries...', function() {
      return _this.load('script', _this.options.urls.apps, 20, 'Loading applications...', function() {
        _this.progress(20, 'Loading data...');
        return _this.options.data(function() {
          _this.progress(20, 'ready');
          return _this.options.ready();
        });
      });
    });
  };

  Loader.prototype.render = function() {
    this.el = $('<div id="shotgun-loader" />').appendTo('body');
    this.el.html(this.template.toString());
    this.label = $(this.el).find('#shotgun-loader-label');
    this.bar = $(this.el).find('#shotgun-loader-bar');
    return this.rendered = true;
  };

  Loader.prototype.progress = function(level, message) {
    console.log(level);
    this.level += level;
    if (!this.rendered) {
      return;
    }
    $(this.bar).css({
      width: this.level + '%'
    });
    if (message) {
      return $(this.label).text(message);
    }
  };

  Loader.prototype.load = function(type, urls, maxLevel, msg, done) {
    var functions, i, url, _i, _len,
      _this = this;
    if (urls == null) {
      urls = [];
    }
    functions = [];
    for (i = _i = 0, _len = urls.length; _i < _len; i = ++_i) {
      url = urls[i];
      functions.push(function(i) {
        if (i == null) {
          i = 0;
        }
        _this.progress(maxLevel / urls.length, urls[i]);
        if (type === 'data') {
          type = '';
        }
        return $.ajax({
          url: urls[i],
          dataType: type,
          complete: function() {
            if (functions[i + 1]) {
              return functions[i + 1](i + 1);
            } else {
              return done();
            }
          }
        });
      });
    }
    if (functions[0]) {
      return functions[0]();
    } else {
      this.progress(maxLevel, 'done');
      return done();
    }
  };

  return Loader;

})();
// Generated by CoffeeScript 1.4.0
var loader;

loader = new Shotgun.Loader({
  debug: true,
  url: {
    js: 'js/testapp.js?' + Math.random(),
    css: 'css/testapp.css?' + Math.random()
  },
  functions: [
    function(cb) {
      return setTimeout(function() {
        return cb();
      }, 2000);
    }
  ],
  ready: function() {}
});

$(document).ready(function() {
  return loader.start();
});

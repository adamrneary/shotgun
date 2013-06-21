
/**
 * Local variables.
 */

var Storage = require('storage');
var bind    = require('bind');
var jsonp   = require('jsonp');
var storage = new Storage('shotgun');

/**
 * Expose constructor.
 */

module.exports = Shotgun;

/**
 * Create `Shotgun` instance.
 *
 * @param {Object} options
 */

function Shotgun(options) {
  this.id  = options.id;
  this.url = options.url.match(/^http/) ? options.url : location.origin + options.url;
}

/**
 * Clear shotgun's cache.
 */

Shotgun.clear = bind(storage, 'clear');

/**
 * Sync local storage with server.
 *
 * @param {Function} cb
 */

Shotgun.prototype.sync = function(cb) {
  jsonp(this.url, resetTime(this, cb));
};

/**
 * Reset currect storage with `data`.
 *
 * @param {Object} data
 * @param {Function} cb
 */

Shotgun.prototype.reset = function(data, cb) {
  storage.put(this.id, data, resetTime(this, cb));
};

/**
 * Helper to handle async request
 * and update last sync time.
 */

function resetTime(that, cb) {
  var time = Date.now();
  return function(err1, data) {
    storage.put(that.id + '-time', time, function(err2) {
      cb(err1 || err2, data);
    });
  };
}

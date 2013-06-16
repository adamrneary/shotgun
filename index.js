
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
  jsonp(this.url, cb);
};

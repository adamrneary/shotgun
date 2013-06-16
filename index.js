
/**
 * Local variables.
 */

var Storage = require('storage');
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
  this.options = options;
}

/**
 * Shotcut to clear shotgun cache.
 */

Shotgun.clear = storage.clear;

/**
 * Sync local storage with server.
 *
 * @param {Function} cb
 */

Shotgun.prototype.sync = function(cb) {
  cb(null, []);
};

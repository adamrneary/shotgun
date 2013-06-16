
/**
 * Module dependencies.
 */

var Storage = require('storage');

/**
 * Expose constructor.
 */

module.exports = Shotgun;

/**
 * create `Shotgun` instance.
 *
 * @param {Object} options
 */

function Shotgun(options) {
  this.options = options;
}

/**
 * Sync local storage with server.
 *
 * @options {Function} cb
 */

Shotgun.prototype.sync = function(cb) {
  cb(null, []);
};

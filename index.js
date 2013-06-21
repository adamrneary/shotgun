
/**
 * Local variables.
 */

var Storage = require('storage');
var bind    = require('bind');
var jsonp   = require('jsonp');
var object  = require('object');
var type    = require('type');
var each    = require('each');
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
  var that = this;
  storage.get(timeAttr(this), function(err, time) {
    if (time)
      jsonp(that.url + '?t=' + time, handleRequest(that, cb));
    else
      jsonp(that.url, reset(that, Date.now(), cb));
  });
};

/**
 * Reset currect storage with `data`.
 *
 * @param {Object} data
 * @param {Function} cb
 */

Shotgun.prototype.reset = function(data, cb) {
  reset(this, Date.now(), cb)(null, data);
};

/**
 * Helper to handle async request
 * and update last sync time.
 */

function reset(that, time, cb) {
  return function(err1, data) {
    storage.put(timeAttr(that), time, function(err2) {
      storage.put(that.id, data, function(err3) {
        cb(err1 || err2 || err3, data);
      });
    });
  };
}

/**
 * Parse requested data.
 */

function handleRequest(that, cb) {
  var time = Date.now();
  return function(err1, data) {
    storage.get(that.id, function(err2, oldData) {
      each(object.keys(data), function(key) {
        data[key] = merge(data[key], oldData[key]);
      });

      reset(that, time, cb)(err1 || err2, data);
    });
  };
}

/**
 * Merge arrays and replace other types with new value.
 */

function merge(data, oldData) {
  if (type(oldData) !== 'array')
    return !data || object.isEmpty(data) ? oldData : data;

  var ids    = getIds(oldData);
  var newIds = getIds(data);

  each(newIds, function(id, val) {
    val.deleted_at ? delete ids[id] : ids[id] = val;
  });

  return object.values(ids);
}

/**
 * Parse array to special id|val object.
 */

function getIds(array) {
  var ret = {};
  each(array, function(val) {
    ret[val.id] = val;
  });
  return ret;
}

/**
 * Helper which returns time attribute.
 */

function timeAttr(that) {
  return that.id + '-time';
}

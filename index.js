;(function(_) {
'use strict';

/**
 * Local variables.
 */

var storage = new Storage('shotgun');

/**
 * Expose constructor.
 */

window.Shotgun = Shotgun;

/**
 * Create `Shotgun` instance.
 *
 * @param {Object} options
 */

function Shotgun(options) {
  this.id  = options.id;
  this.url = options.url.match(/^http/) ? options.url + '?callback=?' : location.origin + options.url;
  this.field = options.field;
  this.disable = !! options.disable;
}

/**
 * Clear shotgun's cache.
 */

Shotgun.clear = _.bind(storage.clear, storage);

/**
 * Sync local storage with server.
 *
 * @param {Function} cb
 */

Shotgun.prototype.sync = function(cb) {
  var that = this;
  if (this.disable) {
    reload(this, cb);
  } else {
    storage.get(timeAttr(this), function(err, time) {
      if (time)
        $.getJSON(that.url + '&t=' + time, handleRequest(that, cb));
      else
        $.getJSON(that.url, reset(that, Date.now(), cb));
    });
  }
};

/**
 * Reset currect storage with `data`.
 *
 * @param {Object} data
 * @param {Function} cb
 */

Shotgun.prototype.reset = function(data, cb) {
  reset(this, Date.now(), cb)(data);
};

/**
 * Helper to handle async request
 * and update last sync time.
 */

function reset(that, time, cb) {
  return function(data) {
    storage.put(timeAttr(that), time, function(err) {
      storage.put(that.id, data, function(err2) {
        cb(err || err2, data);
      });
    });
  };
}

/**
 * Parse requested data.
 */

function handleRequest(that, cb) {
  var time = Date.now();
  return function(data) {
    storage.get(that.id, function(err, oldData) {
      if (!sameStore(data[that.field], oldData[that.field]))
        return reload(that, cb);

      _.forEach(data, function(val, key) {
        data[key] = merge(val, oldData[key]);
      });

      reset(that, time, cb)(data);
    });
  };
}

/**
 * Merge arrays and replace other types with new value.
 */

function merge(data, oldData) {
  if (!_.isArray(oldData))
    return _.isObject(oldData) ? (_.isEmpty(data) ? oldData : data) : data;

  var ids    = getIds(oldData);
  var newIds = getIds(data);

  _.forEach(newIds, function(val, id) {
    val.deleted_at ? delete ids[id] : ids[id] = val;
  });

  return _.values(ids);
}

/**
 * Parse array to special id|val object.
 */

function getIds(array) {
  var ret = {};
  _.forEach(array, function(val) {
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

/**
 * Check that data was not reseeded
 */

function sameStore(data, oldData) {
  var newIds = _.keys(getIds(data)).join('');
  var ids    = _.keys(getIds(oldData)).join('');
  return newIds === ids;
}

/**
 * Reload storage when data was reseeded
 */

function reload(that, cb) {
  storage.del(timeAttr(that), function(err) {
    $.getJSON(that.url, _.bind(cb, null, err));
  });
}

}).call(this, _);

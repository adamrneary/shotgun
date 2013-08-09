;(function($, _, Indexed) {
'use strict';

/**
 * Local variables.
 */

var storage = new Indexed('shotgun:main');

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
  this.id      = options.id;
  this.isJsonp = options.url.match(/^http/);
  this.url     = this.isJsonp ? options.url + '?callback=?' : location.origin + options.url;
  this.field   = options.field;
  this.ignore  = options.allOrNothing || [];
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
      var prefix = that.isJsonp ? '&' : '?';
      if (time)
        $.getJSON(that.url + prefix + 't=' + time, handleRequest(that, cb));
      else
        $.getJSON(that.url, reset(that, cb));
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
  reset(this, cb)(data);
};

/**
 * Helper to handle async request
 * and update last sync time.
 */

function reset(that, cb) {
  return function(data) {
    storage.put(that.id, data, function(err) {
      if (err) return cb(err, data);

      // FIXME: Indexed#0.6.0, don't use value property
      storage.put(timeAttr(that), { value: data.timestamp }, function(err) {
        delete data.id; // FIXME: Indexed#0.6.0, it does not use ugly keyPath field
        delete data.timestamp;
        cb(err, data);
      });
    });
  };
}

/**
 * Parse requested data.
 */

function handleRequest(that, cb) {
  return function(data) {
    storage.get(that.id, function(err, oldData) {
      if (!oldData) oldData = {};
      if (!sameStore(data[that.field], oldData[that.field]))
        return reload(that, cb);

      _.forEach(data, function(val, key) {
        if (_.include(that.ignore, key))
          data[key] = _.isEmpty(val) ? oldData[key] : val;
        else
          data[key] = merge(val, oldData[key]);
      });

      reset(that, cb)(data);
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
    $.getJSON(that.url, function(res) {
      delete res.timestamp;
      cb(err, res);
    });
  });
}

}).call(this, jQuery, _, Indexed);

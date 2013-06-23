;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-clone/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type;

try {
  type = require('type');
} catch(e){
  type = require('type-component');
}

/**
 * Module exports.
 */

module.exports = clone;

/**
 * Clones objects.
 *
 * @param {Mixed} any object
 * @api public
 */

function clone(obj){
  switch (type(obj)) {
    case 'object':
      var copy = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = clone(obj[key]);
        }
      }
      return copy;

    case 'array':
      var copy = new Array(obj.length);
      for (var i = 0, l = obj.length; i < l; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;

    case 'regexp':
      // from millermedeiros/amd-utils - MIT
      var flags = '';
      flags += obj.multiline ? 'm' : '';
      flags += obj.global ? 'g' : '';
      flags += obj.ignoreCase ? 'i' : '';
      return new RegExp(obj.source, flags);

    case 'date':
      return new Date(obj.getTime());

    default: // string, number, boolean, …
      return obj;
  }
}

});
require.register("ask11-indexed/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var clone = require('clone');

/**
 * Local variables.
 */

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB;
var dbs       = {};
var configs   = {};
var indexOf   = [].indexOf;
var slice     = [].slice;

/**
 * Check support of latest standarts.
 * https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase#Browser_Compatibility
 */

var IDBDatabase       = window.IDBDatabase || window.webkitIDBDatabase;
var IDBTransaction    = window.IDBTransaction || window.webkitIDBTransaction;
var hasOnUpgradeEvent = IDBDatabase && ! IDBDatabase.prototype.setVersion;
var hasStringModes    = IDBTransaction && IDBTransaction.READ_WRITE !== 1;
var hasIndexedDB      = !! indexedDB;
var supported         = hasIndexedDB && hasOnUpgradeEvent && hasStringModes;

/**
 * Expose public api.
 */

module.exports    = exports = Indexed;
exports.drop      = drop;
exports.supported = supported;
exports.configs   = configs;

/**
 * Drop IndexedDB instance by name.
 *
 * @options {String} dbName
 * @options {function} cb
 * @api public
 */

function drop(dbName, cb) {
  if (dbs[dbName]) db.close();
  delete configs[dbName];
  delete dbs[dbName];
  request(indexedDB.deleteDatabase(dbName), cb);
}

/**
 * Construtor to wrap IndexedDB API with nice async methods.
 * `name` contains db-name and store-name splited with colon.
 *
 * Example:
 *
 *   // connect to db with name `notepad`, use store `notes`
 *   // use _id field as a key
 *   var indexed = new Indexed('notepad:notes', { key: '_id' });
 *
 * @options {String} name
 * @options {Object} options
 * @api public
 */

function Indexed(name, options) {
  if (typeof name !== 'string') throw new TypeError('name required');
  if (!options) options = {};
  var params = name.split(':');

  this.dbName    = params[0];
  this.name      = params[1];
  this.key       = options.key || 'id';
  this.connected = false;
}

/**
 * Get all values from the object store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.all = transaction('readonly', function(store, tr, cb) {
  var result = [];
  request(store.openCursor(), function(err) {
    var cursor = this.result;
    if (cursor) {
      result.push(cursor.value);
      cursor.continue();
    } else {
      cb(null, result);
    }
  });
});

/**
 * Get object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.get = transaction('readonly', function(store, tr, key, cb) {
  request(store.get(key), function(err) { cb(err, this.result); });
});

/**
 * Clear object store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.clear = transaction('readwrite', function(store, tr, cb) {
  request(store.clear(), tr, cb);
});

/**
 * Delete object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.del = transaction('readwrite', function(store, tr, key, cb) {
  request(store.delete(key), tr, cb);
});

/**
 * Put - replace or create object by `key` with `val`.
 * Extends `val` with `key` automatically.
 *
 * @options {Mixin} key
 * @options {Mixin} val
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.put = transaction('readwrite', function(store, tr, key, val, cb) {
  val[this.key] = key;
  request(store.put(val), tr, function(err) { cb(err, val); });
});

/**
 * Creates new transaction and returns object store.
 *
 * @options {String} mode - readwrite|readonly
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._getStore = function(mode, cb) {
  this._getDb(function(err, db) {
    if (err) return cb(err);

    var transaction = db.transaction([this.name], mode);
    var objectStore = transaction.objectStore(this.name);
    cb.call(this, null, objectStore, transaction);
  });
};

/**
 * Returns db instance, performs connection and upgrade if needed.
 *
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._getDb = function(cb) {
  var that = this;
  var db   = dbs[this.dbName];

  if (db) {
    if (this.connected) return cb.call(that, null, db);
    this._connectOrUpgrade(db, cb);
  } else {
    request(indexedDB.open(this.dbName), function(err) {
      if (err) return cb(err);

      dbs[that.dbName] = this.result;
      that._connectOrUpgrade(this.result, cb);
    });
  }
};

/**
 * Check that `db.version` is equal to config version or
 * Performs connect or db upgrade.
 *
 * @options {Object} db
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._connectOrUpgrade = function(db, cb) {
  var config = this._getUpgradeConfig(db, false);

  if (config.version !== db.version) {
    this._upgrade(db, cb);
  } else {
    this.connected = true;
    cb.call(this, null, db);
  }
};

/**
 * Close current db connection and open new.
 * Create object store if needed and recreate it when keyPath changed.
 *
 * @options {Object} db
 * @options {Function} cb
 * @api private
 */

Indexed.prototype._upgrade = function(db, cb) {
  var that   = this;
  var config = this._getUpgradeConfig(db, true);

  db.close();
  var req = request(indexedDB.open(this.dbName, config.version), function(err) {
    if (err) return cb(err);

    dbs[that.dbName] = this.result;
    that.connected = true;
    cb.call(that, null, this.result);
  });

  req.onupgradeneeded = function(event) {
    if (config.action === 'recreate') this.result.deleteObjectStore(that.name);
    if (config.action) this.result.createObjectStore(that.name, { keyPath: that.key });
  };
};

/**
 * Returns config for upgrade of `db`: new version and action.
 * Prefers info from db to stored config.
 * Backup config to localStorage when `save` is true.
 *
 * @options {Object} db
 * @options {Boolean} save
 * @api private
 */

Indexed.prototype._getUpgradeConfig = function(db, save) {
  var defaults = { version: db.version || 1, stores: [], keys: {} };
  var config   = clone(configs[this.dbName] || defaults);
  var action   = null;

  if (config.stores.indexOf(this.name) < 0) {
    config.stores.push(this.name);
    if (indexOf.call(db.objectStoreNames, this.name) < 0) {
      config.version += 1;
      action = 'create';
    }
  }
  if (!config.keys[this.name] || config.keys[this.name] !== this.key) {
    config.keys[this.name] = this.key;
    if (!action) {
      var objectStore = db.transaction([this.name], 'readonly')
        .objectStore(this.name);

      if (objectStore.keyPath !== this.key) {
        config.version += 1;
        action = 'recreate';
      }
    }
  }

  if (save) configs[this.dbName] = config;
  return { version: config.version, action: action };
};


/**
 * Helper to simplify requests to IndexedDB API.
 * Helps to manage errors, and `onsuccess` and `oncomplete` events
 *
 * @options {Function} method - ready to call request
 * @options {IDBTransaction} tr
 * @options {Function} cb
 * @return {IDBRequest} req
 */

function request(req, tr, cb) {
  req.onerror = function(event) { cb.call(this, event); };

  if (!cb)
    req.onsuccess = function(event) { tr.call(this, null); };
  else
    tr.oncomplete = function(event) { cb.call(this, null); };

  return req;
}

/**
 * Helper to force new transaction for current store.
 *
 * @options {String} mode {readwrite|readonly}
 * @options {Function} handler
 * @return {Function}
 */

function transaction(mode, handler) {
  return function() {
    var args = slice.call(arguments, 0);
    var cb   = args[args.length - 1];

    this._getStore(mode, function(err, store, tr) {
      if (err) return cb(err);
      handler.apply(this, [store, tr].concat(args));
    });
  };
}

});
require.register("timoxley-next-tick/index.js", function(exports, require, module){
"use strict"

if (typeof setImmediate == 'function') {
  module.exports = function(f){ setImmediate(f) }
}
// legacy node.js
else if (typeof process != 'undefined' && typeof process.nextTick == 'function') {
  module.exports = process.nextTick
}
// fallback for other environments / postMessage behaves badly on IE8
else if (typeof window == 'undefined' || window.ActiveXObject || !window.postMessage) {
  module.exports = function(f){ setTimeout(f) };
} else {
  var q = [];

  window.addEventListener('message', function(){
    var i = 0;
    while (i < q.length) {
      try { q[i++](); }
      catch (e) {
        q = q.slice(i);
        window.postMessage('tic!', '*');
        throw e;
      }
    }
    q.length = 0;
  }, true);

  module.exports = function(fn){
    if (!q.length) window.postMessage('tic!', '*');
    q.push(fn);
  }
}

});
require.register("marcuswestin-store.js/store.js", function(exports, require, module){
;(function(win){
	var store = {},
		doc = win.document,
		localStorageName = 'localStorage',
		namespace = '__storejs__',
		storage

	store.disabled = false
	store.set = function(key, value) {}
	store.get = function(key) {}
	store.remove = function(key) {}
	store.clear = function() {}
	store.transact = function(key, defaultVal, transactionFn) {
		var val = store.get(key)
		if (transactionFn == null) {
			transactionFn = defaultVal
			defaultVal = null
		}
		if (typeof val == 'undefined') { val = defaultVal || {} }
		transactionFn(val)
		store.set(key, val)
	}
	store.getAll = function() {}

	store.serialize = function(value) {
		return JSON.stringify(value)
	}
	store.deserialize = function(value) {
		if (typeof value != 'string') { return undefined }
		try { return JSON.parse(value) }
		catch(e) { return value || undefined }
	}

	// Functions to encapsulate questionable FireFox 3.6.13 behavior
	// when about.config::dom.storage.enabled === false
	// See https://github.com/marcuswestin/store.js/issues#issue/13
	function isLocalStorageNameSupported() {
		try { return (localStorageName in win && win[localStorageName]) }
		catch(err) { return false }
	}

	if (isLocalStorageNameSupported()) {
		storage = win[localStorageName]
		store.set = function(key, val) {
			if (val === undefined) { return store.remove(key) }
			storage.setItem(key, store.serialize(val))
			return val
		}
		store.get = function(key) { return store.deserialize(storage.getItem(key)) }
		store.remove = function(key) { storage.removeItem(key) }
		store.clear = function() { storage.clear() }
		store.getAll = function() {
			var ret = {}
			for (var i=0; i<storage.length; ++i) {
				var key = storage.key(i)
				ret[key] = store.get(key)
			}
			return ret
		}
	} else if (doc.documentElement.addBehavior) {
		var storageOwner,
			storageContainer
		// Since #userData storage applies only to specific paths, we need to
		// somehow link our data to a specific path.  We choose /favicon.ico
		// as a pretty safe option, since all browsers already make a request to
		// this URL anyway and being a 404 will not hurt us here.  We wrap an
		// iframe pointing to the favicon in an ActiveXObject(htmlfile) object
		// (see: http://msdn.microsoft.com/en-us/library/aa752574(v=VS.85).aspx)
		// since the iframe access rules appear to allow direct access and
		// manipulation of the document element, even for a 404 page.  This
		// document can be used instead of the current document (which would
		// have been limited to the current path) to perform #userData storage.
		try {
			storageContainer = new ActiveXObject('htmlfile')
			storageContainer.open()
			storageContainer.write('<s' + 'cript>document.w=window</s' + 'cript><iframe src="/favicon.ico"></iframe>')
			storageContainer.close()
			storageOwner = storageContainer.w.frames[0].document
			storage = storageOwner.createElement('div')
		} catch(e) {
			// somehow ActiveXObject instantiation failed (perhaps some special
			// security settings or otherwse), fall back to per-path storage
			storage = doc.createElement('div')
			storageOwner = doc.body
		}
		function withIEStorage(storeFunction) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0)
				args.unshift(storage)
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storageOwner.appendChild(storage)
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
				var result = storeFunction.apply(store, args)
				storageOwner.removeChild(storage)
				return result
			}
		}

		// In IE7, keys may not contain special chars. See all of https://github.com/marcuswestin/store.js/issues/40
		var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g")
		function ieKeyFix(key) {
			return key.replace(forbiddenCharsRegex, '___')
		}
		store.set = withIEStorage(function(storage, key, val) {
			key = ieKeyFix(key)
			if (val === undefined) { return store.remove(key) }
			storage.setAttribute(key, store.serialize(val))
			storage.save(localStorageName)
			return val
		})
		store.get = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			return store.deserialize(storage.getAttribute(key))
		})
		store.remove = withIEStorage(function(storage, key) {
			key = ieKeyFix(key)
			storage.removeAttribute(key)
			storage.save(localStorageName)
		})
		store.clear = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			storage.load(localStorageName)
			for (var i=0, attr; attr=attributes[i]; i++) {
				storage.removeAttribute(attr.name)
			}
			storage.save(localStorageName)
		})
		store.getAll = withIEStorage(function(storage) {
			var attributes = storage.XMLDocument.documentElement.attributes
			var ret = {}
			for (var i=0, attr; attr=attributes[i]; ++i) {
				var key = ieKeyFix(attr.name)
				ret[attr.name] = store.deserialize(storage.getAttribute(key))
			}
			return ret
		})
	}

	try {
		store.set(namespace, namespace)
		if (store.get(namespace) != namespace) { store.disabled = true }
		store.remove(namespace)
	} catch(e) {
		store.disabled = true
	}
	store.enabled = !store.disabled
	if (typeof module != 'undefined' && module.exports) { module.exports = store }
	else if (typeof define === 'function' && define.amd) { define(store) }
	else { win.store = store }
})(this.window || global);

});
require.register("ask11-weak-indexed/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Indexed  = require('indexed');
var store    = require('store');
var each     = require('each');
var nextTick = require('next-tick');

/**
 * Expose constructor.
 */

module.exports = Indexed;

if (Indexed.supported) return;

/**
 * Returns all values from the store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.all = async(function() {
  var result = [];
  var values = store.getAll();
  var name   = this._name();

  each(values, function(key, val) {
    if (key.indexOf(name) === 0) result.push(val);
  });
  return result;
});

/**
 * Get object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.get = async(function(key) {
  return store.get(this._key(key));
});

/**
 * Put - replace or create object by `key` with `val`.
 *
 * @options {Mixin} key
 * @options {Mixin} val
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.put = async(function(key, val) {
  val[this.key] = key;
  return store.set(this._key(key), val);
});

/**
 * Delete object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.del = async(function(key) {
  store.remove(this._key(key));
});

/**
 * Clear store.
 *
 * @options {Function} cb
 * @api public
 */

Indexed.prototype.clear = async(function() {
  var values = store.getAll();
  var name   = this._name();

  each(values, function(key, val) {
    if (key.indexOf(name) === 0) store.remove(key);
  });
});

/**
 * Handle key
 *
 * @options {Mixin} key
 * @return {String}
 * @api private
 */

Indexed.prototype._key = function(key) {
  if (typeof key !== 'string') key = JSON.stringify(key);
  return this._name() + key;
};

/**
 * Returns storage namespace
 *
 * @return {String}
 * @api private
 */

Indexed.prototype._name = function() {
  return this.dbName + ':' + this.name + ':';
};

// we downgraded Indexed methods
Indexed.supported = true;

/**
 * Helper to emulate async call. Essential for all methods.
 */

function async(getVal) {
  return function() {
    var that = this;
    var args = [].slice.call(arguments, 0);
    var cb   = args[args.length - 1];

    nextTick(function() {
      try {
        var res = getVal.apply(that, args.slice(0, -1));
        res ? cb(null, res) : cb(null);
      } catch (error) {
        cb(error);
      }
    });
  };
}

});
require.register("eldargab-parse-fn-args/index.js", function(exports, require, module){
module.exports = function (fn) {
  var src = typeof fn == 'string' ? fn : fn.toString()
  src = src.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, '') // remove comments

  src = src
    .slice(src.indexOf('(') + 1, src.indexOf(')'))
    .replace(/\s+/g, '')

  return src ? src.split(',') : []
}

});
require.register("ask11-storage/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var WeakIndexed = require('weak-indexed');
var object      = require('object');
var type        = require('type');
var parse       = require('parse-fn-args');

/**
 * Local variables.
 */

var store = new WeakIndexed('storage:main', { autoId: false });
var slice = [].slice;

/**
 * Expose constructor.
 */

module.exports = Storage;

/**
 * `Storage` constructor for easy manipulation with data.
 *
 * @param {String} name
 * @api private
 */

function Storage(name) {
  this.name = name;
  this.data = {};
}

/**
 * Returns all values from the store.
 *
 * @options {Function} cb
 * @api public
 */

Storage.prototype.all = request(function(cb) {
  cb(null, this.data);
});

/**
 * Get object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Storage.prototype.get = request(function(key, cb) {
  cb(null, this.data[this._key(key)]);
});

/**
 * Delete all objects in the storage.
 *
 * @options {Function} cb
 * @api public
 */

Storage.prototype.clear = request(function(cb) {
  this.data = {};
  this.save(cb);
});

/**
 * Delete object by `key`.
 *
 * @options {Mixin} key
 * @options {Function} cb
 * @api public
 */

Storage.prototype.del = request(function(key, cb) {
  delete this.data[this._key(key)];
  this.save(cb);
});

/**
 * Put - replace or create object by `key` with `val`.
 *
 * @options {Mixin} key
 * @options {Mixin} val
 * @options {Function} cb
 * @api public
 */

Storage.prototype.put = request(function(key, val, cb) {
  this.data[this._key(key)] = val;
  this.save(function(err, data) { cb(err, val); });
});

/**
 * Perform fast bulk-write operations (both put and delete) in one transaction.
 * `keys` is array with commands.
 * Each command is array with 2 elements: `key` and `val`.
 * In case when `val` is null, performs delete command.
 * Return the count of updated records.
 *
 * Example:
 *
 *    // update items with keys 1 & 2, and remove with 3
 *    notes([[1, { name: 'note 1' }], [2, { name: 'note 2' }], [3, null]])
 *
 * @param {Array} keys
 * @options {Function} cb
 * @api public
 */

Storage.prototype.batch = request(function(keys, cb) {
  if (type(keys) !== 'array') return cb('batch param should be an array');

  for (var i = 0; i < keys.length; i++) {
    var command = keys[i];
    var key     = this._key(command[0]);
    var val     = command[1];

    if (type(command) !== 'array' || command.length !== 2)
      return cb('not valid batch command: ' + command);

    val === null ? delete this.data[key] : this.data[key] = val;
  }

  this.save(function(err, data) {
    if (data) delete data.id;
    cb(err, data);
  });
});

/**
 * Save - update existing object
 *
 * @options {Function} cb
 * @api private
 */

Storage.prototype.save = function(cb) {
  object.isEmpty(this.data) ?
    store.del(this.name, cb) :
    store.put(this.name, this.data, cb);
};

/**
 * Prepare key.
 *
 * @options {Mixin} key
 * @api private
 */

Storage.prototype._key = function(key) {
  return type(key) === 'string' ? key : JSON.stringify(key);
};

/**
 * Helper to validate params count and init data attribute.
 */

function request(handler) {
  var argsCount = parse(handler).length - 1;

  return function() {
    var that = this;
    var args = slice.call(arguments, 0);
    var cb   = args[args.length - 1];

    if (args.length < argsCount)
      throw new TypeError('method has ' + argsCount + ' arguments');

    if (type(cb) !== 'function') {
      cb = function(err) {
        if (err) throw new Error(err);
      };
      args.push(cb);
    }

    store.get(this.name, function(err, data) {
      if (err) return cb(err);
      if (!data) data = {};

      that.data = data;
      delete that.data.id
      handler.apply(that, args);
    });
  };
}

});
require.register("component-bind/index.js", function(exports, require, module){

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = [].slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

});
require.register("visionmedia-debug/index.js", function(exports, require, module){
if ('undefined' == typeof window) {
  module.exports = require('./lib/debug');
} else {
  module.exports = require('./debug');
}

});
require.register("visionmedia-debug/debug.js", function(exports, require, module){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

if (window.localStorage) debug.enable(localStorage.debug);

});
require.register("learnboost-jsonp/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var debug = require('debug')('jsonp');

/**
 * Module exports.
 */

module.exports = jsonp;

/**
 * Callback index.
 */

var count = 0;

/**
 * Noop function.
 */

function noop(){};

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  var opts = opts || {};
  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0];
  var script;
  var timer;

  // generate a unique id for this request
  var id = count++;

  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      fn && fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    script.parentNode.removeChild(script);
    window['__jp' + id] = noop;
  }

  window['__jp' + id] = function(data){
    debug('jsonp got', data);
    if (timer) clearTimeout(timer);
    cleanup();
    fn && fn(null, data);
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc('__jp' + id + '');
  url = url.replace('?&', '?');

  debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  script.src = url;
  target.parentNode.insertBefore(script, target);
};

});
require.register("component-object/index.js", function(exports, require, module){

/**
 * HOP ref.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Return own keys in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.keys = Object.keys || function(obj){
  var keys = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Return own values in `obj`.
 *
 * @param {Object} obj
 * @return {Array}
 * @api public
 */

exports.values = function(obj){
  var vals = [];
  for (var key in obj) {
    if (has.call(obj, key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  for (var key in b) {
    if (has.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};

/**
 * Return length of `obj`.
 *
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.length = function(obj){
  return exports.keys(obj).length;
};

/**
 * Check if `obj` is empty.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api public
 */

exports.isEmpty = function(obj){
  return 0 == exports.length(obj);
};
});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var type = require('type');

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}
});
require.register("shotgun/index.js", function(exports, require, module){

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
  this.id      = options.id;
  this.url     = options.url.match(/^http/) ? options.url : location.origin + options.url;
  this.field   = options.field;
  this.disable = !! options.disable;
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
  if (this.disable) {
    jsonp(that.url, cb);
  } else {
    storage.get(timeAttr(this), function(err, time) {
      if (time)
        jsonp(that.url + '?t=' + time, handleRequest(that, cb));
      else
        jsonp(that.url, reset(that, Date.now(), cb));
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
  reset(this, Date.now(), cb)(null, data);
};

/**
 * Helper to handle async request
 * and update last sync time.
 */

function reset(that, time, cb) {
  return function(err, data) {
    storage.put(timeAttr(that), time, function(err2) {
      storage.put(that.id, data, function(err3) {
        cb(err || err2 || err3, data);
      });
    });
  };
}

/**
 * Parse requested data.
 */

function handleRequest(that, cb) {
  var time = Date.now();
  return function(err, data) {
    storage.get(that.id, function(err2, oldData) {
      if (!sameStore(data[that.field], oldData[that.field]))
        return reload(that, cb);

      each(object.keys(data), function(key) {
        data[key] = merge(data[key], oldData[key]);
      });

      reset(that, time, cb)(err || err2, data);
    });
  };
}

/**
 * Merge arrays and replace other types with new value.
 */

function merge(data, oldData) {
  if (type(oldData) !== 'array')
    return type(oldData) === 'object' ? (object.isEmpty(data) ? oldData : data) : data;

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

/**
 * Check that data was not reseeded
 */

function sameStore(data, oldData) {
  var newIds = object.keys(getIds(data)).join('');
  var ids    = object.keys(getIds(oldData)).join('');
  return newIds === ids;
}

/**
 * Reload storage when data was reseeded
 */

function reload(that, cb) {
  storage.del(timeAttr(that), function(err) {
    err ? cb(err) : that.sync(cb);
  });
}

});
require.alias("ask11-storage/index.js", "shotgun/deps/storage/index.js");
require.alias("ask11-storage/index.js", "shotgun/deps/storage/index.js");
require.alias("ask11-storage/index.js", "storage/index.js");
require.alias("ask11-weak-indexed/index.js", "ask11-storage/deps/weak-indexed/index.js");
require.alias("ask11-weak-indexed/index.js", "ask11-storage/deps/weak-indexed/index.js");
require.alias("ask11-indexed/index.js", "ask11-weak-indexed/deps/indexed/index.js");
require.alias("ask11-indexed/index.js", "ask11-weak-indexed/deps/indexed/index.js");
require.alias("component-clone/index.js", "ask11-indexed/deps/clone/index.js");
require.alias("component-type/index.js", "component-clone/deps/type/index.js");

require.alias("ask11-indexed/index.js", "ask11-indexed/index.js");

require.alias("timoxley-next-tick/index.js", "ask11-weak-indexed/deps/next-tick/index.js");

require.alias("marcuswestin-store.js/store.js", "ask11-weak-indexed/deps/store/store.js");
require.alias("marcuswestin-store.js/store.js", "ask11-weak-indexed/deps/store/index.js");
require.alias("marcuswestin-store.js/store.js", "marcuswestin-store.js/index.js");

require.alias("component-type/index.js", "ask11-weak-indexed/deps/type/index.js");

require.alias("component-each/index.js", "ask11-weak-indexed/deps/each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("ask11-weak-indexed/index.js", "ask11-weak-indexed/index.js");

require.alias("component-object/index.js", "ask11-storage/deps/object/index.js");

require.alias("component-type/index.js", "ask11-storage/deps/type/index.js");

require.alias("eldargab-parse-fn-args/index.js", "ask11-storage/deps/parse-fn-args/index.js");

require.alias("ask11-storage/index.js", "ask11-storage/index.js");

require.alias("component-bind/index.js", "shotgun/deps/bind/index.js");
require.alias("component-bind/index.js", "bind/index.js");

require.alias("learnboost-jsonp/index.js", "shotgun/deps/jsonp/index.js");
require.alias("learnboost-jsonp/index.js", "shotgun/deps/jsonp/index.js");
require.alias("learnboost-jsonp/index.js", "jsonp/index.js");
require.alias("visionmedia-debug/index.js", "learnboost-jsonp/deps/debug/index.js");
require.alias("visionmedia-debug/debug.js", "learnboost-jsonp/deps/debug/debug.js");

require.alias("learnboost-jsonp/index.js", "learnboost-jsonp/index.js");

require.alias("component-object/index.js", "shotgun/deps/object/index.js");
require.alias("component-object/index.js", "object/index.js");

require.alias("component-type/index.js", "shotgun/deps/type/index.js");
require.alias("component-type/index.js", "type/index.js");

require.alias("component-each/index.js", "shotgun/deps/each/index.js");
require.alias("component-each/index.js", "each/index.js");
require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("shotgun/index.js", "shotgun/index.js");

if (typeof exports == "object") {
  module.exports = require("shotgun");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("shotgun"); });
} else {
  this["Shotgun"] = require("shotgun");
}})();
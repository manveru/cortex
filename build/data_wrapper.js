"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

module.exports = function (cortexPubSub) {
  var deepDiff = require("deep-diff").diff;

  var DataWrapper = (function () {
    function DataWrapper(data) {
      _classCallCheck(this, DataWrapper);

      this.__eventId = data.eventId;
      this.__value = data.value;
      this.__path = data.path || [];
      this.__changes = data.changes || [];

      this.__wrap();

      this.val = this.getValue;
    }

    _createClass(DataWrapper, [{
      key: "set",
      value: function set(value, data) {
        var payload = data || {};
        payload.value = value;
        payload.path = this.__path;
        cortexPubSub.publish("update" + this.__eventId, payload);
      }
    }, {
      key: "getValue",
      value: function getValue() {
        return this.__value;
      }
    }, {
      key: "getPath",
      value: function getPath() {
        return this.__path;
      }
    }, {
      key: "getKey",
      value: function getKey() {
        return this.__path[this.__path.length - 1];
      }
    }, {
      key: "getChanges",
      value: function getChanges() {
        return this.__changes;
      }
    }, {
      key: "didChange",
      value: function didChange(key) {
        if (!key) {
          return this.__changes.length > 0;
        }

        for (var i = 0, ii = this.__changes.length; i < ii; i++) {
          var change = this.__changes[i];
          if (change.path[0] === key || this.__hasChange(change, key)) {
            return true;
          }
        }
        return false;
      }
    }, {
      key: "forEach",
      value: function forEach(callback) {
        if (this.__isObject()) {
          for (var key in this.__wrappers) {
            callback(key, this.__wrappers[key], this.__wrappers);
          }
        } else if (this.__isArray()) {
          this.__wrappers.forEach(callback);
        }
      }
    }, {
      key: "remove",
      value: function remove() {
        cortexPubSub.publish("remove" + this.__eventId, { path: this.__path });
      }
    }, {
      key: "__subValue",
      value: function __subValue(path) {
        var subValue = this.__value;
        for (var i = 0, ii = path.length; i < ii; i++) {
          subValue = subValue[path[i]];
        }
        return subValue;
      }
    }, {
      key: "__wrap",

      // Recursively wrap data if @value is a hash or an array.
      // Otherwise there's no need to further wrap primitive or other class instances
      value: function __wrap() {
        this.__cleanup();

        if (this.__isObject()) {
          this.__wrappers = {};
          for (var key in this.__value) {
            this.__wrapChild(key);
          }
        } else if (this.__isArray()) {
          this.__wrappers = [];
          for (var index = 0, length = this.__value.length; index < length; index++) {
            this.__wrapChild(index);
          }
        }
      }
    }, {
      key: "__wrapChild",
      value: function __wrapChild(key) {
        var path = this.__path.slice();
        path.push(key);
        this.__wrappers[key] = new DataWrapper({
          value: this.__value[key],
          path: path,
          eventId: this.__eventId,
          changes: this.__childChanges(key)
        });
        this[key] = this.__wrappers[key];
      }
    }, {
      key: "__childChanges",
      value: function __childChanges(key) {
        var childChanges = [],
            change;
        for (var i = 0, ii = this.__changes.length; i < ii; i++) {
          change = this.__changes[i];
          if (change.path[0] === key) {
            childChanges.push({
              type: change.type,
              path: change.path.slice(1, change.path.length),
              oldValue: change.oldValue,
              newValue: change.newValue
            });
            break;
          } else if (this.__hasChange(change, key)) {
            childChanges.push({
              type: change.type,
              path: [],
              oldValue: change.oldValue ? change.oldValue[key] : undefined,
              newValue: change.newValue ? change.newValue[key] : undefined
            });
            break;
          }
        }

        return childChanges;
      }
    }, {
      key: "__hasChange",
      value: function __hasChange(change, key) {
        return change.path.length === 0 && (change.oldValue && change.oldValue[key] || change.newValue && change.newValue[key]);
      }
    }, {
      key: "__cleanup",
      value: function __cleanup() {
        if (this.__wrappers) {
          if (this.__isObject()) {
            for (var key in this.__wrappers) {
              delete this[key];
            }
          } else if (this.__isArray()) {
            for (var i = 0, ii = this.__wrappers.length; i < ii; i++) {
              delete this[i];
            }
          }
          delete this.__wrappers;
        }
      }
    }, {
      key: "__isObject",
      value: function __isObject() {
        return this.__value && this.__value.constructor === Object;
      }
    }, {
      key: "__isArray",
      value: function __isArray() {
        return this.__value && this.__value.constructor === Array;
      }
    }, {
      key: "__diff",
      value: function __diff(oldValue, newValue) {
        return deepDiff(oldValue, newValue);
      }
    }, {
      key: "__clone",

      // source: http://stackoverflow.com/a/728694
      value: function __clone(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) {
          return obj;
        } // Handle Date
        if (obj instanceof Date) {
          copy = new Date();
          copy.setTime(obj.getTime());
          return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
          copy = [];
          for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = this.__clone(obj[i]);
          }
          return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
          copy = {};
          for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.__clone(obj[attr]);
          }
          return copy;
        }

        throw new Error("Unable to copy obj! Its type isn't supported.");
      }
    }]);

    return DataWrapper;
  })();

  // Mixin Array and Hash behaviors
  var ArrayWrapper = require("./wrappers/array"),
      HashWrapper = require("./wrappers/hash");

  var __include = function __include(klass, mixins) {
    for (var i = 0, ii = mixins.length; i < ii; i++) {
      for (var methodName in mixins[i]) {
        klass.prototype[methodName] = mixins[i][methodName];
      }
    }
  };

  __include(DataWrapper, [ArrayWrapper, HashWrapper]);

  return DataWrapper;
};
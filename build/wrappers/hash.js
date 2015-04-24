"use strict";

var HashWrapper = {
  keys: function keys() {
    return Object.keys(this.__value);
  },

  values: function values() {
    var key,
        values = [];
    for (key in this.__value) {
      values.push(this.__value[key]);
    }
    return values;
  },

  hasKey: function hasKey(key) {
    return this.__value[key] != null;
  },

  destroy: function destroy(key) {
    var oldValue = this.__clone(this.__value),
        removed = this.__value[key];
    delete this.__value[key];
    this.set(this.__value, { oldValue: oldValue });
    return removed;
  },

  add: function add(key, value) {
    var oldValue = this.__clone(this.__value);
    this.__value[key] = value;
    this.set(this.__value, { oldValue: oldValue });
    return value;
  }
};

module.exports = HashWrapper;
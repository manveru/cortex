"use strict";

var ArrayWrapper = {
  count: function count() {
    return this.__value.length;
  },

  map: function map(callback) {
    return this.__wrappers.map(callback);
  },

  filter: function filter(callback, thisArg) {
    return this.__wrappers.filter(callback, thisArg);
  },

  find: function find(callback) {
    for (var index = 0, length = this.__wrappers.length; index < length; index++) {
      if (callback(this.__wrappers[index], index, this.__wrappers)) {
        return this.__wrappers[index];
      }
    }
    return null;
  },

  findIndex: function findIndex(callback) {
    for (var index = 0, length = this.__wrappers.length; index < length; index++) {
      if (callback(this.__wrappers[index], index, this.__wrappers)) {
        return index;
      }
    }
    return -1;
  },

  push: function push(value) {
    var oldValue = this.__clone(this.__value),
        length = this.__value.push(value);
    this.set(this.__value, { oldValue: oldValue });
    return length;
  },

  pop: function pop() {
    var oldValue = this.__clone(this.__value),
        last = this.__value.pop();
    this.set(this.__value, { oldValue: oldValue });
    return last;
  },

  unshift: function unshift(value) {
    var oldValue = this.__clone(this.__value),
        length = this.__value.unshift(value);
    this.set(this.__value, { oldValue: oldValue });
    return length;
  },

  shift: function shift() {
    var oldValue = this.__clone(this.__value),
        last = this.__value.shift();
    this.set(this.__value, { oldValue: oldValue });
    return last;
  },

  insertAt: function insertAt(index) {
    var oldValue = this.__clone(this.__value),
        args = Array.prototype.slice.call(arguments, 1);

    Array.prototype.splice.apply(this.__value, [index, 0].concat(args));

    this.set(this.__value, { oldValue: oldValue });
  },

  removeAt: function removeAt(index) {
    var howMany = arguments[1] === undefined ? 1 : arguments[1];

    var oldValue = this.__clone(this.__value),
        removed = this.__value.splice(index, howMany);

    this.set(this.__value, { oldValue: oldValue });
    return removed;
  }
};

module.exports = ArrayWrapper;
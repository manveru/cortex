"use strict";

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

module.exports = (function () {
  var PubSub = (function () {
    function PubSub() {
      _classCallCheck(this, PubSub);

      this.uid = -1;
      this.topics = {};
    }

    _createClass(PubSub, [{
      key: "subscribe",
      value: function subscribe(topic, callback) {
        if (!this.topics.hasOwnProperty(topic)) {
          this.topics[topic] = [];
        }
        this.topics[topic].push({ callback: callback });
      }
    }, {
      key: "publish",
      value: function publish(topic, data) {
        if (!this.topics.hasOwnProperty(topic)) {
          return false;
        }

        var subscribers = this.topics[topic];

        for (var i = 0, ii = subscribers.length; i < ii; i++) {
          subscribers[i].callback(topic, data);
        }

        return true;
      }
    }, {
      key: "subscribeToCortex",
      value: function subscribeToCortex(updateCallback, removeCallback) {
        this.uid += 1;
        this.subscribe("update" + this.uid, updateCallback);
        this.subscribe("remove" + this.uid, removeCallback);
        return this.uid;
      }
    }, {
      key: "unsubscribeFromCortex",
      value: function unsubscribeFromCortex(topicId) {
        delete this.topics["update" + topicId];
        delete this.topics["remove" + topicId];
      }
    }]);

    return PubSub;
  })();

  return new PubSub();
})();
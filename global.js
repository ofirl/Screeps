// global stuff

var mod = {
    init: function (params) {
        Creep.extend = require('creep').extend;
        Room.extend = require('room').extend;
        Spawn.extend = require('spawn').extend;

        _.assign(global, params);
        _.assign(global, {
                // base event class
                // on = subscribe,  off = unsubscribe , trigger = call all subscribers
                // subscribers takes 1 parameter
                LiteEvent: function () {
                    this.handlers = [];
                    this.on = function (handler) {
                        this.handlers.push(handler);
                    };
                    this.off = function (handler) {
                        this.handlers = this.handlers.filter(h => h !== handler);
                    };
                    this.trigger = function (data) {
                        this.handlers.slice(0).forEach(h => h(data));
                    }
                }
            },


        )
    }
};

module.exports = mod;
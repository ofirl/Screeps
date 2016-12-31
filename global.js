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
                },
                DECAY_AMOUNT: {
                    'rampart': RAMPART_DECAY_AMOUNT, // 300
                    'road': ROAD_DECAY_AMOUNT, // 100
                    'container': CONTAINER_DECAY, // 5000
                },
                DECAYABLES: [
                    STRUCTURE_ROAD,
                    STRUCTURE_CONTAINER,
                    STRUCTURE_RAMPART],
                translateErrorCode: function (code) {
                    var codes = {
                        0: 'OK',
                        1: 'ERR_NOT_OWNER',
                        2: 'ERR_NO_PATH',
                        3: 'ERR_NAME_EXISTS',
                        4: 'ERR_BUSY',
                        5: 'ERR_NOT_FOUND',
                        6: 'ERR_NOT_ENOUGH_RESOURCES',
                        7: 'ERR_INVALID_TARGET',
                        8: 'ERR_FULL',
                        9: 'ERR_NOT_IN_RANGE',
                        10: 'ERR_INVALID_ARGS',
                        11: 'ERR_TIRED',
                        12: 'ERR_NO_BODYPART',
                        14: 'ERR_RCL_NOT_ENOUGH',
                        15: 'ERR_GCL_NOT_ENOUGH'
                    };
                    return codes[code * -1];
                },
            }
        )
    }
};

module.exports = mod;
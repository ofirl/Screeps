// global stuff

var mod = {
    init: function () {
        _.assign(global, params);
        _.assign(global, {
            LiteEvent: function() {
                this.handlers = [];
                this.on = function(handler) {
                    this.handlers.push(handler);
                }
                this.off = function(handler) {
                    this.handlers = this.handlers.filter(h => h !== handler);
                }
                this.trigger = function(data) {
                    this.handlers.slice(0).forEach(h => h(data));
                }
            }
    }
};

module.exports = mod;
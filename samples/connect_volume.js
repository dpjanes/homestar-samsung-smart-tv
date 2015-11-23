/*
 *  NOTE: prefer iotdb versions
 */

"use strict";

var Model = require('../SamsungSmartTVBridge').Bridge;

var tv = new Model();
tv.discovered = function (bridge) {
    console.log("+", "got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+", "state-change", state);
    };
    bridge.connect({});
    bridge.push({
        'volume.delta': 10,
    });
};
tv.discover();

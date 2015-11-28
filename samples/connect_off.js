/*
 *  NOTE: prefer iotdb versions
 */

"use strict";

var Bridge = require('../SamsungSmartTVBridge').Bridge;

var exemplar = new Bridge();
exemplar.discovered = function (bridge) {
    console.log("+", "got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+", "state-change", state);
    };
    bridge.connect({});
    bridge.push({
        off: true,
    });
};
exemplar.discover();

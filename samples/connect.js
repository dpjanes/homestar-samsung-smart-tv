/*
 *  NOTE: the best way to use this is in "model.js"
 *  Connect to a Denon AVR at a named host
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
};
tv.discover();

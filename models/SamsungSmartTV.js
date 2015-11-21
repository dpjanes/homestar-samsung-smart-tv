/*
 *  SamsungSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2015-11-21
 */

var iotdb = require("iotdb");

exports.binding = {
    bridge: require('../SamsungSmartTVBridge').Bridge,
    model: require('./SamsungSmartTv.json'),
};

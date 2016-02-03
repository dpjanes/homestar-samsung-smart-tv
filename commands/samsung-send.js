/*
 *  bin/commands/samsung-send.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-12-31
 *
 *  HomeStar command line control: "homestar add-id"
 *  Add a IDs to Groups
 *
 *  Copyright [2013-2015] [David P. Janes]
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb.helpers;
var cfg = iotdb.cfg;

var SamsungRemote = require('samsung-remote');

exports.command = "samsung-send";
exports.summary = "testing: send a command to a Samsung TV";

exports.help = function () {
    console.log("usage: homestar samsung-send <COMMAND>");
    console.log("");
    console.log("e.g. homestar samsung-send KEY_HDMI");
};

exports.run = function (ad) {
    var self = this;

    if (ad._.length !== 2) {
        console.log("#", "COMMAND argument is required (e.g KEY_HDMI, KEY_TV)");
        exports.help();
        process.exit(1);
    }

    var command = ad._[1];

    var cp = require("iotdb-upnp").control_point();

    console.log("+", "looking for Samsung TV using UPnP");

    cp.on("device", function (device) {
        if (device.deviceType !== "urn:samsung.com:device:RemoteControlReceiver:1") {
            return;
        }

        console.log("+", "found one!", device.host);

        var native = new SamsungRemote({
            ip: device.host,
        });

        native.send(command, function(error) {
            if (error) {
                console.log("#", "command failed", _.error.message(error));
                process.exit(1);
            } else {
                console.log("+", "command sent!");
                process.exit(0);
            }
        });
    });
};

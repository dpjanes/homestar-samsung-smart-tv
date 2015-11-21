/*
 *  SamsungSmartTVBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-11-21
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
var _ = iotdb._;

var logger = iotdb.logger({
    name: 'homestar-samsung-smart-tv',
    module: 'SamsungSmartTVBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var SamsungSmartTVBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/SamsungSmartTVBridge/initd"), {
            poll: 30
        }
    );
    self.native = native;   // the thing that does the work - keep this name

    if (self.native) {
        self.queue = _.queue("SamsungSmartTVBridge");
    }
};

SamsungSmartTVBridge.prototype = new iotdb.Bridge();

SamsungSmartTVBridge.prototype.name = function () {
    return "SamsungSmartTVBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
SamsungSmartTVBridge.prototype.discover = function () {
    var self = this;

    var cp = iotdb.module("iotdb-upnp").control_point();

    cp.on("device", function (native) {
        if (native.deviceType !== "urn:samsung.com:device:RemoteControlReceiver:1") {
            return;
        }

        self.discovered(new SamsungSmartTVBridge(self.initd, native));
    });

    cp.search();

};

/**
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
SamsungSmartTVBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

SamsungSmartTVBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

SamsungSmartTVBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
SamsungSmartTVBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
SamsungSmartTVBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    logger.info({
        method: "push",
        pushd: pushd
    }, "push");

    var qitem = {
        // if you set "id", new pushes will unqueue old pushes with the same id
        // id: self.number, 
        run: function () {
            self._pushd(pushd);
            self.queue.finished(qitem);
        },
        code: function() {
            done();
        },
    };
    self.queue.add(qitem);
};

/**
 *  Do the work of pushing. If you don't need queueing
 *  consider just moving this up into push
 */
SamsungSmartTVBridge.prototype._push = function (pushd) {
    if (pushd.on !== undefined) {
    }
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
SamsungSmartTVBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }
};

/* --- state --- */

/**
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
SamsungSmartTVBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing-id": _.id.thing_urn.unique("SamsungSmartTV", self.native.uuid, self.initd.number),
        "schema:name": self.native.name || "SamsungSmartTV",

        // "iot:thing-number": self.initd.number,
        // "iot:device-id": _.id.thing_urn.unique("SamsungSmartTV", self.native.uuid),
        // "schema:manufacturer": "",
        // "schema:model": "",
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
SamsungSmartTVBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 */
SamsungSmartTVBridge.prototype.configure = function (app) {};

/*
 *  API
 */
exports.Bridge = SamsungSmartTVBridge;

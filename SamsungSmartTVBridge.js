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
var SamsungRemote = require('samsung-remote');

var logger = iotdb.logger({
    name: 'homestar-samsung-smart-tv',
    module: 'SamsungSmartTVBridge',
});

var COMMAND_DELAY = 100;    // 100ms between commands


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

    cp.on("device", function (device) {
        if (device.deviceType !== "urn:samsung.com:device:RemoteControlReceiver:1") {
            return;
        }

        var metad = {
            uuid: device.uuid,
            name: device.friendlyName,
            manufacturer: device.manufacturer,
            model: device.modelDescription,
            mpn: device.modelName,
        };

        var native = new SamsungRemote({
            ip: device.host,
        });

        native.isAlive(function(error) {
            if (error) {
                logger.info({
                    method: "discover",
                    metad: metad,
                    cause: "may not support this protocol",
                }, "cannot connect to this SamsungTV");
                return;
            }

            native.metad = metad;

            self.discovered(new SamsungSmartTVBridge(self.initd, native));
        });

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

    var dcount = 0;
    var _doing = function() {
        dcount++;
    }
    var _done = function() {
        if ((--dcount <= 0) && done) {
            done();
            done = null;
        }
    };
    
    try {
        _doing();

        if (pushd.off !== undefined) {
            _doing();
            self._push_off(pushd.off, _done);
        }

        if (pushd.channel !== undefined) {
            _doing();
            self._push_channel(pushd.channel, _done);
        }

        if (pushd.band !== undefined) {
            _doing();
            self._push_band(pushd.band, _done);
        }

        _done();
    } catch (x) {
        dcount = -9999;
        done(new Error("unexpected excption: " + x));
    }
};

SamsungSmartTVBridge.prototype._send = function (command, done) {
    var self = this;
    var qitem = {
        run: function () {
            try {
                self.native.send(command, function(error) {
                    if (error) {
                        logger.error({
                            method: "_push_off",
                            error: _.error.message(error),
                        }, "could not send command to TV");

                        self.disconnect();
                    }

                    setTimeout(function() {
                        self.queue.finished(qitem);
                    }, COMMAND_TIMEOUT);
                });
            }
            catch (x) {
                self.queue.finished(qitem);
            }
        },
        coda: function() {
            done();
        },
    };

    self.queue.add(qitem);
};

SamsungSmartTVBridge.prototype._push_off = function (off, done) {
    this._send('KEY_POWEROFF', done);
};

SamsungSmartTVBridge.prototype._push_channel = function (channel, done) {
    done();
};

SamsungSmartTVBridge.prototype._push_band = function (band, done) {
    done();
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
        "iot:thing-id": _.id.thing_urn.unique("SamsungSmartTV", self.native.metad.uuid),
        "schema:name": self.native.metad.name || "SamsungSmartTV",
        "schema:model": self.native.metad.model,
        "schema:manufacturer": self.native.metad.manufacturer,
        "schema:mpn": self.native.metad.mpn,
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

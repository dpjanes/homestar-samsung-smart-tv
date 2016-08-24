# homestar-samsung-smart-tv
[IOTDB](https://github.com/dpjanes/node-iotdb) Bridge for [Samsung Smart TV](http://www.samsung.com/us/experience/smart-tv/)

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

This [Module](https://homestar.io/about/things) allows you to control your Samsung Smart TV devices from IOTDB and Home☆Star.

Note that "Samsung Smart TV" is basically just a name. It's not really that Smart, and not all Samsung Smart TVs will work with this because reasons.

After installation (see below) you can test compatibility by trying

	$ homestar samsung-send KEY_POWEROFF
	
which should turn off your TV. There's no corresponding way to turn on the TV unfortunately, as the Internet connection is not there when the TV is off.

* [Read about Bridges](https://github.com/dpjanes/node-iotdb/blob/master/docs/bridges.md)

# Installation

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

Then:

    $ npm install homestar-samsung-smart-tv

# Use

Change to HDMI1 and turn the volume up by 5 levels.

	const iotdb = require('iotdb')
    iotdb.use("iotdb-samsung-smart-tv")

	const things = iotdb.connect("SamsungSmartTV")
	things.set(":band", "iot-purpose:band.hdmi")
	things.set(":volume.delta", 5)
	
# Models
## SamsungSmartTV

See [SamsungSmartTv.iotql](https://github.com/dpjanes/homestar-samsung-smart-tv/blob/master/models/SamsungSmartTv.iotql)

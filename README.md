# homestar-samsung-smart-tv
IOTDB / Home☆Star Module for [Samsung Smart TV](http://www.samsung.com/us/experience/smart-tv/)
<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

This [Module](https://homestar.io/about/things) allows you to control your Samsung Smart TV devices from IOTDB and Home☆Star.

## Notes 

Note that "Samsung Smart TV" is basically just a name. It's not really that Smart, and not all Samsung Smart TVs will work with this because reasons.

After installation (see below) you can test compatibility by trying

	$ homestar samsung-send KEY_POWEROFF
	
which should turn off your TV. There's no corresponding way to turn on the TV unfortunately, as the Internet connection is not there when the TV is off.

# Installation

[Install Home☆Star first](https://homestar.io/about/install).

Then:

    $ homestar install homestar-samsung-smart-tv

## Home☆Star

Do:

	$ homestar runner browser=1
	
You may have to refresh the page, as it may take a little while for your Things to be discovered. If your TV is not on it won't show up.

## IOTDB

Change to HDMI1 and turn the volume up by 5 levels.

	$ node
	>>> iotdb = require('iotdb')
	>>> things = iotdb.connect("SamsungSmartTV")
	>>> things.set(":band", "iot-purpose:band.hdmi")
	>>> things.set(":volume.delta", 5)
	
## [IoTQL](https://github.com/dpjanes/iotdb-iotql)

Change to HDMI1 

	$ homestar install iotql
	$ homestar iotql
	> SET state:band = iot-purpose:band.hdmi WHERE meta:model-id = "samsung-smart-tv";
	

# Models
## SamsungSmartTV

See [SamsungSmartTv.iotql](https://github.com/dpjanes/homestar-samsung-smart-tv/blob/master/models/SamsungSmartTv.iotql)
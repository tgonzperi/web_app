const express = require("express");
const path = require('path');

var FiixCmmsClient = require("fiix-cmms-client")

var fiixCmmsClient = new FiixCmmsClient();
fiixCmmsClient.setBaseUri( 'https://360ing.macmms.com/api/' );
fiixCmmsClient.setAppKey('macmmsackp38466f5c22b90408e47ff752b58b9cb8d90bfba1287729c33a520b3');
fiixCmmsClient.setAuthToken('macmmsaakp384fe7626d1240d5b7b5be3a65b35f7fbd958979f0c3b97926bdc63');
fiixCmmsClient.setPKey('macmmsaskp3844a570124c053077c8324aa43376b15a569b75ed37be13ebd999fac3b383ea36e');

const mqtt = require('mqtt');

const host = 'ec2-3-144-199-195.us-east-2.compute.amazonaws.com'
const port = '1883'

const connectUrl = `mqtt://${host}:${port}`
const client = mqtt.connect(connectUrl, {
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
})

// const topic = 'iot-2/type/+/id/+/evt/+/fmt/json';
const topic = 'test';
client.on('connect', () => {
  console.log('Connected')
  client.subscribe([topic], () => {
    console.log(`Subscribe to topic '${topic}'`)
  })
})
client.on('error', (error) => {
  console.log(error);
})

client.on('message', function (topic, message, packet) {
  // message is Buffer
  console.log(message)
  var obj = {
    "intMeterReadingUnitsID": 11702,
    "dblMeterReading": parseFloat(message.toString()),
    "intAssetID": 172839,
    "dtmDateSubmitted": 1638152560000
  };

  fiixCmmsClient.add({
    "className": "MeterReading",
    "fields": "id, intMeterReadingUnitsID, dblMeterReading, intAssetID",
    "object": obj,
    "callback": function(ret) {
      if (!ret.error) {
        console.log(ret.object);
      } else console.log(ret.error);
    }
  });
})

const PORT = process.env.PORT || 3000;

const app = express();

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Handle GET requests to /api route
app.get("/form", (req, res) => {
  console.log(req.query)
  // console.log(res)
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
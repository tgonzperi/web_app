const mqtt = require('mqtt');


function start_mqtt(){
    const host = 'ec2-3-144-199-195.us-east-2.compute.amazonaws.com'
    const port = '1883'
    
    const connectUrl = `mqtt://${host}:${port}`
    const client = mqtt.connect(connectUrl, {
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    })
    
    const topic_other = 'other/#';
    const topic_linortek = 'lt1000/#'
    client.on('connect', () => {
      console.log('Connected')
      client.subscribe([topic_other], () => {
        console.log(`Subscribe to topic '${topic_other}'`)
      })
      client.subscribe([topic_linortek], () => {
        console.log(`Subscribe to topic '${topic_linortek}'`)
      })
    })
    
    client.on('error', (error) => {
      console.log(error);
    })
    
    function decode_topic(topic){
      var index_bar = topic.indexOf("/");
      return topic.slice(0,index_bar);
      
    }
    client.on('message', function (topic, message, packet) {
    
      var mqtt_sender = decode_topic(topic)
    
      var JSONmessage = JSON.parse(message)
    
      switch (mqtt_sender) {
        case "lt1000":
          console.log(JSONmessage.device_id)
          console.log(JSONmessage.hour_meter[0].value)
          console.log(JSONmessage.hour_meter[1].value) 
          break;
        
        case "other":
          for (let index = 0; index < JSONmessage.devices.length; index++) {
            console.log("Device", index + 1, " : ")
            console.log("Asset ID : ", JSONmessage.devices[index].asset_id)
            for (let index2 = 0; index2 < JSONmessage.devices[index].data.length; index2++) {
              console.log("Unit ID : ", JSONmessage.devices[index].data[index2].unit_id)
              console.log("Data :", JSONmessage.devices[index].data[index2].value)        
            }
          }
        default:
          break;
      }
    })
}

module.exports = start_mqtt;

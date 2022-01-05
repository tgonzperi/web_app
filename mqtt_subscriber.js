const mqtt = require('mqtt');
var mysql      = require('mysql');
var events = require('events');

const fiixclient = require('./fiix.js');

const host = 'ec2-3-144-199-195.us-east-2.compute.amazonaws.com'
const port = '1883'

const connectUrl = `mqtt://${host}:${port}`

class mqtt_subscriber{
  constructor(){
    this.eventEmitter = new events.EventEmitter();
    this.fiix = new fiixclient().getInstance();
    this.sqlpool = mysql.createPool({
      connectionLimit: 10,
      host     : 'localhost',
      user     : '360ingMySQL',
      password : 'Sbq4504P',
      database : '360ing_db'
    });

    this.client = mqtt.connect(connectUrl, {
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    })

    const topic_other = 'nettra/#';
    const topic_linortek = 'lt1000/#'
    this.client.on('connect', () => {
      console.log('Connected')
      this.client.subscribe([topic_other], () => {
        console.log(`Subscribe to topic '${topic_other}'`)
      })
      this.client.subscribe([topic_linortek], () => {
        console.log(`Subscribe to topic '${topic_linortek}'`)
      })
    })
    
    this.client.on('error', (error) => {
      console.log(error);
    })

    function decode_topic(topic){
      var index_bar = topic.indexOf("/");
      return topic.slice(0,index_bar);
    }

    const findDeviceId = (DeviceType, message) => {

      const sqlquery = (message, error, results) => {
        
        if (error) this.eventEmitter.emit('error', {ErrorCode: 1});
        if (results.length === 0){
          console.log('Device Id not found')
          var e = {
            ErrorCode: 2,
            device_id: message.device_id,
            DeviceType: DeviceType
          }
          this.eventEmitter.emit('error', e); 
        }else{
          let data = {id: results[0].id,
                    device_id: message.device_id,
                    DeviceType: DeviceType,
                    req: [],
                    idlist: []
          }
          message.hour_meter.forEach((element, index) => {
            let asset_id = results[0]['id'+index]
            if(asset_id !== null){
                data.idlist.push(asset_id)
                data.req.push(this.fiix.prepareaddMeterReading(element.value, asset_id));
            }else{
              console.log('Index ', index, ' is not in database');
              var e = {
                ErrorCode: 3,
                index: index,
                id: results[0].id,
                device_id: message.device_id,
                DeviceType: DeviceType
              };
              this.eventEmitter.emit('error', e);
            }
          });
          
          try{
            this.fiix.batch(data);              
          }catch{
              var e = {
                ErrorCode: 4
              }
              this.eventEmitter.emit('error', e);
              return;
          }

        }
      }
      var sql = 'SELECT * FROM ' + DeviceType + ' WHERE '+ (DeviceType==='linortek' ? 'MacAddress=' : 'NettraId=') + '\'' + message.device_id + '\'';
      this.sqlpool.query(sql, function (error, results, fields) {

        sqlquery(message, error, results);

      });      
    }

    this.client.on('message', function (topic, message, packet) {
    
      var mqtt_sender = decode_topic(topic)
    
      var JSONmessage = JSON.parse(message)
      
      console.log(this.fiix)
      var DeviceType = mqtt_sender === "lt1000" ? "linortek" : "nettra";


      switch (mqtt_sender) {
        case "lt1000":

          findDeviceId(DeviceType, JSONmessage)

          console.log(JSONmessage.device_id)
          console.log(JSONmessage.hour_meter[0].value)
          console.log(JSONmessage.hour_meter[1].value) 
          break;
        
        case "nettra":
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

  on(event, callback)
  {
    this.eventEmitter.on(event, callback);
  }

  }


module.exports = mqtt_subscriber;

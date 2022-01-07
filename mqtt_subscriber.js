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

    function get_Id(topic){
      var index_bar = topic.indexOf("/");
      return topic.slice(index_bar+1);      
    }

      const sqlquery = (DeviceType, device_id, values, error, results) => {
        
        if (error) this.eventEmitter.emit('error', {ErrorCode: 1});
        if (results.length === 0){
          console.log('Device Id not found')
          var e = {
            ErrorCode: 2,
            device_id: device_id,
            DeviceType: DeviceType
          }
          this.eventEmitter.emit('error', e); 
        }else{
          let data = {id: results[0].id,
                    device_id: device_id,
                    DeviceType: DeviceType,
                    req: [],
                    idlist: []
          }
          let max_index;
          values.forEach((element, index) => {
            let asset_id = results[0]['id'+index]
            if(asset_id !== null){
                data.idlist.push(asset_id)
                data.req.push(this.fiix.prepareaddMeterReading(element, asset_id));
            }else{
              console.log('id',index,' is not in database');
              var e = {
                ErrorCode: 3,
                index: index,
                id: results[0].id,
                device_id: device_id,
                DeviceType: DeviceType
              };
              this.eventEmitter.emit('error', e);
            }
            max_index = index;
          });
          var ids = []
          Object.entries(results[0]).forEach((element, index) => {
            if(index > 1 && element[1] !== null)
              ids.push(element[1])
          });
          console.log("IDs length:", ids.length)
          console.log(max_index)
          if(max_index < ids.length){
            for(let i = max_index + 1; i<ids.length; i++){
              var e = {
                ErrorCode: 6,
                index: i,
                id: results[0].id,
                asset_id: ids[i],
                device_id: device_id,
                DeviceType: DeviceType
              };
              this.eventEmitter.emit('error', e);              
            }
          }

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

    const query = (DeviceType, message, device_id) => {

      var sql = 'SELECT * FROM ' + DeviceType + ' WHERE '+ (DeviceType==='linortek' ? 'MacAddress=' : 'NettraId=') + '\'' + device_id + '\'';
      let values = []

      switch (DeviceType) {
        case 'linortek':
          Object.entries(message.hour_meter).forEach((element, index) => {
            values.push(element[1].value)
          })
          this.sqlpool.query(sql, function (error, results, fields) {
    
            sqlquery(DeviceType, device_id, values, error, results);
    
          });   
          break;
      
        case 'nettra':
          Object.entries(message.values).forEach((element, index) => {
            values.push(element[1])
          })
          this.sqlpool.query(sql, function (error, results, fields) {
    
            sqlquery(DeviceType, device_id, values, error, results);
    
          }); 
          break;
        default:
          break;
      }
    }
    this.client.on('message', function (topic, message, packet) {
    
      var mqtt_sender = decode_topic(topic)
    
      var JSONmessage = JSON.parse(message)
      var device_id = get_Id(topic);

      console.log(this.fiix)
      var DeviceType = mqtt_sender === "lt1000" ? "linortek" : "nettra";

      query(DeviceType, JSONmessage, device_id)
    })
  }

  on(event, callback)
  {
    this.eventEmitter.on(event, callback);
  }

  }


module.exports = mqtt_subscriber;

var events = require('events');

var FiixCmmsClient = require("fiix-cmms-client");

const sendMail = require('./mailer.js')

class FiixClient{
  constructor(company) {
    this.fiixCmmsClient = new FiixCmmsClient();
    this.eventEmitter = new events.EventEmitter();
    this.connected = false;
    this.credSet = false;
    this.company = company;
    this.errors = 
    {
      linortek: [],
      nettra: []
    }
  }

  setCoords(BaseUri, AppKey, AuthToken, PKey)
  {
    this.BaseUri = BaseUri;
    this.AuthToken = AuthToken;
    this.AppKey = AppKey;
    this.PKey = PKey;
  }
  
  connectFiix(callback)
  {
    const f = (error) => {
      if (!error) {    
        if(this.connected !== true){
          this.connected = true;

        }
        console.log('No error in transaction');
      } else {
        if(this.connected !== false){
          this.connected = false;
        }
        console.log('Transaction failed');
      }
      callback(this.connected)
    }
    var rpc = {
      "name" : "Ping",
      "callback": function(ret) {
        f(ret.error);
      }
    }
    this.fiixCmmsClient.setBaseUri( this.BaseUri );
    this.fiixCmmsClient.setAppKey(this.AppKey);
    this.fiixCmmsClient.setAuthToken(this.AuthToken);
    this.fiixCmmsClient.setPKey(this.PKey);
    this.credSet = true;

    this.fiixCmmsClient.rpc(rpc);
  
  }
  
  checkId(asset_idList, id, DeviceType, device_id){

    const f = (ret, id, idlist, DeviceType, device_id) => {

      if (!ret.error) {    
        if(this.connected !== true){
          this.eventEmitter.emit('connection');
          this.connected = true;
        }
        let i = 0;
        for(let el of ret.responses){
          if(!el.object) { 
            var e = {
              ErrorCode: 5,
              index: i,
              id: id,
              DeviceType: DeviceType,
              device_id: device_id,
              asset_id: idlist[i]
            }
            this.eventEmitter.emit('error', e) 
          }//SendWrongIDMessage()
          i++;
        }
        console.log('No error in transaction');
      } else {
        if(this.connected !== false){
          this.eventEmitter.emit('disconnection');
          this.connected = false;
        }
        console.log('Not connected to Fiix');
      }
    }
    if(this.credSet){
      let req = []
      asset_idList.forEach((el) => {
        req.push(this.fiixCmmsClient.prepareFindById({
          "className": "Asset",
          id: el
        }))
      })

      this.fiixCmmsClient.batch({
        "requests": req,
        "callback": function(ret){
          f(ret, id, asset_idList, DeviceType, device_id);
        }
      });
    }else{
      console.log('Credentials not set')
    }
    
  }
  prepareaddMeterReading(value, asset_id)
  {
    var obj = {
      "intMeterReadingUnitsID": 11702, // Hours id
      "dblMeterReading": value,
      "intAssetID": asset_id,
      "dtmDateSubmitted": Date.now()
    }

    return this.fiixCmmsClient.prepareAdd({
      "className": "MeterReading",
      "fields": "id, intMeterReadingUnitsID, dblMeterReading, intAssetID",
      "object": obj
    });   
  }

  batch(data){
    const f = (ret, id, idlist, DeviceType, device_id) => {

      if (!ret.error) {    
        if(this.connected !== true){
          this.eventEmitter.emit('connection');
          this.connected = true;
        }
        let i = 0;
        for(let el of ret.responses){
          if(el.error) { 
            var e = {
              ErrorCode: 5,
              index: i,
              id: id,
              DeviceType: DeviceType,
              device_id: device_id,
              asset_id: idlist[i]
            }
            this.eventEmitter.emit('error', e) 
          }//SendWrongIDMessage()
          i++;
        }
        console.log('Data uploaded');
      } else {
        if(ret.error.code === 3200){
          sendMail(JSON.stringify(ret.error));
          console.log("Could not apply changes due to excessive api calls")
        }
        if(this.connected !== false){
          this.eventEmitter.emit('disconnection');
          this.connected = false;
        }
        console.log('Not connected to Fiix (Data could not be uploaded');
      }
    }
    // if(this.connected && this.credSet){
      this.fiixCmmsClient.batch({
        "requests": data.req,
        "callback": function(ret){
          f(ret, data.id, data.idlist, data.DeviceType, data.device_id);
        }
      });
    // }



  }
  on(event, callback)
  {
    this.eventEmitter.on(event, callback);
  }
}

// class Singleton{
//   constructor(company) {
//     if (!Singleton.instance) {
//         Singleton.instance = new FiixClient(company);
//     }
//   }

//   getInstance() {
//     return Singleton.instance;
//   }
// }


// module.exports = Singleton;

module.exports = FiixClient;
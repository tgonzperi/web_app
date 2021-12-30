var FiixCmmsClient = require("fiix-cmms-client");
var fiixCmmsClient = new FiixCmmsClient();

function connectFiix(BaseUri, AppKey, AuthToken, PKey, cb)
{
  fiixCmmsClient.setBaseUri( BaseUri );
  fiixCmmsClient.setAppKey(AppKey);
  fiixCmmsClient.setAuthToken(AuthToken);
  fiixCmmsClient.setPKey(PKey);

  fiixCmmsClient.rpc({
    "name" : "Ping",
    "callback": function(ret){
        if(!ret.error){
            return cb("Connection Established");
          }else{
            return cb("No Connection");
          }
    }
  });
}

// var fiix_connected = false;
// if(BaseUri == "" || AppKey == ""){
//   fiix_connected = false;
// }else{
//   connectFiix(BaseUri, AppKey, AuthToken, PKey);
// }

module.exports = connectFiix;


  // message is Buffer
  // console.log(message)
  // var obj = {
  //   "intMeterReadingUnitsID": 11702,
  //   "dblMeterReading": 64,
  //   "intAssetID": 172839,
  //   "dtmDateSubmitted": 1638152560000
  // };

  // fiixCmmsClient.add({
  //   "className": "MeterReading",
  //   "fields": "id, intMeterReadingUnitsID, dblMeterReading, intAssetID",
  //   "object": obj,
  //   "callback": function(ret) {
  //     if (!ret.error) {
  //       console.log(ret.object);
  //     } else console.log(ret.error);
  //   }
  // });
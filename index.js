const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')

const fiixclient = require("./fiix.js");

var mysql      = require('mysql');

var status = "No Connection";

var errorList = {
  linortek: [],
  nettra: []
      }
var fiix = new fiixclient().getInstance();

fiix.on('connection', () => {
  status = 'Connection Established';
});

fiix.on('disconnection', () => {
  status = 'No Connection';
});


fiix.on('error', (e) => {
  switch (e.ErrorCode) {
    case 5:
      let error = {}
      if(errorList[e.DeviceType].filter((elem) => elem.asset_id === e.asset_id).length === 0){
        error = e
        error.message = 'id = '+ e.asset_id + ' (MacAddress = ' + e.device_id + ') doesn\'t exist in fiix'
        errorList[e.DeviceType].push(error)
        console.log('id = ',e.asset_id, ' (MacAddress = ', e.device_id,') doesn\'t exist in fiix')
      }
      break;
  
    default:
      break;
  }
})

var mqtt_subscriber = require('./mqtt_subscriber.js');

var mqttSubscriber = new mqtt_subscriber(); 

mqttSubscriber.on('error', (e) => {
  let error = {}
  switch (e.ErrorCode) {
    case 1:
      console.log('SQL Error')
      break;
    case 2:
      error = e
      error.message = (e.DeviceType === 'linortek' ? 'MacAddress ' : 'Nettra Id ') + e.device_id + ' not found in table'
      errorList[e.DeviceType].push(error)
      console.log('Device id ', e.device_id, ' not found in Table')
    break;
    case 3:
      error = e;
      error.message = 'Id' + e.index + ' is missing for ' + (e.DeviceType === 'linortek' ? 'MacAddress = ' : 'Nettra Id = ') + e.device_id
      errorList[e.DeviceType].push(error)
      console.log('Id', e.index, ' not found in Table')
      break;
    case 4:
      console.log("Credentials not set");
      break;

    case 6:
      error = e;
      error.message = 'id = ' + e.asset_id  + (e.DeviceType === 'linortek' ?  '(MacAddress = ' : ' (Nettra Id = ') + e.device_id + ") was not received in MQTT message"
      errorList[e.DeviceType].push(error)
      console.log('id = ' + e.asset_id  + (e.DeviceType === 'linortek' ? ' (MacAddress = ' : ' (Nettra Id = ') + e.device_id + ") was not received in MQTT message")
      break;
    default:
      break;
  }
})




function set_mysql_command(id, arr, DeviceType)
{
  var sql = "INSERT INTO " + DeviceType + " (id, ";
  var values = "VALUES (" + id + ", ";
  for(let ind = 0; ind < arr.length; ind++)
  {
    sql += arr[ind][0];
    if(arr[ind][0] === 'MacAddress' || arr[ind][0] === 'NettraId'){
      values += "'" + arr[ind][1] + "'";
    }else{
      values += arr[ind][1];
    }

    if(ind !== arr.length - 1){
      sql += ", ";
      values += ", ";
    }else{
      sql += ") ";
      values += ") ";
    }

  }
  sql = sql + values;
  return sql;
}

function checkDeviceId(DeviceType, device_id){
  errorList[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 2 && el.device_id === device_id){
      console.log('Missing Device Id added');
      errorList[DeviceType].splice(ind, 1);
    }
  })
}

function checkMissingId(id, DeviceType, max_index=0){
  errorList[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 3 && el.id === id){
      if(max_index){
        if(max_index >= el.index){
          console.log('Missing asset id added');
          errorList[DeviceType].splice(ind, 1);
        }
      }else{
        console.log('Line of missing id deleted');
        errorList[DeviceType].splice(ind, 1);
      }
    }
  })
}

function checkWrongId(id, DeviceType, asset_idList=[]){
  errorList[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 5 && el.id === id){
      if(asset_idList.length === 0){
        console.log('Wrong id line deleted');
        errorList[DeviceType].splice(ind, 1);
      }else{
        let isPresent = false;
        asset_idList.forEach((elem) => {
          console.log(elem)
          console.log(el.asset_id)
          isPresent |= (elem === el.asset_id)
        })
        if(!isPresent){
          console.log('Wrong id deleted')
          errorList[DeviceType].splice(ind, 1);
        }
      }

    }
  })
}


const PORT = process.env.PORT || 80;

const app = express();


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.all('*', function (req, res, next) {
  if(req.url !== '/api/errors/linortek' && req.url !== '/api/errors/nettra' && req.url !== '/api/fiix/status')
    console.log('Request \x1b[33m['+ req.method +']\x1b[0m', req.url)
  next() // pass control to the next handler
})

// Handle GET requests to /api route
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
  res.end();
});

app.get("/api/fiix/status", (req, res) => {
  res.json({status: status});
  res.end();
});

// Handle GET requests to /api route
app.post("/api/fiix/form", (req, res) => {
  var data = req.body;
  fiix.setCoords(data.BaseURI, data.APPKey, data.AuthToken, data.PKey);
  fiix.connectFiix();
  res.end();
});

app.post("/api/add_mqtt/:DeviceType", (req, res) => {
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  var key_val = Object.entries(data.data);
  let asset_list = []
  let asset_list_name = []
  key_val.forEach((el, ind) => {
    if(ind !== 0 && !isNaN(parseInt(el[1]))){
      asset_list_name.push(el[0])
      asset_list.push(parseInt(el[1]));
    }
  })

  fiix.checkId(asset_list, parseInt(data.id), DeviceType, key_val[0][1])
  // var sql = set_mysql_command(data.id, key_val, DeviceType);
  var sql = 'INSERT INTO ' + DeviceType + ' (id, ' + key_val[0][0];
  let sqlfin = ''
  asset_list_name.forEach((elem, index)=>{
    sql+= ', ' + elem;
    sqlfin += ', ?'
  })
  sqlfin += ')'
  sql+= ') VALUES (?, ?' + sqlfin;

  checkDeviceId(DeviceType,key_val[0][1])
  try{
  let values = [ data.id, key_val[0][1]]
  mqttSubscriber.sqlpool.query(sql, values.concat(asset_list), function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });
  }catch(error){
  console.log("Error : ", error.code)
  console.log("Error No: ", error.errno)
  }
  res.end();
});

app.post("/api/edit_mqtt/:DeviceType", (req, res) => {
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  var key_val = Object.entries(data.data);
  let asset_list = []
  key_val.forEach((el, ind) => {
    if(ind !== 0 && !isNaN(parseInt(el[1]))){
      asset_list.push(parseInt(el[1]));
    }
  })

  fiix.checkId(asset_list, parseInt(data.id), DeviceType, key_val[0][1])
  checkWrongId(parseInt(data.id), DeviceType,asset_list);
  checkMissingId(parseInt(data.id), DeviceType, asset_list.length - 1);
  checkDeviceId(DeviceType, key_val[0][1])
  var sql = 'UPDATE ' + DeviceType + ' SET ' + key_val[0][0] + '=?, id0=?, id1=?, id2=?, id3=? WHERE id=' + data.id;
  mqttSubscriber.sqlpool.query(sql,[key_val[0][1], data.data.id0, data.data.id1, data.data.id2, data.data.id3 ], function (err, result) {
    if (err) throw err;
    console.log("1 record updated");
  });
  res.end();
});

app.post("/api/rm_mqtt/:DeviceType", (req, res) => {
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  checkMissingId(parseInt(data.id), DeviceType, data.device_id);
  checkWrongId(parseInt(data.id), DeviceType);
  var sql = "DELETE FROM " + DeviceType +" WHERE id=" +data.id;

  mqttSubscriber.sqlpool.query(sql, function (error, results, fields) {
    if (error) throw Error;
    console.log("Records with id = ", data.id, "deleted");
  });

  res.end();
});

app.post("/api/rm_all_mqtt/:DeviceType", (req, res) => {
  var DeviceType = req.params.DeviceType;

  var sql = "DELETE FROM " + DeviceType;

  errorList[DeviceType] = errorList[DeviceType].filter((el) => el.ErrorCode === 2)


  mqttSubscriber.sqlpool.query(sql, function (error, results, fields) {
    if (error) throw Error;
    console.log("All records deleted");
  });

  res.end();
});


app.get("/api/errors/:DeviceType", (req, res) => {
  var DeviceType = req.params.DeviceType;
  res.json(errorList[DeviceType]);
  res.end();
})
app.post("/api/mqtt/:DeviceType", (req,res) => {

  var DeviceType = req.params.DeviceType;

  mqttSubscriber.sqlpool.query('SELECT * FROM ' + DeviceType, function (error, results, fields) {
    if (error) throw Error;
    res.json(results);
    res.end();
  });
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
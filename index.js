const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')

const sendMail = require('./mailer.js')

const fiixclient = require("./fiix.js");

var mysql      = require('mysql');






var mqtt_subscriber = require('./mqtt_subscriber.js');

var mqttSubscriber = new mqtt_subscriber();  

mqttSubscriber.fiix.forEach((element) => {

  element.on('error', (e) => {
    switch (e.ErrorCode) {
      case 5:
        let error = {}
        if(element.errors[e.DeviceType].filter((elem) => elem.asset_id === e.asset_id).length === 0){
          error = e
          error.message = 'id = '+ e.asset_id + ' (MacAddress = ' + e.device_id + ') doesn\'t exist in fiix'
          element.errors[e.DeviceType].push(error)
          console.log('id = ',e.asset_id, ' (MacAddress = ', e.device_id,') doesn\'t exist in fiix')
        }
        break;
    
      default:
        break;
    }
  })
})
mqttSubscriber.on('error', (e) => {
  let error = {}
  switch (e.ErrorCode) {
    case 1:
      console.log('SQL Error')
      break;
    // case 2:
    //   if(errorList[e.DeviceType].filter((elem) => elem.device_id === e.device_id).length === 0){
    //     error = e
    //     error.message = (e.DeviceType === 'linortek' ? 'MacAddress ' : 'Nettra Id ') + e.device_id + ' not found in table'
    //     errorList[e.DeviceType].push(error)
    //     console.log('Device id ', e.device_id, ' not found in Table')
    //   }
    // break;
    case 3:
      var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company)  
      if(fiixObject.errors[e.DeviceType].filter((elem) => elem.id === e.id).length === 0){
        error = e;
        error.message = 'Id' + e.index + ' is missing for ' + (e.DeviceType === 'linortek' ? 'MacAddress = ' : 'Nettra Id = ') + e.device_id
        fiixObject.errors[e.DeviceType].push(error)
        console.log('Id', e.index, ' not found in Table')
      }
      break;
    case 4:
      console.log("Credentials not set");
      break;

    case 6:
      var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company)   
      if(fiixObject.errors[e.DeviceType].filter((elem) => elem.asset_id === e.asset_id && elem.device_id === e.device_id).length === 0){
        error = e;
        error.message = 'id = ' + e.asset_id  + (e.DeviceType === 'linortek' ?  '(MacAddress = ' : ' (Nettra Id = ') + e.device_id + ") was not received in MQTT message"
        fiixObject.errors[e.DeviceType].push(error)
        console.log('id = ' + e.asset_id  + (e.DeviceType === 'linortek' ? ' (MacAddress = ' : ' (Nettra Id = ') + e.device_id + ") was not received in MQTT message")
      }
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

function checkDeviceId(DeviceType, device_id, company){
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company)  
  fiixObject.errors[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 2 && el.device_id === device_id){
      console.log('Missing Device Id added');
      fiixObject.errors[DeviceType].splice(ind, 1);
    }
  })
}

function checkMissingId(id, DeviceType, company, max_index=0){
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company) 
  fiixObject.errors[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 3 && el.id === id){
      if(max_index){
        if(max_index >= el.index){
          console.log('Missing asset id added');
          fiixObject.errors[DeviceType].splice(ind, 1);
        }
      }else{
        console.log('Line of missing id deleted');
        fiixObject.errors[DeviceType].splice(ind, 1);
      }
    }
  })
}

function checkWrongId(id, DeviceType, company, asset_idList=[]){
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company) 
  fiixObject.errors[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 5 && el.id === id){
      if(asset_idList.length === 0){
        console.log('Wrong id line deleted');
        fiixObject.errors[DeviceType].splice(ind, 1);
      }else{
        let isPresent = false;
        asset_idList.forEach((elem) => {
          isPresent |= (elem === el.asset_id)
        })
        if(!isPresent){
          console.log('Wrong id deleted')
          fiixObject.errors[DeviceType].splice(ind, 1);
        }
      }

    }
  })
}

function checkExtraId(id, DeviceType, company, asset_idList=[]){
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === e.company) 
  fiixObject.errors[DeviceType].forEach((el, ind) => {
    if(el.ErrorCode === 6 && el.id === id){
      if(asset_idList.length === 0){
        console.log('Extra Id line deleted');
        fiixObject.errors[DeviceType].splice(ind, 1);
      }else{
        if(asset_idList.length <= el.index){
          console.log('Extra Id deleted');
          fiixObject.errors[DeviceType].splice(ind, 1);
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

app.post("/api/fiix/status", (req, res) => {
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === req.body.company)  
  let data2send = 
  {
    status: fiixObject.connected ? "Connection Established" : "No Connection",
    BaseURI: fiixObject.BaseUri,
    APPKey: fiixObject.AppKey,
    AuthToken: fiixObject.AuthToken,
    PKey: fiixObject.PKey
  }
  res.json(data2send);
  res.end();
});

// Handle GET requests to /api route
app.post("/api/fiix/form", (req, res) => {
  const callback = (connected) => {
    let data2send = 
    {
      status: connected ? "Connection Established" : "No Connection"
    }
    res.json(data2send)
    res.end();
  }

  var data = req.body;
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === data.company)  
  fiixObject.setCoords(data.BaseURI, data.APPKey, data.AuthToken, data.PKey);
  fiixObject.connectFiix(callback);
 
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
  
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === data.company)  
  fiixObject.checkId(asset_list, parseInt(data.id), DeviceType, key_val[0][1])
  // var sql = set_mysql_command(data.id, key_val, DeviceType);
  var sql = 'INSERT INTO idTable' + ' (id, company, DeviceType, device_id';
  let sqlfin = ''
  asset_list_name.forEach((elem, index)=>{
    sql+= ', ' + elem;
    sqlfin += ', ?'
  })
  sqlfin += ')'
  sql+= ') VALUES (?, ?, ?, ?' + sqlfin;

  checkDeviceId(DeviceType,key_val[0][1], data.company)
  
  let values = [ data.id, data.company, DeviceType, key_val[0][1]]
  mqttSubscriber.sqlpool.query(sql, values.concat(asset_list), function (err, result) {
    try{
      if (err) throw err;
      console.log("1 record inserted into idTables");
    }catch(e){
      sendMail(JSON.stringify(e));
    }
  });

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

  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === data.company)  
  fiixObject.checkId(asset_list, parseInt(data.id), DeviceType, key_val[0][1])
  checkWrongId(parseInt(data.id), DeviceType, data.company, asset_list);
  checkMissingId(parseInt(data.id), DeviceType, data.company, asset_list.length - 1);
  checkDeviceId(DeviceType, key_val[0][1], data.company)
  checkExtraId(parseInt(data.id), DeviceType, data.company, asset_list)
  var sql = 'UPDATE idTable SET device_id=?, id0=?, id1=?, id2=?, id3=? WHERE id=' + data.id + ' AND DeviceType=' + DeviceType + ' AND company=' + data.company;
  
    mqttSubscriber.sqlpool.query(sql,[key_val[0][1], data.data.id0 !== '' ? data.data.id0 : null, data.data.id1 !== '' ? data.data.id1 : null, data.data.id2 !== '' ? data.data.id2 : null, data.data.id3 !== '' ? data.data.id3 : null ], function (err, result) {
      try{
        if (err) throw err;
        console.log("1 record updated in idTable");
      }catch(e){
        sendMail(JSON.stringify(e));
      }
    });


  res.end();
});

app.post("/api/rm_mqtt/:DeviceType", (req, res) => {
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  checkMissingId(parseInt(data.id), DeviceType, data.company);
  checkWrongId(parseInt(data.id), DeviceType, data.company);
  checkExtraId(parseInt(data.id), DeviceType, data.company)
  var sql = "DELETE FROM idTable WHERE id=" + data.id + ' AND DeviceType=' + DeviceType + ' AND company=' + data.company;

  mqttSubscriber.sqlpool.query(sql, function (error, results, fields) {
    try{
      if (error) throw error;
      console.log("Records with id = ", data.id, "deleted");
    }catch(e){
      sendMail(JSON.stringify(e));
    }
  });

  res.end();
});

app.post("/api/rm_all_mqtt/:DeviceType", (req, res) => {
  var DeviceType = req.params.DeviceType;

  var sql = "DELETE FROM idTable WHERE DeviceType=" + DeviceType + ' AND company=' + req.body.company;

  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === data.company)  
  fiixObject.errors[DeviceType] = fiixObject.errors[DeviceType].filter((el) => el.ErrorCode === 2)


  mqttSubscriber.sqlpool.query(sql, function (error, results, fields) {
    try{
      if (error) throw error;
      console.log("All records deleted for company " + req.body.company);
    }catch(e){
      sendMail(JSON.stringify(e));
    }
  });

  res.end();
});


app.post("/api/errors/:DeviceType", (req, res) => {
  var DeviceType = req.params.DeviceType;
  console.log(req.body.company)
  var fiixObject = mqttSubscriber.fiix.find((elem) => elem.company === req.body.company) 
  res.json(fiixObject.errors[DeviceType]);
  res.end();
})
app.post("/api/mqtt/:DeviceType", (req,res) => {

  var DeviceType = req.params.DeviceType;
  var sql = 'SELECT * FROM idTable WHERE DeviceType=' + '\'' + DeviceType + '\'' + ' AND company=' + '\'' + req.body.company + '\'';
  mqttSubscriber.sqlpool.query(sql, function (error, results, fields) {
    try{
      if (error) throw error;
      res.json(results);
      res.end();
    }catch(e){
      sendMail(JSON.stringify(e));
      res.end();
      }
  });
})

app.post('/api/login', (req, res) => {
  var logindata = req.body;
  var response = {}
  mqttSubscriber.sqlpool.query('SELECT * FROM company_table WHERE Username=? AND Password=?', [logindata.username, logindata.password], (error, results)=> {
    if(results.length !== 0){
      response = {
        result: 1,
        company: results[0].Company
      }
    }else{
      response = {
        result: 0
      };
    }
    res.json(response)
    res.end();
  })
  
})

app.post('/api/register/add', (req, res) => {
  var data = req.body;

  var sql = 'INSERT INTO company_table (Company, Username, Password) VALUES (?, ?, ?)'

  mqttSubscriber.sqlpool.query(sql, [data.Company, data.Username, data.Password], function(errors, result) {
    if (errors) throw errors;
    console.log("1 record inserted into company_table");
    res.end();
  })
});

app.post('/api/register/rm', (req, res) => {
  var data = req.body;

  var sql = 'DELETE FROM company_table WHERE Company=?'

  mqttSubscriber.sqlpool.query(sql, [data.company], function(errors, result) {
    if (errors) throw errors;
    console.log("1 record deleted from company_table");
  })
  res.end();
});

app.post('/api/register/rm_all', (req, res) => {
  var data = req.body;

  var sql = 'DELETE FROM company_table'

  mqttSubscriber.sqlpool.query(sql, function(errors, result) {
    if (errors) throw errors;
    console.log("All records deleted from company_table");
  })
  res.end();
});

app.post('/api/:source/fetch', (req, res) => {
  var sql = 'SELECT * FROM company_table WHERE Company=?'
  mqttSubscriber.sqlpool.query(sql,[req.body.company], (errors, results) => {
    if (errors) throw errors;
    res.json(results)
    console.log(results)
    res.end();
  })
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'), function(err) {
    if (err) {
        res.status(err.status).end();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
const express = require("express");
const path = require('path');
const bodyParser = require('body-parser')

const connectFiix = require("./fiix.js");
const start_mqtt = require('./mqtt_subscriber.js');

start_mqtt();

var mysql      = require('mysql');

var status = "No Connection";

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
  console.log(sql);
  return sql;
}

const PORT = process.env.PORT || 3001;

const app = express();


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './client/build')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());





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
  connectFiix(data.BaseURI, data.APPKey, data.AuthToken, data.PKey, (ret) => {
    status = ret;
    res.end();
  });
});

app.post("/api/add_mqtt/:DeviceType", (req, res) => {
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  var key_val = Object.entries(data.data);
  var sql = set_mysql_command(data.id, key_val, DeviceType);

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '360ingMySQL',
    password : 'Sbq4504P',
    database : '360ing_db'
  });

  connection.connect();
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

  res.end();
});

app.post("/api/rm_mqtt/:DeviceType", (req, res) => {
  console.log('RM');
  var data = req.body;
  var DeviceType = req.params.DeviceType;

  var sql = "DELETE FROM " + DeviceType +" WHERE id=" +data.id;

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '360ingMySQL',
    password : 'Sbq4504P',
    database : '360ing_db'
  });

  connection.connect();

  connection.query(sql, function (error, results, fields) {
    if (error) throw Error;
    console.log("Records with id = ", data.id, "deleted");
  });
   
  connection.end();

  res.end();
});

app.post("/api/rm_all_mqtt/:DeviceType", (req, res) => {
  var DeviceType = req.params.DeviceType;

  var sql = "DELETE FROM " + DeviceType;

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '360ingMySQL',
    password : 'Sbq4504P',
    database : '360ing_db'
  });

  connection.connect();

  connection.query(sql, function (error, results, fields) {
    if (error) throw Error;
    console.log("All records deleted");
  });
   
  connection.end();

  res.end();
});

app.post("/api/mqtt/:DeviceType", (req,res) => {

  var DeviceType = req.params.DeviceType;

  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : '360ingMySQL',
    password : 'Sbq4504P',
    database : '360ing_db'
  });

  connection.connect();

  connection.query('SELECT * FROM ' + DeviceType, function (error, results, fields) {
    if (error) throw Error;
    res.json(results);
    res.end();
  });
   
  connection.end();
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
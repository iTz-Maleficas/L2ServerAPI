const express = require('express');

const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const list = require('./engine/list.js');
const account = require('./engine/account.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// connection configurations
const mc = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodejs',
});

// connect to database
mc.connect();

// default route
app.get('/', (req, res) => res.send({ error: true, message: 'hello' }));

// general info
app.use('/list', list);

// account manager
app.use('/account', account);

// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, () => {
  console.log('Node app is running on port 8080');
});

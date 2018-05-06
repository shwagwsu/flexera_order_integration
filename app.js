
//------------------------------------------------------------------------------
// node.js gehc flexera application 
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cfenv = require('cfenv');
var apis = require('./routes/api');
var session = require('express-session');
var log4js = require('log4js');

log4js.configure('./log4js.json');

var log = log4js.getLogger("app");



// create a new express server
var app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use('/routes',apis);
//app.use('/flexera',require('./routes/flexera.js'));
// serve the files out of ./public as our main files
//app.use(express.static(__dirname + '/public'));

//  Route for Product..
app.use('/flexera/Product',require('./routes/product.js'));
//app.use('/flexera/Accounts',require('./routes/accounts.js'));
//app.use('/flexera/Users',require('./routes/users.js'));
app.use('/flexera/Entitlements',require('./routes/entitlements.js'));


app.use('/Orders',require('./routes/orders.js'));
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
//var server = app.listen(pappEnv.port || 6001, '0.0.0.0', function() {
var server = app.listen(process.env.VCAP_APP_PORT || 6001, function() {	// print a message when the server starts listening
  //console.log("server starting on " + server.address().port);
  log.info("server starting on " + server.address().port);
  console.log("server starting on " + server.address().port);

});



  


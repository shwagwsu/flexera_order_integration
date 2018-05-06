var express = require('express');
var router = express.Router();
//var soap = require('soap');
var sortJsonArray = require('sort-json-array');
//var groupJsonArray = require('group-array');
//var soap = require('soap');
var bodyParser = require('body-parser');
var util = require('./util');
var request = require('request');
var log = require('log4js').getLogger("orders");
var Account = require('../flexera/account');
var Users = require('../flexera/user');
var ProductCheck = require('../flexera/productcheck');
var EntitlementCheck = require('../flexera/entitlementcheck');
var Entitlement = require('../flexera/entitlement');



//**  Design get the list of orders..  Sort them by OrderId  and loop throw them.. */
//**  2. Evaulate the Order and see if there is an EntitlementId   */
//** both 1 and 2 will run parallell  */
//** Update the orders */
//** Run the Entitlement Creation */
//** update the orders */
//** Send Entitlement Emails */
//** Return List */
var bProductChecks = false;
var bEntitlmentChecks = false;

var Response;

var results;


function ProcessEntitlements()
{
  log.debug("Check Status "+ bProductChecks + " "+ bEntitlmentChecks)
  if (bProductChecks && bEntitlmentChecks)
  {
    log.info("Product and Entitlements Checks complete!!")
    //  Start the Accounts..
    var flexEntitlement = new Entitlement(results);
    flexEntitlement.createEntitlements(function(results) {
      log.debug(results);
  })

    Response.status(200).json(results);
  }
}
//  Flexera Entitlement Request
var flexEntitlementRequest = {
  simpleEntitlement:[],
  opType:"CREATE_OR_UPDATE"
};
var Products =[];
var OrderNos=[];

var finalOrders;

//  Creates Entitlements
function createEntitlements(res) {
  request.post({
    "headers": {"content-type": "application/json"},
    "url":fullUrl +"/flexera/Entitlements",
    "body":JSON.stringify(flexEntitlementRequest)
  },(error,response,body) => {
    if (error) {
      log.error(error);
    }
    log.debug("Entitlement Updates complete!!");
  });
}
//  Checks Entitlements
function checkEntitlements(OrderNo) {
  request.get({
    "headers": {"content-type": "application/json"},
    "url":fullUrl +"/flexera/Entitlements?OrderNo="+ OrderNo
  //  "body":JSON.stringify(flexEntitlementRequest)
  },(error,response,body) => {
    if (error) {
      log.error(error);
    }
    entitlementResponseCount++;
    if (response.statusInfo == "SUCCESS")
    {
      //  Check for details..
      if (response.activatableItem != undefined)
      {
        //response.activatableItem.entitlementId
      }
    }
    
    if (entitlementResponseCount == OrderNos.length)
    {
      bEntitlmentChecks = true;
    }
    checkStatus();
    log.debug("Order check for OrderNo:"  + OrderNo);
  });
}


/* Get Template */
router.get('/OrdersTemplate',function(req,res) {
     return res.status(200).sendFile(__dirname + '/template.json');
});


router.post('/',function(req,res){
  Response = res;
  fullUrl = req.protocol +"://"+ req.get('host');
  results =sortJsonArray(req.body.request,"OrderNo");
  log.debug("Start Orders Processing ("+ results.length +")");

  bEntitlmentChecks = false;
  bProductChecks = false;

 
//  Flexera Entitlement Request
flexEntitlementRequest = {
  simpleEntitlement:[],
  opType:"CREATE_OR_UPDATE"
};




var flexProduct = new ProductCheck(results,function(results){
  bProductChecks = true;
  log.info("Product Check Complete");
  ProcessEntitlements();
}
);
var flexEntitlement = new  EntitlementCheck(results,function(results){
  bEntitlmentChecks = true;
  log.info("Entitlement Check Complete");
  ProcessEntitlements();
});

//res.status(200).json(results);

/*
//  First Create Accounts
 var flexAccount = new Account(results);
 flexAccount.createAccounts(function(response,result){
    log.info("Accounts ("+ result.responseData.account.length +") created");
    // Second Create Users
    var flexUser = new Users(response);
    //log.debug(flexUser.UserList);
    flexUser.createUsers(function(response,result){
      log.info("Users ("+ result.responseData.user.length +") created");
      res.status(200).json(response);
      // Now Create Entitlements..
      //  Now Send Emails..
      // Email alerts etc..
    })

    
 });
*/

 /*
  //  Loop through and get customers..
  for(var i=0;i< results.length;i++)
  {
    results[i]["EntitlementId"]="";
    results[i]["ActivationId"]="";
    results[i]["Flexera"]={
      status:"",
      Message:""
    };
    buildProducts(results[i].ProductId,results[i].ProductVersion);
    buildCustomers(results[i]);
    buildUsers(results[i].Contact,results[i].Id);
    buildOrderNoList(results[i].OrderNo);
   
  }
  */
  //checkProducts(orders,res)
  //checkEntitlements()
  //Response.status(200).json(results);
  //createAccounts(res);
  log.debug("End Order Processing");
  
})
   

module.exports = router;
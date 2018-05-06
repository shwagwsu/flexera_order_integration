"use strict";

var util = require('../routes/util');
var request = require('request');
var log = require('log4js').getLogger("user");
var soap = require('soap');
var config= require('../LocalConfig.json');
/*  TO DO */
/* Break out internal vs Extneral users   Internal is only an update */
 //  Flexera User Request..
 var flexUserRequest ={
    user:[],
    opType:"CREATE_OR_UPDATE"
  }
var _orders;

function updateRows(error) {
   var userList = flexUserRequest.user;
  
    for(var i=0;i<userList.length;i++)
    {
        for(var O=0;O<_orders.length;O++)
        {
              for(var c=0;c<_orders[O].Contact.length;c++)
              {
                  //  Compare the emails..
                  if (_orders[O].Contact[c].email == userList[i].emailAddress)
                  {
                      if(error !=null)
                      {
                        _orders[O].Flexera.status = "E"
                        _orders[O].Flexera.Message = error;
                      }
                      else
                      {
                        _orders[O].Flexera.contactId.push(userList[i].emailAddress)
                      }
                  }
              }  

           
        }
    }

}

class FlexUsers {
    constructor(orders) {
       
        _orders = orders;
       log.debug("FlxUsers");
        var users = flexUserRequest.user;
        //  Loop through the orders...
       for(var a=0;a<_orders.length;a++)
       {
           if (_orders[a].Flexera == undefined)
           {
        _orders[a]["Flexera"] ={
            status:"",
            Message:""
            };
        };
        _orders[a].Flexera["contactId"]=[];  
        log.debug(_orders[a].Flexera); 
        var accountid = _orders[a].Id;
        var exists = false;
        for(var c=0;c< _orders[a].Contact.length;c++)
        {
            for(var i=0;i<users.length;i++)
            {
                if (_orders[a].Contact[c].email == users[i].emailAddress)
                {
                    exists =true;
                    var newUser = util.addUserRole(users[i],accountid);
                    users[i] =newUser;
                    break;
                }
            }
            
            if (!exists)
            {
              var user = util.getUser(_orders[a].Contact[c],accountid)
              users.push(user);
            }            
        }
     }
        this.UserList = users;
       
    }
}
FlexUsers.prototype.getFlexRequest = function() {
    return flexUserRequest;
};

FlexUsers.prototype.createUsers =function(callback){

    var EndPointUrl = config.UserAcctHierarchyServiceEndPoint;
    var WsdlUrl = EndPointUrl + "?WSDL";
    soap.createClient(WsdlUrl, function(err, soapClient){
        if (err){
            return res.status(500).json(err);
          }
        soapClient.on('request',function(data){
            log.debug("Start onRequest");
            log.debug(data);
            log.debug("End onRequest");
        });

    soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
    soapClient.setEndpoint(EndPointUrl);
   
    soapClient.createUser(flexUserRequest,function(err, result){
    
   if (err){
     log.error(err);
     updateRows(err);
     // return res.status(500).json(err);
   }
   log.debug(JSON.stringify(result));
 //  callback(result.responseData);
    //  Check if it successfull
    if (result.responseData.status == "SUCCESS")
    {
        updateRows();
    }
    else
    {
        updateRows();
    }
   //return res.status(200).json(result.responseData)
   callback(_orders,result);   
});
});
};
module.exports = FlexUsers;
    //this.createStatus = true;

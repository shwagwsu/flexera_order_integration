"use strict";

var util = require('../routes/util');
var request = require('request');
var log = require('log4js').getLogger("account");
var soap = require('soap');
var config= require('../LocalConfig.json');


//  Flexera Account Request..
var flexAccountRequest = {
    account:[],
    opType:"CREATE_OR_UPDATE"
}

var _orders;

function updateRows(error) {
   var accountList = flexAccountRequest.account;
  
    for(var i=0;i<accountList.length;i++)
    {
        for(var O=0;O<_orders.length;O++)
        {
            if (_orders[O].Id == accountList[i].id)
            {
                log.debug("Order Found "+ accountList[i].id);
                if (error !=null)
                {
                    _orders[O].Flexera.status = "E",
                    _orders[O].Flexera.Message = error
                }
                else
                {
                    _orders[O].Flexera["accountId"] = accountList[i].id;
                }
                break;
            }
        }
    }

}

class FlexAccounts {
    constructor(orders) {
       
        _orders = orders;
       
        var accounts = flexAccountRequest.account;
        //  Get the account info from the Order Record...
       for(var a=0;a<_orders.length;a++)
       {
        _orders[a]["Flexera"] ={
            status:"",
            Message:""
        
        }   
        var account = util.getAccount(_orders[a]);
        var exists = false;
        for(var i=0;i<accounts.length;i++)
        {
          if (accounts[i].id == account.id)
          {
            exists = true;
            break;
          }
        }
        if (!exists)
        {
          accounts.push(account);
        }
    }
        this.AccountList = accounts;
       
    }
};
FlexAccounts.prototype.getFlexRequest = function() {
    return flexAccountRequest;
};
FlexAccounts.prototype.createAccounts =function(callback){

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
   
    soapClient.createAccount(flexAccountRequest,function(err, result){
    
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
    //this.createStatus = true;
   
});

/*

    request.post({
        "headers": {"content-type": "application/json"},
        "url":fullUrl +"/flexera/Accounts",
        "body":JSON.stringify(flexAccountRequest)
      },(error,response,body) => {
        if (error) {
          log.error(error);
          console.log("ER")
        }
        log.debug("Account Updates complete!!");
      
        callback(body);
    });*/
}

module.exports = FlexAccounts;

var soap = require('soap');
var config = require('../LocalConfig.json');
var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("entitlements");
var sortJsonArray = require('sort-json-array');

var _orders;
var flexEntitlementRequest = {
    simpleEntitlement:[],
    opType:"CREATE_OR_UPDATE"
  };
  

 function updateOrders(results) {

 } 
class FlexEntitlement {
    constructor(orders) {
    //
    var lastOrderId;
    _orders = sortJsonArray(orders,"OrderNo");
    var entitlement;
    for(var i=0;i<_orders.length;i++)
    {
     
        if (lastOrderId !=_orders[i].OrderNo)
        {
            if (i> 0)
            {
                flexEntitlementRequest.simpleEntitlement.push(entitlement);
            
            }
           var entitlement ={
            simpleEntitlement:{
                entitlementId:{
                    autoGenerate:true
                },
            soldTo: _orders[i].Id,
            lineItems:[] 
            }
        };
            lastOrderId = _orders[i].OrderNo;
        }
        var line = {
            activationId:{
                autoGenerate:true
            },
            product:{
                primaryKeys:{
                    name:_orders[i].ProductId,
                    version:_orders[i].ProductVersion
                }
            },
            orderId:_orders[i].OrderNo,
            orderLineNumber:_orders[i].OrderLine,
            numberOfCopies:_orders[i].Quantity,
            startDate:new Date().toISOString(),
            isPermanent: true
        }
        entitlement.simpleEntitlement.lineItems.push(line);
       
        
        
    }
    flexEntitlementRequest.simpleEntitlement.push(entitlement);
    log.debug(flexEntitlementRequest);
}
    
}
FlexEntitlement.prototype.getFlexRequest = function() {
    return flexEntitlementRequest;
};
FlexEntitlement.prototype.createEntitlements = function(callback) {

    log.debug(flexEntitlementRequest);
    var EndPointUrl = config.EntitlementOrderService;
    var WsdlUrl = EndPointUrl + "?WSDL";
    //var data = req.body;
    soap.createClient(WsdlUrl, function(err, soapClient){
        soapClient.on('request',function(data){
            log.debug("Start Request");
            log.debug(data);
            log.debug("End Start Request");
            
        })
      if (err){
        log.error(err);
      }
      soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
      soapClient.setEndpoint(EndPointUrl);
      soapClient.createSimpleEntitlement(flexEntitlementRequest,function(err,result){
        if (err){
            log.error(err);
          }
          //  Update the Orders..
          log.debug(JSON.stringify(result));
         callback(_orders);
          //return res.status(200).json(result.responseData);
        
       // callback(_orders);
        }    
    );
     });
};

module.exports = FlexEntitlement;

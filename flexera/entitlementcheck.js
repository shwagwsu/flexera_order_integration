"use strict";
var request = require('request');
var log = require('log4js').getLogger("entitlementcheck");

var _entitlementResponseCount;
var _OrderNos =[];
var _orders;
function UpdateOrdersMesssages(orderNo,entitlementId) {
    for(var i=0;i < _orders.length;i++)
    {
      if(_orders[i].OrderNo == orderNo)
      {
        
              _orders[i].Flexera.EntitlementId= entitlementId;
      
      }
    }
  
  } 

function checkEntitlement(OrderNo,callback)
{
    request.get({
        "headers": {"content-type": "application/json"},
        "url":fullUrl +"/flexera/Entitlements?OrderNo="+ OrderNo
      },(error,response,body) => {
        if (error) {
          log.error(error);
        }
        _entitlementResponseCount++;
        var entitlementId;
        var orderNo;
        if (response.statusInfo == "SUCCESS")
        {
          //  Check for details..
          if (response.activatableItem != undefined)
          {
            entitlementId = response.activatableItem.entitlementId;
            orderNo = response.activatableItem.orderId
            UpdateOrdersMesssages(orderNo,entitlementId);
          }
        }
        
        log.debug("Order check for OrderNo:"  + OrderNo);
        
        if ( _entitlementResponseCount == _OrderNos.length)
        {
          callback(_orders)
        }
      });
}
class FlexEntitlmentCheck {
    constructor(orders,callback) {
        _orders =orders;
        _OrderNos = [];
        _entitlementResponseCount = 0;


    
        for(var i=0;i<_orders.length;i++)
        {
            if (_orders[i].Flexera == undefined)
            {
         _orders[i]["Flexera"] ={
             status:"",
             Message:""
             };
         };
         _orders[i]["EntitlementId"];
        if (_OrderNos.indexOf(_orders[i].OrderNo) != 0)
        {
          _OrderNos.push(_orders[i].OrderNo);
          checkEntitlement(_orders[i].OrderNo,callback);
      
        }
    }
    this.OrderList;  
    }
}
module.exports = FlexEntitlmentCheck;

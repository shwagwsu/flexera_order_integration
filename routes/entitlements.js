var soap = require('soap');
var config = require('../LocalConfig.json');
var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("entitlements");

router.get('/',function(req,res){
    var EndPointUrl = config.EntitlementOrderService;
    var WsdlUrl = EndPointUrl + "?WSDL";
    log.debug("request for OrderNo:  "+ req.query.OrderNo)
    // console.log(req.query.OrderNo);
    soap.createClient(WsdlUrl, function(err, soapClient){
        soapClient.on('request',function(data){
            log.debug("Start Request:");
           // console.log(data);
            log.debug(data);
            log.debug("End onRequest");
        })
      if (err){
        return json(err);
      }
      soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
      soapClient.setEndpoint(EndPointUrl);
      soapClient.getEntitlementLineItemPropertiesQuery({
        queryParams: {
            orderId: {
            value:req.query.OrderNo,
            searchType:'EQUALS'
        }
    },
        entitlementLineItemResponseConfig:{
            entitlementId:true
        },
        batchSize:1,
        pageNumber:1
      },function(err,result){
        if (err){
            return res.status(500).json(err);
          }
          log.debug(JSON.stringify(result));
          return res.status(200).json(result);
        }
        );
     });
    });
 
//});

router.post('/',function(req,res) {
    
    var EndPointUrl = config.EntitlementOrderService;
    var WsdlUrl = EndPointUrl + "?WSDL";
    console.log(req.query.OrderNo);
    var data = req.body;
    soap.createSimpleEntitlement(WsdlUrl, function(err, soapClient){
        soapClient.on('request',function(data){
            console.log("REQUEST");
            console.log(data);
        })
      if (err){
        return json(err);
      }
      soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
      soapClient.setEndpoint(EndPointUrl);
      soapClient.createUser(req.body,function(err,result){
        if (err){
            return res.status(500).json(err);
          }
          console.log(result);
          return res.status(200).json(result.responseData);
        }
        );
     });
    });
//});
module.exports = router;
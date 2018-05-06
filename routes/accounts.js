var soap = require('soap');
var config = require('../LocalConfig.json');
var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("accounts");

//  POST to check product count..
router.post('/',function(req,res) {
    var EndPointUrl = config.UserAcctHierarchyServiceEndPoint;
    var WsdlUrl = EndPointUrl + "?WSDL";
    soap.createClient(WsdlUrl, function(err, soapClient){
        if (err){
            return res.status(500).json(err);
          }
        soapClient.on('request',function(data){
            log.debug("Start onRequest");
           // console.log(data);
            log.debug(data);
            log.debug("End onRequest");
        })
       
           soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
           soapClient.setEndpoint(EndPointUrl);
          
           soapClient.createAccount(req.body,function(err, result){
           
          if (err){
            log.error(err);
            return res.status(500).json(err);
          }
          log.debug(JSON.stringify(result));

          return res.status(200).json(result.responseData)
           });
    });

});
module.exports = router;
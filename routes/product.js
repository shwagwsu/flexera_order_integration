var soap = require('soap');
var config = require('../LocalConfig.json');
var express = require('express');
var router = express.Router();
var log = require('log4js').getLogger("product");


router.get('/',function(req,res){
    if (req.query.productid !="" && req.query.version !="")
    {
    var EndPointUrl = config.ProductPackagingService;
    var WsdlUrl = EndPointUrl + "?WSDL";
    soap.createClient(WsdlUrl, function(err, soapClient){
        if (err){
            log.error(err);
             return res.status(500).json(err);
           }
        soapClient.on('request',function(data){
            log.debug("Start onRequest");
           // console.log(data);
            log.debug(data);
            log.debug("End onRequest");
        })
       
          var productid= req.query.productid;
          var version = req.query.version;
          soapClient.setSecurity(new soap.BasicAuthSecurity(config.WsUserName, config.WsPassword));
          soapClient.setEndpoint(EndPointUrl);
          soapClient["productid"] =req.query.productid;
          soapClient.getProductCount({
            queryParams: {
                productName: {
                value:req.query.productid,
                searchType:'EQUALS'
            },
                version:{
                value:req.query.version,
                searchType:'EQUALS'
                },
            state:{
                value:'DEPLOYED',
                searchType:'EQUALS'
                }
            }
          },function(err, result,raw){
            if (err){
                log.error(err);
                return res.status(500).json(err);
              }
              //  Include the product id
              log.debug(JSON.stringify(result));
              return res.status(200).json({"productid":productid,"version":version,"count":result.responseData.count});
          });
    });
}
else
{
    log.info("No productid or version in query string");
    res.status(200).json({"error":"productid and version are required in the query string"});
}
})


 module.exports = router;

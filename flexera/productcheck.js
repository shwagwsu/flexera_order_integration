"use strict";
var request = require('request');
var log = require('log4js').getLogger("productcheck");


var _products = [];
var _productResponseCount;
var _orders;

function UpdateProductMesssages(product) {
      for(var i=0;i < _orders.length;i++)
      {
        if(_orders[i].ProductId == product.productid && _orders[i].ProductVersion == product.version)
        {
          
            if (product.count ==0)
            {
                _orders[i].Flexera.status ="E";
                _orders[i].Flexera.Message ="Product "+ product.productid +" and version "+ product.version +" is not active in Flexera";
            }
              _orders[i].Flexera.product = product;
        }
      }
    
    } 

function checkProduct(productid,version,callback)
{
request.get({
    "headers": {"content-type": "application/json"},
    "url":fullUrl +"/flexera/Product?productid="+ productid +"&version="+ version
  },(error,response,body) => {
    if (error) {
      log.error(error)
    }
    _productResponseCount ++;
    var rep =JSON.parse(body);
    UpdateProductMesssages(rep);
    log.debug("Product Checks complete for product: "+  rep.productid + " version: "+ rep.version + " count: "+rep.count);
    if ( _productResponseCount == _products.length)
    {
     callback(_orders);
      
    }
   
  });
}

 
class FlexProductCheck {
    constructor(orders,callback) {
        _orders =orders;
        _products = [];
        _productResponseCount = 0;
    for(var a=0;a<_orders.length;a++)
    {
        if (_orders[a].Flexera == undefined)
        {
     _orders[a]["Flexera"] ={
         status:"",
         Message:""
         };
     };
        _orders[a].Flexera["product"]=false;
        var productid = _orders[a].ProductId;
        var version = _orders[a].ProductVersion;
        var exists = false;
        for(var i=0;i<_products.length;i++)
        {
          if (_products[i].Id == productid && _products[i].version == version)
          {
            exists = true;
          }
        }
        if (!exists)
        {
            _products.push({Id:productid,version:version});
              checkProduct(productid,version,callback);
        }
    }
        this.ProductList;
    }

}
module.exports = FlexProductCheck;

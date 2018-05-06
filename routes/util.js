
function updateOrders() {
  
}
function getAccount(data) {
  var account ={ accountType:'CUSTOMER',
      id:data.Id,
      name:data.DisplayName,
      address:{
        address1:data.Address1,
        address2:data.Address2,
        city:data.City,
        state:data.State,
        country:data.Country,
        zipcode:data.Zip
      },
        customAttributes:{
          attribute:{
            attributeName:"UCMID",
            stringValue:data.UCMID
          }
        }
    
    }
    return account;
}
function addUserRole(user,accountid){
 // console.log(user);
 //  Need to add code to dedupliate users..
  var role = {
   
      account:{
        primaryKeys:{
            id:accountid
        }
      },
      roles:{
        role:{
          primaryKeys:{
            name:'Portal Admin User Role'
          }
        }
      }
  //  }
  };
  //  Check to see if the user is GE or not..
  if(user.emailAddress.indexOf("ge.com") > -1 || user.emailAddress.indexOf("med.ge.com") > -1) {
    role["expiryDate"] = "2019-04-04";
    role.roles.role.primaryKeys.name="Portal User Role";
    
  }
  user.acctRolesList.acctRoles.push(role);
 
  return user;
}

function getUser(contact,accountid) {
  var user = {
        firstName:contact.FirstName,
        lastName:contact.LastName,
        emailAddress:contact.email,
        userName:contact.email,
        canLogin:true,
        shared:false,
        acctRolesList:{ acctRoles:[]}
      
    };
    
    return addUserRole(user,accountid);
  }
exports.getUser = getUser;
exports.getAccount = getAccount;
exports.addUserRole =addUserRole;

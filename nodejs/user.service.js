
const bcrypt = require('bcryptjs');
const {User} = require('./models');
var jwt = require('jsonwebtoken');
var config = require('./config');
var alert =require('alert-node');
module.exports = {
    authenticate,
    create,
};
function returnlogin(res,req){
    res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/log" });
    return res.end();
}
async function authenticate(req,res) {
  
    User.findOne({ username: req.body.username }, function (err,user) {
       
        if(err){
            alert(err);
            returnlogin(res,req);
        }
        if (!user){
            alert('No user found.');
            returnlogin(res,req);
        }else{
            var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
            if (!passwordIsValid) {     alert('Incorrect password');          returnlogin(res,req);
            }
            else{
                var token = jwt.sign({ id: user._id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                  });
                  if(token){
                      req.header['x-access-token']=token;
                      req.header['auth']=true;
                              
                      res.writeHead(301, { "Location": "http://" + req.headers['host'] + "/home" });
                      return res.end();
                  }
            }
            
        }
        
        
     
});


}





async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }
    if(userParam.password !== userParam.confirm_password){
        throw 'Passwords does not match';
    }
    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.password = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}



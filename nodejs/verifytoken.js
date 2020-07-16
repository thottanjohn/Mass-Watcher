var jwt = require('jsonwebtoken');
var config = require('./config');

function verifyToken(req, res, next) {

  var token = req.header['x-access-token'];
    
  jwt.verify(token, config.secret, function(err, decoded) {
    if (!err)
      
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
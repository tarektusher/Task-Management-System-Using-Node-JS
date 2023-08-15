const jwt = require('jsonwebtoken');
module.exports  = function(req, res, next){
     const authHeader = req.headers.authorization;
     if(!authHeader){
          res.status(401).json({message : `Unauthorized`});
          return ;
     }
     const token = authHeader && authHeader.split(" ")[1];
     if(!token){
          res.status(401).json({message : `Unauthorized`});
          return ;
     }
     else{
          jwt.verify(token, process.env.JWT_Secret, (err,user) =>{
               if(err){
                    res.status(401).json({message : `Unauthorized`});
               }
               else{
                    req.user = user;
                    next();
               }
          })
     }
}

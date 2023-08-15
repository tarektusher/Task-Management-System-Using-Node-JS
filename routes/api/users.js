const express = require('express');
const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../Models/User');
const authenticateToken = require('../../MiddleWare/auth');
const router = express.Router();
const {body, validationResult} = require('express-validator');


//? API to create a User
router.post(
     '/users',
     [
          body('fname' , 'fname is required').notEmpty(),
          body('lname' , 'lname is required').notEmpty(),
          body('age' , 'age is required').optional().isNumeric(),
          body('email' , 'Valid Email is required').notEmpty().isEmail(),
          body('password' , 'Please Enter a Password 6 or more Characters').isLength({min : 6}),
     ],
     async (req,res) => {
     try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
               return res.status(400).json({errors : errors.array()});
          }
          const salt =await bycript.genSalt(10);
          const hash = await bycript.hash(req.body.password,salt);
          const userObj = {
               fname : req.body.fname,
               lname : req.body.lname,
               email : req.body.email,
               password : hash,
               age : req.body.age,
          }
          const user = new User(userObj);
          await user.save();
          res.status(201).json(user);
     } catch (error) {
          console.error(error);
          res.status(500).json({message : `Something is worng in the server`});
     }
})

//? API to LOG IN
router.post(
     '/users/login',
     [
          body('type' , 'type is Required').notEmpty(),
          body('type' , 'type must be email or refresh').isIn(['email','refresh']),

     ],
      async(req,res) =>{
     try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
               return res.status(400).json({errors : errors.array()});
          }
          const {email , password, type, refreshToken} = req.body;
          if(!type){
               res.status(401).json({message : `Type is not defined`});
          }
          else{
               if(type == 'email'){
                    await handleEmail(email, res, password);
               }
               else{
                    handleRefreshToken(refreshToken, res);
                    
               }
          }
     } catch (error) {
          console.error(error);
          res.status(500).json({message : `Something is worng in the server`});
     }
})

//? get a user profile 
router.get('/profile',authenticateToken,async(req,res) =>{
     try {
          const id =req.user.id;
          const user = await User.findById(id);
          if(user){
               res.json(user);
          }
          else{
               res.status(404).json({message:"User Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})

//? API to get Users 
router.get('/users',async(req,res) =>{
     try {
          const users =  await User.find({})
          res.json(users);
          
     } catch (error) {
          res.status(404).json(`User not Found`);
     }
})

//? API to get specfic user
router.get('/users',authenticateToken,async (req,res)=>{
     try {
          const id =req.user.id;
          const user = await User.findById(id);
          if(user){
               res.json(user);
          }
          else{
               res.status(404).json({message:"User Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})

//? API to Update a user
router.put('/users',authenticateToken,async(req,res) =>{
     try {
          const id = req.user.id;
          const body = req.body
          const user = await User.findByIdAndUpdate(id,body,{new : true});
          if(user){
               res.json(user);
          }
          else {
               res.status(404).json({message:"User Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})

//? API to DELETE a user
router.delete('/users',authenticateToken,async(req,res) =>{
     try {
          const id =req.user.id;
          const user = await User.findByIdAndDelete(id);
          if(user){
               res.status(200).json(user);
          }
          else {
               res.status(404).json({message : "User is not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }

})
module.exports = router;

function handleRefreshToken(refreshToken, res) {
     if(!refreshToken){
          res.status(401).json({message : `RefreshToken is not defined`})
     }
     else{
          jwt.verify(refreshToken, process.env.JWT_Secret, async (err, payload) => {
               if (err) {
                    res.status(401).json({ message: `Unauthorized` });
               }
               else {
                    const id = payload.id;
                    const user = await User.findById(id);
                    if (user) {
                         res.status(401).json(user);
     
                    }
                    else {
                         getUserTokens(user, res);
                    }
               }
          });
     }
}
function getUserTokens(user, res) {
     const accessToken = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_Secret, { expiresIn: '2d' });
     const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_Secret, { expiresIn: '60d' });
     const userObj = user.toJSON();
     userObj['accessToken'] = accessToken;
     userObj['refreshToken'] = refreshToken;
     res.json(userObj);
}

async function handleEmail(email, res, password) {
     const user = await User.findOne({ email: email });
     if (!user) {
          res.status(401).json({ message: `User is not found` });
     }
     else {
          const validPassword = await bycript.compare(password, user.password);
          if (!validPassword) {
               res.status(401).json({ message: `Wrong Password` });
          }
          else {
               getUserTokens(user, res);
          }
     }
}
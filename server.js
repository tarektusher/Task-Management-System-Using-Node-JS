//? Package List
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const connect_db = require('./config/db');
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 6000;
const multer  = require('multer');

// const upload = multer({ dest : "./public/data/uploads/" });
const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, './public/data/uploads/')
     },
     filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) 
     //   const uniqueSuffix = 'MyMan.jpg';
       cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
     }
})
const upload = multer({ storage: storage })

//? Routes
app.use('/users', require('./routes/api/users'));
app.use('/users', require('./routes/api/tasks'));

//?MongoDB Connect 
connect_db();
//? Check Connection
app.listen(port,() =>{
     console.log(`Server is running on PORT ${port}`);
})
app.post('/uploades',upload.single("file"), (req,res) =>{
     res.json({message : `File is Uploaded`});
})
//? API to check connection
app.get('/',(req,res) =>{
     res.json({message: 'Welcome to my app'});
})

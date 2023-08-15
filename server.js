//? Package List
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config()
const connect_db = require('./config/db');
const app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 6000;

//? Routes
app.use('/users', require('./routes/api/users'))
app.use('/users', require('./routes/api/tasks'))

//?MongoDB Connect 
connect_db();
//? Check Connection
app.listen(port,() =>{
     console.log(`Server is running on PORT ${port}`);
})

//? API to check connection
app.get('/',(req,res) =>{
     res.json({message: 'Welcome to my app'});
})

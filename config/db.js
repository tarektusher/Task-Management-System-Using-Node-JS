const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;
const connect_db = () =>{
     try {
          mongoose.connect(url, {useNewUrlParser : true})
          console.log(`DB is Connected`);
     } catch (error) {
          console.log(`DB is not Connectd`);
     }
}
module.exports = connect_db 
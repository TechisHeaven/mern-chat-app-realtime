const mongoose = require("mongoose");
const colors = require("colors")

const ConnectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL)
        console.log(`Connected to Mongo - ${conn.connection.host}`.red.bold)
    }
    catch(err){
        console.log(err)
        process.exit()
    }
}



module.exports = ConnectDB;
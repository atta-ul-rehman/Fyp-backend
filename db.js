const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const mongoURI = process.env.MONGO_DB;

const connectToMongo = async () => {
  const con = await mongoose.connect(mongoURI, {}).then((res)=>
  console.log("Connected to Mongo Successfully".brightGreen.underline.bold)
  ).catch((err)=>{
    console.log("Cannot Connect to Mongo".red.underline.bold)
  })
 
};

module.exports = connectToMongo;

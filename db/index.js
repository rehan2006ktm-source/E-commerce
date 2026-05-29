import mongoose from 'mongoose';
import DB_NAME from '../constant.js'
// Connect to your MongoDB database

import dotenv from "dotenv";

dotenv.config({
    path:'../.env'
});

const funct=async ()=>{
    try{
        console.log("URI:", process.env.MONGODB_URI);
     const response= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
     console.log(response);
    }
    catch(err){
        console.log("error found" ,err)
        throw err;
    }
  
}

export default funct
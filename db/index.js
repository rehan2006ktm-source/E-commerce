import mongoose from 'mongoose';
import DB_NAME from '../constant.js'
// Connect to your MongoDB database

import dotenv from "dotenv";

dotenv.config({
    path:'../.env'
});

const funct=async ()=>{
    try{
        const baseUri = (process.env.MONGODB_URI ?? "").replace(/\/+$/, "");
        if (!baseUri) {
            throw new Error("MONGODB_URI is not set in environment");
        }
        const connectionUri = `${baseUri}/${DB_NAME}`;
        console.log("Connecting to MongoDB database:", DB_NAME);
        const response = await mongoose.connect(connectionUri);
     console.log(response);
    }
    catch(err){
        console.log("error found" ,err)
        throw err;
    }
  
}

export default funct
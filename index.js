import funct from "./db/index.js"
import dotenv from "dotenv";
dotenv.config( {path:'./.env'});
import app from './app.js'

const PORT = process.env.PORT || 5000;

funct()
.then((result)=>{
    app.listen(PORT,()=>{
        console.log(`MONGODB CONNECT SUCCESSFULLY ON PORT ${PORT}`)
    })
    
})
.catch((err)=>{
    console.log("mongo db connection falied");
})

const rehan="reha1"

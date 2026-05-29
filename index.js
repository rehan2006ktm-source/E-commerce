import funct from "./db/index.js"
import dotenv from "dotenv";
dotenv.config( {path:'./.env'});
import app from './app.js'

funct()
.then((result)=>{
    app.listen(process.env.PORT||5000,()=>{
        console.log(`MONGODB CONNECT SUCCESSFULLY ON PORT ${process.env.PORT}`)
    })
    
})
.catch((err)=>{
    console.log("mongo db connection falied");
})

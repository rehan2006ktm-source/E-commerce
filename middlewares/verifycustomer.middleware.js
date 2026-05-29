import apierror from "../utils/apierror.js"

const verifyCustomer = (req,res,next)=>{
   if(req.user.role !== "customer"){
      throw new apierror(403,"only customer allowed")
   }
   next()
}
export {verifyCustomer}
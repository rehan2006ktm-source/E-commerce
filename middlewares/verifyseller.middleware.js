import apierror from "../utils/apierror.js"

const verifySeller = (req,res,next)=>{
   if(req.user.role !== "seller"){
      throw new apierror(403,"only seller allowed")
   }
   next()
}

export {verifySeller}
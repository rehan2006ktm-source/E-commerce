import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
   user_id:{
    type:mongoose.Schema.Types.ObjectId,
   ref:"User"
   },
   amount:{
    type:Number
   },
   order_id:{
    type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
  //  type:
   },
   payment_status:{
    type:String,
    enum:["pending","failed","paid","refunded"]
   },
   mode_of_payment:{
     type:String,
        enum:["cod","upi","card","netbanking"],
        required:true
   },
   transaction_id:{
        type:String
    },
      gateway_order_id:{
        type:String
    },

    gateway_payment_id:{
        type:String
    },
     payment_gateway:{
        type:String,
        enum:["razorpay","paytm","google pay ","none"],
        default:"none"
    }

},{timestamps:true})

const Payment = mongoose.model("Payment",paymentSchema)

export default Payment
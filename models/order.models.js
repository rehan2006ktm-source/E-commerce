import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
   user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },

   products:[
    {
      product:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Product"
      },

      quantity:{
         type:Number,
         default:1
      },

      productOwner:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      }
   }
],

   location:{
    type:String,
    required:true
   },

   price:{
    type:Number
   },

   mobile_no:{
    type:Number
   },

  status: {
  type: String,
  enum: ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
  default: "placed"
},
payment_status:{
   type:String
},

   mode_of_payment:{
    type:String
   },
   
   trackingHistory: [
  {
    status: String,
    message: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
]

},{timestamps:true})

const Order = mongoose.model("Order",orderSchema)

export default Order
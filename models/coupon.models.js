import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    discount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date
    },
    isActive:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Coupon = mongoose.model("Coupon",couponSchema)

export default Coupon
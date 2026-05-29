import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
      title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        default:1
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    images:[
        {type:String}
    ],
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
    review:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review"

    }

    
},{timestamps:true})

const Product = mongoose.model("Product",productSchema)

export default Product
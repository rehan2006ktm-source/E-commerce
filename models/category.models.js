import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
     name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String
    },
      slug:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
      parentCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default:null
    },

    image:{
        type:String
    },

    isActive:{
        type:Boolean,
        default:true
    }

},{timestamps:true})

const Category = mongoose.model("Category",categorySchema)

export default Category
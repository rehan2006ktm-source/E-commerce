import mongoose from 'mongoose'
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    location:{
        type:String
    },
     email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["customer","seller","admin"],
        default:"customer"
    },
    avatar:{
        type:String
    },
    wallet:{
        type:Number
    },
    //sller field
     panNumber:{
        type:String
    },

    gstNumber:{
        type:String
    },

    bankAccountNumber:{
        type:Number
    },

    ifscCode:{
        type:String
    },

    addressProof:{
        type:String
    },

    businessAddress:{
        type:String
    },

    kycStatus:{
        type:String,
        enum:["pending","approved","rejected"],
        default:"pending"
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            name:this.name,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            name:this.name
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

const User=mongoose.model("User",userSchema)

export default User

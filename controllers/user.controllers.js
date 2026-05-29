import User from "../models/user.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"

const generateAccessAndRefreshToken=async(userId)=>{
  try {
   const user = await User.findById(userId)
   const accessToken=user.generateAccessToken()
   const refreshToken=user.generateRefreshToken()

   user.refreshToken=refreshToken
   await user.save({validateBeforeSave:false})

   return {accessToken,refreshToken}
    
  } catch (error) {
    throw new apierror(500,"something went wrong while generating refreshtoken and accesstoken")
  }
}   


const registerUser=asynchandler( async (req,res,next)=>{

    const {role} =req.body


    if(role==='customer'){
        const {name,email,password,location}=req.body;
    if([name,email,password,location].some((val)=>val?.trim()==="")){
        throw new apierror(400,"all fields reuired")
    }
    //name email must be unique
    const existedUser=await User.findOne({
        $or:[{name},{email}]
    })
    if(existedUser){
        throw new apierror(409,"user with email or username or password already existed")
      }
      const filepath= req.files?.avatar[0].path;
      if(filepath){
        const fileurl=await cloudinary(filepath)
      }
      const user=await User.create({
        name,
        email,
        password,
        location ,
        avatar:avatar.url
        
      })
    }
    else {
        const {name,email,avatar,password,location,panNumber,gstNumber,
        bankAccountNumber,
        ifscCode,
        addressProof,
        businessAddress}=req.body
    
    if(!panNumber || !gstNumber || !bankAccountNumber || !ifscCode || !addressProof || !businessAddress){
        throw new apierror(400,"data insufficient")
    }
    const existedUser=await User.findOne({
        $or:[{name},{email},{panNumber},{bankAccountNumber},{ifscCode}]
    })
    if(existedUser){
        throw new apierror(409,"user with email or username or password already existed")
      }
       const filepath= req.files?.avatar[0].path;
      if(filepath){
        const fileurl=await cloudinary(filepath)
      }
       const user=await User.create({
        name,
        email,
        password,
        location ,
        avatar:fileurl.url,
        panNumber,
        gstNumber,
        bankAccountNumber,
        ifscCode,
        addressProof,
        businessAddress
        
      })



    }
    return res.status(200).json(
        new apiresponse(200,user,"registered successfully ")
    )
    

})

const loginuser=asynchandler(async(req,res,next)=>{
    
    const {email,password} = req.body

    if(!email || !password){
        throw new apierror(400,"email and password required")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new apierror(404,"user not found")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new apierror(401,"invalid password")
    }

    const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new apiresponse(200,{
            user:loggedInUser,
            accessToken
        },"login successfully")
    )
})

const logout=asynchandler(async(req,res,next)=>{ 
  //clear cookies  
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset:{
        refreshToken:1
      }
    },
    {
      new:true
    }
  )
   const options={
    httpOnly:true,
    secure:false,
    sameSite:"lax"
   }

   return res.status(200)
   //.clearCookie()
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new apiresponse(200,{},"User logged out"))



   

})

const getCurrentUser = asynchandler(async(req,res,next)=>{
    return res.status(200).json(
        new apiresponse(200, req.user, "current user fetched successfully")
    )
})

const updateProfile = asynchandler(async(req,res,next)=>{
    const {name, mobile_no, location} = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                name,
                mobile_no,
                location
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new apiresponse(200, user, "profile updated successfully")
    )
})

const changePassword = asynchandler(async(req,res,next)=>{
    const {oldPassword, newPassword} = req.body

    if(!oldPassword || !newPassword){
        throw new apierror(400,"old password and new password required")
    }

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new apierror(401,"old password is wrong")
    }

    user.password = newPassword
    await user.save()

    return res.status(200).json(
        new apiresponse(200, {}, "password changed successfully")
    )
})

export {registerUser,loginuser,logout,getCurrentUser,
    updateProfile,
    changePassword }

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


const registerUser = asynchandler(async (req, res) => {
    const { role } = req.body;
    let user;

    if (role === "customer") {
        const { name, email, password, location } = req.body;
        if ([name, email, password, location].some((val) => val?.trim() === "")) {
            throw new apierror(400, "all fields required");
        }

        const existedUser = await User.findOne({ $or: [{ name }, { email }] });
        if (existedUser) {
            throw new apierror(409, "user with email or username already exists");
        }

        let avatarUrl;
        const avatarFile = req.file ?? req.files?.avatar?.[0];
        if (avatarFile?.path) {
            const uploaded = await cloudinary(avatarFile.path);
            avatarUrl = uploaded.url;
        }

        user = await User.create({
            name,
            email,
            password,
            location,
            role: "customer",
            ...(avatarUrl ? { avatar: avatarUrl } : {}),
        });
    } else if (role === "seller") {
        const {
            name,
            email,
            password,
            location,
            panNumber,
            gstNumber,
            bankAccountNumber,
            ifscCode,
            addressProof,
            businessAddress,
        } = req.body;

        if (
            !panNumber ||
            !gstNumber ||
            !bankAccountNumber ||
            !ifscCode ||
            !addressProof ||
            !businessAddress
        ) {
            throw new apierror(400, "data insufficient");
        }

        const existedUser = await User.findOne({
            $or: [{ name }, { email }, { panNumber }, { bankAccountNumber }, { ifscCode }],
        });
        if (existedUser) {
            throw new apierror(409, "seller with these details already exists");
        }

        let avatarUrl;
        const avatarFile = req.file ?? req.files?.avatar?.[0];
        if (avatarFile?.path) {
            const uploaded = await cloudinary(avatarFile.path);
            avatarUrl = uploaded.url;
        }

        user = await User.create({
            name,
            email,
            password,
            location,
            role: "seller",
            panNumber,
            gstNumber,
            bankAccountNumber,
            ifscCode,
            addressProof,
            businessAddress,
            ...(avatarUrl ? { avatar: avatarUrl } : {}),
        });
    } else {
        throw new apierror(400, "role must be customer or seller");
    }

    const created = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(new apiresponse(201, created, "registered successfully"));
});

const loginuser=asynchandler(async(req,res,next)=>{
    
    const {email,password} = req.body

    if(!email || !password){
        throw new apierror(400,"email and password required")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new apierror(404,"user not found")
    }

    // #region agent log
    fetch('http://127.0.0.1:7816/ingest/d5ea4e40-392a-4df8-8cba-5ae32091630d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3f2db'},body:JSON.stringify({sessionId:'b3f2db',runId:'pre-fix',hypothesisId:'B',location:'user.controllers.js:loginuser',message:'login user loaded',data:{hasIsPasswordCorrect:typeof user.isPasswordCorrect==='function',hasGenerateAccessToken:typeof user.generateAccessToken==='function',emailProvided:!!email},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new apierror(401,"invalid password")
    }

    const {accessToken,refreshToken} =await generateAccessAndRefreshToken(user._id)

    // #region agent log
    fetch('http://127.0.0.1:7816/ingest/d5ea4e40-392a-4df8-8cba-5ae32091630d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b3f2db'},body:JSON.stringify({sessionId:'b3f2db',runId:'pre-fix',hypothesisId:'C',location:'user.controllers.js:loginuser',message:'login tokens generated',data:{hasAccessToken:!!accessToken,hasRefreshToken:!!refreshToken},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
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


``
   

})

const getCurrentUser = asynchandler(async(req,res,next)=>{
    return res.status(200).json(
        new apiresponse(200, req.user, "current user fetched successfully")
    )
})

const updateProfile = asynchandler(async(req,res,next)=>{
    const {
        name,
        mobile_no,
        location,
        role,
        panNumber,
        gstNumber,
        bankAccountNumber,
        ifscCode,
        addressProof,
        businessAddress
    } = req.body

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                name,
                mobile_no,
                location,
                ...(role ? { role } : {}),
                ...(panNumber ? { panNumber } : {}),
                ...(gstNumber ? { gstNumber } : {}),
                ...(bankAccountNumber ? { bankAccountNumber } : {}),
                ...(ifscCode ? { ifscCode } : {}),
                ...(addressProof ? { addressProof } : {}),
                ...(businessAddress ? { businessAddress } : {}),
                ...(role === 'seller' ? { kycStatus: 'approved' } : {})
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

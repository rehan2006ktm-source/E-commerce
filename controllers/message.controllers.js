import Message from "../models/message.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"

const sendMessage = asynchandler(async(req,res,next)=>{
    const {receiver,message} = req.body

    if(!receiver || !message){
        throw new apierror(400,"receiver and message required")
    }

    const newMessage = await Message.create({
        sender:req.user._id,
        receiver,
        message
    })

    return res.status(201).json(
        new apiresponse(201,newMessage,"message sent successfully")
    )
})

const getMyMessages = asynchandler(async(req,res,next)=>{
    const messages = await Message.find({
        $or:[
            {sender:req.user._id},
            {receiver:req.user._id}
        ]
    })
    .populate("sender","name email")
    .populate("receiver","name email")
    .sort({createdAt:-1})

    return res.status(200).json(
        new apiresponse(200,messages,"messages fetched successfully")
    )
})
const getConversation = asynchandler(async(req,res,next)=>{
    const {userId} = req.params

    const messages = await Message.find({
        $or:[
            {sender:req.user._id, receiver:userId},
            {sender:userId, receiver:req.user._id}
        ]
    })
    .sort({createdAt:1})

    return res.status(200).json(
        new apiresponse(200,messages,"conversation fetched successfully")
    )
})

const deleteMessage = asynchandler(async(req,res,next)=>{
    const {messageId} = req.params

    const message = await Message.findById(messageId)

    if(!message){
        throw new apierror(404,"message not found")
    }

    if(message.sender.toString() !== req.user._id.toString()){
        throw new apierror(403,"you can delete only your message")
    }

    await Message.findByIdAndDelete(messageId)

    return res.status(200).json(
        new apiresponse(200,{},"message deleted successfully")
    )
})

const markAsRead = asynchandler(async(req,res,next)=>{
    const {messageId} = req.params

    const message = await Message.findById(messageId)

    if(!message){
        throw new apierror(404,"message not found")
    }

    if(message.receiver.toString() !== req.user._id.toString()){
        throw new apierror(403,"not allowed")
    }

    message.isRead = true

    await message.save()

    return res.status(200).json(
        new apiresponse(200,message,"message marked as read")
    )
})

export {
    sendMessage,
    getMyMessages,
    getConversation,
    markAsRead,
    deleteMessage
}
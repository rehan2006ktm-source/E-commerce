import Order from "../models/order.models.js"
import Cart from "../models/cart.models.js"
import Product from "../models/product.models.js"
import Payment from "../models/payment.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"

const createPayment = asynchandler(async(req,res,next)=>{

    const {
        order_id,
        mode_of_payment,
        payment_gateway
    } = req.body

    // check order id
    if(!order_id){
        throw new apierror(400,"order id required")
    }

    // find order
    const order = await Order.findById(order_id)

    if(!order){
        throw new apierror(404,"order not found")
    }

    // check successful payment already exists
    const existedPayment = await Payment.findOne({
        order_id,
        payment_status:"paid"
    })

    if(existedPayment){
        throw new apierror(400,"payment already completed")
    }

    // COD logic
    if(mode_of_payment === "cod"){

        const payment = await Payment.create({

            user_id:req.user._id,

            order_id,

            amount:order.price,

            payment_status:"pending",

            mode_of_payment:"cod",

            payment_gateway:"none"
        })

        order.payment_status = "pending"

        return res.status(201).json(

            new apiresponse(
                201,
                payment,
                "cash on delivery selected"
            )
        )
    }

})

const getMyPayments = asynchandler(async(req,res,next)=>{

    const payments = await Payment.find({
        user_id:req.user._id
    })
    .populate("order_id")

    return res.status(200).json(

        new apiresponse(
            200,
            payments,
            "payments fetched successfully"
        )
    )
})


const getSinglePayment = asynchandler(async(req,res,next)=>{

    const {paymentId} = req.params

    const payment = await Payment.findById(paymentId)
    .populate("order_id")

    if(!payment){
        throw new apierror(404,"payment not found")
    }

    return res.status(200).json(

        new apiresponse(
            200,
            payment,
            "payment fetched successfully"
        )
    )
})

const updatePaymentStatus = asynchandler(async(req,res,next)=>{

    const {paymentId} = req.params

    const {payment_status} = req.body

    const payment = await Payment.findById(paymentId)

    if(!payment){
        throw new apierror(404,"payment not found")
    }

    payment.payment_status = payment_status

    await payment.save()

    return res.status(200).json(

        new apiresponse(
            200,
            payment,
            "payment status updated successfully"
        )
    )
})

const deletePayment = asynchandler(async(req,res,next)=>{

    // admin check
    if(req.user.role !== "admin"){
        throw new apierror(403,"only admin can delete payment")
    }

    const {paymentId} = req.params

    const payment = await Payment.findByIdAndDelete(paymentId)

    if(!payment){
        throw new apierror(404,"payment not found")
    }

    return res.status(200).json(

        new apiresponse(
            200,
            {},
            "payment deleted successfully"
        )
    )
})
export {
    createPayment,
    getMyPayments,
    getSinglePayment,
    updatePaymentStatus,
    deletePayment
}
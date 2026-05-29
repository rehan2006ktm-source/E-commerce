import Cart from "../models/cart.models.js"
import Product from "../models/product.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"
import mongoose from "mongoose"
const addToCart = asynchandler(async(req,res,next)=>{

    const {productId, quantity} = req.body

    if(!productId){
        throw new apierror(400,"product id required")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new apierror(404,"product not found")
    }

    let cart = await Cart.findOne({
        user:req.user._id
    })

    if(!cart){
        cart = await Cart.create({
            user:req.user._id,
            items:[],
            totalPrice:0
        })
    }

    const existedProduct = cart.items.find(
        (item)=>item.product.toString() === productId
    )

    if(existedProduct){
        existedProduct.quantity += quantity || 1
    }
    else{
        cart.items.push({
            product:productId,
            quantity:quantity || 1
        })
    }

    cart.totalPrice = 0

    for(const item of cart.items){

        const productData = await Product.findById(item.product)

        cart.totalPrice += productData.price * item.quantity
    }

    await cart.save()

    return res.status(200).json(
        new apiresponse(200,cart,"product added to cart")
    )
})


const  getCart = asynchandler(async(req,res,next)=>{

    const cart = await Cart.findOne({
        user:req.user._id
    }).populate("items.product")

    return res.status(200).json(
        new apiresponse(200,cart,"cart fetched successfully")
    )
})


const updateCartQuantity = asynchandler(async(req,res,next)=>{

    const {productId, quantity} = req.body

    const cart = await Cart.findOne({
        user:req.user._id
    })

    if(!cart){
        throw new apierror(404,"cart not found")
    }

    const item = cart.items.find(
        (item)=>item.product.toString() === productId
    )

    if(!item){
        throw new apierror(404,"product not found in cart")
    }

    item.quantity = quantity

    cart.totalPrice = 0

    for(const item of cart.items){

        const productData = await Product.findById(item.product)

        cart.totalPrice += productData.price * item.quantity
    }

    await cart.save()

    return res.status(200).json(
        new apiresponse(200,cart,"cart updated successfully")
    )
})

const removeFromCart = asynchandler(async(req,res,next)=>{

    const {productId} = req.body

    const cart = await Cart.findOne({
        user:req.user._id
    })

    if(!cart){
        throw new apierror(404,"cart not found")
    }

    cart.items = cart.items.filter(
        (item)=>item.product.toString() !== productId
    )

    cart.totalPrice = 0

    for(const item of cart.items){

        const productData = await Product.findById(item.product)

        cart.totalPrice += productData.price * item.quantity
    }

    await cart.save()

    return res.status(200).json(
        new apiresponse(200,cart,"product removed from cart")
    )
})


const clearCart = asynchandler(async(req,res,next)=>{

    const cart = await Cart.findOne({
        user:req.user._id
    })

    if(!cart){
        throw new apierror(404,"cart not found")
    }

    cart.items = []

    cart.totalPrice = 0

    await cart.save()

    return res.status(200).json(
        new apiresponse(200,cart,"cart cleared successfully")
    )
})



export {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
}
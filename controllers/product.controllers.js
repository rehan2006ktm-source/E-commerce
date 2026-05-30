import Product from "../models/product.models.js"
import Category from "../models/category.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"


//seller view on product controller
//addprodcut deletep updatep stock change 
const addProduct = asynchandler(async(req,res,next)=>{
    const {title, description, price, stock, category} = req.body

    if(!title || !price){
        throw new apierror(400,"title and price required")
    }

    const imagePaths = req.files?.images || []

    let images = []

    for(const file of imagePaths){
        const uploadedImage = await cloudinary(file.path)
        images.push(uploadedImage.url)
    }

    const product = await Product.create({
        title,
        description,
        price,
        stock,
        category,
        images,
        owner:req.user._id
    })

    return res.status(201).json(
        new apiresponse(201,product,"product added successfully")
    )
})


const updateProduct = asynchandler(async(req,res,next)=>{
    const {productId} = req.params

    const product = await Product.findById(productId)

    if(!product){
        throw new apierror(404,"product not found")
    }

    if(product.owner.toString() !== req.user._id.toString()){
        throw new apierror(403,"you can update only your product")
    }

    const imagePaths = req.files?.images || []
    let images = []
    
    if (imagePaths.length > 0) {
        for(const file of imagePaths){
            const uploadedImage = await cloudinary(file.path)
            images.push(uploadedImage.url)
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                ...req.body,
                ...(images.length > 0 ? { images } : {})
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new apiresponse(200,updatedProduct,"product updated successfully")
    )
})



const deleteProduct = asynchandler(async(req,res,next)=>{
    const {productId} = req.params

    const product = await Product.findById(productId)

    if(!product){
        throw new apierror(404,"product not found")
    }

    if(product.owner.toString() !== req.user._id.toString()){
        throw new apierror(403,"you can delete only your product")
    }

    await Product.findByIdAndDelete(productId)

    return res.status(200).json(
        new apiresponse(200,{},"product deleted successfully")
    )
})


// SELLER: get own products
const getSellerProducts = asynchandler(async(req,res,next)=>{
    const products = await Product.find({
        owner:req.user._id
    })

    return res.status(200).json(
        new apiresponse(200,products,"seller products fetched successfully")
    )
})


//customer
const getAllProducts = asynchandler(async(req,res,next)=>{
    const products = await Product.find()

    return res.status(200).json(
        new apiresponse(200,products,"products fetched successfully")
    )
})

const getSingleProduct = asynchandler(async(req,res,next)=>{
    const {productId} = req.params

    const product = await Product.findById(productId)

    if(!product){
        throw new apierror(404,"product not found")
    }

    return res.status(200).json(
        new apiresponse(200,product,"product fetched successfully")
    )
})

const searchProducts = asynchandler(async(req,res,next)=>{
    const {keyword} = req.query

    if(!keyword){
        throw new apierror(400,"search keyword is required")
    }

    // Find any categories that match the search keyword
    const categories = await Category.find({
        $or: [
            {name: {$regex: keyword, $options: "i"}},
            {slug: {$regex: keyword, $options: "i"}},
            {description: {$regex: keyword, $options: "i"}}
        ]
    });

    const categoryIds = categories.map(cat => cat._id);

    // Retrieve products matching by title, description, or associated category ID
    const products = await Product.find({
        $or:[
            {title:{$regex:keyword,$options:"i"}},
            {description:{$regex:keyword,$options:"i"}},
            {category:{$in:categoryIds}}
        ]
    })

    return res.status(200).json(
        new apiresponse(200,products,"products fetched successfully")
    )
})

export {
    addProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    getAllProducts,
    getSingleProduct,
    searchProducts
}
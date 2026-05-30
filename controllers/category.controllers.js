import Category from "../models/category.models.js"
import Product from "../models/product.models.js"

import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"

//admin 
//import Category from "../models/category.models.js"

const createCategory = asynchandler(async(req,res,next)=>{

    const {
        name,
        slug,
        description,
        parentCategory
    } = req.body

    if(!name || !slug){
        throw new apierror(400,"name and slug required")
    }

    const existedCategory = await Category.findOne({
        $or:[{name},{slug}]
    })

    if(existedCategory){
        throw new apierror(409,"category already exists")
    }

    const filepath = req.files?.image?.[0]?.path

    let imageUrl = ""

    if(filepath){
        const uploadedImage = await cloudinary(filepath)

        imageUrl = uploadedImage?.url
    }

    const category = await Category.create({
        name,
        slug,
        description,
        parentCategory,
        image:imageUrl
    })

    return res.status(201).json(
        new apiresponse(
            201,
            category,
            "category created successfully"
        )
    )
})

// getAllCategories
const getAllCategories = asynchandler(async(req,res,next)=>{

    const categories = await Category.find()

    return res.status(200).json(
        new apiresponse(200,categories,"all categories fetched")
    )
})

// getSingleCategory
const getSingleCategory = asynchandler(async(req,res,next)=>{

    const {categoryId} = req.params

    const category = await Category.findById(categoryId)

    if(!category){
        throw new apierror(404,"category not found")
    }

    return res.status(200).json(
        new apiresponse(200,category,"category fetched successfully")
    )
})

// updateCategory
const updateCategory = asynchandler(async(req,res,next)=>{

    const {categoryId} = req.params

    const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set:req.body
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new apiresponse(200,updatedCategory,"category updated successfully")
    )
})

// deleteCategory
const deleteCategory = asynchandler(async(req,res,next)=>{

    const {categoryId} = req.params

    await Category.findByIdAndUpdate(
        categoryId,
        {
            $set:{
                isActive:false
            }
        }
    )

    return res.status(200).json(
        new apiresponse(200,{},"category deleted successfully")
    )
})

// getCategoryProducts
const getCategoryProducts = asynchandler(async(req,res,next)=>{

    const {categoryId} = req.params

    const products = await Product.find({
        category:categoryId
    })

    return res.status(200).json(
        new apiresponse(200,products,"category products fetched")
    )
})
// getSubCategories
const getSubCategories = asynchandler(async(req,res,next)=>{

    const {categoryId} = req.params

    const subCategories = await Category.find({
        parentCategory:categoryId
    })

    return res.status(200).json(
        new apiresponse(200,subCategories,"subcategory fetched successfully")
    )
})


export {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    getSubCategories,
    getCategoryProducts
}
const s="ss"
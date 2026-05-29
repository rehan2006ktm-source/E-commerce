import Review from "../models/review.models.js"
import Product from "../models/product.models.js"
import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"


const addReview = asynchandler(async(req,res,next)=>{

    const {productId, rating, comment} = req.body

    if(!productId || !rating){
        throw new apierror(400,"product and rating required")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new apierror(404,"product not found")
    }

    const existedReview = await Review.findOne({
        user_id:req.user._id,
        product_id:productId
    })

    if(existedReview){
        throw new apierror(409,"review already added")
    }

    const review = await Review.create({
        user_id:req.user._id,
        product_id:productId,
        rating,
        comment
    })

    return res.status(201).json(
        new apiresponse(201,review,"review added successfully")
    )
})


const getProductReviews = asynchandler(async(req,res,next)=>{

    const {productId} = req.params

    const reviews = await Review.find({
        product_id:productId
    })
    .populate("user_id","name avatar")
    .sort({createdAt:-1})

    return res.status(200).json(
        new apiresponse(200,reviews,"reviews fetched successfully")
    )
})

const updateReview = asynchandler(async(req,res,next)=>{

    const {reviewId} = req.params

    const review = await Review.findById(reviewId)

    if(!review){
        throw new apierror(404,"review not found")
    }

    if(review.user_id.toString() !== req.user._id.toString()){
        throw new apierror(403,"not allowed")
    }

    const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
            $set:req.body
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new apiresponse(200,updatedReview,"review updated successfully")
    )
})

const deleteReview = asynchandler(async(req,res,next)=>{

    const {reviewId} = req.params

    const review = await Review.findById(reviewId)

    if(!review){
        throw new apierror(404,"review not found")
    }

    if(review.user_id.toString() !== req.user._id.toString()){
        throw new apierror(403,"not allowed")
    }

    await Review.findByIdAndDelete(reviewId)

    return res.status(200).json(
        new apiresponse(200,{},"review deleted successfully")
    )
})


const getMyReviews = asynchandler(async(req,res,next)=>{

    const reviews = await Review.find({
        user_id:req.user._id
    })
    .populate("product_id","title images")

    return res.status(200).json(
        new apiresponse(200,reviews,"my reviews fetched successfully")
    )
})






export {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getMyReviews
}
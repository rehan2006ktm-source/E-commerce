import Order from "../models/order.models.js"
import Cart from "../models/cart.models.js"
import Product from "../models/product.models.js"


import apierror from "../utils/apierror.js"
import apiresponse from "../utils/apiresponse.js"
import asynchandler from "../utils/asynchandler.js"
import cloudinary from "../utils/cloudinary.js"




const createOrder = asynchandler(async(req,res,next)=>{
    const {location, mobile_no, mode_of_payment} = req.body

    const cart = await Cart.findOne({user:req.user._id})

    if(!cart || cart.items.length === 0){
        throw new apierror(400,"cart is empty")
    }

    const products = []

    for(const item of cart.items){

    const productData = await Product.findById(item.product)

    products.push({
        product:item.product,
        quantity:item.quantity,
        productOwner:productData.owner
    })
}

    const order = await Order.create({
        user_id:req.user._id,
        products,
        location,
        mobile_no,
        price:cart.totalPrice,
        status:"placed",
        mode_of_payment
    })

    cart.items = []
    cart.totalPrice = 0
    await cart.save()

    return res.status(201).json(
        new apiresponse(201,order,"order created successfully")
    )
})
const getMyOrders = asynchandler(async(req,res,next)=>{
    const orders = await Order.find({user_id:req.user._id})

    return res.status(200).json(
        new apiresponse(200,orders,"orders fetched successfully")
    )
})

const cancelOrder = asynchandler(async(req,res,next)=>{
    const {orderId} = req.params

    const order = await Order.findById(orderId)

    if(!order){
        throw new apierror(404,"order not found")
    }

    if(order.user_id.toString() !== req.user._id.toString()){
        throw new apierror(403,"not allowed")
    }

    order.status = "cancelled"
    await order.save()

    return res.status(200).json(
        new apiresponse(200,order,"order cancelled successfully")
    )
})

const getSingleOrder = asynchandler(async(req,res,next)=>{
    const {orderId} = req.params

    const order = await Order.findById(orderId)

    if(!order){
        throw new apierror(404,"order not found")
    }

    return res.status(200).json(
        new apiresponse(200,order,"order fetched successfully")
    )
})


// getSellerOrders
const getSellerOrders = asynchandler(async(req,res,next)=>{

    const orders = await Order.find({
        "products.productOwner":req.user._id
    })

    return res.status(200).json(
        new apiresponse(
            200,
            orders,
            "seller orders fetched successfully"
        )
    )
})

const updateOrderStatus = asynchandler(async (req, res,next) => {
  const {orderId} = req.params;
  const {status} = req.body;

  const allowedStatus = [
    "placed",
    "confirmed",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled"
  ];

  if (!allowedStatus.includes(status)) {
    throw new apierror(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new apierror(404, "Order not found");
  }

  order.status = status;

  order.trackingHistory.push({
    status,
    message: `Order ${status}`,
    updatedBy: req.user._id
  });

  await order.save();

  return res.status(200).json(
    new apiresponse(200, order, "Order status updated")
  );
});

const trackOrder = asynchandler(async (req, res,next) => {
  const {orderId} = req.params;

  const order = await Order.findOne({
    _id: orderId,
    user_id: req.user._id
  }).select("status trackingHistory");

  if (!order) {
    throw new apierror(404, "Order not found");
  }

  return res.status(200).json(
    new apiresponse(200, order, "Order tracking fetched")
  );
});

export {
    createOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    updateOrderStatus,
    getSellerOrders,
    trackOrder
}
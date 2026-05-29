import {Router} from "express"

import {
    createOrder,
    getMyOrders,
    getSingleOrder,
    cancelOrder,
    updateOrderStatus,
    getSellerOrders,
    trackOrder
} from "../controllers/order.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()


// create order
router.route("/create")
.post(
    verifyJWT,
    verifyCustomer,
    createOrder
)


// get my orders
router.route("/my-orders")
.get(
    verifyJWT,
    verifyCustomer,
    getMyOrders
)


// get single order
router.route("/:orderId")
.get(
    verifyJWT,
    getSingleOrder
)


// cancel order
router.route("/:orderId/cancel")
.patch(
    verifyJWT,
    verifyCustomer,
    cancelOrder
)





// seller routes


// seller orders
router.route("/seller/orders")
.get(
    verifyJWT,
    verifySeller,
    getSellerOrders
)


// update order status
router.route("/:orderId/status")
.patch(
    verifyJWT,
    verifySeller,
    updateOrderStatus
)

// track order
router.route("/:orderId/track")
.get(
    verifyJWT,
    verifyCustomer,
    trackOrder
)



export default router


import {Router} from "express"

import  {
    addProduct,
    updateProduct,
    deleteProduct,
    getSellerProducts,
    getAllProducts,
    getSingleProduct,
    searchProducts
} from "../controllers/product.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()

router.route("/search")
.get(searchProducts)


router.route("/")
.get(getAllProducts)


// get single product
router.route("/:productId")
.get(getSingleProduct)





// seller protected routes

// create product
router.route("/create")
.post(
    verifyJWT,
    verifySeller,

    upload.fields([
        {
            name:"images",
            maxCount:5
        }
    ]),

    addProduct
)




// update product
router.route("/:productId")
.patch(
    verifyJWT,
    verifySeller,

    upload.fields([
        {
            name:"images",
            maxCount:5
        }
    ]),

    updateProduct
)




// delete product
router.route("/:productId")
.delete(
    verifyJWT,
    verifySeller,
    deleteProduct
)




// seller products
router.route("/seller/my-products")
.get(
    verifyJWT,
    verifySeller,
    getSellerProducts
)



export default router


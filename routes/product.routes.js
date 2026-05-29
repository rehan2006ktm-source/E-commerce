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

const router=Router()

router.route("/search").get(searchProducts);

router.route("/").get(getAllProducts);

// seller protected routes (must be before /:productId)
router.route("/seller/my-products").get(verifyJWT, verifySeller, getSellerProducts);

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
);

// get single product
router.route("/:productId").get(getSingleProduct);

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
);

export default router;


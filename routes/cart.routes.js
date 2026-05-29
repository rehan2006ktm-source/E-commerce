import {Router} from "express"

import { 
    addToCart, 
    getCart,              // Assumes you renamed the duplicate function
    updateCartQuantity, 
    removeFromCart, 
    clearCart 
} from "../controllers/cart.controllers.js";

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()

router.use(verifyJWT, verifyCustomer);

// Route to handle getting the cart and adding products to the cart
router.route("/")
    .get(getCart)
    .post(addToCart);

// Route to update product quantity or remove a single product from the cart
router.route("/item")
    .patch(updateCartQuantity)
    .delete(removeFromCart);

// Route to clear the entire cart
router.route("/clear")
    .delete(clearCart);

export default router;
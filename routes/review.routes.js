import {Router} from "express"

import  {
    addReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getMyReviews
} from "../controllers/review.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()

router.route("/product/:productId")
    .get(getProductReviews);


// --- PROTECTED ROUTES (Requires Login) ---
// Apply authentication middleware to all routes listed below this line
router.use(verifyJWT); 

// Base review route
router.route("/")
    .post(addReview);      // Expects productId, rating, comment in req.body

// Fetch reviews written by the logged-in user
router.route("/me")
    .get(getMyReviews);

// Manage specific individual reviews
router.route("/:reviewId")
    .put(updateReview)     // Checks if req.user._id matches the author
    .delete(deleteReview); // Checks if req.user._id matches the author

export default router;

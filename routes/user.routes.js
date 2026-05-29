import {Router} from "express"

import {registerUser,loginuser,logout,getCurrentUser,
    updateProfile,
    changePassword }
 from "../controllers/user.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import { optionalAvatarUpload } from "../middlewares/optionalUpload.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"
import {verifyAdmin} from "../middlewares/verifyadmin.middleware.js"
const router=Router()


// public routes
router.route("/register").post(optionalAvatarUpload, registerUser);

router.route("/login").post(loginuser)


// protected routes
router.route("/logout").post(
    verifyJWT,
    logout
)

router.route("/current-user").get(
    verifyJWT,
    getCurrentUser
)

router.route("/update-profile").patch(
    verifyJWT,
    updateProfile
)

router.route("/change-password").patch(
    verifyJWT,
    changePassword
)


// only customer route example
router.route("/customer/profile").get(
    verifyJWT,
    verifyCustomer,
    getCurrentUser
)


// only seller route example
router.route("/seller/profile").get(
    verifyJWT,
    verifySeller,
    getCurrentUser
)


export default router
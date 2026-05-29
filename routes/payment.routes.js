import {Router} from "express"

import  {
    createPayment,
    getMyPayments,
    getSinglePayment,
    updatePaymentStatus,
    deletePayment
} from "../controllers/payment.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()



router.use(verifyJWT);

// Route: /api/v1/payments
router.route("/")
    .post(createPayment)   // Process a new payment (expects order_id, mode_of_payment, etc.)
    .get(getMyPayments);   // Fetch all payments belonging to the logged-in user

// Route: /api/v1/payments/:paymentId
router.route("/:paymentId")
    .get(getSinglePayment)       // Fetch specific payment details by ID
    .patch(updatePaymentStatus)  // Update payment status (e.g., from "pending" to "paid")
    .delete(deletePayment);      // Delete a record (Controller internally checks if user is Admin)

export default router;
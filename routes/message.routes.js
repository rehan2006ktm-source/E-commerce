import {Router} from "express"

import  {
    sendMessage,
    getMyMessages,
    getConversation,
    markAsRead,
    deleteMessage
} from "../controllers/message.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifySeller} from "../middlewares/verifyseller.middleware.js"
import {verifyCustomer} from "../middlewares/verifycustomer.middleware.js"

const router=Router()



router.route("/send")
.post(
    verifyJWT,
    sendMessage
)



// all my messages
router.route("/my-messages")
.get(
    verifyJWT,
    getMyMessages
)



// single conversation with another user
router.route("/conversation/:receiverId")
.get(
    verifyJWT,
    getConversation
)



// mark message as read
router.route("/:messageId/read")
.patch(
    verifyJWT,
    markAsRead
)



// delete message
router.route("/:messageId")
.delete(
    verifyJWT,
    deleteMessage
)



export default router
import {Router} from "express"

import  {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    getSubCategories,
    getCategoryProducts
} from "../controllers/category.controllers.js"

import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyAdmin} from "../middlewares/verifyadmin.middleware.js"

const router=Router()


router.route("/")
    .get(getAllCategories)
    // upload.fields or upload.single depending on how your multer is configured.
    // It's needed because createCategory checks for req.files?.image
    .post(verifyJWT, verifyAdmin, upload.fields([{ name: "image", maxCount: 1 }]), createCategory);

// Route: /api/v1/categories/:categoryId
router.route("/:categoryId")
    .get(getSingleCategory)
    .put(verifyJWT, verifyAdmin, updateCategory)    // You can use .patch() if you prefer partial updates
    .delete(verifyJWT, verifyAdmin, deleteCategory);

// Route: /api/v1/categories/:categoryId/products
router.route("/:categoryId/products")
    .get(getCategoryProducts);

// Route: /api/v1/categories/:categoryId/subcategories
router.route("/:categoryId/subcategories")
    .get(getSubCategories);

export default router;
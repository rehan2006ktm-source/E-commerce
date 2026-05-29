import express from'express'
const app=express()

import cors from 'cors'
import cookieParser from 'cookie-parser'

import dotenv from "dotenv";
dotenv.config( {path:'./.env'});


// Reflect request origin (works with credentials + localhost + deployed frontends).
// Do NOT use app.options("*") — Express 5 path-to-regexp rejects "*" and crashes.
app.use(
    cors({
        origin: true,
        credentials: true,
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

app.use(express.static("public"));
app.use(
    express.json({
        limit: "16kb",
    }),
);
app.use(
    express.urlencoded({
        limit: "16kb",
        extended: true,
    }),
);
app.use(cookieParser());


import userRouter from "./routes/user.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js"; // Use your actual product route file
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import reviewRouter from "./routes/review.routes.js";
import messageRouter from "./routes/message.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// --- 2. MOUNT THE ROUTERS (API Route Declarations) ---
// Prefixing with /api/v1 is standard practice for version control in APIs

app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/messages", messageRouter);

app.use(errorHandler);

export default app
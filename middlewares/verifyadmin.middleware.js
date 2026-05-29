import apierror from "../utils/apierror.js"

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return next(new apierror(403, "admin access required"));
    }
    next();
};

export {verifyAdmin}
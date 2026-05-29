import apierror from "../utils/apierror.js"

const verifyCustomer = (req, res, next) => {
    if (req.user.role !== "customer") {
        return next(new apierror(403, "only customer allowed"));
    }
    next();
};
export {verifyCustomer}
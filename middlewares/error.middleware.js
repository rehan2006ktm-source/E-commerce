import apierror from "../utils/apierror.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const statusCode = err instanceof apierror ? err.statuscode : err.statusCode || 500;
  const message = err.message || "Internal server error";

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    statuscode: statusCode,
    message,
    success: false,
  });
};

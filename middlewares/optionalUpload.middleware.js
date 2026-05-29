import { upload } from "./multer.middleware.js";

/** Run multer only for multipart requests (optional avatar file). */
export const optionalAvatarUpload = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("multipart/form-data")) {
    return next();
  }
  return upload.single("avatar")(req, res, next);
};

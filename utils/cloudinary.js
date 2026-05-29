import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
})

const uploadOnCloud = async (filepath) => {
  try {
    if (!filepath) return null

    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
      throw new Error("Cloudinary environment variables are missing")
    }

    const fileurl = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto"
    })

    fs.unlinkSync(filepath)
    return fileurl
  } catch (error) {
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
    console.log("Cloudinary upload error:", error?.message || error)
    return null
  }
}

export default uploadOnCloud

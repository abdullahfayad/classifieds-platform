import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  fileBuffer: ArrayBuffer,
  folder: string = "classifieds"
) {
  return new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 1000, crop: "limit" }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Failed to upload image"));
          }
          resolve(result.secure_url);
        }
      )
      .end(Buffer.from(fileBuffer));
  });
}

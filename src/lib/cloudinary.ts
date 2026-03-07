import { v2 as cloudinary } from 'cloudinary';

// Configure with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(fileBuffer: Uint8Array, mimeType: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "controle-combustivel",
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error("Unknown error during Cloudinary upload"));
                }
            }
        );

        // Write the buffer to the upload stream
        uploadStream.end(fileBuffer);
    });
}

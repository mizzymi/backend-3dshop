import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = (
    buffer: Buffer,
    folder = "reimii-3d/products"
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error || !result) {
                    return reject(error);
                }

                resolve(result.secure_url);
            }
        );

        stream.end(buffer);
    });
};
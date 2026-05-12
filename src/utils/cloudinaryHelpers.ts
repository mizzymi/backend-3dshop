import cloudinary from "../config/cloudinary";

export const getCloudinaryPublicId = (url: string) => {
  const uploadIndex = url.indexOf("/upload/");

  if (uploadIndex === -1) {
    return null;
  }

  const path = url.substring(uploadIndex + 8);

  const withoutVersion = path.replace(/^v\d+\//, "");

  return withoutVersion.replace(/\.[^/.]+$/, "");
};

export const deleteCloudinaryImage = async (url: string) => {
  const publicId = getCloudinaryPublicId(url);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error borrando imagen de Cloudinary:", error);
  }
};

export const deleteCloudinaryImages = async (urls: string[]) => {
  await Promise.all(urls.map((url) => deleteCloudinaryImage(url)));
};

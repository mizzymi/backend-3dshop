import { Request, Response } from "express";
import Product from "../models/Product";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { deleteCloudinaryImages, uploadToProducts, uploadToReviews } from "../utils/cloudinaryHelpers";

const parseArray = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Error obteniendo productos" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json(product);
  } catch {
    res.status(500).json({ message: "Error obteniendo producto" });
  }
};

export const createProductWithImages = async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    const productImageFiles = files.filter(
      (file) => file.fieldname === "images",
    );

    const imageUrls = productImageFiles.length
      ? await Promise.all(
          productImageFiles.map((file) => uploadToProducts(file.buffer)),
        )
      : [];

    const modifiers = parseArray(req.body.modifiers);

    for (const modifier of modifiers) {
      for (const option of modifier.options || []) {
        const fieldName = `modifier_option_image_${modifier.id}_${option.id}`;

        const optionImageFile = files.find(
          (file) => file.fieldname === fieldName,
        );

        if (optionImageFile) {
          option.image = await uploadToProducts(optionImageFile.buffer);
        }
      }
    }

    const product = await Product.create({
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      weight: Number(req.body.weight || 0),
      width: Number(req.body.width || 0),
      height: Number(req.body.height || 0),
      depth: Number(req.body.depth || 0),
      category: parseArray(req.body.category),
      customizable: req.body.customizable === "true",
      featured: req.body.featured === "true",
      colors: parseArray(req.body.colors),
      sizes: parseArray(req.body.sizes),
      modifiers,
      images: imageUrls,
    });

    res.status(201).json({
      message: "Producto creado con imágenes correctamente",
      product,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error creando producto con imágenes",
      error: error.message || error,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];

    const oldProduct = await Product.findById(req.params.id);

    if (!oldProduct) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const productImageFiles = files.filter(
      (file) => file.fieldname === "images",
    );

    const newImageUrls = productImageFiles.length
      ? await Promise.all(
          productImageFiles.map((file) => uploadToProducts(file.buffer)),
        )
      : [];

    const existingImages = parseArray(req.body.existingImages);

    const imagesToDelete = (oldProduct.images || []).filter(
      (image: string) => !existingImages.includes(image),
    );

    if (imagesToDelete.length > 0) {
      await deleteCloudinaryImages(imagesToDelete);
    }

    const modifiers = parseArray(req.body.modifiers);

    for (const modifier of modifiers) {
      for (const option of modifier.options || []) {
        const fieldName = `modifier_option_image_${modifier.id}_${option.id}`;

        const optionImageFile = files.find(
          (file) => file.fieldname === fieldName,
        );

        if (optionImageFile) {
          option.image = await uploadToProducts(optionImageFile.buffer);
        }
      }
    }

    const updateData: any = {
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,

      category: parseArray(req.body.category),

      price: Number(req.body.price),
      stock: Number(req.body.stock),

      weight: Number(req.body.weight || 0),
      width: Number(req.body.width || 0),
      height: Number(req.body.height || 0),
      depth: Number(req.body.depth || 0),

      customizable:
        req.body.customizable === "true" || req.body.customizable === true,

      featured: req.body.featured === "true" || req.body.featured === true,

      colors: parseArray(req.body.colors),
      sizes: parseArray(req.body.sizes),

      modifiers,

      images: [...existingImages, ...newImageUrls],
    };

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || Number.isNaN(updateData[key])) {
        delete updateData[key];
      }
    });

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Producto actualizado correctamente",
      product,
    });
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Error actualizando producto",
      error: error.message || error,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.images?.length > 0) {
      await deleteCloudinaryImages(product.images);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      message: "Producto eliminado correctamente",
    });
  } catch (error: any) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Error eliminando producto",
      error: error.message || error,
    });
  }
};

export const addProductReview = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        message: "Rating y comentario son obligatorios",
      });
    }

    const ratingNumber = Number(rating);

    if (ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        message: "El rating debe estar entre 1 y 5",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "Ya has dejado una reseña en este producto",
      });
    }

    // =========================
    // SUBIR IMÁGENES
    // =========================

    const uploadedImages: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const imageUrl = await uploadToReviews(file.buffer);

        uploadedImages.push(imageUrl);
      }
    }

    // =========================
    // CREAR REVIEW
    // =========================

    product.reviews.push({
      user: user._id,
      username: user.username,
      profileImage: user.profileImage,
      rating: ratingNumber,
      comment,
      images: uploadedImages,
    } as any);

    product.ratingCount = product.reviews.length;

    product.ratingAverage =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    user.myReviews.push({
      product: product._id,
      rating: ratingNumber,
      comment,
    } as any);

    await product.save();
    await user.save();

    res.status(201).json({
      message: "Reseña añadida correctamente",
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al añadir reseña",
    });
  }
};

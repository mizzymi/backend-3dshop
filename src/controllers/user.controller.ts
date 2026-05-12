import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";
import Product from "../models/Product";
import { deleteCloudinaryImage } from "../utils/cloudinaryHelpers";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" },
  );
};

const uploadProfileImage = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "reimii/profile-images",
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      },
    );

    stream.end(fileBuffer);
  });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El correo o username ya está en uso",
      });
    }

    let profileImage: string | undefined;

    if (req.file) {
      profileImage = await uploadProfileImage(req.file.buffer);
    }

    const user = await User.create({
      username,
      email,
      password,
      name,
      profileImage,
    });

    res.status(201).json({
      message: "Usuario creado correctamente",
      token: generateToken(user),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        shippingAddresses: user.shippingAddresses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({
      message: "Login correcto",
      token: generateToken(user),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        shippingAddresses: user.shippingAddresses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      profileImage: user.profileImage,
      shippingAddresses: user.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
};

export const editProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { username, email, name } = req.body;

    if (username && username !== user.username) {
      const exists = await User.findOne({ username });
      if (exists) {
        return res.status(400).json({ message: "Ese username ya existe" });
      }

      user.username = username;
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: "Ese correo ya está en uso" });
      }

      user.email = email;
    }

    if (name) user.name = name;

    if (req.file) {
      const oldProfileImage = user.profileImage;

      const newProfileImage = await uploadProfileImage(req.file.buffer);

      user.profileImage = newProfileImage;

      if (oldProfileImage) {
        await deleteCloudinaryImage(oldProfileImage);
      }
    }

    await user.save();

    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        shippingAddresses: user.shippingAddresses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al editar perfil" });
  }
};

export const addShippingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.shippingAddresses.push(req.body);

    await user.save();

    res.json({
      message: "Dirección añadida correctamente",
      shippingAddresses: user.shippingAddresses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al añadir dirección" });
  }
};

export const toggleSavedProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const alreadySaved = user.savedProducts.some(
      (id) => id.toString() === productId,
    );

    if (alreadySaved) {
      user.savedProducts = user.savedProducts.filter(
        (id) => id.toString() !== productId,
      );
    } else {
      user.savedProducts.push(product._id as any);
    }

    await user.save();

    await user.populate("savedProducts");

    res.json({
      message: alreadySaved
        ? "Producto eliminado de guardados"
        : "Producto guardado",
      savedProducts: user.savedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar producto" });
  }
};

export const getSavedProducts = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate("savedProducts");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user.savedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener guardados" });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId,
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({
        product: productId,
        quantity: Number(quantity),
      } as any);
    }

    await user.save();

    await user.populate("cart.product");

    res.json({
      message: "Producto añadido al carrito",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al añadir al carrito" });
  }
};

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const item = user.cart.find(
      (cartItem) => cartItem.product.toString() === productId,
    );

    if (!item) {
      return res
        .status(404)
        .json({ message: "Producto no está en el carrito" });
    }

    item.quantity = Number(quantity);

    if (item.quantity <= 0) {
      user.cart = user.cart.filter(
        (cartItem) => cartItem.product.toString() !== productId,
      );
    }

    await user.save();

    await user.populate("cart.product");

    res.json({
      message: "Carrito actualizado",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar carrito" });
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId,
    );

    await user.save();

    await user.populate("cart.product");

    res.json({
      message: "Producto eliminado del carrito",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar producto del carrito" });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.cart = [];

    await user.save();

    res.json({
      message: "Carrito vaciado",
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
};

export const getMyReviews = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate(
      "myReviews.product",
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user.myReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus reseñas" });
  }
};

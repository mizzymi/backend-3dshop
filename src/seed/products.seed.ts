import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product";

dotenv.config();

const products = [
    {
        name: "Dragón articulado 3D",
        slug: "dragon-articulado-3d",
        description:
            "Figura de dragón articulado impresa en 3D. Ideal como decoración, regalo o pieza de colección.",
        price: 19.99,
        images: [
            "https://placehold.co/600x600?text=Dragon+3D"
        ],
        category: "Figuras",
        colors: ["Negro", "Blanco", "Rojo", "Azul", "Verde"],
        sizes: ["Pequeño", "Mediano", "Grande"],
        stock: 15,
        customizable: true,
        featured: true
    },
    {
        name: "Llavero personalizado",
        slug: "llavero-personalizado",
        description:
            "Llavero impreso en 3D con nombre, iniciales o diseño personalizado.",
        price: 7.99,
        images: [
            "https://placehold.co/600x600?text=Llavero+3D"
        ],
        category: "Llaveros",
        colors: ["Negro", "Blanco", "Rosa", "Azul", "Morado"],
        sizes: ["Único"],
        stock: 40,
        customizable: true,
        featured: true
    },
    {
        name: "Kit De jugador DND",
        slug: "reimii-dnd-box-stats-dice",
        description: `
Sistema completo para juegos de rol impreso en 3D.

Incluye paneles de stats ajustables, panel de habilidades, compartimentos para dados y bandeja central.

Diseñado para jugadores de DnD y juegos de rol que buscan una experiencia más inmersiva y organizada en mesa.

Características:
- Panel de estadísticas con diales ajustables
- Panel de habilidades
- Compartimentos para dados
- Bandeja central
- Diseño plegable tipo caja
- Acabado personalizable

Ideal para campañas, sesiones y regalo para jugadores.
`,
        price: 59.99,
        images: [
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891696/IMG_20260504_095955_dksncc.jpg",
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891811/IMG_20260504_100114_ofae1a.jpg",
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891810/IMG_20260504_100124_hri5fs.jpg",
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891809/IMG_20260504_100134_c3jwjg.jpg",
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891810/IMG_20260504_100147_b9heke.jpg",
            "https://res.cloudinary.com/dlfywvn89/image/upload/v1777891816/IMG_20260504_100214_pyq0hu.jpg"
        ],
        category: "Gaming",
        colors: ["Negro + Dorado", "Negro + Blanco", "Custom"],
        sizes: ["Único"],
        stock: 5,
        customizable: true,
        featured: true
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);

        await Product.deleteMany();
        await Product.insertMany(products);

        console.log("Productos insertados correctamente");
        process.exit(0);
    } catch (error) {
        console.error("Error insertando productos:", error);
        process.exit(1);
    }
};

seedProducts();
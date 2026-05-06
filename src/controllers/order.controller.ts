import { Request, Response } from "express";
import Order from "../models/Order";
import Product from "../models/Product";

export const createOrder = async (req: Request, res: Response) => {
    const session = await Order.startSession();

    try {
        session.startTransaction();

        const { customerName, email, phone, items } = req.body;

        const productIds = items.map((item: any) => item.productId);

        const products = await Product.find({
            _id: { $in: productIds }
        }).session(session);

        if (products.length !== productIds.length) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Uno o más productos no existen"
            });
        }

        const orderItems = [];

        for (const item of items) {
            const product = products.find(
                (p) => p._id.toString() === item.productId
            );

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para ${product.name}`);
            }

            product.stock -= item.quantity;
            await product.save({ session });

            const subtotal = product.price * item.quantity;

            orderItems.push({
                productId: product._id.toString(),
                name: product.name,
                quantity: item.quantity,
                unitPrice: product.price,
                subtotal,
                color: item.color,
                size: item.size
            });
        }

        const total = orderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const [order] = await Order.create(
            [
                {
                    customerName,
                    email,
                    phone,
                    items: orderItems,
                    total,
                    status: "pending"
                }
            ],
            { session }
        );

        await session.commitTransaction();

        res.status(201).json({
            message: "Pedido creado correctamente",
            order
        });
    } catch (error: any) {
        await session.abortTransaction();

        res.status(400).json({
            message: error.message || "Error creando pedido"
        });
    } finally {
        session.endSession();
    }
};

export const getOrders = async (_req: Request, res: Response) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch {
        res.status(500).json({ message: "Error obteniendo pedidos" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        res.json(order);
    } catch {
        res.status(500).json({ message: "Error obteniendo pedido" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        const validStatuses = [
            "pending",
            "paid",
            "processing",
            "shipped",
            "cancelled"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Estado no válido" });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        res.json({
            message: "Estado del pedido actualizado",
            order
        });
    } catch {
        res.status(500).json({ message: "Error actualizando pedido" });
    }
};
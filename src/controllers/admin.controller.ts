import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import CustomRequest from '../models/CustomRequest';

const generateToken = (user: any) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET as string,
        {
            expiresIn: '30d'
        }
    );
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({
            email,
            role: 'admin'
        }).select('+password');

        if (!admin) {
            return res.status(401).json({
                message: 'Admin no encontrado'
            });
        }

        const validPassword = await admin.comparePassword(password);

        if (!validPassword) {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }

        res.json({
            token: generateToken(admin),
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                profileImage: admin.profileImage
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error login admin'
        });
    }
};

export const getAdminStats = async (
    _req: Request,
    res: Response
) => {
    try {
        const [
            products,
            orders,
            customs
        ] = await Promise.all([
            Product.countDocuments(),
            Order.find(),
            CustomRequest.countDocuments()
        ]);

        const revenue = orders.reduce(
            (acc, order: any) => acc + Number(order.total || 0),
            0
        );

        const latestOrder = await Order.findOne()
            .sort({ createdAt: -1 });

        const latestCustom = await CustomRequest.findOne()
            .sort({ createdAt: -1 });

        res.json({
            stats: {
                products,
                orders: orders.length,
                customs,
                revenue
            },

            latestOrder,
            latestCustom
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error obteniendo estadísticas'
        });
    }
};
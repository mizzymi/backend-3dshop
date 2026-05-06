import express from "express";
import cors from "cors";

import webhookRoutes from "./routes/webhook.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import customRequestRoutes from "./routes/customRequest.routes";
import uploadRoutes from "./routes/upload.routes";
import authRoutes from "./routes/auth.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();

app.use(cors());

app.use("/api/webhooks", webhookRoutes);

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({ message: "API Reimii 3D funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);

export default app;
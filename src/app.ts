import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import customRequestRoutes from "./routes/customRequest.routes";
import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "API Reimii 3D funcionando" });
});

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/custom-requests", customRequestRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);

export default app;

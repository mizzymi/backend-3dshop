import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { transporter } from "./config/mailer";

dotenv.config();

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP ERROR:", error);
    } else {
        console.log("SMTP listo para enviar emails");
    }
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
});
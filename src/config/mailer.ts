import nodemailer from "nodemailer";

const requiredEnv = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS"
];

for (const key of requiredEnv) {
    if (!process.env[key]) {
        throw new Error(`Falta ${key} en .env`);
    }
}

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
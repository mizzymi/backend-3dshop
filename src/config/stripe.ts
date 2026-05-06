import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Falta STRIPE_SECRET_KEY en el archivo .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;
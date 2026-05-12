import dotenv from "dotenv";
import SumUpClient from "@sumup/sdk";

dotenv.config();

if (!process.env.SUMUP_API_KEY) {
  throw new Error("Falta SUMUP_API_KEY en el archivo .env");
}

const sumup = new SumUpClient({
  apiKey: process.env.SUMUP_API_KEY,
});

export default sumup;

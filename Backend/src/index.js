import express from "express";
import { PORT } from "./config.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Buenos Dias</h1>");
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Bienvenidos al himalaya ${PORT} `);
});

import express from "express";
import { PORT } from "./config.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:" http://localhost:5173",
  credentials: true,
}))

app.get("/", (req, res) => {
  res.send("<h1>Buenos Dias</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes)

app.listen(PORT, () => {
  console.log(`Bienvenidos al himalaya ${PORT} `);
});

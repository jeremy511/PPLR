import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { PORT } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/authRoutes.js";
import initGoogleAuth from "./routes/googleAuth.js";

// 1) load env
dotenv.config();

const app = express();

// 2) middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// 3) init google strategy
initGoogleAuth();

// 4) initialize passport
app.use(passport.initialize());

// routes
app.get("/", (req, res) => {
  res.send("<h1>Buenos Dias</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.listen(PORT, () => {
  console.log(`Bienvenidos al himalaya ${PORT}`);
});

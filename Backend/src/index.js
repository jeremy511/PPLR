import express from "express";
import passport from "passport";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { PORT, CLIENT_URL } from "./config.js";
import authRoutes from "./routes/authRoutes.js";
import initGoogleAuth from "./routes/googleAuth.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import zoneRoutes from "./routes/zoneRoutes.js";

import logger from "./utils/logger.js";
import errorHandler from "./Middleware/errorHandler.js";

// 1) load env
dotenv.config();

export const app = express();

// 2) middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// Request logging via pino (optional, can also use pino-http)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.info({ method: req.method, url: req.url }, "Incoming Request");
  }
  next();
});

// 3) init google strategy
initGoogleAuth();

// 4) initialize passport
app.use(passport.initialize());

// routes
app.get("/", (req, res) => {
  res.send("<h1>Buenos Dias</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/zones", zoneRoutes);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Bienvenidos al himalaya ${PORT}`);
  });
}

process.on("uncaughtException", (err) => {
  logger.fatal(err, "UNCAUGHT EXCEPTION! 💥 Shutting down...");
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(err, "UNHANDLED REJECTION! 💥");
});


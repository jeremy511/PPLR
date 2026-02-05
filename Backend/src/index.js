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

import { logger } from "./utils/logger.js";
import errorHandler from "./Middleware/errorHandler.js";

// 1) load env
dotenv.config();

export const app = express();
app.set("trust proxy", 1);

// 2) middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// DEBUGGING: Log incoming cookies
app.use((req, res, next) => {
  console.log("DEBUG COOKIES:", req.cookies);
  console.log("DEBUG HEADERS:", req.headers);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigin = CLIENT_URL.endsWith('/') ? CLIENT_URL.slice(0, -1) : CLIENT_URL;
      
      if (origin === allowedOrigin || origin === CLIENT_URL) {
        return callback(null, allowedOrigin);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
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


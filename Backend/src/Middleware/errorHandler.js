import logger from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    logger.error({
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    logger.error({
      message: err.message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
};

export default errorHandler;

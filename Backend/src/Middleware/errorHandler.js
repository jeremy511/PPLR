import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";
import { randomUUID } from "crypto";

/**
 * Traduce errores técnicos de Prisma/DB a mensajes amigables para el usuario.
 * Nunca expone detalles internos de la base de datos.
 */
const handlePrismaError = (err) => {
  // P2002: Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'campo';
    const friendlyFields = { email: 'correo electrónico', phone: 'teléfono' };
    const label = friendlyFields[field] || field;
    return new AppError(`Ya existe una cuenta con ese ${label}.`, 409);
  }
  // P2025: Record not found
  if (err.code === 'P2025') {
    return new AppError('El recurso solicitado no existe.', 404);
  }
  // P2003: Foreign key constraint
  if (err.code === 'P2003') {
    return new AppError('Operación no válida: referencia a un recurso que no existe.', 400);
  }
  // P2014: Relation violation
  if (err.code === 'P2014') {
    return new AppError('No se puede completar la operación debido a dependencias existentes.', 400);
  }
  return null; // Unknown Prisma error — will be treated as internal
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // --- Handle known Prisma/DB errors ---
  if (err.name === 'PrismaClientKnownRequestError' || err.code?.startsWith('P')) {
    const prismaErr = handlePrismaError(err);
    if (prismaErr) {
      logger.warn({ code: err.code, meta: err.meta, url: req.originalUrl }, "Prisma known error");
      return res.status(prismaErr.statusCode).json({
        status: prismaErr.status,
        message: prismaErr.message,
      });
    }
  }

  // --- Log appropriately based on environment ---
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
      statusCode: err.statusCode,
    });
  }

  // --- Operational errors: safe to send to client ---
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // --- Unknown/programming errors: never leak internals ---
  const errorId = randomUUID().split('-')[0].toUpperCase();
  logger.error({ errorId, err: err.message, stack: err.stack }, "Unhandled error");

  return res.status(500).json({
    status: "error",
    message: "Ocurrió un problema inesperado. Por favor intenta de nuevo.",
    ...(process.env.NODE_ENV === 'development' && {
      dev_message: err.message,
      dev_stack: err.stack,
    }),
    errorId, // El usuario puede reportar este código al soporte
  });
};

export default errorHandler;

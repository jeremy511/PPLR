/**
 * Custom application error for frontend API and business logic.
 * Follows patterns from .agents/skills/error-handling-patterns
 */
export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = options.statusCode || 500;
    this.errorId = options.errorId || null;
    this.errors = options.errors || null;
    this.isNetwork = Boolean(options.isNetwork);
    this.devMessage = options.devMessage || null;
    this.devStack = options.devStack || null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Traduce un error técnico o excepción a un mensaje legible para el usuario final.
 * Oculta detalles internos (stack traces, SQL, códigos HTTP crudos) y proporciona
 * explicaciones claras y accionables.
 */
export function getUserErrorMessage(error, defaultFallback = "Ha ocurrido un problema inesperado. Por favor, intenta de nuevo.") {
  if (!error) return defaultFallback;

  // Si es un ApiError con errorId (código de soporte de backend para 500)
  if (error instanceof ApiError) {
    if (error.isNetwork) {
      return "No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.";
    }
    if (error.errorId) {
      return `${error.message || defaultFallback} (Código de referencia: ${error.errorId})`;
    }
    if (error.message) {
      return error.message;
    }
  }

  // Si es un Error estándar con mensaje
  const msg = typeof error === "string" ? error : error.message;

  if (!msg) return defaultFallback;

  // Detectar errores comunes de red del navegador
  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("Load failed") ||
    msg.includes("ERR_CONNECTION_REFUSED")
  ) {
    return "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.";
  }

  // Detectar errores con código HTTP crudo (ej: "Error 500: Internal Server Error")
  if (/^Error\s+5\d{2}/i.test(msg) || msg.includes("Internal Server Error")) {
    return "El servicio no está disponible en este momento. Por favor, intenta de nuevo en unos minutos.";
  }
  if (/^Error\s+404/i.test(msg) || msg.includes("Not Found")) {
    return "El recurso solicitado no fue encontrado.";
  }
  if (/^Error\s+403/i.test(msg) || msg.includes("Forbidden")) {
    return "No tienes permiso para realizar esta acción.";
  }
  if (/^Error\s+401/i.test(msg) || msg.includes("Unauthorized")) {
    return "Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión nuevamente.";
  }

  return msg;
}

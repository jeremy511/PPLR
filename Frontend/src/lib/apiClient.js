// Simple wrapper around fetch to centralize configuration
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

import { ApiError } from "./errors.js";

// Helper to provide friendly messages for HTTP status codes when server provides no message
const STATUS_MESSAGES = {
  400: "Los datos enviados son incorrectos o incompletos.",
  401: "Tu sesión ha expirado o las credenciales no son válidas.",
  403: "No tienes permiso para realizar esta acción.",
  404: "El recurso solicitado no fue encontrado.",
  409: "Ya existe un registro con esta información.",
  422: "La información ingresada no cumple con el formato requerido.",
  429: "Demasiadas peticiones. Por favor, espera un momento.",
  500: "Ocurrió un problema en el servidor. Por favor, intenta de nuevo.",
  502: "El servidor no responde en este momento. Intenta más tarde.",
  503: "El servicio se encuentra temporalmente en mantenimiento.",
};

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Default headers and credentials
    const defaultOptions = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    let response;
    try {
      response = await fetch(url, defaultOptions);
    } catch (networkError) {
      if (import.meta.env.DEV) {
        console.warn(`[API Network Error] ${options.method || "GET"} ${endpoint}:`, networkError);
      }
      throw new ApiError(
        "No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.",
        {
          isNetwork: true,
          statusCode: 0,
          devMessage: networkError.message,
        }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Pick user-friendly message, preferring the backend operational message if present
      let message = errorData.message || errorData.error;
      if (!message || message.startsWith("Error ")) {
        message = STATUS_MESSAGES[response.status] || "Ocurrió un problema al procesar la solicitud.";
      }

      // If there's an error reference ID from backend (for 500s)
      if (errorData.errorId && !message.includes(errorData.errorId)) {
        message = `${message} (Ref: ${errorData.errorId})`;
      }

      if (import.meta.env.DEV) {
        console.warn(`[API ${response.status}] ${options.method || "GET"} ${endpoint}:`, {
          message,
          errorData,
        });
      }

      throw new ApiError(message, {
        statusCode: response.status,
        errorId: errorData.errorId || null,
        errors: errorData.errors || null,
        devMessage: errorData.dev_message || null,
        devStack: errorData.dev_stack || null,
      });
    }

    // Return null for 204 No Content, otherwise JSON
    if (response.status === 204) return null;
    return await response.json();
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(BASE_URL);

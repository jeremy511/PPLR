// Simple wrapper around fetch to centralize configuration
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Prioritize 'message' which is what AppError uses
        const message = errorData.message || errorData.error || errorData.details || `Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      // Return null for 204 No Content, otherwise JSON
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
       // Here we could add a centralized error logger or toast notification logic
       // console.error("API Call Failed:", error);
       throw error;
    }
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

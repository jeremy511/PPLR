import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error("FATAL ERROR: JWT_SECRET environment variable is not defined. Refusing to run in production without a secure secret.");
  } else {
    console.warn("⚠️  [AVISO DE SEGURIDAD] JWT_SECRET no está configurado en .env. Se usará un secreto provisional para desarrollo local.");
    jwtSecret = "pplr-local-dev-fallback-secret-key-32chars!";
  }
}

export const JWT_SECRET = jwtSecret;

export const { 
  PORT = 3000, 
  CLIENT_URL = "http://localhost:5173",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY,
  BREVO_API_KEY,
  SENDER_EMAIL,
  API_URL = "http://localhost:3000"
} = process.env;


import "dotenv/config";

export const { 
  PORT = 3000, 
  CLIENT_URL = "http://localhost:5173",
  JWT_SECRET = "supersecret",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY,
  BREVO_API_KEY,
  SENDER_EMAIL,
  API_URL = "http://localhost:3000"
} = process.env;

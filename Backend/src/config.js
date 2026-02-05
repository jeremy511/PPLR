import "dotenv/config";

export const { 
  PORT = 3000, 
  CLIENT_URL = "http://localhost:5173",
  JWT_SECRET = "supersecret",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  RESEND_API_KEY,
  GMAIL_USER,
  GMAIL_PASS,
  API_URL = "http://localhost:3000"
} = process.env;

import "dotenv/config";

export const { 
  PORT = 3000, 
  FRONTEND_URL = "http://localhost:5173",
  JWT_SECRET = "supersecret",
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
} = process.env;

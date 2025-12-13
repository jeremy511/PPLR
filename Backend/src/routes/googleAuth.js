// src/routes/googleAuth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

import { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../config.js";

export default function initGoogleAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        let user = await prisma.publisher.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.publisher.create({
            data: {
              email,
              name: profile.displayName,
              password: "",
            },
          });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,);
      
        return done(null, {
          id: user.id,
          email: user.email,
        });
      }
    )
  );
}

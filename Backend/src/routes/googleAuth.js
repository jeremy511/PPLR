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
          const { given_name, family_name } = profile._json;
          user = await prisma.publisher.create({
            data: {
              email,
              firstName: given_name || profile.displayName.split(" ")[0] || "User",
              lastName: family_name || profile.displayName.split(" ").slice(1).join(" ") || "",
              password: "",
            },
          });
        }

        return done(null, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        });
      }
    )
  );
}

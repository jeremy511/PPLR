// src/routes/googleAuth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../lib/prisma.js";
import { getSettings } from "../services/serviceSettings.js";
import { logger } from "../utils/logger.js";

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, API_URL } from "../config.js";

export default function initGoogleAuth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${API_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || !profile.emails[0]?.value) {
            return done(new Error("No email provided by Google account"), false);
          }

          const email = profile.emails[0].value.toLowerCase().trim();
          let user = await prisma.publisher.findUnique({ where: { email } });

          if (!user) {
            const settings = await getSettings();
            if (settings.allowPublicRegistration === false) {
              logger.warn({ email }, "Google OAuth registration blocked: public registration is closed");
              return done(null, false, { message: "registration_closed" });
            }

            const { given_name, family_name } = profile._json || {};
            user = await prisma.publisher.create({
              data: {
                email,
                firstName: given_name || profile.displayName?.split(" ")[0] || "Usuario",
                lastName: family_name || profile.displayName?.split(" ").slice(1).join(" ") || "",
                password: "",
              },
            });
            logger.info({ userId: user.id, email }, "New user registered via Google OAuth");
          }

          return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          });
        } catch (err) {
          logger.error({ err: err.message }, "Error during Google OAuth strategy execution");
          return done(err, false);
        }
      }
    )
  );
}


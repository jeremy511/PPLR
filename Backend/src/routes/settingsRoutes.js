import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as SettingsService from "../services/serviceSettings.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const router = express.Router();

/**
 * Configuración pública para pantallas de inicio/login/registro
 * GET /api/settings/public
 */
router.get("/public", asyncHandler(async (req, res) => {
  const settings = await SettingsService.getSettings();
  res.json({
    congregationName: settings.congregationName,
    allowPublicRegistration: settings.allowPublicRegistration,
    announcementBanner: settings.showAnnouncementBanner ? settings.announcementBanner : "",
    showAnnouncementBanner: settings.showAnnouncementBanner,
  });
}));

/**
 * Configuración para publicadores autenticados (reglas, horarios y avisos)
 * GET /api/settings
 */
router.get("/", authMiddleware, asyncHandler(async (req, res) => {
  const settings = await SettingsService.getSettings();
  res.json({
    congregationName: settings.congregationName,
    allowPublicRegistration: settings.allowPublicRegistration,
    announcementBanner: settings.showAnnouncementBanner ? settings.announcementBanner : "",
    showAnnouncementBanner: settings.showAnnouncementBanner,
    advanceWeeks: settings.advanceWeeks,
    maxWeeklyShiftsPerUser: settings.maxWeeklyShiftsPerUser,
    defaultCapacityPerShift: settings.defaultCapacityPerShift,
    minCancellationHours: settings.minCancellationHours,
    timeSlots: settings.timeSlots || [],
  });
}));

export default router;

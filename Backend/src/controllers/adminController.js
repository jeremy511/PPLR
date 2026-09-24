import { asyncHandler } from "../utils/asyncHandler.js";
import * as SettingsService from "../services/serviceSettings.js";
import { logger } from "../utils/logger.js";

/**
 * Obtener configuración global del sistema
 * GET /api/admin/settings
 */
export const getSettingsController = asyncHandler(async (req, res) => {
  const settings = await SettingsService.getSettings();
  res.json(settings);
});

/**
 * Actualizar configuración global del sistema
 * PUT /api/admin/settings
 */
export const updateSettingsController = asyncHandler(async (req, res) => {
  logger.info({ adminId: req.user?.id }, "Updating system settings");
  const updated = await SettingsService.updateSettings(req.body);
  res.json(updated);
});

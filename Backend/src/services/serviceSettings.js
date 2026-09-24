import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";
import { AppError, ValidationError } from "../utils/errors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const SETTINGS_FILE = path.join(DATA_DIR, "systemSettings.json");

export const DEFAULT_SETTINGS = {
  // 1. Reglas de turnos
  advanceWeeks: 2, // Semanas de anticipación (1, 2, 3, 4)
  maxWeeklyShiftsPerUser: 2, // Tope de turnos por semana (0 = sin límite)
  defaultCapacityPerShift: 2, // Publicadores por turno estándar
  minCancellationHours: 24, // Horas mínimas para cancelar sin responsable

  // 2. Horarios maestros (Turnos del día)
  timeSlots: [
    { id: "1", label: "7:30 - 9:30 AM", startHour: 7, startMinute: 30, endHour: 9, endMinute: 30, active: true },
    { id: "2", label: "9:30 - 11:00 AM", startHour: 9, startMinute: 30, endHour: 11, endMinute: 0, active: true },
    { id: "3", label: "4:00 - 6:00 PM", startHour: 16, startMinute: 0, endHour: 18, endMinute: 0, active: true },
    { id: "4", label: "6:00 - 7:30 PM", startHour: 18, startMinute: 0, endHour: 19, endMinute: 30, active: true },
  ],

  // 3. Acceso y Congregación
  congregationName: "Congregación Central",
  allowPublicRegistration: true,
  requireAdminApproval: false,
  announcementBanner: "Recuerden revisar el estado de su turno y reportar cualquier novedad a su compañero.",
  showAnnouncementBanner: true,

  // 4. Reglas específicas por estación (overrides por zoneId)
  zoneOverrides: {},
};

// In-memory cache for fast lookups
let cachedSettings = null;

/**
 * Asegura que el directorio y el archivo de configuración existan
 */
async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    }
  } catch (err) {
    logger.error({ err: err.message }, "Error ensuring settings data file");
  }
}

/**
 * Obtiene la configuración actual del sistema
 */
export async function getSettings() {
  if (cachedSettings) {
    return cachedSettings;
  }

  await ensureDataFile();

  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    cachedSettings = { 
      ...DEFAULT_SETTINGS, 
      ...parsed,
      zoneOverrides: parsed.zoneOverrides || {} 
    };
    return cachedSettings;
  } catch (err) {
    logger.warn({ err: err.message }, "Failed to read settings file, returning defaults");
    return DEFAULT_SETTINGS;
  }
}

/**
 * Guarda los ajustes en memoria y en disco de forma segura
 */
async function persistSettings(settingsToSave) {
  await ensureDataFile();
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settingsToSave, null, 2), "utf-8");
    cachedSettings = settingsToSave;
    return cachedSettings;
  } catch (err) {
    logger.error({ err: err.message }, "Failed to write system settings file");
    throw new AppError("No se pudo guardar la configuración en el servidor", 500);
  }
}

/**
 * Actualiza la configuración global del sistema
 */
export async function updateSettings(newSettings) {
  if (!newSettings || typeof newSettings !== "object") {
    throw new ValidationError("Los datos de configuración no son válidos");
  }

  const current = await getSettings();

  // Validaciones de reglas
  const advanceWeeks = Number(newSettings.advanceWeeks) || current.advanceWeeks;
  if (advanceWeeks < 1 || advanceWeeks > 8) {
    throw new ValidationError("Las semanas de anticipación deben estar entre 1 y 8 semanas.");
  }

  const maxWeeklyShifts = Number(newSettings.maxWeeklyShiftsPerUser);
  const maxWeeklyShiftsPerUser = isNaN(maxWeeklyShifts) || maxWeeklyShifts < 0 ? current.maxWeeklyShiftsPerUser : maxWeeklyShifts;

  const defaultCapacity = Number(newSettings.defaultCapacityPerShift) || current.defaultCapacityPerShift;
  if (defaultCapacity < 1 || defaultCapacity > 6) {
    throw new ValidationError("La capacidad por turno debe ser entre 1 y 6 publicadores.");
  }

  const minCancellationHours = Number(newSettings.minCancellationHours);
  const validCancellationHours = isNaN(minCancellationHours) || minCancellationHours < 0 ? current.minCancellationHours : minCancellationHours;

  const merged = {
    ...current,
    advanceWeeks,
    maxWeeklyShiftsPerUser,
    defaultCapacityPerShift: defaultCapacity,
    minCancellationHours: validCancellationHours,
    congregationName: typeof newSettings.congregationName === "string" ? newSettings.congregationName.trim() : current.congregationName,
    allowPublicRegistration: typeof newSettings.allowPublicRegistration === "boolean" ? newSettings.allowPublicRegistration : current.allowPublicRegistration,
    requireAdminApproval: typeof newSettings.requireAdminApproval === "boolean" ? newSettings.requireAdminApproval : current.requireAdminApproval,
    announcementBanner: typeof newSettings.announcementBanner === "string" ? newSettings.announcementBanner : current.announcementBanner,
    showAnnouncementBanner: typeof newSettings.showAnnouncementBanner === "boolean" ? newSettings.showAnnouncementBanner : current.showAnnouncementBanner,
    timeSlots: Array.isArray(newSettings.timeSlots) && newSettings.timeSlots.length > 0 ? newSettings.timeSlots : current.timeSlots,
    zoneOverrides: current.zoneOverrides || {},
  };

  await persistSettings(merged);
  logger.info("System settings updated successfully");
  return merged;
}

/**
 * Obtiene las reglas personalizadas de una estación específica
 */
export async function getZoneRules(zoneId) {
  if (!zoneId) return null;
  const settings = await getSettings();
  return settings.zoneOverrides?.[String(zoneId)] || null;
}

/**
 * Obtiene todas las reglas personalizadas por estación
 */
export async function getAllZoneRules() {
  const settings = await getSettings();
  return settings.zoneOverrides || {};
}

/**
 * Guarda o actualiza las reglas específicas de una estación
 */
export async function saveZoneRules(zoneId, rules) {
  if (!zoneId) return;
  const current = await getSettings();
  const zoneOverrides = { ...(current.zoneOverrides || {}) };

  if (!rules || rules.isCustom === false) {
    delete zoneOverrides[String(zoneId)];
  } else {
    zoneOverrides[String(zoneId)] = {
      isCustom: true,
      hasCustomCapacity: Boolean(rules.hasCustomCapacity),
      customCapacity: Number(rules.customCapacity) || current.defaultCapacityPerShift,
      hasCustomSchedule: Boolean(rules.hasCustomSchedule),
      operatingDays: Array.isArray(rules.operatingDays) && rules.operatingDays.length > 0 
        ? rules.operatingDays 
        : [1, 2, 3, 4, 5, 6, 0],
      customSlots: Array.isArray(rules.customSlots) ? rules.customSlots : [],
      isTemporaryEvent: Boolean(rules.isTemporaryEvent),
      startDate: rules.startDate || "",
      endDate: rules.endDate || "",
      updatedAt: new Date().toISOString()
    };
  }

  const updated = { ...current, zoneOverrides };
  await persistSettings(updated);
  logger.info({ zoneId }, "Zone custom rules updated successfully");
  return zoneOverrides[String(zoneId)] || null;
}

/**
 * Elimina las reglas personalizadas cuando una estación es eliminada
 */
export async function deleteZoneRules(zoneId) {
  if (!zoneId) return;
  const current = await getSettings();
  if (current.zoneOverrides && current.zoneOverrides[String(zoneId)]) {
    const zoneOverrides = { ...current.zoneOverrides };
    delete zoneOverrides[String(zoneId)];
    await persistSettings({ ...current, zoneOverrides });
  }
}

/**
 * Calcula la configuración efectiva para una estación:
 * Combina la configuración global con los overrides de la estación (si los tiene).
 */
export async function getEffectiveSettingsForZone(zoneId) {
  const global = await getSettings();
  const zoneRules = zoneId ? await getZoneRules(zoneId) : null;

  if (!zoneRules || !zoneRules.isCustom) {
    return {
      advanceWeeks: global.advanceWeeks,
      maxWeeklyShiftsPerUser: global.maxWeeklyShiftsPerUser,
      capacity: global.defaultCapacityPerShift,
      minCancellationHours: global.minCancellationHours,
      operatingDays: [0, 1, 2, 3, 4, 5, 6], // Todos los días
      timeSlots: global.timeSlots || [],
      isTemporaryEvent: false,
    };
  }

  const capacity = zoneRules.hasCustomCapacity && zoneRules.customCapacity > 0
    ? zoneRules.customCapacity
    : global.defaultCapacityPerShift;

  const operatingDays = zoneRules.operatingDays && zoneRules.operatingDays.length > 0
    ? zoneRules.operatingDays
    : [0, 1, 2, 3, 4, 5, 6];

  const timeSlots = zoneRules.hasCustomSchedule && zoneRules.customSlots && zoneRules.customSlots.length > 0
    ? zoneRules.customSlots
    : global.timeSlots;

  return {
    advanceWeeks: global.advanceWeeks,
    maxWeeklyShiftsPerUser: global.maxWeeklyShiftsPerUser,
    capacity,
    minCancellationHours: global.minCancellationHours,
    operatingDays,
    timeSlots,
    isTemporaryEvent: Boolean(zoneRules.isTemporaryEvent),
    startDate: zoneRules.startDate,
    endDate: zoneRules.endDate,
  };
}

import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";
import * as SettingsService from "../services/serviceSettings.js";

export const getAllZones = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "ADMIN";
  const includeHidden = req.query.includeHidden === 'true';
  // Only show hidden zones if user is Admin AND explicitly asks for them
  const whereClause = (isAdmin && includeHidden) ? {} : { active: true };

  const [zones, zoneRulesMap] = await Promise.all([
    prisma.zone.findMany({
      where: whereClause,
      include: {
        carts: {
          include: {
            cart: true
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    SettingsService.getAllZoneRules()
  ]);

  const zonesWithRules = zones.map(zone => ({
    ...zone,
    customRules: zoneRulesMap[String(zone.id)] || null
  }));

  res.json(zonesWithRules);
});

export const createZone = asyncHandler(async (req, res) => {
  const { name, description, color, active, location, warehouse, instructions, customRules } = req.body;
  const zone = await prisma.zone.create({
    data: { 
      name, 
      description, 
      color,
      active: active !== undefined ? active : true,
      location,
      warehouse,
      instructions
    }
  });

  let savedRules = null;
  if (customRules) {
    savedRules = await SettingsService.saveZoneRules(zone.id, customRules);
  }

  res.status(201).json({ ...zone, customRules: savedRules });
});

export const updateZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, color, active, location, warehouse, instructions, customRules } = req.body;
  const parsedId = parseInt(id);
  
  const zone = await prisma.zone.update({
    where: { id: parsedId },
    data: { 
      name, 
      description, 
      color, 
      active,
      location,
      warehouse,
      instructions
    }
  });

  let savedRules = null;
  if (customRules !== undefined) {
    savedRules = await SettingsService.saveZoneRules(parsedId, customRules);
  } else {
    savedRules = await SettingsService.getZoneRules(parsedId);
  }

  res.json({ ...zone, customRules: savedRules });
});

export const deleteZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  try {
    await prisma.zone.delete({
      where: { id: parsedId }
    });
    await SettingsService.deleteZoneRules(parsedId);
    res.json({ message: "Zona eliminada correctamente" });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("No se puede eliminar la zona porque tiene carritos o turnos asociados.", 400);
    }
    throw error;
  }
});


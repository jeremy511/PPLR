import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/errors.js";

export const getAllZones = asyncHandler(async (req, res) => {
  const isAdmin = req.user?.role === "ADMIN";
  const includeHidden = req.query.includeHidden === 'true';
  // Only show hidden zones if user is Admin AND explicitly asks for them
  const whereClause = (isAdmin && includeHidden) ? {} : { active: true };

  const zones = await prisma.zone.findMany({
    where: whereClause,
    include: {
      carts: {
        include: {
          cart: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  res.json(zones);
});

export const createZone = asyncHandler(async (req, res) => {
  const { name, description, color, active, location, warehouse, instructions } = req.body;
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
  res.status(201).json(zone);
});

export const updateZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, color, active, location, warehouse, instructions } = req.body;
  
  const zone = await prisma.zone.update({
    where: { id: parseInt(id) },
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
  res.json(zone);
});

export const deleteZone = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.zone.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Zona eliminada correctamente" });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("No se puede eliminar la zona porque tiene carritos o turnos asociados.", 400);
    }
    throw error;
  }
});

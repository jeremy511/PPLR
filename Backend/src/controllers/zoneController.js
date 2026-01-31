import prisma from "../lib/prisma.js";

export const getAllZones = async (req, res) => {
  try {
    const zones = await prisma.zone.findMany({
      include: {
        carts: {
            include: {
                cart: true
            }
        }
      }
    });
    res.json(zones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las zonas" });
  }
};

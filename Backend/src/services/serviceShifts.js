import prisma from "../lib/prisma.js";


export const getAll = async ({ month, year }) => {
  const filters = {};

  if (month && year) {
    const startDate = new Date(year, month - 1, 1); // mes empieza en 0
    const endDate = new Date(year, month, 1);       // siguiente mes

    filters.date = {
      gte: startDate,
      lt: endDate,
    };
  }

return await prisma.shift.findMany({
  where: filters,
  include: {
    schedule: true,
    cart: true,
    publishers: {
      include: {
        publisher: true // solo si existe esta relación
      }
    },
    responsable: true
  },
  orderBy: {
    date: 'asc'
  }
})
};

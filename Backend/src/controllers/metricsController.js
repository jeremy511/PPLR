import prisma from "../lib/prisma.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getDashboardMetrics = catchAsync(async (req, res) => {
  // 1. Total Publishers count
  const totalPublishers = await prisma.publisher.count({
    where: { role: "PUBLISHER" } // Only count regular publishers? Or all? Usually exclude admins if separated.
  });

  // 2. Weekly Shift Coverage
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); 
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const totalShiftsThisWeek = await prisma.shift.count({
    where: {
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      }
    }
  });

  // Covered means at least one publisher is assigned
  const coveredShiftsThisWeek = await prisma.shift.count({
    where: {
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      },
      publishers: {
        some: {} // Has at least one publisher
      }
    }
  });

  const weeklyCoverage = totalShiftsThisWeek > 0 
    ? Math.round((coveredShiftsThisWeek / totalShiftsThisWeek) * 100) 
    : 0;

  // 3. Top Zones (by total shifts created, or filled? Let's say filled shifts historically)
  const topZonesRaw = await prisma.shift.groupBy({
    by: ['zoneId'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 5
  });

  // Enrich zone names
  const topZones = await Promise.all(topZonesRaw.map(async (item) => {
    if (!item.zoneId) return null;
    const zone = await prisma.zone.findUnique({ where: { id: item.zoneId } });
    return {
      name: zone ? zone.name : 'Zona Desconocida',
      count: item._count.id
    };
  }));

  // 4. Recent Audit Activity
  const recentActivity = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    // You might want to include relation data if AuditLog has relations, 
    // but the schema showed Int fields (adminId, etc.) without explicit relations in the model snippet.
    // If we want names, we'd need to fetch them or update schema to have relations.
    // For now, raw data is fine or we do a quick fetch.
  });

  res.json({
    stats: {
      totalPublishers,
      weeklyCoverage,
      totalShiftsThisWeek,
      coveredShiftsThisWeek
    },
    topZones: topZones.filter(z => z !== null),
    recentActivity
  });
});

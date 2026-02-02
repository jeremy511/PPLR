import prisma from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError, NotFoundError, ValidationError, UnauthorizedError } from "../utils/errors.js";
import logger from "../utils/logger.js";

// Helper to calculate the current publication policy limits
const getPublicationLimits = () => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

    const currentDay = today.getUTCDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setUTCDate(today.getUTCDate() - currentDay + 1);

    const maxDate = new Date(currentMonday);
    maxDate.setUTCDate(currentMonday.getUTCDate() + 14);

    return { today, maxDate };
};

export const getAllShifts = asyncHandler(async (req, res) => {
  logger.info({ query: req.query, user: req.user }, "getAllShifts");
  
  const { zoneId, startDate, endDate } = req.query;
  const whereClause = zoneId ? { zoneId: parseInt(zoneId) } : {};
    
  if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      whereClause.date = {
          gte: start,
          lte: end
      };
  }

  const shifts = await prisma.shift.findMany({
    where: whereClause,
    include: {
      schedule: true,
      cart: true,
      zone: true,
      responsable: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      publishers: {
        select: {
          createdAt: true,
          publisher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              age: true,
              gender: true,
            },
          },
        },
      },
    },
  });
  res.json(shifts);
});

export const joinShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(req.user.id);

  logger.info({ shiftId: id, userId }, "joinShift attempt");

  await prisma.$transaction(async (tx) => {
      const shift = await tx.shift.findUnique({
          where: { id: parseInt(id) },
          include: { 
              publishers: true,
              schedule: true
          },
      });

      if (!shift) {
          throw new NotFoundError("Turno no encontrado");
      }

      // Verification: prevent joining cancelled shifts
      if (shift.status === 'CANCELLED') {
          throw new ValidationError("Este turno está cancelado y no admite inscripciones");
      }

      // Validation: prevent joining past shifts or shifts not yet published
      const { today, maxDate } = getPublicationLimits();
      const shiftDate = new Date(shift.date);
      if (shiftDate < today) {
          throw new ValidationError("No puedes inscribirte en un turno que ya pasó");
      }
      if (shiftDate >= maxDate && req.user.role !== 'ADMIN') {
          throw new ValidationError("Este turno aún no ha sido publicado para inscripción");
      }

      // New validation: prevent joining another shift on the same date and same time slot (any zone)
      const overlappingShift = await tx.shift.findFirst({
          where: {
              date: shift.date,
              schedule: {
                  startTime: shift.schedule.startTime,
                  endTime: shift.schedule.endTime,
              },
              publishers: { some: { publisherId: userId } },
              NOT: { id: shift.id },
          },
          include: { zone: true }
      });

      if (overlappingShift) {
          throw new ValidationError(`Ya estás inscrito en otro turno en este horario (${overlappingShift.zone.name})`);
      }

      const isJoined = shift.publishers.some((p) => p.publisherId === userId);
      if (isJoined) {
          throw new ValidationError("Ya estás inscrito en este turno");
      }

      if (shift.publishers.length >= 4) {
          throw new ValidationError("El turno ya se completó justo ahora. Intenta otro hueco.");
      }

      await tx.shiftPublisher.create({
          data: {
              shiftId: parseInt(id),
              publisherId: userId,
          },
      });
  });

  res.json({ message: "Inscrito exitosamente" });
});

export const leaveShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = parseInt(req.user.id);

  logger.info({ shiftId: id, userId }, "leaveShift attempt");

  await prisma.shiftPublisher.deleteMany({
    where: {
      shiftId: parseInt(id),
      publisherId: userId,
    },
  });

  res.json({ message: "Saliste del turno exitosamente" });
});

export const createShift = asyncHandler(async (req, res) => {
  logger.info({ body: req.body, user: req.user?.id }, "createShift");
  
  const { startTime, endTime, zoneId, publisherId, status, date: dateInBody } = req.body;
  const userId = parseInt(req.user?.id);

  if (!startTime || !endTime) {
    throw new ValidationError("Faltan datos de inicio o fin del turno");
  }

  if (!req.user || !req.user.id) {
    throw new UnauthorizedError("User not authenticated");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Formato de fecha inválido");
  }

  // Determine target publisher
  let targetPublisherId;
  if (req.user.role === 'ADMIN') {
      if (publisherId === null) {
          targetPublisherId = null;
      } else if (publisherId) {
          targetPublisherId = parseInt(publisherId);
      } else {
          targetPublisherId = userId;
      }
  } else {
      targetPublisherId = userId;
  }

  // Validation: Enforce publication policy
  const { today, maxDate } = getPublicationLimits();
  
  const dateStr = dateInBody || start.toISOString().split('T')[0];
  const shiftDay = new Date(dateStr + 'T00:00:00.000Z');

  if (start < today) {
      throw new ValidationError("No puedes crear turnos en el pasado");
  }
  
  if (start >= maxDate && req.user.role !== 'ADMIN') {
      throw new ValidationError("Este turno aún no ha sido publicado para inscripción");
  }

  await prisma.$transaction(async (tx) => {
      // Idempotency: Check if a shift already exists for this zone and time
      const existingShift = await tx.shift.findFirst({
          where: {
              zoneId: zoneId ? parseInt(zoneId) : null,
              date: shiftDay,
              schedule: {
                  startTime: start,
                  endTime: end
              }
          },
          include: { publishers: true }
      });

      let currentShift;

      if (existingShift) {
          currentShift = existingShift;
      } else {
          // Check if user is already in another shift in a DIFFERENT zone at the same time
          if (targetPublisherId !== null) {
              const overlapping = await tx.shift.findFirst({
                  where: {
                      date: shiftDay,
                      schedule: {
                          startTime: start,
                          endTime: end,
                      },
                      publishers: { some: { publisherId: targetPublisherId } }
                  },
                  include: { zone: true }
              });
              if (overlapping) {
                  throw new ValidationError(`Ya estás inscrito en otro turno en este horario (${overlapping.zone.name})`);
              }
          }

          const schedule = await tx.schedule.create({
              data: {
                  startTime: start,
                  endTime: end,
              },
          });

          currentShift = await tx.shift.create({
              data: {
                  status: status || "PENDING",
                  date: shiftDay,
                  scheduleId: schedule.id,
                  zoneId: zoneId ? parseInt(zoneId) : null,
              },
          });
      }

      // Only add publisher if ID is provided
      if (targetPublisherId !== null) {
          const currentPublishers = currentShift.publishers || [];
          if (currentPublishers.length >= 4) {
               throw new ValidationError("El turno ya se completó (capacidad llena)");
          }

          await tx.shiftPublisher.upsert({
              where: {
                  shiftId_publisherId: {
                      shiftId: currentShift.id,
                      publisherId: targetPublisherId,
                  },
              },
              update: {},
              create: {
                  shiftId: currentShift.id,
                  publisherId: targetPublisherId,
              },
          });
      }

      res.status(201).json({ 
          message: existingShift ? "Ya existía un turno, te hemos añadido" : "Turno creado exitosamente", 
          shiftId: currentShift.id 
      });
  });
});

export const adminAddPublisher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { publisherId } = req.body;
    
    const shiftIdInt = parseInt(id);
    const pubIdInt = parseInt(publisherId);

    if (isNaN(shiftIdInt) || isNaN(pubIdInt)) {
        throw new ValidationError("IDs de turno o publicador inválidos");
    }

    await prisma.$transaction(async (tx) => {
        const shift = await tx.shift.findUnique({
            where: { id: shiftIdInt },
            include: { publishers: true, schedule: true }
        });

        if (!shift) {
            throw new NotFoundError("Turno no encontrado");
        }

        if (shift.publishers.length >= 4) {
            throw new ValidationError("El turno ya está completo (máximo 4 personas)");
        }

        // Check if user is already in another shift in a DIFFERENT zone at the same time
        const overlappingShift = await tx.shift.findFirst({
            where: {
                date: shift.date,
                schedule: {
                    startTime: shift.schedule.startTime,
                    endTime: shift.schedule.endTime,
                },
                publishers: { some: { publisherId: pubIdInt } },
                NOT: { id: shift.id },
            },
            include: { zone: true }
        });

        if (overlappingShift) {
            throw new ValidationError(`El usuario ya está inscrito en otro turno en este horario (${overlappingShift.zone.name})`);
        }

        await tx.shiftPublisher.upsert({
            where: {
                shiftId_publisherId: {
                    shiftId: shiftIdInt,
                    publisherId: pubIdInt
                }
            },
            update: {},
            create: {
                shiftId: shiftIdInt,
                publisherId: pubIdInt
            }
        });
    });
    res.json({ message: "Publicador añadido exitosamente por el administrador" });
});

export const adminRemovePublisher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { publisherId, reason } = req.body;
    const adminId = req.user.id;
    
    const shiftIdInt = parseInt(id);
    const pubIdInt = parseInt(publisherId);

    if (isNaN(shiftIdInt) || isNaN(pubIdInt)) {
        throw new ValidationError("IDs de turno o publicador inválidos");
    }

    if (!reason || reason.trim() === "") {
        throw new ValidationError("Se requiere un motivo para remover al participante");
    }

    await prisma.$transaction([
        prisma.shiftPublisher.deleteMany({
            where: {
                shiftId: shiftIdInt,
                publisherId: pubIdInt
            }
        }),
        prisma.auditLog.create({
            data: {
                action: 'REMOVE_PARTICIPANT',
                adminId: adminId,
                publisherId: pubIdInt,
                shiftId: shiftIdInt,
                reason: reason
            }
        })
    ]);
    res.json({ message: "Publicador removido y acción registrada exitosamente" });
});

export const updateShiftStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const shiftIdInt = parseInt(id);
    if (isNaN(shiftIdInt)) {
        throw new ValidationError("ID de turno inválido");
    }

    await prisma.shift.update({
        where: { id: shiftIdInt },
        data: { status }
    });
    res.json({ message: "Estado del turno actualizado exitosamente" });
});

export const getUserShifts = asyncHandler(async (req, res) => {
  logger.info({ user: req.user?.id }, "getUserShifts");

  if (!req.user || !req.user.id) {
    throw new UnauthorizedError("No autorizado: ID de usuario faltante");
  }

  const userId = parseInt(req.user.id);
  if (isNaN(userId)) {
    throw new ValidationError("ID de usuario inválido");
  }
  
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  
  const shifts = await prisma.shift.findMany({
    where: {
      AND: [
        {
          publishers: {
            some: {
              publisherId: userId
            }
          }
        },
        {
          date: { gte: startOfDay }
        },
        {
          status: { not: 'CANCELLED' }
        }
      ]
    },
    distinct: ['id'],
    include: {
      schedule: true,
      cart: true,
      zone: true,
      responsable: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      publishers: {
        select: {
          createdAt: true,
          publisher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              age: true,
              gender: true,
            },
          },
        },
      },
    },
    orderBy: [
      { date: 'asc' },
      { schedule: { startTime: 'asc' } }
    ]
  });
  
  logger.info(`User ${userId} - Found ${shifts.length} upcoming active shifts`);
  res.json(shifts);
});

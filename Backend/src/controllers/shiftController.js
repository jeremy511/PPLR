import prisma from "../lib/prisma.js";

// Helper to calculate the current publication policy limits
const getPublicationLimits = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDay = today.getDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - currentDay + 1);
    currentMonday.setHours(0, 0, 0, 0);

    // One week ahead of the current Monday
    const maxDate = new Date(currentMonday);
    maxDate.setDate(currentMonday.getDate() + 14);

    return { today, maxDate };
};

export const getAllShifts = async (req, res) => {
  const { zoneId, startDate, endDate } = req.query;
  try {
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
            name: true,
            email: true,
          },
        },
        publishers: {
          select: {
            createdAt: true,
            publisher: {
              select: {
                id: true,
                name: true,
                email: true,
                age: true,
                gender: true,
              },
            },
          },
        },
      },
    });
    res.json(shifts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los turnos" });
  }
};

export const joinShift = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; 

  try {
    await prisma.$transaction(async (tx) => {
        const shift = await tx.shift.findUnique({
            where: { id: parseInt(id) },
            include: { publishers: true },
        });

        if (!shift) {
            throw new Error("NOT_FOUND");
        }

        // Verification: prevent joining cancelled shifts
        if (shift.status === 'CANCELLED') {
            throw new Error("Este turno está cancelado y no admite inscripciones");
        }

        // Validation: prevent joining past shifts
        const { today } = getPublicationLimits();
        if (new Date(shift.date) < today) {
            throw new Error("No puedes inscribirte en un turno que ya pasó");
        }

        // New validation: prevent joining another shift on the same date and same time slot (any zone)
        const overlappingShift = await tx.shift.findFirst({
            where: {
                date: shift.date,
                schedule: {
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                },
                publishers: { some: { publisherId: userId } },
                NOT: { id: shift.id },
            },
        });
        if (overlappingShift) {
            throw new Error("Ya estás inscrito en otro turno en la misma fecha");
        }


        const isJoined = shift.publishers.some((p) => p.publisherId === userId);
        if (isJoined) {
            throw new Error("Ya estás inscrito en este turno");
        }

        if (shift.publishers.length >= 4) {
            throw new Error("CAPACITY_FULL");
        }

        await tx.shiftPublisher.create({
            data: {
                shiftId: parseInt(id),
                publisherId: userId,
            },
        });
    });

    res.json({ message: "Inscrito exitosamente" });
  } catch (error) {
    if (error.message === "NOT_FOUND") {
        return res.status(404).json({ error: "Turno no encontrado" });
    }
    if (error.message === "CAPACITY_FULL") {
        return res.status(400).json({ error: "El turno ya se completó justo ahora. Intenta otro hueco." });
    }
    console.error(error);
    res.status(500).json({ error: error.message || "Error al unirse al turno" });
  }
};

export const leaveShift = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await prisma.shiftPublisher.deleteMany({
      where: {
        shiftId: parseInt(id),
        publisherId: userId,
      },
    });

    res.json({ message: "Saliste del turno exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al salir del turno" });
  }
};

export const createShift = async (req, res) => {
  console.log("createShift called");
  console.log("Body:", req.body);
  
  const { startTime, endTime, zoneId, publisherId, status } = req.body;
  const userId = req.user?.id;

  if (!startTime || !endTime) {
    console.error("Missing startTime or endTime");
    return res.status(400).json({ error: "Faltan datos de inicio o fin del turno" });
  }

  try {
    if (!req.user || !req.user.id) {
      console.error("User not found in request");
      return res.status(401).json({ error: "User not authenticated" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error("Invalid date format", startTime, endTime);
        return res.status(400).json({ error: "Formato de fecha inválido" });
    }

    // Determine target publisher
    const targetPublisherId = (req.user.role === 'ADMIN' && publisherId) 
        ? parseInt(publisherId) 
        : (req.user.role === 'ADMIN' && publisherId === null) ? null : userId; // Admin can choose not to add someone

    // Validation: Enforce publication policy
    const { today, maxDate } = getPublicationLimits();
    
    if (start < today) {
        return res.status(400).json({ error: "No puedes crear turnos en el pasado" });
    }
    
    if (start >= maxDate && req.user.role !== 'ADMIN') { // Allow admin to prep future weeks maybe? No, let's keep it consistent.
        return res.status(400).json({ error: "Este turno aún no ha sido publicado para inscripción" });
    }

    await prisma.$transaction(async (tx) => {
        // Idempotency: Check if a shift already exists for this zone and time
        const existingShift = await tx.shift.findFirst({
            where: {
                zoneId: zoneId ? parseInt(zoneId) : null,
                date: start
            },
            include: { publishers: true }
        });

        let currentShift;

        if (existingShift) {
            currentShift = existingShift;
        } else {
            const schedule = await tx.schedule.create({
                data: {
                    startTime: start,
                    endTime: end,
                },
            });

            currentShift = await tx.shift.create({
                data: {
                    status: status || "PENDING",
                    date: start,
                    scheduleId: schedule.id,
                    zoneId: zoneId ? parseInt(zoneId) : null,
                },
            });
        }

        // Only add publisher if ID is provided
        if (targetPublisherId !== null) {
            // Check capacity even on create (for concurrency)
            if (currentShift.publishers && currentShift.publishers.length >= 4) {
                 throw new Error("CAPACITY_FULL");
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

  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Error al crear el turno", details: error.message });
  }
};

export const adminAddPublisher = async (req, res) => {
    const { id } = req.params;
    const { publisherId } = req.body;
    
    const shiftIdInt = parseInt(id);
    const pubIdInt = parseInt(publisherId);

    if (isNaN(shiftIdInt) || isNaN(pubIdInt)) {
        return res.status(400).json({ error: "IDs de turno o publicador inválidos" });
    }

    try {
        await prisma.$transaction(async (tx) => {
            const shift = await tx.shift.findUnique({
                where: { id: shiftIdInt },
                include: { publishers: true }
            });

            if (!shift) {
                throw new Error("Turno no encontrado");
            }

            if (shift.publishers.length >= 4) {
                throw new Error("El turno ya está completo (máximo 4 personas)");
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || "Error al añadir publicador" });
    }
};

export const adminRemovePublisher = async (req, res) => {
    const { id } = req.params;
    const { publisherId, reason } = req.body;
    const adminId = req.user.id;
    
    const shiftIdInt = parseInt(id);
    const pubIdInt = parseInt(publisherId);

    if (isNaN(shiftIdInt) || isNaN(pubIdInt)) {
        return res.status(400).json({ error: "IDs de turno o publicador inválidos" });
    }

    if (!reason || reason.trim() === "") {
        return res.status(400).json({ error: "Se requiere un motivo para remover al participante" });
    }

    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al remover publicador y registrar auditoría" });
    }
};

export const updateShiftStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const shiftIdInt = parseInt(id);
    if (isNaN(shiftIdInt)) {
        return res.status(400).json({ error: "ID de turno inválido" });
    }

    try {
        await prisma.shift.update({
            where: { id: shiftIdInt },
            data: { status }
        });
        res.json({ message: "Estado del turno actualizado exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar estado del turno" });
    }
};

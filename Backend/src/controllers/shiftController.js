import prisma from "../lib/prisma.js";

export const getAllShifts = async (req, res) => {
  try {
    const shifts = await prisma.shift.findMany({
      include: {
        schedule: true,
        cart: true,
        responsable: {
          select: {
            name: true,
            email: true,
          },
        },
        publishers: {
          include: {
            publisher: {
              select: {
                name: true,
                email: true,
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
    const shift = await prisma.shift.findUnique({
      where: { id: parseInt(id) },
      include: { publishers: true },
    });

    if (!shift) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    const isJoined = shift.publishers.some((p) => p.publisherId === userId);
    if (isJoined) {
      return res.status(400).json({ error: "Ya estás inscrito en este turno" });
    }

    if (shift.publishers.length >= 4) {
      return res.status(400).json({ error: "El turno está completo" });
    }

    await prisma.shiftPublisher.create({
      data: {
        shiftId: parseInt(id),
        publisherId: userId,
      },
    });

    res.json({ message: "Inscrito exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al unirse al turno" });
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
  
  const { startTime, endTime } = req.body;
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

    console.log("Creating schedule:", start, end);

    const schedule = await prisma.schedule.create({
      data: {
        startTime: start,
        endTime: end,
      },
    });

    const shift = await prisma.shift.create({
      data: {
        status: "PENDING",
        date: start,
        scheduleId: schedule.id,
      },
    });

    await prisma.shiftPublisher.create({
      data: {
        shiftId: shift.id,
        publisherId: userId,
      },
    });

    res.status(201).json({ message: "Turno creado e inscrito exitosamente", shiftId: shift.id });

  } catch (error) {
    console.error("Error creating shift:", error);
    res.status(500).json({ error: "Error al crear el turno", details: error.message });
  }
};
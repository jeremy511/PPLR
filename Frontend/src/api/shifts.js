const API_URL = "http://localhost:3000/api/shifts";

export const getShifts = async () => {
  const res = await fetch(API_URL, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener turnos");
  return res.json();
};

export const joinShift = async (shiftId) => {
  const res = await fetch(`${API_URL}/${shiftId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al unirse al turno");
  }
  return res.json();
};

export const leaveShift = async (shiftId) => {
  const res = await fetch(`${API_URL}/${shiftId}/leave`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al salir del turno");
  }
  return res.json();
};

export const createShift = async (startTime, endTime) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startTime, endTime }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al crear el turno");
  }
  return res.json();
};

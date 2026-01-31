const API_URL = "http://localhost:3000/api";

export const getShifts = async (zoneId, startDate, endDate) => {
  let url = `${API_URL}/shifts`;
  const params = new URLSearchParams();
  if (zoneId) params.append("zoneId", zoneId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener turnos");
  return res.json();
};

export const joinShift = async (shiftId) => {
  const res = await fetch(`${API_URL}/shifts/${shiftId}/join`, {
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
  const res = await fetch(`${API_URL}/shifts/${shiftId}/leave`, {
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

export const createShift = async (startTime, endTime, zoneId) => {
  const res = await fetch(`${API_URL}/shifts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startTime, endTime, zoneId }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al crear el turno");
  }
  return res.json();
};

export const getZones = async () => {
  const res = await fetch(`${API_URL}/zones`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener zonas");
  return res.json();
};

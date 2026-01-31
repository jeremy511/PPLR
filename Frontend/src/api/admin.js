const API_URL = "http://localhost:3000/api";

export const getAllPublishers = async () => {
  const res = await fetch(`${API_URL}/auth/publishers`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener la lista de publicadores");
  return res.json();
};

export const adminAddParticipant = async (shiftId, publisherId) => {
  const res = await fetch(`${API_URL}/shifts/${shiftId}/admin/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publisherId }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al añadir participantes");
  }
  return res.json();
};

export const adminRemoveParticipant = async (shiftId, publisherId, reason) => {
  const res = await fetch(`${API_URL}/shifts/${shiftId}/admin/remove`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publisherId, reason }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al remover participante");
  }
  return res.json();
};

export const updateShiftStatus = async (shiftId, status) => {
  const res = await fetch(`${API_URL}/shifts/${shiftId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al actualizar estado del turno");
  }
  return res.json();
};

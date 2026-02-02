const API_URL = "http://localhost:3000/api";

export const getAllPublishers = async () => {
  const res = await fetch(`${API_URL}/auth/publishers`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al obtener la lista de publicadores");
  return res.json();
};

export const getAllReports = async () => {
    // Placeholder - implement actual reports endpoint later
    const res = await fetch(`${API_URL}/reports`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener reportes");
    return res.json();
};

// ZONES API
const ZONES_API = "http://localhost:3000/api/zones";

export const createZone = async (data) => {
    const res = await fetch(ZONES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Error al crear zona");
    }
    return res.json();
};

export const updateZone = async (id, data) => {
    const res = await fetch(`${ZONES_API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Error al actualizar zona");
    }
    return res.json();
};

export const deleteZone = async (id) => {
    const res = await fetch(`${ZONES_API}/${id}`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Error al eliminar zona");
    }
    return res.json();
};

export const deletePublisher = async (id) => {
  const res = await fetch(`${API_URL}/auth/publishers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al eliminar el usuario");
  return res.json();
};

export const updatePublisherRole = async (id, role) => {
  const res = await fetch(`${API_URL}/auth/publishers/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al actualizar el rol");
  return res.json();
};

export const updatePublisher = async (id, data) => {
  const res = await fetch(`${API_URL}/auth/publishers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Error al actualizar el usuario");
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

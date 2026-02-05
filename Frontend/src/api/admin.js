import { apiClient } from "../lib/apiClient";

export const getAllPublishers = async () => {
  return apiClient.get("/auth/publishers");
};

export const getAllReports = async () => {
    return apiClient.get("/reports");
};

// ZONES API

export const createZone = async (data) => {
    return apiClient.post("/zones", data);
};

export const updateZone = async (id, data) => {
    return apiClient.put(`/zones/${id}`, data);
};

export const deleteZone = async (id) => {
    return apiClient.delete(`/zones/${id}`);
};

export const deletePublisher = async (id) => {
  return apiClient.delete(`/auth/publishers/${id}`);
};

export const updatePublisherRole = async (id, role) => {
  return apiClient.request(`/auth/publishers/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

export const updatePublisher = async (id, data) => {
  return apiClient.put(`/auth/publishers/${id}`, data);
};

export const adminAddParticipant = async (shiftId, publisherId) => {
  return apiClient.post(`/shifts/${shiftId}/admin/add`, { publisherId });
};

export const adminRemoveParticipant = async (shiftId, publisherId, reason) => {
  return apiClient.post(`/shifts/${shiftId}/admin/remove`, { publisherId, reason });
};

export const updateShiftStatus = async (shiftId, status) => {
  return apiClient.request(`/shifts/${shiftId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

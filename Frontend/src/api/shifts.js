import { apiClient } from "../lib/apiClient";

export const getShifts = async (zoneId, startDate, endDate) => {
  const params = {};
  if (zoneId) params.zoneId = zoneId;
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return apiClient.get("/shifts", params);
};

export const joinShift = async (shiftId) => {
  return apiClient.post(`/shifts/${shiftId}/join`);
};

export const leaveShift = async (shiftId) => {
  return apiClient.post(`/shifts/${shiftId}/leave`);
};

export const createShift = async (startTime, endTime, zoneId, date) => {
  return apiClient.post("/shifts", { startTime, endTime, zoneId, date });
};

export const getZones = async (includeHidden = false) => {
  return apiClient.get("/zones", { includeHidden });
};

export const getMyShifts = async () => {
  return apiClient.get("/shifts/my-shifts");
};

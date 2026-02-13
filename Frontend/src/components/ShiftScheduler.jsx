import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
import { useAuth } from "../hooks/useAuth";
import { getShifts, joinShift, leaveShift, createShift, getZones } from "../api/shifts";
import { getAllPublishers, adminAddParticipant, updateShiftStatus } from "../api/admin";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Lazy Loaded Components
const ShiftModal = lazy(() => import("./ShiftModal").then(module => ({ default: module.ShiftModal })));

// Sub-components
import { toast } from "sonner";
import { ZoneSelector } from "./ZoneSelector";
import { CalendarControls } from "./CalendarControls";
import ShiftGrid from "./ShiftGrid";
import { apiClient } from "../lib/apiClient";

const DISPLAY_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TIME_SLOTS = [
  { label: "7:30 - 9:30 AM", startHour: 7, startMinute: 30, endHour: 9, endMinute: 30 },
  { label: "9:30 - 11:00 AM", startHour: 9, startMinute: 30, endHour: 11, endMinute: 0 },
  { label: "4:00 - 6:00 PM", startHour: 16, startMinute: 0, endHour: 18, endMinute: 0 },
  { label: "6:00 - 7:30 PM", startHour: 18, startMinute: 0, endHour: 19, endMinute: 30 },
];

const getWeekOfMonth = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfWeek = firstDayOfMonth.getDay() || 7;
  const firstMonday = dayOfWeek === 1 ? firstDayOfMonth : new Date(new Date(firstDayOfMonth).setDate(1 + (8 - dayOfWeek) % 7));
  if (date < firstMonday) return 1;
  return Math.ceil((date.getDate() - firstMonday.getDate() + 1) / 7) + (dayOfWeek === 1 ? 0 : 1);
};

const getWeekDates = (offset = 0) => {
  const today = new Date();
  const currentDay = today.getDay() || 7;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - currentDay + 1);
  currentMonday.setHours(0, 0, 0, 0);

  const targetMonday = new Date(currentMonday);
  targetMonday.setDate(currentMonday.getDate() + (offset * 7));

  return DISPLAY_DAYS.map((dayName, index) => {
    const d = new Date(targetMonday);
    d.setDate(targetMonday.getDate() + index);
    return { name: dayName, date: d.getDate(), fullDate: d };
  });
};
export function ShiftScheduler({ zones = [], selectedZoneId, onZoneSelect, zoneColor = "#6366f1" }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Navigation State
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedShiftKey, setSelectedShiftKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized date calculation
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const startDate = weekDates[0].fullDate.toLocaleDateString('en-CA');
  const endDate = weekDates[6].fullDate.toLocaleDateString('en-CA');

  // Queries (Zones are now passed as props)

  const { data: allPublishers = [], isLoading: isLoadingPubs } = useQuery({
    queryKey: ["publishers"],
    queryFn: getAllPublishers,
    enabled: user?.role === 'ADMIN',
  });

  const { data: rawShifts = [], isLoading: isLoadingShifts } = useQuery({
    queryKey: ["shifts", selectedZoneId, startDate, endDate],
    queryFn: () => getShifts(selectedZoneId, startDate, endDate),
    enabled: !!selectedZoneId,
  });

  const shifts = useMemo(() => {
    const mappedShifts = {};
    if (!rawShifts || !Array.isArray(rawShifts)) return mappedShifts;

    rawShifts.forEach(shift => {
      const shiftDate = new Date(shift.date);

      // We want to match the server date (UTC Midnight) with our displayed week day
      const sYear = shiftDate.getUTCFullYear();
      const sMonth = shiftDate.getUTCMonth();
      const sDate = shiftDate.getUTCDate();

      const weekDay = weekDates.find(wd => {
        const d = wd.fullDate;
        return d.getFullYear() === sYear && d.getMonth() === sMonth && d.getDate() === sDate;
      });

      if (weekDay) {
        const startTime = new Date(shift.schedule.startTime);
        const startHour = startTime.getHours();
        const startMinute = startTime.getMinutes();
        const slotIdx = TIME_SLOTS.findIndex(s => s.startHour === startHour && s.startMinute === startMinute);

        if (slotIdx !== -1) {
          const key = `${weekDay.name}-${slotIdx}`;
          mappedShifts[key] = {
            id: shift.id,
            status: shift.status,
            day: weekDay.name,
            slotIndex: slotIdx,
            publishers: shift.publishers.map(p => ({
              id: p.publisher.id,
              firstName: p.publisher.firstName,
              lastName: p.publisher.lastName,
              email: p.publisher.email,
              phone: p.publisher.phone,
              age: p.publisher.age,
              gender: p.publisher.gender,
              createdAt: p.createdAt
            }))
          };
        }
      }
    });
    return mappedShifts;
  }, [rawShifts, weekDates]);

  // Initial zone setting is now handled by parent

  // Special Zone Logic
  const SPECIAL_EVENT_ZONE_NAME = "Jardin Botanico";
  const SPECIAL_EVENT_MONTH = 2; // March (0-indexed)
  const SPECIAL_EVENT_DAYS = [5, 6, 7, 8];

  const filteredZones = useMemo(() => {
    if (!zones.length) return [];

    // Check if the current week view includes any of the special event days
    const weekStartMonth = weekDates[0].fullDate.getMonth();
    const weekEndMonth = weekDates[6].fullDate.getMonth();

    // Simple check: if any day in the current view is in March and is one of the special days
    const isSpecialWeek = weekDates.some(d =>
      d.fullDate.getMonth() === SPECIAL_EVENT_MONTH &&
      SPECIAL_EVENT_DAYS.includes(d.fullDate.getDate())
    );

    return zones.filter(z => {
      if (z.name === SPECIAL_EVENT_ZONE_NAME) {
        return isSpecialWeek;
      }
      return true;
    });
  }, [zones, weekDates]);

  // Adjust selected zone if it disappears from the list
  useEffect(() => {
    if (selectedZoneId && filteredZones.length > 0) {
      const stillExists = filteredZones.find(z => z.id === selectedZoneId);
      if (!stillExists) {
        onZoneSelect(filteredZones[0].id);
      }
    }
  }, [filteredZones, selectedZoneId, onZoneSelect]);

  const loading = isLoadingShifts || isLoadingPubs;

  const invalidateShifts = async () => {
    return queryClient.invalidateQueries({ queryKey: ["shifts"] });
  };

  // Handlers
  const handleSlotClick = useCallback((day, slotIdx) => {
    // Prevent clicking on non-special days for the special zone
    const currentZone = zones.find(z => z.id === selectedZoneId);
    if (currentZone?.name === SPECIAL_EVENT_ZONE_NAME) {
      const dayDate = weekDates.find(d => d.name === day)?.fullDate;
      if (dayDate) {
        const isSpecialDay = dayDate.getMonth() === SPECIAL_EVENT_MONTH && SPECIAL_EVENT_DAYS.includes(dayDate.getDate());
        if (!isSpecialDay) {
          toast.error("Este turno solo está habilitado para la reunión especial (5-8 de Marzo).");
          return;
        }
      }
    }

    setSelectedShiftKey(`${day}-${slotIdx}`);
    setIsModalOpen(true);
  }, [zones, selectedZoneId, weekDates]);

  const handleJoin = async () => {
    if (!selectedShiftKey || !user || !selectedZoneId) return;
    const existingShift = shifts[selectedShiftKey];

    try {
      if (existingShift) {
        await joinShift(existingShift.id);
      } else {
        const [dayName, slotIdxStr] = selectedShiftKey.split("-");
        const slotIdx = parseInt(slotIdxStr, 10);
        const slot = TIME_SLOTS[slotIdx];
        const dayData = weekDates.find(d => d.name === dayName);
        if (!dayData) throw new Error("Fecha inválida");

        const startTime = new Date(dayData.fullDate);
        startTime.setHours(slot.startHour, slot.startMinute, 0, 0);
        const endTime = new Date(dayData.fullDate);
        endTime.setHours(slot.endHour, slot.endMinute, 0, 0);

        await createShift(
          startTime.toISOString(),
          endTime.toISOString(),
          selectedZoneId,
          dayData.fullDate.toLocaleDateString('en-CA')
        );
      }
      await invalidateShifts();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdminAdd = async (publisherId) => {
    if (!selectedShiftKey || !selectedZoneId) return;
    const existingShift = shifts[selectedShiftKey];

    try {
      if (existingShift) {
        await adminAddParticipant(existingShift.id, publisherId);
      } else {
        const [dayName, slotIdxStr] = selectedShiftKey.split("-");
        const slotIdx = parseInt(slotIdxStr, 10);
        const slot = TIME_SLOTS[slotIdx];
        const dayData = weekDates.find(d => d.name === dayName);
        if (!dayData) throw new Error("Fecha inválida");

        const startTime = new Date(dayData.fullDate);
        startTime.setHours(slot.startHour, slot.startMinute, 0, 0);
        const endTime = new Date(dayData.fullDate);
        endTime.setHours(slot.endHour, slot.endMinute, 0, 0);

        await apiClient.post("/shifts", {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          zoneId: selectedZoneId,
          publisherId: publisherId
        });
      }
      invalidateShifts();
    } catch (err) {
      throw err;
    }
  };

  const handleAdminStatusChange = async (status) => {
    if (!selectedShiftKey || !selectedZoneId) return;
    const existingShift = shifts[selectedShiftKey];

    try {
      if (existingShift) {
        await updateShiftStatus(existingShift.id, status);
      } else {
        const [dayName, slotIdxStr] = selectedShiftKey.split("-");
        const slotIdx = parseInt(slotIdxStr, 10);
        const slot = TIME_SLOTS[slotIdx];
        const dayData = weekDates.find(d => d.name === dayName);
        if (!dayData) throw new Error("Fecha inválida");

        const startTime = new Date(dayData.fullDate);
        startTime.setHours(slot.startHour, slot.startMinute, 0, 0);
        const endTime = new Date(dayData.fullDate);
        endTime.setHours(slot.endHour, slot.endMinute, 0, 0);

        await apiClient.post("/shifts", {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          zoneId: selectedZoneId,
          publisherId: null,
          status: status
        });
      }
      invalidateShifts();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLeave = async () => {
    if (!selectedShiftKey || !user) return;
    const shift = shifts[selectedShiftKey];
    if (!shift) return;

    try {
      await leaveShift(shift.id);
      await invalidateShifts();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Memoized status info
  const weekInfo = useMemo(() => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const firstDate = weekDates[0].fullDate;
    return `Semana ${getWeekOfMonth(firstDate)} de ${months[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
  }, [weekDates]);

  const selectedShiftDetails = useMemo(() => {
    if (!selectedShiftKey) return null;
    const [dayName] = selectedShiftKey.split("-");
    const dayData = weekDates.find(d => d.name === dayName);
    const zoneName = zones.find(z => z.id === selectedZoneId)?.name;

    return {
      ...(shifts[selectedShiftKey] || {
        day: dayName,
        slotIndex: parseInt(selectedShiftKey.split("-")[1]),
        publishers: []
      }),
      fullDate: dayData?.fullDate,
      zoneName: zoneName
    };
  }, [selectedShiftKey, shifts, weekDates, zones, selectedZoneId]);

  const isPast = useMemo(() => {
    if (!selectedShiftKey) return false;
    const [dayName, slotIdx] = selectedShiftKey.split("-");
    const dayData = weekDates.find(d => d.name === dayName);
    if (!dayData) return false;

    const slot = TIME_SLOTS[parseInt(slotIdx)];
    const today = new Date();

    // Create a date object for the shift slot in local time to compare
    const shiftDate = new Date(dayData.fullDate);
    // Use the slot start time (DR time)
    // Note: Our buttons show local time, so we compare current local time
    shiftDate.setHours(slot.startHour, slot.startMinute, 0, 0);

    return shiftDate < today;
  }, [selectedShiftKey, weekDates]);

  const isJoined = useMemo(() =>
    selectedShiftDetails?.publishers.some(p => p.email === user?.email),
    [selectedShiftDetails, user]);

  const isFull = useMemo(() =>
    selectedShiftDetails?.publishers.length >= 4,
    [selectedShiftDetails]);

  // Check if grid should be partially disabled/dimmed for non-special days
  // We can pass a function to ShiftGrid to determine availability per day
  const isDateUnavailable = useCallback((dayName) => {
    const currentZone = zones.find(z => z.id === selectedZoneId);
    if (currentZone?.name === SPECIAL_EVENT_ZONE_NAME) {
      const dayDate = weekDates.find(d => d.name === dayName)?.fullDate;
      if (dayDate) {
        const isSpecialDay = dayDate.getMonth() === SPECIAL_EVENT_MONTH && SPECIAL_EVENT_DAYS.includes(dayDate.getDate());
        return !isSpecialDay;
      }
    }
    return false;
  }, [zones, selectedZoneId, weekDates]);


  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-500">
      {/* TEMP DEBUG */}
      <div className="text-xs text-center text-gray-400 font-mono">
        Zones: {zones.length} ({zones.map(z => z.name).join(", ")}) | SpecialWeek: {weekDates.some(d => d.fullDate.getMonth() === 2 && [5, 6, 7, 8].includes(d.fullDate.getDate())) ? "YES" : "NO"}
      </div>

      <ZoneSelector
        zones={filteredZones}
        selectedZoneId={selectedZoneId}
        onSelect={onZoneSelect}
      />

      <CalendarControls
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        weekInfo={weekInfo}
        zoneColor={zoneColor}
      />

      <ShiftGrid
        weekDates={weekDates}
        timeSlots={TIME_SLOTS}
        shifts={shifts}
        user={user}
        loading={loading}
        onSlotClick={handleSlotClick}
        zoneColor={zoneColor}
        isDateUnavailable={isDateUnavailable}
      />

      <Suspense fallback={null}>
        <ShiftModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          selectedShift={selectedShiftDetails}
          isPast={isPast}
          isJoined={isJoined}
          isFull={isFull}
          user={user}
          onJoin={handleJoin}
          onLeave={handleLeave}
          timeSlots={TIME_SLOTS}
          allPublishers={allPublishers}
          onAdminUpdate={invalidateShifts}
          onAdminAdd={handleAdminAdd}
          onAdminStatusChange={handleAdminStatusChange}
        />
      </Suspense>
    </div>
  );
}

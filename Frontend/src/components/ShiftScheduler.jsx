import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "../hooks/useAuth";
import { getShifts, joinShift, leaveShift, createShift } from "../api/shifts";

const DISPLAY_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const TIME_SLOTS = [
  { label: "7:30 - 9:30 AM", startHour: 7, startMinute: 30, endHour: 9, endMinute: 30 },
  { label: "9:30 - 11:00 AM", startHour: 9, startMinute: 30, endHour: 11, endMinute: 0 },
  { label: "4:00 - 6:00 PM", startHour: 16, startMinute: 0, endHour: 18, endMinute: 0 },
  { label: "6:00 - 7:30 PM", startHour: 18, startMinute: 0, endHour: 19, endMinute: 30 },
];

const getCurrentWeekDates = () => {
  const today = new Date();
  const day = today.getDay(); // 0 (Sun) to 6 (Sat)
  // Adjust diff to get Monday of the current week
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  return DISPLAY_DAYS.map((dayName, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return {
      name: dayName,
      date: d.getDate(),
      fullDate: d
    };
  });
};

export function ShiftScheduler() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState({});
  const [selectedShiftKey, setSelectedShiftKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weekDates] = useState(getCurrentWeekDates());

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await getShifts();
      const mappedShifts = {};

      data.forEach(shift => {
        const shiftDate = new Date(shift.date);
        shiftDate.setHours(0, 0, 0, 0);

        // Find if shift belongs to the current week display
        const weekDay = weekDates.find(wd => {
          const wdDate = new Date(wd.fullDate);
          wdDate.setHours(0, 0, 0, 0);
          return wdDate.getTime() === shiftDate.getTime();
        });

        if (weekDay) {
          const startTime = new Date(shift.schedule.startTime);
          const startHour = startTime.getUTCHours();
          const startMinute = startTime.getUTCMinutes();

          const slotIndex = TIME_SLOTS.findIndex(s => s.startHour === startHour && s.startMinute === startMinute);

          if (slotIndex !== -1) {
            const key = `${weekDay.name}-${slotIndex}`;
            mappedShifts[key] = {
              id: shift.id,
              day: weekDay.name,
              slotIndex,
              publishers: shift.publishers.map(p => ({
                id: p.publisher.id,
                name: p.publisher.name,
                email: p.publisher.email
              }))
            };
          }
        }
      });

      setShifts(mappedShifts);
    } catch (error) {
      console.error("Failed to fetch shifts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSlotClick = (day, slotIndex) => {
    const key = `${day}-${slotIndex}`;
    setSelectedShiftKey(key);
    setIsModalOpen(true);
  };

  const handleJoin = async () => {
    if (!selectedShiftKey || !user) return;
    const shift = shifts[selectedShiftKey];

    try {
      if (shift) {
        await joinShift(shift.id);
      } else {
        const [dayName, slotIndexStr] = selectedShiftKey.split("-");
        const slotIndex = parseInt(slotIndexStr, 10);
        const slot = TIME_SLOTS[slotIndex];

        const dayData = weekDates.find(d => d.name === dayName);
        if (!dayData) throw new Error("Fecha no válida");

        const date = dayData.fullDate;

        const startTime = new Date(date);
        startTime.setUTCHours(slot.startHour, slot.startMinute, 0, 0);

        const endTime = new Date(date);
        endTime.setUTCHours(slot.endHour, slot.endMinute, 0, 0);

        await createShift(startTime.toISOString(), endTime.toISOString());
      }
      await fetchShifts();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLeave = async () => {
    if (!selectedShiftKey || !user) return;
    const shift = shifts[selectedShiftKey];

    try {
      if (shift) {
        await leaveShift(shift.id);
        await fetchShifts();
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const selectedShift = selectedShiftKey
    ? (shifts[selectedShiftKey] || {
      day: selectedShiftKey.split("-")[0],
      slotIndex: parseInt(selectedShiftKey.split("-")[1]),
      publishers: []
    })
    : null;

  const isJoined = selectedShift?.publishers.some((p) => p.email === user?.email);
  const isFull = selectedShift?.publishers.length >= 4;

  return (
    <div className="p-4 bg-white rounded-lg shadow overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header Row */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-4">
          <div className="font-bold text-gray-400 text-xs uppercase flex items-center justify-center">Hora</div>
          {weekDates.map((day) => (
            <div key={day.name} className="flex flex-col items-center pb-2 border-b-2 border-transparent">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">{day.name}</span>
              <span className="text-xl font-bold text-gray-800">{day.date}</span>
            </div>
          ))}
        </div>

        {/* Time Slots */}
        <div className="grid gap-2">
          {TIME_SLOTS.map((slot, index) => (
            <div key={index} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2">
              {/* Time Label */}
              <div className="text-gray-500 font-medium text-sm flex items-center justify-center text-center px-2">
                {slot.label}
              </div>

              {/* Day Slots */}
              {weekDates.map((day) => {
                const key = `${day.name}-${index}`;
                const shift = shifts[key];
                const count = shift?.publishers.length || 0;
                const isUserIn = shift?.publishers.some(p => p.email === user?.email);

                // Wednesday (Miércoles) and Sunday (Domingo) slots 2 and 3 (4:00-7:30 PM) are unavailable
                const isUnavailable = (day.name === "Miércoles" || day.name === "Domingo") && (index === 2 || index === 3);

                let bgClass = "bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100 cursor-pointer";

                if (isUnavailable) {
                  bgClass = "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed striped-background";
                } else if (shift) {
                  bgClass = "bg-white border-gray-300 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
                  if (isUserIn) {
                    bgClass = "bg-indigo-100 border-indigo-500 text-indigo-700 font-semibold cursor-pointer";
                  } else if (count >= 4) {
                    bgClass = "bg-red-50 border-red-200 text-red-400 cursor-not-allowed";
                  } else if (count > 0) {
                    bgClass = "bg-green-50 border-green-200 text-green-600 cursor-pointer";
                  }
                }

                return (
                  <div
                    key={key}
                    onClick={() => !isUnavailable && !loading && handleSlotClick(day.name, index)}
                    className={cn(
                      "min-h-[4rem] h-auto py-2 rounded-md border transition-all flex flex-col items-center justify-center text-sm",
                      loading ? "bg-gray-50 border-gray-100 animate-pulse" : bgClass
                    )}
                  >
                    {loading ? (
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                    ) : isUnavailable ? (
                      <span className="text-xs italic text-gray-400">No disponible</span>
                    ) : shift ? (
                      <div className="flex flex-col items-center w-full overflow-hidden">
                        <span className="text-xs font-bold mb-1">{count}/4</span>
                        <div className="flex flex-col gap-0.5 w-full px-1">
                          {shift.publishers.map((p) => (
                            <span
                              key={p.id}
                              className="text-[13px] leading-tight w-full text-center line-clamp-1 break-words"
                              title={p.name}
                            >
                              {p.name.length > 10
                                ? p.name.slice(0, 10) + "…"
                                : p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Turno {selectedShift?.day} {selectedShift?.slotIndex !== undefined ? TIME_SLOTS[selectedShift.slotIndex]?.label : ""}</DialogTitle>
            <DialogDescription>
              Detalles del turno y participantes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Participantes ({selectedShift?.publishers.length}/4)</h4>
            {selectedShift?.publishers.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No hay nadie anotado aún.</p>
            ) : (
              <ul className="space-y-2">
                {selectedShift?.publishers.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm p-2 bg-secondary rounded-md">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    {p.name} {p.email === user?.email && "(Tú)"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            {isJoined ? (
              <Button variant="destructive" onClick={handleLeave}>
                Salir del turno
              </Button>
            ) : (
              <Button onClick={handleJoin} disabled={isFull}>
                {isFull ? "Turno Completo" : "Inscribirme"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

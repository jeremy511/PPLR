import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Header } from "../components/Header";
import { ShiftScheduler } from "../components/ShiftScheduler";
import { ZoneInfoCard } from "../components/ZoneInfoCard";
import { getZones } from "../api/shifts";
import { useQuery } from "@tanstack/react-query";
import "react-loading-skeleton/dist/skeleton.css";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { LoadingScreen } from "../components/ui/LoadingScreen";

import { CherryBlossomBackground } from "../components/ui/CherryBlossomBackground";

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Fetch Zones (Only active ones)
  const { data: zones = [], isLoading: zonesLoading } = useQuery({
    queryKey: ["zones", "active"],
    queryFn: () => getZones(false),
  });

  // Set initial zone
  useEffect(() => {
    if (zones && zones.length > 0 && !selectedZoneId) {
      // Prefer keeping current selection if valid, otherwise pick first
      const exists = zones.find(z => z.id === selectedZoneId);
      if (!exists) {
        setSelectedZoneId(zones[0].id);
      }
    }
  }, [zones, selectedZoneId]);

  const selectedZone = zones.find(z => z.id === selectedZoneId) || null;

  if (authLoading || zonesLoading) {
    return <LoadingScreen text="Cargando tablero..." />;
  }

  return (
    <div className={`min-h-screen py-10 px-4 md:px-8 transition-colors duration-500 relative ${selectedZone?.name === "Jardin Botanico" ? "" : "bg-background"
      }`}>
      {selectedZone?.name === "Jardin Botanico" && <CherryBlossomBackground />}

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <Header />

        {/* Carousel Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border p-2 md:p-8">
          <div className="flex justify-center">
            <Carousel
              plugins={[Autoplay({ delay: 5000 })]}
              className="w-full max-w-5xl"
            >
              <CarouselContent>
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="border-0 shadow-none">
                        <CardContent className="flex flex-col gap-2 p-0">
                          <div className="aspect-[16/9] md:aspect-[32/9] w-full overflow-hidden rounded-xl relative">
                            <img
                              src={`https://picsum.photos/seed/${index + 1}/1200/400`}
                              alt={`Slide ${index + 1}`}
                              loading={index === 0 ? "eager" : "lazy"}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 backdrop-blur-sm">
                              <p className="text-white text-xs md:text-sm font-medium text-center">
                                Momento destacado de la congregación #{index + 1} - Reunión especial
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>

        {/* Scheduler Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border p-2 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">Cronograma de Turnos</h3>
              <p className="text-muted-foreground text-sm mt-1">Gestiona y visualiza las asignaciones semanales.</p>
            </div>
          </div>
          <ShiftScheduler
            zones={zones}
            selectedZoneId={selectedZoneId}
            onZoneSelect={setSelectedZoneId}
            zoneColor={selectedZone?.color}
          />
        </section>

        {/* Zone Info Cards Section */}
        {selectedZone && (
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xl font-bold text-foreground">Información de {selectedZone.name}</h3>
            </div>
            <ZoneInfoCard zone={selectedZone} />
          </section>
        )}
      </div>
    </div>
  );
};


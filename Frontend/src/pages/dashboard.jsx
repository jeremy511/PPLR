import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/Layout";
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
import { BlossomBackground } from "../components/ui/BlossomBackground";


const CAROUSEL_IMAGES = [
  "/Group1.JPG",
  "/Group2.JPG",
  "/Group3.JPG",
];

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  // Fetch Zones (Only active ones)
  const { data: zones = [], isLoading: zonesLoading, error: zonesError, refetch: refetchZones } = useQuery({
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

  if (zonesError) {
    return (
      <Layout>
        <div className="p-8 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl max-w-lg mx-auto my-12">
          <h2 className="text-lg font-bold text-red-900 dark:text-red-300">No se pudo cargar la información del tablero</h2>
          <p className="text-sm text-red-700 dark:text-red-400 mt-2">
            {zonesError.message || "Ocurrió un problema al conectar con el servidor."}
          </p>
          <button
            onClick={() => refetchZones()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      </Layout>
    );
  }

  const isJardinBotanico = selectedZone?.name === "Jardin Botanico";
  const glassEffect = isJardinBotanico
    ? "bg-white/60 backdrop-blur-md border-white/40 shadow-lg"
    : "bg-card border-border shadow-sm";

  return (
    <Layout
      className={isJardinBotanico ? "!bg-transparent" : ""}
      background={isJardinBotanico ? <BlossomBackground /> : null}
    >
        {/* Carousel Section */}
        <section className={`${glassEffect} rounded-2xl p-2 md:p-8 border transition-all duration-300`}>
          <div className="flex justify-center">
            <Carousel
              plugins={[Autoplay({ delay: 5000 })]}
              className="w-full max-w-5xl"
            >
              <CarouselContent>
                {CAROUSEL_IMAGES.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card className="border-0 shadow-none bg-transparent">
                        <CardContent className="flex flex-col gap-2 p-0">
                          <div className="aspect-[16/9] md:aspect-[32/9] w-full overflow-hidden rounded-xl relative">
                            <img
                              src={src}
                              alt={`Slide ${index + 1}`}
                              loading={index === 0 ? "eager" : "lazy"}
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 backdrop-blur-sm">
                              <p className="text-white text-xs md:text-sm font-medium text-center">
                                Momento destacado de la congregación #{index + 1}
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
        <section className={`${glassEffect} rounded-2xl p-2 md:p-8 border transition-all duration-300`}>
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
            zoneColor={isJardinBotanico ? "#00731B" : selectedZone?.color}
          />
        </section>

        {/* Zone Info Cards Section */}
        {
          selectedZone && (
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xl font-bold text-foreground">Información de {selectedZone.name}</h3>
              </div>
              <ZoneInfoCard zone={selectedZone} />
            </section>
          )
        }
    </Layout>
  );
};

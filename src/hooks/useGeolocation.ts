import { useCallback, useRef, useState } from "react";
import type { Coords } from "../models/ubi.model";

export type GeolocationStatus = "idle" | "pending" | "active" | "error";

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000,
};

// Los códigos son propiedades de instancia de GeolocationPositionError, así que
// se comparan con los literales numéricos que define la especificación.
const ERROR_MESSAGES: Record<number, string> = {
  1: "Permiso de ubicación denegado. Actívalo en los ajustes del navegador.",
  2: "No se pudo determinar tu ubicación.",
  3: "La ubicación tardó demasiado. Inténtalo de nuevo.",
};

export interface UseGeolocation {
  location: Coords | null;
  status: GeolocationStatus;
  errorMessage: string | null;
  request: () => void;
  clear: () => void;
  toggle: () => void;
}

export const useGeolocation = (): UseGeolocation => {
  const [location, setLocation] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Evita que el doble render de StrictMode dispare dos prompts de permiso.
  const pendingRef = useRef(false);

  const request = useCallback(() => {
    if (pendingRef.current) return;

    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErrorMessage("Tu navegador no soporta geolocalización.");
      return;
    }

    pendingRef.current = true;
    setStatus("pending");
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        pendingRef.current = false;
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("active");
      },
      (error) => {
        pendingRef.current = false;
        setLocation(null);
        setStatus("error");
        setErrorMessage(
          ERROR_MESSAGES[error.code] ?? "No se pudo obtener tu ubicación.",
        );
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  const clear = useCallback(() => {
    pendingRef.current = false;
    setLocation(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const toggle = useCallback(() => {
    // Un toque durante la espera cancela, para no dejar el botón bloqueado.
    if (location || pendingRef.current) clear();
    else request();
  }, [location, clear, request]);

  return { location, status, errorMessage, request, clear, toggle };
};

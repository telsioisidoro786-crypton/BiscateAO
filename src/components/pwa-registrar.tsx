"use client";

import { useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";

/**
 * Componente cliente que registra o Service Worker e inicializa PWA
 * Deve ser renderizado uma vez no layout raiz
 */
export function PWARegistrar() {
  const { swRegistration } = usePWA();

  useEffect(() => {
    // O hook usePWA já registra o SW, mas podemos adicionar lógica extra aqui
    if (swRegistration) {
      // Enviar dados para cache no SW (profissionais vistos, etc.)
      swRegistration.active?.postMessage?.({
        type: 'CACHE_PROFISSIONAIS',
        profissionais: [], // Será preenchido dinamicamente
      });
    }
  }, [swRegistration]);

  return null;
}
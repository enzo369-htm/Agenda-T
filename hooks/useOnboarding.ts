'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  initializeOnboarding,
  getOnboardingFromStorage,
  saveOnboardingToStorage,
  markTaskAsCompleted as markTaskCompleted,
  setSidebarOpen as setSidebarOpenStorage,
  type OnboardingStorage,
} from '@/lib/onboarding-storage';
import { getOnboardingProgress } from '@/lib/onboarding';

export function useOnboarding(business?: any) {
  const { data: session } = useSession();
  const [onboardingState, setOnboardingState] = useState<OnboardingStorage>(initializeOnboarding);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar desde localStorage
  useEffect(() => {
    const stored = getOnboardingFromStorage();
    if (stored) {
      setOnboardingState(stored);
    }
    setIsInitialized(true);
  }, []);

  const markTaskAsCompleted = useCallback((taskId: string) => {
    markTaskCompleted(taskId);
    setOnboardingState((prev) => {
      const updatedTasks = prev.tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      );
      const updatedState = {
        ...prev,
        tasks: updatedTasks,
      };
      saveOnboardingToStorage(updatedState);
      return updatedState;
    });
  }, []);

  const setSidebarOpen = useCallback((isOpen: boolean) => {
    setSidebarOpenStorage(isOpen);
    setOnboardingState((prev) => {
      const updated = {
        ...prev,
        isSidebarOpen: isOpen,
        hasSeenOnboarding: true,
      };
      saveOnboardingToStorage(updated);
      return updated;
    });
  }, []);

  // Detectar tareas completadas automáticamente SOLO para "crear cuenta"
  // Las demás tareas se marcan manualmente cuando el usuario realiza la acción
  useEffect(() => {
    if (!isInitialized || !session) return;

    setOnboardingState((prev) => {
      const updatedTasks = [...prev.tasks];
      let hasChanges = false;

      // Solo marcar "crear cuenta" como completada si hay sesión activa
      // Esta es la única tarea que se detecta automáticamente
      const createAccountTask = updatedTasks.find((t) => t.id === 'create-account');
      if (createAccountTask && !createAccountTask.completed && session.user) {
        createAccountTask.completed = true;
        hasChanges = true;
      }

      // NO marcamos automáticamente otras tareas basándonos en datos existentes
      // Solo se marcan cuando el usuario realiza la acción explícitamente

      // Guardar cambios si hubo actualizaciones
      if (hasChanges) {
        const updatedState = {
          ...prev,
          tasks: updatedTasks,
        };
        saveOnboardingToStorage(updatedState);
        return updatedState;
      }

      return prev;
    });
  }, [business, session, isInitialized]);

  // Abrir sidebar automáticamente para nuevos usuarios
  useEffect(() => {
    if (!isInitialized || !session) return;
    
    setOnboardingState((prev) => {
      const progress = getOnboardingProgress(prev.tasks);
      const shouldOpen = !prev.hasSeenOnboarding && progress.percentage < 100;
      
      if (shouldOpen && !prev.isSidebarOpen) {
        // Delay para que la UI se renderice primero
        setTimeout(() => {
          setSidebarOpen(true);
        }, 1000);
      }
      
      return prev;
    });
  }, [isInitialized, session, setSidebarOpen]);

  const progress = getOnboardingProgress(onboardingState.tasks);

  return {
    tasks: onboardingState.tasks,
    progress,
    isSidebarOpen: onboardingState.isSidebarOpen,
    setSidebarOpen,
    markTaskAsCompleted,
    isInitialized,
  };
}


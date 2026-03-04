'use client';

import { ONBOARDING_TASKS, type OnboardingTask } from './onboarding';

const STORAGE_KEY = 'turnos-in-onboarding';

export interface OnboardingStorage {
  tasks: OnboardingTask[];
  isSidebarOpen: boolean;
  hasSeenOnboarding: boolean;
  lastUpdated: string;
}

export function getOnboardingFromStorage(): OnboardingStorage | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading onboarding from storage:', error);
  }
  
  return null;
}

export function saveOnboardingToStorage(data: OnboardingStorage): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error saving onboarding to storage:', error);
  }
}

export function initializeOnboarding(): OnboardingStorage {
  const stored = getOnboardingFromStorage();
  
  if (stored) {
    return stored;
  }
  
  return {
    tasks: ONBOARDING_TASKS,
    isSidebarOpen: false,
    hasSeenOnboarding: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function markTaskAsCompleted(taskId: string): void {
  const stored = getOnboardingFromStorage();
  if (!stored) return;
  
  const updatedTasks = stored.tasks.map((task) =>
    task.id === taskId ? { ...task, completed: true } : task
  );
  
  saveOnboardingToStorage({
    ...stored,
    tasks: updatedTasks,
  });
}

export function setSidebarOpen(isOpen: boolean): void {
  const stored = getOnboardingFromStorage();
  if (!stored) return;
  
  saveOnboardingToStorage({
    ...stored,
    isSidebarOpen: isOpen,
    hasSeenOnboarding: true,
  });
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function clearOnboardingProgress(): void {
  resetOnboarding();
}


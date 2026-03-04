export interface OnboardingTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  action?: {
    type: 'link' | 'button' | 'modal';
    label: string;
    href?: string;
    onClick?: () => void;
  };
  step: number;
}

export interface OnboardingState {
  tasks: OnboardingTask[];
  currentStep: number;
  isSidebarOpen: boolean;
  activeTooltip?: string;
}

export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    id: 'facebook-profile',
    title: 'Configura tu cuenta con un perfil de negocio de Facebook',
    completed: false,
    action: {
      type: 'link',
      label: 'Configurar',
      href: '#',
    },
    step: 1,
  },
  {
    id: 'create-account',
    title: 'Crea tu cuenta en Turnos In',
    completed: false, // Se marcará automáticamente solo si hay sesión activa
    action: {
      type: 'button',
      label: 'Repetir',
      onClick: () => {},
    },
    step: 2,
  },
  {
    id: 'configure-schedule',
    title: 'Configura tu horario de atención',
    completed: false,
    action: {
      type: 'button',
      label: 'Iniciar',
      onClick: () => {},
    },
    step: 3,
  },
  {
    id: 'configure-service',
    title: 'Configura tu primer servicio',
    completed: false,
    action: {
      type: 'button',
      label: 'Iniciar',
      onClick: () => {},
    },
    step: 4,
  },
  {
    id: 'test-booking',
    title: 'Crea una reserva y prueba WhatsApp',
    completed: false,
    action: {
      type: 'button',
      label: 'Iniciar',
      onClick: () => {},
    },
    step: 5,
  },
  {
    id: 'google-calendar',
    title: 'Descubre nuestra conexión con Google Calendar',
    completed: false,
    action: {
      type: 'button',
      label: 'Iniciar',
      onClick: () => {},
    },
    step: 6,
  },
  {
    id: 'know-website',
    title: 'Conoce tu sitio web de agendamiento',
    completed: false,
    action: {
      type: 'link',
      label: 'Iniciar',
      href: '#',
    },
    step: 7,
  },
];

export function getOnboardingProgress(tasks: OnboardingTask[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function getCurrentStep(tasks: OnboardingTask[]): number {
  const incompleteTask = tasks.find((t) => !t.completed);
  return incompleteTask?.step || tasks.length;
}

export function markTaskAsCompleted(taskId: string, tasks: OnboardingTask[]): OnboardingTask[] {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, completed: true } : task
  );
}


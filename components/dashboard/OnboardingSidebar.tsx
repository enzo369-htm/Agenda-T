'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { type OnboardingTask } from '@/lib/onboarding';
import { resetOnboarding } from '@/lib/onboarding-storage';

interface OnboardingSidebarProps {
  business?: any;
  tasks: OnboardingTask[];
  progress: { completed: number; total: number; percentage: number };
  onClose?: () => void;
  onTaskAction?: (task: OnboardingTask) => void;
}

export function OnboardingSidebar({ 
  business, 
  tasks, 
  progress,
  onClose,
  onTaskAction,
}: OnboardingSidebarProps) {
  const router = useRouter();

  const handleTaskAction = (task: OnboardingTask) => {
    if (onTaskAction) {
      onTaskAction(task);
      return;
    }

    // Navegar según la tarea
    switch (task.id) {
      case 'facebook-profile':
        // Abrir configuración de Facebook (placeholder)
        toast('Funcionalidad de Facebook próximamente');
        break;
      case 'configure-schedule':
        if (business?.slug) {
          router.push(`/dashboard/negocio/${business.slug}?tab=settings`);
          onClose?.();
        }
        break;
      case 'configure-service':
        if (business?.slug) {
          router.push(`/dashboard/negocio/${business.slug}?tab=settings`);
          onClose?.();
        }
        break;
      case 'test-booking':
        if (business?.slug) {
          router.push(`/dashboard/negocio/${business.slug}?tab=agenda`);
          onClose?.();
        }
        break;
      case 'google-calendar':
        if (business?.slug) {
          router.push(`/dashboard/negocio/${business.slug}?tab=settings`);
          onClose?.();
        }
        break;
      case 'know-website':
        if (business?.slug) {
          window.open(`/negocio/${business.slug}`, '_blank');
        }
        break;
      default:
        if (task.action?.type === 'link' && task.action.href) {
          if (task.action.href.startsWith('http')) {
            window.open(task.action.href, '_blank');
          } else {
            router.push(task.action.href);
          }
        } else if (task.action?.onClick) {
          task.action.onClick();
        }
        break;
    }
  };

  return (
    <div className="fixed right-0 top-0 z-50 h-full w-96 bg-white shadow-xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Primeros pasos</h2>
            <p className="text-sm text-gray-600">
              {progress.completed}/{progress.total} Has completado {progress.completed} de {progress.total} tareas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {progress.completed > 0 && (
              <button
                onClick={() => {
                  if (confirm('¿Deseas reiniciar el progreso de primeros pasos?')) {
                    resetOnboarding();
                    window.location.reload();
                  }
                }}
                className="rounded-lg p-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                title="Reiniciar progreso"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-lg border p-4 ${
                  task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {task.completed ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.completed ? 'text-green-800' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-1 text-xs text-gray-600">{task.description}</p>
                    )}
                    {task.action && (
                      <div className="mt-2">
                        {task.action.type === 'link' ? (
                          <a
                            href={task.action.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleTaskAction(task);
                            }}
                            className="text-xs font-medium text-primary-600 hover:text-primary-700"
                          >
                            {task.action.label}
                          </a>
                        ) : (
                          <Button
                            size="sm"
                            variant={task.completed ? 'outline' : 'primary'}
                            onClick={() => handleTaskAction(task)}
                            className="h-7 text-xs"
                          >
                            {task.action.label}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Discovery Cards */}
          <div className="mt-8">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Completa los primeros pasos y descubre más herramientas
            </h3>
            <div className="space-y-3">
              {/* Sales Module Card */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">Módulo de ventas</h4>
                  <p className="mb-3 text-xs text-gray-600">
                    Los ingresos de tu negocio al alcance de tu mano, en tiempo real
                  </p>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="h-7 text-xs"
                    onClick={() => {
                      if (business?.slug) {
                        router.push(`/dashboard/negocio/${business.slug}?tab=sales`);
                        onClose?.();
                      }
                    }}
                  >
                    Descubrir
                  </Button>
                  <p className="mt-2 text-xs text-gray-500">2 min</p>
                </CardContent>
              </Card>

              {/* WhatsApp Card */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">WhatsApp Personalizados</h4>
                  <p className="mb-3 text-xs text-gray-600">
                    Crea mensajes personalizados, podrás enviarlos desde la reserva a la velocidad del
                  </p>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    className="h-7 text-xs"
                    onClick={() => {
                      if (business?.slug) {
                        router.push(`/dashboard/negocio/${business.slug}?tab=sales`);
                        onClose?.();
                      }
                    }}
                  >
                    Descubrir
                  </Button>
                  <p className="mt-2 text-xs text-gray-500">2 min</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


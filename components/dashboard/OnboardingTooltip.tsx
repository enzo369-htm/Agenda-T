'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface OnboardingTooltipProps {
  title: string;
  description: string;
  step: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onNext?: () => void;
  onClose?: () => void;
  show?: boolean;
}

export function OnboardingTooltip({
  title,
  description,
  step,
  targetId,
  position = 'bottom',
  onNext,
  onClose,
  show = true,
}: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !targetId || !tooltipRef.current) return;

    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
      // Si no encuentra el elemento, intentar después de un delay
      const timeout = setTimeout(() => {
        const retryElement = document.getElementById(targetId);
        if (!retryElement) return;
      }, 500);
      return () => clearTimeout(timeout);
    }

    const updatePosition = () => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      if (!tooltipRect) return;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = targetRect.bottom + 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - 10;
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'right':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.right + 10;
          break;
        case 'left':
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          left = targetRect.left - tooltipRect.width - 10;
          break;
      }

      // Asegurar que el tooltip esté dentro de la ventana
      const padding = 10;
      if (top < padding) top = padding;
      if (left < padding) left = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }

      if (tooltipRef.current) {
        tooltipRef.current.style.top = `${top}px`;
        tooltipRef.current.style.left = `${left}px`;
      }
    };

    // Delay para asegurar que el DOM esté listo
    const timeout = setTimeout(updatePosition, 100);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [show, targetId, position]);

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 w-80 rounded-lg bg-gray-900 p-4 text-white shadow-xl"
        style={{ position: 'fixed' }}
      >
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="mt-1 text-xs text-gray-300">{description}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">{step}</span>
          <div className="flex gap-2">
            {onNext && (
              <Button
                size="sm"
                variant="primary"
                onClick={onNext}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Entendido
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


'use client';

import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  brandColor?: string;
  className?: string;
}

export function DatePicker({
  selected,
  onSelect,
  disabled,
  brandColor = '#0ea5e9',
  className,
}: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDisabled = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (d < today) return true;
    return disabled?.(date) ?? false;
  };

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-6 ${className ?? ''}`}
      style={
        {
          '--rdp-cell-size': '48px',
          '--rdp-caption-font-size': '20px',
          '--rdp-accent-color': brandColor,
          '--rdp-background-color': `${brandColor}25`,
          '--rdp-selected-color': '#fff',
        } as React.CSSProperties
      }
    >
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(d) => onSelect?.(d)}
        disabled={isDisabled}
        locale={es}
        showOutsideDays
        className="!m-0"
        components={{
          IconLeft: () => <ChevronLeft className="h-5 w-5" />,
          IconRight: () => <ChevronRight className="h-5 w-5" />,
        }}
        modifiersStyles={{
          selected: { backgroundColor: brandColor, color: '#fff' },
        }}
      />
    </div>
  );
}

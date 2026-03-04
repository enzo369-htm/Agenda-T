'use client';

import { useMemo, memo } from 'react';
import { formatTime } from '@/lib/utils';

interface WeekCalendarViewProps {
  bookings: any[];
  selectedDate: Date;
  selectedEmployee?: string;
  onTimeSlotClick?: (date: Date, time: string) => void;
  onBookingClick?: (booking: any) => void;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9);

function WeekCalendarViewComponent({
  bookings,
  selectedDate,
  selectedEmployee,
  onTimeSlotClick,
  onBookingClick,
}: WeekCalendarViewProps) {
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(selectedDate.getDate() - selectedDate.getDay());
    return d;
  }, [selectedDate]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const bookingsBySlot = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const booking of bookings) {
      const bookingDate = new Date(booking.startTime);
      if (selectedEmployee && selectedEmployee !== 'all' && booking.employeeId !== selectedEmployee) continue;
      const key = `${bookingDate.toDateString()}-${bookingDate.getHours()}`;
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list);
    }
    return map;
  }, [bookings, selectedEmployee]);

  const getBookingsForSlot = (day: Date, hour: number) => {
    return bookingsBySlot.get(`${day.toDateString()}-${hour}`) ?? [];
  };

  const isWeekend = (day: Date) => {
    const dayOfWeek = day.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1000px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 text-sm font-medium text-gray-700">Hora</div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`border-l p-3 text-center ${
                isWeekend(day) ? 'bg-gray-100' : ''
              }`}
            >
              <div className="text-sm font-semibold text-gray-900">
                {day.toLocaleDateString('es-AR', { weekday: 'short' })}
              </div>
              <div className="text-xs text-gray-600">
                {day.toLocaleDateString('es-AR', { day: 'numeric', month: 'numeric' })}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b">
            <div className="p-2 text-sm text-gray-600">{hour.toString().padStart(2, '0')}:00</div>
            {days.map((day) => {
              const dayBookings = getBookingsForSlot(day, hour);
              const isWeekendDay = isWeekend(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`relative min-h-[80px] border-l p-1 ${
                    isWeekendDay ? 'bg-gray-50' : ''
                  }`}
                >
                  {dayBookings.map((booking) => {
                    const bookingDate = new Date(booking.startTime);
                    const duration = booking.service?.durationMinutes || 30;
                    const heightPercent = (duration / 60) * 100;

                    return (
                      <div
                        key={booking.id}
                        onClick={() => onBookingClick?.(booking)}
                        className="mb-1 cursor-pointer rounded bg-blue-100 p-2 text-xs hover:bg-blue-200 transition-colors"
                        style={{ minHeight: `${Math.max(heightPercent, 20)}%` }}
                      >
                        <div className="font-semibold text-gray-900">{booking.clientName}</div>
                        <div className="text-gray-600">
                          {formatTime(booking.startTime)}
                          {duration > 30 && ` - ${formatTime(new Date(bookingDate.getTime() + duration * 60000))}`}
                        </div>
                        {booking.service && (
                          <div className="text-gray-500">{booking.service.name}</div>
                        )}
                      </div>
                    );
                  })}
                  {dayBookings.length === 0 && !isWeekendDay && (
                    <button
                      onClick={() => {
                        const slotDate = new Date(day);
                        slotDate.setHours(hour, 0, 0, 0);
                        onTimeSlotClick?.(slotDate, `${hour.toString().padStart(2, '0')}:00`);
                      }}
                      className="h-full w-full opacity-0 hover:opacity-100 hover:bg-gray-100 transition-opacity rounded"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const WeekCalendarView = memo(WeekCalendarViewComponent);


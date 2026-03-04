'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface SidebarProps {
  business: any;
  selectedBranch?: string;
  selectedEmployee?: string;
  onBranchChange?: (branch: string) => void;
  onEmployeeChange?: (employee: string) => void;
  onDateSelect?: (date: Date) => void;
  onQuickSearch?: (query: string) => void;
}

export function Sidebar({
  business,
  selectedBranch,
  selectedEmployee,
  onBranchChange,
  onEmployeeChange,
  onDateSelect,
  onQuickSearch,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const businessUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/negocio/${business?.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(businessUrl);
    toast.success('Link copiado al portapapeles');
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    onDateSelect?.(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r bg-white">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-full p-3 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-white">
      {/* Collapse button */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Share Link Card */}
      <div className="border-b p-4">
        <div className="mb-2 flex items-center gap-2">
          <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-900">
            ¡Comparte tu link y recibe citas!
          </h3>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-2">
          <span className="flex-1 truncate text-xs text-gray-600">{businessUrl}</span>
          <button
            onClick={copyLink}
            className="p-1 hover:bg-gray-200 rounded"
            title="Copiar link"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="border-b p-4">
        <label className="mb-2 block text-xs font-medium text-gray-700">Sucursal</label>
        <select
          value={selectedBranch || business?.id}
          onChange={(e) => onBranchChange?.(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value={business?.id}>{business?.name}</option>
        </select>
      </div>

      {/* Employee Selector */}
      <div className="border-b p-4">
        <label className="mb-2 block text-xs font-medium text-gray-700">Profesional</label>
        <select
          value={selectedEmployee || 'all'}
          onChange={(e) => onEmployeeChange?.(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">Todos</option>
          {business?.employees?.filter((e: any) => e.isActive).map((employee: any) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Search */}
      <div className="border-b p-4">
        <label className="mb-2 block text-xs font-medium text-gray-700">
          Búsqueda rápida de hora
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar hora..."
            onChange={(e) => onQuickSearch?.(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold text-gray-900">
            {currentMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Days of week */}
        <div className="mb-2 grid grid-cols-7 gap-1 text-center">
          {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentMonth).map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            const isSelected =
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth.getMonth() &&
              selectedDate.getFullYear() === currentMonth.getFullYear();
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentMonth.getMonth() &&
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`aspect-square rounded text-xs transition-colors ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : isToday
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Next month preview */}
        <div className="mt-3 flex items-center justify-end">
          <button
            onClick={() => navigateMonth('next')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1).toLocaleDateString('es-AR', {
              month: 'long',
              year: 'numeric',
            })}{' '}
            →
          </button>
        </div>
      </div>
    </div>
  );
}


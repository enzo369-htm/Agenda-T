'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Logo } from '../ui/Logo';

interface DashboardHeaderProps {
  activeTab?: string;
  business?: any;
  onboardingProgress?: { completed: number; total: number };
  onOnboardingClick?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: Array<{ label: string; href: string }>;
}

export function DashboardHeader({ 
  activeTab = 'agenda', 
  business,
  onboardingProgress = { completed: 2, total: 6 },
  onOnboardingClick,
}: DashboardHeaderProps) {
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    { id: 'agenda', label: 'Agenda', href: business ? `/dashboard/negocio/${business.slug}?tab=agenda` : '/dashboard' },
    { 
      id: 'sales', 
      label: 'Ventas', 
      href: business ? `/dashboard/negocio/${business.slug}?tab=sales&sales=facturadas` : '/dashboard',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Ventas Facturadas', href: business ? `/dashboard/negocio/${business.slug}?tab=sales&sales=facturadas` : '#' },
        { label: 'Mis cobros', href: business ? `/dashboard/negocio/${business.slug}?tab=sales&sales=cobros` : '#' },
      ]
    },
    { id: 'services', label: 'Servicios', href: business ? `/dashboard/negocio/${business.slug}?tab=services` : '/dashboard' },
    { id: 'clients', label: 'Clientes', href: business ? `/dashboard/negocio/${business.slug}?tab=clients` : '/dashboard' },
    { id: 'admin', label: 'Administración', href: business ? `/dashboard/negocio/${business.slug}?tab=settings` : '/dashboard' },
  ];

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/">
          <Logo variant="full" size="md" />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            if (item.hasDropdown) {
              return (
                <div key={item.id} className="relative group">
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    {item.dropdownItems?.map((dropdownItem, idx) => (
                      <Link
                        key={idx}
                        href={dropdownItem.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Progress indicator */}
          <button
            onClick={onOnboardingClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <span>{onboardingProgress.completed}/{onboardingProgress.total} Primeros pasos</span>
          </button>

          {/* Website link */}
          {business && (
            <Link
              href={`/negocio/${business.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              Sitio web
            </Link>
          )}

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white hover:bg-primary-700">
              {userInitials}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


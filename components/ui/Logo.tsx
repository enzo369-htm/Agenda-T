'use client';

interface LogoProps {
  variant?: 'full' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizes[size];

  if (variant === 'icon') {
    return (
      <div className={`${iconSize} ${className}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Fondo con gradiente */}
          <rect width="48" height="48" rx="12" fill="url(#gradient)" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9221ED" />
              <stop offset="1" stopColor="#EF54B4" />
            </linearGradient>
          </defs>
          
          {/* Calendario */}
          <rect x="10" y="12" width="28" height="28" rx="4" fill="white" opacity="0.95" />
          <rect x="10" y="12" width="28" height="6" rx="2" fill="url(#gradient)" />
          
          {/* Líneas del calendario */}
          <line x1="18" y1="22" x2="30" y2="22" stroke="#9221ED" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="28" x2="30" y2="28" stroke="#EF54B4" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="34" x2="26" y2="34" stroke="#9221ED" strokeWidth="2" strokeLinecap="round" />
          
          {/* Punto de entrada (In) */}
          <circle cx="32" cy="28" r="3" fill="#EF54B4" />
          <path d="M30 28 L32 30 L34 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`font-bold text-gray-900 ${textSize} ${className}`}>
        Turnos In
      </span>
    );
  }

  // Full logo (icon + text)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={iconSize}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Fondo con gradiente */}
          <rect width="48" height="48" rx="12" fill="url(#gradient)" />
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#9221ED" />
              <stop offset="1" stopColor="#EF54B4" />
            </linearGradient>
          </defs>
          
          {/* Calendario */}
          <rect x="10" y="12" width="28" height="28" rx="4" fill="white" opacity="0.95" />
          <rect x="10" y="12" width="28" height="6" rx="2" fill="url(#gradient)" />
          
          {/* Líneas del calendario */}
          <line x1="18" y1="22" x2="30" y2="22" stroke="#9221ED" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="28" x2="30" y2="28" stroke="#EF54B4" strokeWidth="2" strokeLinecap="round" />
          <line x1="18" y1="34" x2="26" y2="34" stroke="#9221ED" strokeWidth="2" strokeLinecap="round" />
          
          {/* Punto de entrada (In) */}
          <circle cx="32" cy="28" r="3" fill="#EF54B4" />
          <path d="M30 28 L32 30 L34 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      <span className={`font-bold text-gray-900 ${textSize}`}>
        Turnos In
      </span>
    </div>
  );
}




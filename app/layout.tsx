import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Agenda Turnos Pro - Sistema de Reservas Online',
  description:
    'Plataforma de agendado de turnos online para peluquerías, barberías y centros estéticos. Gestiona reservas, empleados y servicios de forma simple y profesional.',
  keywords: ['turnos', 'reservas', 'agenda', 'peluquería', 'barbería', 'estética'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}


import { redirect } from 'next/navigation';

export default function BusinessesPage() {
  // Esta plataforma es para dueños de negocio (no un marketplace de clientes).
  redirect('/');
}


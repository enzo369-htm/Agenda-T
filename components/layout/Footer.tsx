import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Agenda Turnos Pro</h3>
            <p className="text-sm text-gray-600">
              La plataforma más completa para gestionar reservas y citas online.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Para Clientes</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/negocios" className="text-gray-600 hover:text-primary-600">
                  Buscar Negocios
                </Link>
              </li>
              <li>
                <Link href="/mis-reservas" className="text-gray-600 hover:text-primary-600">
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link href="/como-funciona" className="text-gray-600 hover:text-primary-600">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Para Negocios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/para-negocios" className="text-gray-600 hover:text-primary-600">
                  Información
                </Link>
              </li>
              <li>
                <Link href="/precios" className="text-gray-600 hover:text-primary-600">
                  Planes y Precios
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=BUSINESS_OWNER" className="text-gray-600 hover:text-primary-600">
                  Crear Cuenta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ayuda" className="text-gray-600 hover:text-primary-600">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-600 hover:text-primary-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="text-gray-600 hover:text-primary-600">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-gray-600 hover:text-primary-600">
                  Términos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>© {currentYear} Agenda Turnos Pro. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}


import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-5xl font-bold leading-tight">
                Gestiona turnos online de forma simple y profesional
              </h1>
              <p className="mb-8 text-xl text-primary-100">
                La plataforma completa para peluquerías, barberías y centros estéticos.
                Reservas 24/7, pagos online y recordatorios automáticos.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/negocios">
                  <Button size="lg" variant="secondary">
                    Buscar Negocios
                  </Button>
                </Link>
                <Link href="/para-negocios">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Para Negocios
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Todo lo que necesitas en una sola plataforma
              </h2>
              <p className="text-lg text-gray-600">
                Potentes herramientas para gestionar tu negocio de servicios
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="📅"
                title="Agenda Online 24/7"
                description="Tus clientes pueden reservar turnos en cualquier momento, desde cualquier dispositivo."
              />
              <FeatureCard
                icon="💳"
                title="Pagos Integrados"
                description="Acepta pagos online con Stripe o MercadoPago. También puedes cobrar en el local."
              />
              <FeatureCard
                icon="🔔"
                title="Recordatorios Automáticos"
                description="Envía recordatorios por email y WhatsApp para reducir ausencias."
              />
              <FeatureCard
                icon="👥"
                title="Gestión de Empleados"
                description="Asigna servicios y horarios a tus empleados fácilmente."
              />
              <FeatureCard
                icon="📊"
                title="Reportes y Analytics"
                description="Visualiza métricas de reservas, ingresos y ocupación en tiempo real."
              />
              <FeatureCard
                icon="🔗"
                title="Integraciones"
                description="Conecta con Google Calendar, WhatsApp y más herramientas."
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                ¿Cómo funciona?
              </h2>
              <p className="text-lg text-gray-600">
                En solo 3 simples pasos
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="1"
                title="Crea tu cuenta"
                description="Regístrate gratis y configura tu negocio en minutos."
              />
              <StepCard
                number="2"
                title="Agrega servicios"
                description="Define tus servicios, precios, duración y empleados."
              />
              <StepCard
                number="3"
                title="Recibe reservas"
                description="Comparte tu link y empieza a recibir turnos online."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-600 px-8 py-16 text-center text-white">
              <h2 className="mb-4 text-4xl font-bold">
                ¿Listo para digitalizar tu negocio?
              </h2>
              <p className="mb-8 text-xl text-white/90">
                Únete a cientos de negocios que ya usan Agenda Turnos Pro
              </p>
              <Link href="/auth/register?role=BUSINESS_OWNER">
                <Button size="lg" variant="secondary">
                  Comenzar Gratis - 14 días de prueba
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
        {number}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}


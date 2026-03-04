import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section - Mejorado */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 py-24 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-6 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                🎉 Prueba gratis por 14 días - Sin tarjeta de crédito
              </div>
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
                Software de gestión de turnos, pagos y administración
              </h1>
              <p className="mb-8 text-xl text-primary-100 md:text-2xl">
                Optimizá la gestión de tu negocio. Agenda online, automatizaciones y reportes en una sola plataforma.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/auth/register?role=BUSINESS_OWNER">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Probá Gratis Acá
                  </Button>
                </Link>
                <Link href="#como-funciona">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                    Ver Cómo Funciona
                  </Button>
                </Link>
              </div>
              <p className="mt-6 text-sm text-primary-200">
                ✅ Sin costo inicial • ✅ Configuración en minutos • ✅ Soporte incluido
              </p>
            </div>
          </div>
        </section>

        {/* Formulario de Optimización */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left: Benefits */}
                <div>
                  <h2 className="mb-6 text-3xl font-bold text-gray-900">
                    Optimizá la gestión de tu negocio
                  </h2>
                  <div className="space-y-4">
                    <BenefitItem
                      icon="📅"
                      title="Agenda Online 24/7"
                      description="Tus clientes reservan cuando quieran, sin llamadas ni mensajes."
                    />
                    <BenefitItem
                      icon="💰"
                      title="Control de Ingresos"
                      description="Visualizá tus ventas, pagos pendientes y reportes en tiempo real."
                    />
                    <BenefitItem
                      icon="🤖"
                      title="Automatizaciones"
                      description="Recordatorios automáticos por email y WhatsApp. Menos ausencias."
                    />
                    <BenefitItem
                      icon="👥"
                      title="Gestión de Equipo"
                      description="Asigná servicios, horarios y comisiones a tus empleados."
                    />
                    <BenefitItem
                      icon="📊"
                      title="Reportes Detallados"
                      description="Analytics completo de reservas, ingresos y rendimiento."
                    />
                    <BenefitItem
                      icon="💳"
                      title="Pagos Integrados"
                      description="Aceptá pagos online y en el local. Todo centralizado."
                    />
                  </div>
                </div>

                {/* Right: Form */}
                <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 p-8 text-white">
                  <h3 className="mb-6 text-2xl font-bold">Probá gratis ahora</h3>
                  <form className="space-y-4" action="/auth/register?role=BUSINESS_OWNER" method="get">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Tipo de negocio</label>
                      <select
                        name="business_type"
                        className="w-full rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-900">Selecciona</option>
                        <option value="beauty" className="text-gray-900">Peluquería / Belleza</option>
                        <option value="barber" className="text-gray-900">Barbería</option>
                        <option value="spa" className="text-gray-900">Spa / Estética</option>
                        <option value="nails" className="text-gray-900">Manicura / Pedicura</option>
                        <option value="massage" className="text-gray-900">Masajes</option>
                        <option value="other" className="text-gray-900">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Tu nombre</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Ej: Juan"
                        className="w-full rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">¿Cuál es tu necesidad principal?</label>
                      <select
                        name="need"
                        className="w-full rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-900">Selecciona</option>
                        <option value="bookings" className="text-gray-900">Organizar turnos</option>
                        <option value="payments" className="text-gray-900">Gestionar pagos</option>
                        <option value="clients" className="text-gray-900">Base de clientes</option>
                        <option value="reports" className="text-gray-900">Reportes y analytics</option>
                        <option value="automation" className="text-gray-900">Automatizaciones</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">¿En cuánto tiempo quieres implementarlo?*</label>
                      <select
                        name="timeline"
                        required
                        className="w-full rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-900">- Por favor selecciona una opción -</option>
                        <option value="immediate" className="text-gray-900">Inmediatamente</option>
                        <option value="week" className="text-gray-900">Esta semana</option>
                        <option value="month" className="text-gray-900">Este mes</option>
                        <option value="exploring" className="text-gray-900">Solo explorando</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">¿Cuál es tu rol?*</label>
                      <select
                        name="role"
                        required
                        className="w-full rounded-lg border-0 bg-white/20 px-4 py-3 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        defaultValue=""
                      >
                        <option value="" disabled className="text-gray-900">- Por favor selecciona una opción -</option>
                        <option value="owner" className="text-gray-900">Dueño / Propietario</option>
                        <option value="manager" className="text-gray-900">Gerente / Administrador</option>
                        <option value="employee" className="text-gray-900">Empleado</option>
                      </select>
                    </div>
                    <Link href="/auth/register?role=BUSINESS_OWNER" className="block">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full bg-white text-primary-600 hover:bg-gray-100 text-lg py-6 font-bold"
                      >
                        ¡PROBÁ GRATIS AQUÍ!
                      </Button>
                    </Link>
                    <p className="text-center text-xs text-white/80">
                      Al registrarte, aceptas nuestros{' '}
                      <Link href="/terminos" className="underline">
                        Términos y Condiciones
                      </Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Mejorado */}
        <section className="py-20" id="como-funciona">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Todo lo que necesitas en una sola plataforma
              </h2>
              <p className="text-lg text-gray-600">
                Potentes herramientas diseñadas específicamente para negocios de servicios
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="📅"
                title="Agenda Online 24/7"
                description="Tus clientes pueden reservar turnos en cualquier momento, desde cualquier dispositivo. Sin llamadas, sin confusiones."
              />
              <FeatureCard
                icon="💳"
                title="Pagos Integrados"
                description="Acepta pagos online con Stripe o MercadoPago. También puedes cobrar en el local. Todo centralizado."
              />
              <FeatureCard
                icon="🔔"
                title="Recordatorios Automáticos"
                description="Envía recordatorios por email y WhatsApp para reducir ausencias. Configura horarios personalizados."
              />
              <FeatureCard
                icon="👥"
                title="Gestión de Empleados"
                description="Asigna servicios y horarios a tus empleados fácilmente. Control de comisiones y rendimiento."
              />
              <FeatureCard
                icon="📊"
                title="Reportes y Analytics"
                description="Visualiza métricas de reservas, ingresos y ocupación en tiempo real. Exporta datos a Excel."
              />
              <FeatureCard
                icon="🔗"
                title="Integraciones"
                description="Conecta con Google Calendar, WhatsApp Business y más herramientas que ya usas."
              />
              <FeatureCard
                icon="📱"
                title="Página Web Personalizada"
                description="Cada negocio tiene su propia página web profesional donde los clientes pueden reservar."
              />
              <FeatureCard
                icon="💬"
                title="Base de Clientes"
                description="Gestiona tu base de clientes, historial de servicios y preferencias. Todo en un solo lugar."
              />
              <FeatureCard
                icon="⚡"
                title="Automatizaciones"
                description="Automatiza confirmaciones, recordatorios y seguimientos. Ahorra tiempo y aumenta la eficiencia."
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="bg-gray-100 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
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
                description="Regístrate gratis en menos de 2 minutos. No necesitas tarjeta de crédito."
              />
              <StepCard
                number="2"
                title="Configura tu negocio"
                description="Agrega tus servicios, precios, horarios y empleados. Todo en minutos."
              />
              <StepCard
                number="3"
                title="Comparte y recibe reservas"
                description="Comparte tu link personalizado y empieza a recibir turnos online inmediatamente."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20" id="precios">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Planes que se adaptan a tu negocio
              </h2>
              <p className="text-lg text-gray-600">
                Empezá gratis y crecé cuando lo necesites
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <PricingCard
                name="Free"
                price={0}
                period="Siempre gratis"
                description="Perfecto para empezar"
                features={[
                  '50 reservas/mes',
                  '1 empleado',
                  '5 servicios',
                  'Agenda básica',
                  'Recordatorios por email',
                ]}
                highlighted={false}
              />
              <PricingCard
                name="Basic"
                price={99}
                period="por mes"
                description="Para negocios pequeños"
                features={[
                  '200 reservas/mes',
                  '3 empleados',
                  '20 servicios',
                  'Agenda completa',
                  'Reportes básicos',
                  'Soporte por email',
                ]}
                highlighted={false}
              />
              <PricingCard
                name="Professional"
                price={199}
                period="por mes"
                description="Para negocios en crecimiento"
                features={[
                  '1,000 reservas/mes',
                  '10 empleados',
                  '100 servicios',
                  'Analytics avanzado',
                  'Integraciones',
                  'Soporte prioritario',
                ]}
                highlighted={true}
              />
              <PricingCard
                name="Enterprise"
                price={399}
                period="por mes"
                description="Para negocios grandes"
                features={[
                  'Reservas ilimitadas',
                  'Empleados ilimitados',
                  'Servicios ilimitados',
                  'Dominio personalizado',
                  'API personalizada',
                  'Soporte 24/7',
                ]}
                highlighted={false}
              />
            </div>
          </div>
        </section>

        {/* CTA Section Final */}
        <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center text-white">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                ¿Listo para digitalizar tu negocio?
              </h2>
              <p className="mb-8 text-xl text-white/90">
                Únete a cientos de negocios que ya usan Turnos In para gestionar sus reservas
              </p>
              <Link href="/auth/register?role=BUSINESS_OWNER">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Comenzar Gratis - 14 días de prueba
                </Button>
              </Link>
              <p className="mt-6 text-sm text-white/80">
                Sin tarjeta de crédito • Cancelá cuando quieras • Soporte incluido
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function BenefitItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 text-3xl">{icon}</div>
      <div>
        <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
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

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-6 ${
        highlighted
          ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
          : 'border-gray-200 bg-white'
      }`}
    >
      {highlighted && (
        <div className="mb-4 inline-block rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
          MÁS POPULAR
        </div>
      )}
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{name}</h3>
      <div className="mb-2">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        {price > 0 && <span className="text-gray-600"> ARS</span>}
        <span className="text-sm text-gray-600"> / {period}</span>
      </div>
      <p className="mb-6 text-sm text-gray-600">{description}</p>
      <ul className="mb-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-primary-600">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/auth/register?role=BUSINESS_OWNER" className="block">
        <Button
          variant={highlighted ? 'primary' : 'outline'}
          className="w-full"
        >
          {price === 0 ? 'Empezar Gratis' : 'Elegir Plan'}
        </Button>
      </Link>
    </div>
  );
}

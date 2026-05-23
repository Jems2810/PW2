import React from 'react';
import { Link } from 'react-router-dom';
import BuildIcon from '@mui/icons-material/Build';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const services = [
  {
    icon: BuildIcon,
    color: 'bg-primary-100 text-primary-700',
    title: 'Reparaciones especializadas',
    description: 'Diagnóstico gratuito y reparación de pantallas, baterías, puertos y placas para todas las marcas.',
    bullets: ['Repuestos originales', 'Garantía de 90 días', 'Entrega en 24-48h']
  },
  {
    icon: VerifiedUserIcon,
    color: 'bg-emerald-100 text-emerald-700',
    title: 'Garantía extendida',
    description: 'Amplía hasta 24 meses la cobertura de tu equipo nuevo con protección contra fallas y daños accidentales.',
    bullets: ['Cobertura ampliada', 'Reemplazo express', 'Soporte premium 24/7']
  },
  {
    icon: CreditScoreIcon,
    color: 'bg-violet-100 text-violet-700',
    title: 'Financiamiento a meses',
    description: 'Hasta 18 meses sin intereses con tarjetas participantes. Aprobación rápida directo en tienda.',
    bullets: ['MSI con bancos selectos', 'Sin enganche disponible', 'Aprobación en minutos']
  },
  {
    icon: LocalShippingIcon,
    color: 'bg-sky-100 text-sky-700',
    title: 'Envíos a todo México',
    description: 'Envío estándar y express con seguimiento en tiempo real. Cobertura nacional con paqueterías premium.',
    bullets: ['Envío gratis +$5,000', 'Express en 24h CDMX/MTY', 'Tracking en línea']
  },
  {
    icon: SyncAltIcon,
    color: 'bg-amber-100 text-amber-700',
    title: 'Plan de cambio (Trade-in)',
    description: 'Recibimos tu equipo usado en parte de pago para que estrenes el modelo más reciente con mejor precio.',
    bullets: ['Avalúo en línea', 'Aplica a cualquier marca', 'Bonificación inmediata']
  },
  {
    icon: SupportAgentIcon,
    color: 'bg-rose-100 text-rose-700',
    title: 'Soporte técnico',
    description: 'Atención por WhatsApp, correo y teléfono con técnicos certificados antes y después de tu compra.',
    bullets: ['Atención personalizada', 'Respuesta < 30 min', 'Asesoría preventa y posventa']
  }
];

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <Navbar />

      <section className="pt-32 pb-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <span className="inline-block rounded-full bg-primary-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
            Servicios MovilStore
          </span>
          <h1 className="mt-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Más allá de la venta: te acompañamos en todo el ciclo
          </h1>
          <p className="mt-4 max-w-2xl text-gray-600">
            Reparaciones, financiamiento, envíos y soporte. Cada servicio fue diseñado para que tu experiencia con tu equipo sea segura, ágil y confiable.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${service.color}`}>
                  <Icon />
                </span>
                <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
                <p className="text-sm text-gray-600">{service.description}</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-700">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl bg-gray-900 p-8 text-white lg:grid-cols-[1.5fr,1fr] lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-300">¿Necesitas asesoría?</p>
            <h2 className="mt-3 text-3xl font-bold">Hablemos de tu proyecto o reparación</h2>
            <p className="mt-3 max-w-xl text-gray-300">
              Cuéntanos qué necesitas y te respondemos en menos de 30 minutos en horario hábil. Sin compromisos.
            </p>
          </div>
          <div className="flex flex-col gap-3 self-end">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600"
            >
              Ir al formulario de contacto
            </Link>
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Explorar catálogo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;

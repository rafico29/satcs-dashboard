import { useState, type FormEvent } from 'react';
import {
  Mail,
  MapPin,
  Linkedin,
  Github,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface FormState {
  nombre: string;
  organizacion: string;
  email: string;
  tipo: string;
  mensaje: string;
}

const INITIAL: FormState = {
  nombre: '',
  organizacion: '',
  email: '',
  tipo: 'General',
  mensaje: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactView() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );
  const [submitted, setSubmitted] = useState(false);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.nombre.trim()) next.nombre = 'Ingresa tu nombre';
    if (!form.organizacion.trim())
      next.organizacion = 'Ingresa tu organización';
    if (!form.email.trim()) next.email = 'Ingresa tu email';
    else if (!EMAIL_RE.test(form.email.trim()))
      next.email = 'Email no válido';
    if (!form.mensaje.trim()) next.mensaje = 'Cuéntanos cómo podemos ayudarte';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    // No real send - simulate success
    setSubmitted(true);
    setForm(INITIAL);
  };

  const inputClass = (field: keyof FormState) =>
    `w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-slate-200 focus:border-accent focus:ring-accent'
    }`;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Contacto
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Contáctanos</h1>
        <p className="mt-1 text-sm text-slate-500">
          ¿Tienes preguntas o quieres colaborar? Escríbenos.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Form */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card lg:col-span-3">
          {submitted && (
            <div className="mb-4 flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold">Mensaje recibido</p>
                <p className="mt-1 text-xs text-emerald-700">
                  Te contactaremos en 24-48 h. Gracias por escribir al equipo
                  SATCS.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={update('nombre')}
                  className={inputClass('nombre')}
                  autoComplete="name"
                />
                {errors.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errors.nombre}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organizacion"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  Organización
                </label>
                <input
                  id="organizacion"
                  type="text"
                  value={form.organizacion}
                  onChange={update('organizacion')}
                  className={inputClass('organizacion')}
                  autoComplete="organization"
                />
                {errors.organizacion && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.organizacion}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={update('email')}
                className={inputClass('email')}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="tipo"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Tipo de consulta
              </label>
              <select
                id="tipo"
                value={form.tipo}
                onChange={update('tipo')}
                className={inputClass('tipo')}
              >
                <option>General</option>
                <option>Demo</option>
                <option>Colaboración</option>
                <option>Soporte técnico</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="mensaje"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600"
              >
                Mensaje
              </label>
              <textarea
                id="mensaje"
                rows={5}
                value={form.mensaje}
                onChange={update('mensaje')}
                className={inputClass('mensaje')}
              />
              {errors.mensaje && (
                <p className="mt-1 text-xs text-red-600">{errors.mensaje}</p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
              Enviar mensaje
            </button>
          </form>
        </section>

        {/* Contact info */}
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-card lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Información de contacto
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Otros canales para conectar con el equipo SATCS.
          </p>

          <ul className="mt-4 space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <a
                  href="mailto:contacto@satcs.gov.co"
                  className="text-slate-800 hover:text-accent"
                >
                  contacto@satcs.gov.co
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ubicación
                </p>
                <p className="text-slate-800">Bogotá, Colombia</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                <Linkedin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  LinkedIn
                </p>
                <a
                  href="https://linkedin.com/company/satcs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-800 hover:text-accent"
                >
                  linkedin.com/company/satcs
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Github className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  GitHub
                </p>
                <a
                  href="https://github.com/satcs-team"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-800 hover:text-accent"
                >
                  github.com/satcs-team
                </a>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Clock className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Horario
                </p>
                <p className="text-slate-800">Lun a Vie · 8:00 - 18:00 COT</p>
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

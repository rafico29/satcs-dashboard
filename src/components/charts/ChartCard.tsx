import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: Props) {
  return (
    <section
      className={`flex h-full flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-card ${
        className ?? ''
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export function EmptyChart({
  message = 'Sin datos para mostrar',
}: {
  message?: string;
}) {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  );
}

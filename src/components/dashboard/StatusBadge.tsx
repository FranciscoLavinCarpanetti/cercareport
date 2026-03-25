import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'ok' | 'alert' | 'critical';
  className?: string;
}

const statusConfig = {
  ok: { label: 'OK', bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  alert: { label: 'ALERTA', bg: 'bg-orange/15', text: 'text-orange', dot: 'bg-orange' },
  critical: { label: 'CRÍTICO', bg: 'bg-destructive/15', text: 'text-destructive', dot: 'bg-destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn(`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-[1px] uppercase ${config.bg} ${config.text}`, className)}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
}

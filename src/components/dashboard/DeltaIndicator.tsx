import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaIndicatorProps {
  value: number;
  suffix?: string;
  invertColors?: boolean;
  className?: string;
}

export function DeltaIndicator({ value, suffix = '%', invertColors = false, className }: DeltaIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  let colorClass: string;
  if (isNeutral) colorClass = 'text-muted-foreground';
  else if (invertColors) colorClass = isPositive ? 'text-destructive' : 'text-emerald-400';
  else colorClass = isPositive ? 'text-emerald-400' : 'text-destructive';

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span className={cn(`inline-flex items-center gap-1 text-[11px] font-semibold ${colorClass}`, className)}>
      <Icon className="w-3 h-3" />
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  );
}

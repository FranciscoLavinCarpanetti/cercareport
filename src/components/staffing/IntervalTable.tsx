import type { IntervalResult } from "@/lib/workforce/staffing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props {
  intervals: IntervalResult[];
  slaTarget: number;
}

export function IntervalTable({ intervals, slaTarget }: Props) {
  const fmt = (v: number) => new Intl.NumberFormat('es-ES').format(v);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-card border-b border-border">
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-20">Hora</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Llamadas</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Erlangs</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Staff</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">SLA %</TableHead>
              <TableHead className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground text-right">Ocup. %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {intervals.map((row) => {
              const slaOk = row.sla >= slaTarget;
              return (
                <TableRow key={row.hour} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs text-foreground/80">{row.hour}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs">{fmt(row.calls)}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-muted-foreground">{row.erlangs}</TableCell>
                  <TableCell className="text-right tabular-nums text-xs font-semibold text-electric">{fmt(row.staffRequired)}</TableCell>
                  <TableCell className={`text-right tabular-nums text-xs font-semibold ${slaOk ? 'text-emerald-400' : 'text-destructive'}`}>
                    {row.sla}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs text-orange">{row.occupancy}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

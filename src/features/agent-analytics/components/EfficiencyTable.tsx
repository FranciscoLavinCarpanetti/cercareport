import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import type { AgentEfficiency } from '../types';

interface Props {
  data: AgentEfficiency[];
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function EfficiencyTable({ data }: Props) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Eficiencia Operativa por Agente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground text-[11px] uppercase">Agente</TableHead>
                <TableHead className="text-muted-foreground text-[11px] uppercase text-center">Sesiones</TableHead>
                <TableHead className="text-muted-foreground text-[11px] uppercase text-right">T. Productivo</TableHead>
                <TableHead className="text-muted-foreground text-[11px] uppercase text-right">T. Total</TableHead>
                <TableHead className="text-muted-foreground text-[11px] uppercase w-[200px]">Eficiencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((agent) => {
                const pct = Math.round(agent.efficiency * 100);
                const color = pct >= 70 ? 'text-green-400' : pct >= 50 ? 'text-accent' : 'text-destructive';
                return (
                  <TableRow key={agent.agentId} className="border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground text-sm">{agent.agentName}</TableCell>
                    <TableCell className="text-center text-muted-foreground text-sm">{agent.sessionCount}</TableCell>
                    <TableCell className="text-right text-sm text-accent">{formatDuration(agent.productiveSeconds)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{formatDuration(agent.totalSeconds)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className={`text-xs font-bold w-10 text-right ${color}`}>{pct}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

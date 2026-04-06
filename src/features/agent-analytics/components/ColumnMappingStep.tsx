import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, AlertCircle, Columns3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ExcelPreview, ColumnMapping } from '../utils/parseAgentExcel';

const REQUIRED_FIELDS = [
  { key: 'agentId', label: 'Agente (ID)', description: 'Identificador del agente', required: true },
  { key: 'agentName', label: 'Nombre Agente', description: 'Nombre del agente (opcional)', required: false },
  { key: 'start', label: 'Inicio Sesión', description: 'Fecha/hora de inicio', required: true },
  { key: 'end', label: 'Fin Sesión', description: 'Fecha/hora de fin', required: true },
  { key: 'state', label: 'Estado', description: 'Estado o actividad del agente', required: true },
] as const;

interface Props {
  preview: ExcelPreview;
  onConfirm: (mapping: ColumnMapping) => void;
  onBack: () => void;
}

export function ColumnMappingStep({ preview, onConfirm, onBack }: Props) {
  const [mapping, setMapping] = useState<Record<string, number | null>>(() => {
    const auto = preview.autoMapping as Record<string, number | null | undefined>;
    const initial: Record<string, number | null> = {};
    for (const f of REQUIRED_FIELDS) {
      initial[f.key] = auto[f.key] ?? null;
    }
    return initial;
  });

  const isValid = useMemo(() => {
    return REQUIRED_FIELDS
      .filter(f => f.required)
      .every(f => mapping[f.key] !== null && mapping[f.key] !== undefined);
  }, [mapping]);

  const autoDetectedCount = useMemo(() => {
    const auto = preview.autoMapping as Record<string, number | null | undefined>;
    return REQUIRED_FIELDS.filter(f => auto[f.key] !== undefined).length;
  }, [preview.autoMapping]);

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm({
      agentId: mapping.agentId!,
      agentName: mapping.agentName ?? null,
      start: mapping.start!,
      end: mapping.end!,
      state: mapping.state!,
    });
  };

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold tracking-tight">
          Mapeo de <span className="text-accent">Columnas</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {preview.totalRows} filas detectadas · {preview.headers.length} columnas · {autoDetectedCount} auto-detectadas
        </p>
      </motion.div>

      {/* Mapping form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground flex items-center gap-2">
              <Columns3 className="w-4 h-4" /> Asignar Campos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {REQUIRED_FIELDS.map((field) => {
              const value = mapping[field.key];
              const isSet = value !== null && value !== undefined;
              return (
                <div key={field.key} className="flex items-center gap-4">
                  <div className="w-5 shrink-0">
                    {isSet ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : field.required ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-border" />
                    )}
                  </div>
                  <div className="w-40 shrink-0">
                    <div className="text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-0.5">*</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{field.description}</div>
                  </div>
                  <Select
                    value={value !== null && value !== undefined ? String(value) : ''}
                    onValueChange={(v) => setMapping(prev => ({ ...prev, [field.key]: v === '__none__' ? null : parseInt(v, 10) }))}
                  >
                    <SelectTrigger className="flex-1 bg-muted/30 border-border">
                      <SelectValue placeholder="— Seleccionar columna —" />
                    </SelectTrigger>
                    <SelectContent>
                      {!field.required && <SelectItem value="__none__">— Ninguna —</SelectItem>}
                      {preview.headers.map((h, i) => (
                        <SelectItem key={i} value={String(i)}>
                          Col {String.fromCharCode(65 + i)}: {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Vista Previa (primeras 5 filas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    {preview.headers.map((h, i) => {
                      const mappedField = REQUIRED_FIELDS.find(f => mapping[f.key] === i);
                      return (
                        <TableHead key={i} className="text-[11px] uppercase whitespace-nowrap">
                          <div className="text-muted-foreground">{h}</div>
                          {mappedField && (
                            <div className="text-accent text-[10px] font-bold mt-0.5">→ {mappedField.label}</div>
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.sampleRows.map((row, ri) => (
                    <TableRow key={ri} className="border-border">
                      {row.map((cell, ci) => (
                        <TableCell key={ci} className="text-xs text-muted-foreground whitespace-nowrap max-w-[200px] truncate">
                          {cell || '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          ← Volver
        </Button>
        <Button onClick={handleConfirm} disabled={!isValid} size="sm" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
          Analizar <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

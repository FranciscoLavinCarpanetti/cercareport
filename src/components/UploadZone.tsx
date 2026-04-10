import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet } from "lucide-react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  subtitle?: string;
}

export function UploadZone({ onFileSelected, subtitle = 'Carga tu informe diario para generar el cierre ejecutivo' }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-66px)] px-6 py-12">
      {/* Executive tagline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-bold tracking-[-0.04em] mb-2">
          Panel de <span className="text-orange">Reporting</span>
        </h1>
        <p className="text-sm text-muted-foreground font-normal tracking-wide">
          {subtitle}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0, delay: 0.1 }}
        className={`relative w-full max-w-[520px] rounded-2xl cursor-pointer snap-transition duration-300 overflow-hidden group ${
          dragOver ? "-translate-y-1" : "hover:-translate-y-1"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className={`relative border-2 rounded-2xl p-10 text-center snap-transition duration-300 ${
          dragOver
            ? "border-orange bg-navy-mid shadow-orange"
            : "border-border bg-card hover:border-orange/60 hover:shadow-[0_0_40px_rgba(255,153,3,0.08)]"
        }`}>
          {/* Top accent line */}
          <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-orange/50 to-transparent" />

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          <div className="flex flex-col items-center gap-5">
            {/* Icon container */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center snap-transition duration-300 ${
              dragOver
                ? "bg-orange/20 shadow-orange"
                : "bg-orange/10 group-hover:bg-orange/15"
            }`}>
              <Upload className={`w-7 h-7 snap-transition duration-300 ${
                dragOver ? "text-orange scale-110" : "text-orange/80 group-hover:text-orange"
              }`} />
            </div>

            <div>
              <div className="text-lg font-bold text-orange mb-1.5 tracking-[-0.01em]">
                Subir Excel de Llamadas
              </div>
              <div className="text-[13px] text-muted-foreground leading-relaxed font-normal">
                Arrastra el archivo o haz clic para seleccionar
              </div>
            </div>

            {/* File types badge */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border">
                <FileSpreadsheet className="w-3.5 h-3.5" /> .xlsx
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border">
                <FileSpreadsheet className="w-3.5 h-3.5" /> .xls
              </span>
            </div>

            {fileName && (
              <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/30 rounded-lg px-4 py-2 text-xs text-orange font-semibold">
                📎 {fileName}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex items-center gap-2 text-[10px] text-muted-foreground/50 font-medium tracking-wide uppercase"
      >
        <span className="w-8 h-px bg-border" />
        Columnas: País · Día · Llamadas · AWT · ATT
        <span className="w-8 h-px bg-border" />
      </motion.div>
    </div>
  );
}

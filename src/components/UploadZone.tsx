import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
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
    <div className="flex items-center justify-center min-h-[calc(100vh-66px)] px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        className={`relative w-full max-w-[560px] border-2 border-dashed rounded-[20px] p-12 text-center cursor-pointer snap-transition duration-300 ${
          dragOver
            ? "border-orange bg-gradient-to-br from-orange/12 to-navy/90 -translate-y-1 shadow-[0_16px_48px_rgba(255,153,3,0.2)]"
            : "border-orange/50 bg-gradient-to-br from-orange/[0.06] to-navy/80 hover:border-orange hover:from-orange/12 hover:to-navy/90 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(255,153,3,0.2)]"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {/* Gradient border overlay */}
        <div className="absolute inset-[-1px] rounded-[20px] bg-gradient-to-br from-orange/20 via-transparent to-electric/10 pointer-events-none" />

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

        <div className="relative z-10">
          <div className="text-[56px] mb-4 drop-shadow-[0_4px_12px_rgba(255,153,3,0.4)]">
            <Upload className="w-14 h-14 mx-auto text-orange" />
          </div>
          <div className="text-[22px] font-extrabold text-orange mb-2.5 tracking-[0.5px]">
            Subir Excel de Llamadas
          </div>
          <div className="text-xs text-gray-400 leading-[1.8] font-normal">
            Arrastra el archivo o haz clic para seleccionar<br />
            <em>Llamadas por hora · agentes · .xlsx / .xls</em>
          </div>
          {fileName && (
            <div className="inline-flex items-center gap-2 bg-orange/12 border border-orange/40 rounded-lg px-4 py-2 mt-4 text-xs text-orange font-semibold">
              📎 {fileName}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

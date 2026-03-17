import { Phone } from "lucide-react";

interface AppHeaderProps {
  showActions: boolean;
  onReset: () => void;
  onExport: () => void;
}

export function AppHeader({ showActions, onReset, onExport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-7 py-3 border-b-2 border-orange bg-gradient-to-r from-navy-deep via-navy to-navy-deep shadow-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange to-orange-deep flex items-center justify-center shadow-orange">
          <Phone className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-[2px] uppercase">
            CERCA <span className="text-orange">REPORTING</span>
          </div>
          <span className="text-[9px] font-semibold text-gray-400 tracking-[2.5px] uppercase block -mt-0.5">
            Call Center Intelligence
          </span>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2.5 items-center">
          <button
            onClick={onReset}
            className="h-[38px] px-4 rounded-lg border border-orange/45 text-orange text-[11px] font-bold tracking-[0.9px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:bg-orange/10 hover:border-orange hover:-translate-y-px"
          >
            ↩ Nuevo Excel
          </button>
          <button
            onClick={onExport}
            className="h-[38px] px-4 rounded-lg bg-gradient-to-br from-orange to-orange-deep text-navy-deep text-[11px] font-bold tracking-[0.9px] uppercase inline-flex items-center gap-1.5 shadow-orange snap-transition duration-150 hover:from-orange-bright hover:to-orange hover:-translate-y-px"
          >
            📷 Exportar imagen
          </button>
        </div>
      )}
    </header>
  );
}

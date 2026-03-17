import { Phone, BarChart3 } from "lucide-react";

interface AppHeaderProps {
  showActions: boolean;
  onReset: () => void;
  onExport: () => void;
}

export function AppHeader({ showActions, onReset, onExport }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-7 py-3 bg-navy border-b border-border">
      {/* Orange accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange/0 via-orange to-orange/0" />

      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center">
          <Phone className="w-[18px] h-[18px] text-accent-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-[1.5px] uppercase leading-tight">
            CERCA <span className="text-orange">REPORTING</span>
          </div>
          <span className="text-[8px] font-semibold text-gray-400 tracking-[2px] uppercase block mt-[-1px]">
            Call Center Intelligence
          </span>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-2 items-center">
          <button
            onClick={onReset}
            className="h-9 px-4 rounded-lg border border-border text-gray-400 text-[11px] font-semibold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:text-foreground hover:border-foreground/20 hover:-translate-y-px"
          >
            ↩ Nuevo
          </button>
          <button
            onClick={onExport}
            className="h-9 px-5 rounded-lg bg-orange text-accent-foreground text-[11px] font-bold tracking-[0.5px] uppercase inline-flex items-center gap-1.5 snap-transition duration-150 hover:bg-orange-bright hover:-translate-y-px active:scale-[0.98]"
          >
            <BarChart3 className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      )}
    </header>
  );
}

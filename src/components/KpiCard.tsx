import { motion } from "framer-motion";

interface KpiCardProps {
  label: string;
  value: number;
  unit?: string;
  variant?: "orange" | "white" | "electric";
  index?: number;
}

const colorMap = {
  orange: "text-orange",
  white: "text-foreground",
  electric: "text-electric",
};

export function KpiCard({ label, value, unit, variant = "orange", index = 0 }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0, delay: index * 0.04 }}
      className="py-6 px-4 text-center border-r border-foreground/[0.06] last:border-r-0 snap-transition duration-150 hover:bg-foreground/[0.02]"
    >
      <div className="text-[9px] text-gray-400 uppercase tracking-[1.8px] font-semibold mb-3 leading-none">
        {label}
      </div>
      <div className={`text-[38px] font-extrabold leading-none tracking-[-1px] tabular-nums ${colorMap[variant]}`}>
        {value.toLocaleString('es-ES')}
        {unit && <span className="text-sm font-semibold text-gray-400 ml-0.5">{unit}</span>}
      </div>
    </motion.div>
  );
}

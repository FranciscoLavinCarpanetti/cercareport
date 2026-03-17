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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0, delay: index * 0.05 }}
      className={`py-5 px-3.5 text-center border-r border-foreground/[0.06] last:border-r-0 snap-transition duration-150 ${
        variant === "electric" ? "hover:bg-electric/[0.05]" : "hover:bg-orange/[0.05]"
      }`}
    >
      <div className="text-[9px] text-gray-400 uppercase tracking-[1.5px] font-semibold mb-2.5 leading-[1.4]">
        {label}
      </div>
      <div className={`text-4xl font-extrabold leading-none tracking-[-0.5px] tabular-nums ${colorMap[variant]}`}>
        {value.toLocaleString('es-ES')}
        {unit && <span className="text-[15px] font-semibold text-gray-400 ml-0.5">{unit}</span>}
      </div>
    </motion.div>
  );
}

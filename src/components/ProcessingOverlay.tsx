import { motion, AnimatePresence } from "framer-motion";

interface ProcessingOverlayProps {
  active: boolean;
}

export function ProcessingOverlay({ active }: ProcessingOverlayProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-navy-deep/[0.92] backdrop-blur-sm"
        >
          <div className="w-[50px] h-[50px] border-[3px] border-orange/15 border-t-orange rounded-full animate-spin" />
          <div className="text-[13px] font-bold text-orange tracking-[2px] uppercase">
            Procesando Excel…
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

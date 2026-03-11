'use client';

import { motion } from 'framer-motion';
import type { BarChartBlock as BarChartBlockType } from '@/types';

export function BarChartBlock({ title, data, unit, maxValue }: BarChartBlockType) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {title && <p className="text-xs text-white/70 mono">{title}</p>}

      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = max > 0 ? (item.value / max) * 100 : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/90">{item.label}</span>
                <span className="text-white/70 mono">
                  {item.value}{unit}
                </span>
              </div>
              <div className="h-1 bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="h-full bg-white/20"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

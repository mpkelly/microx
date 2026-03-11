'use client';

import type { PieChartBlock as PieChartBlockType } from '@/types';

export function PieChartBlock({ title, data }: PieChartBlockType) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      {title && <p className="text-xs text-white/70 mono">{title}</p>}

      <div className="space-y-2">
        {data.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={i} className="flex items-center gap-4 text-sm">
              <span className="text-white/70 mono w-10">{pct}%</span>
              <span className="text-white/70">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

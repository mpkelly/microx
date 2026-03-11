'use client';

import type { ScaleBlock as ScaleBlockType } from '@/types';

export function ScaleBlock({ title, leftLabel, rightLabel, markers }: ScaleBlockType) {
  return (
    <div className="space-y-4">
      {title && <p className="text-xs text-white/70 mono">{title}</p>}

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/70">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>

        <div className="relative h-px bg-white/10">
          {markers.map((marker, i) => (
            <div
              key={i}
              className="absolute -top-3 flex flex-col items-center"
              style={{ left: `${marker.position}%`, transform: 'translateX(-50%)' }}
            >
              <span className="text-xs text-white/70 whitespace-nowrap">{marker.label}</span>
              <div className="w-px h-2 bg-white/30 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

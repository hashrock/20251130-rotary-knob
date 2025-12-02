import { useState } from 'react';
import { useDateTimeKnob, SCALES, SCALE_CONFIG, type TimeScale } from './useDateTimeKnob';
import { DEG_TO_RAD } from './svgUtils';

const VALUE_COLOR = '#4fc3f7';
const TRACK_COLOR = '#444';

interface RotaryKnobDateTimeProps {
  value?: Date;
  size?: number;
  onChange?: (date: Date) => void;
}

export function RotaryKnobDateTime({
  value = new Date(),
  size = 250,
  onChange,
}: RotaryKnobDateTimeProps) {
  const [activeScale, setActiveScale] = useState<TimeScale | null>(null);

  const center = size / 2;
  const padding = 8;
  const innerRadius = 40;
  const outerRadius = center - padding;

  const { knobRef, getScaleRadii, handleMouseDown, handleTouchStart } = useDateTimeKnob({
    center,
    innerRadius,
    outerRadius,
    onChange,
    onActiveScaleChange: setActiveScale,
  });

  const getValueForScale = (scale: TimeScale): number => {
    switch (scale) {
      case 'minute':
        return value.getMinutes();
      case 'hour':
        return value.getHours();
      case 'day':
        return value.getDate() - 1;
      case 'month':
        return value.getMonth();
      case 'year':
        return value.getFullYear() % 10;
    }
  };

  const year = value.getFullYear().toString();
  const month = (value.getMonth() + 1).toString().padStart(2, '0');
  const day = value.getDate().toString().padStart(2, '0');
  const hour = value.getHours().toString().padStart(2, '0');
  const minute = value.getMinutes().toString().padStart(2, '0');

  return (
    <svg
      ref={knobRef}
      width={size}
      height={size}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      onMouseDown={(e) => handleMouseDown(e, value)}
      onTouchStart={(e) => handleTouchStart(e, value)}
    >
      {/* Center circle */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 2}
        fill="#2a2a2a"
        stroke="#555"
        strokeWidth={2}
      />

      {/* Scale rings */}
      {SCALES.map((scale) => {
        const { ticks } = SCALE_CONFIG[scale];
        const radii = getScaleRadii(scale);
        const currentValue = getValueForScale(scale);
        const ringWidth = radii.outer - radii.inner - 2;

        return (
          <g key={scale}>
            {/* Track background */}
            <circle
              cx={center}
              cy={center}
              r={radii.mid}
              fill="none"
              stroke={TRACK_COLOR}
              strokeWidth={ringWidth}
            />

            {/* Tick dots */}
            {Array.from({ length: ticks }).map((_, i) => {
              const tickAngle = (i / ticks) * 360 - 90;
              const tickRad = tickAngle * DEG_TO_RAD;
              const isActive = i === currentValue;

              return (
                <circle
                  key={i}
                  cx={center + radii.mid * Math.cos(tickRad)}
                  cy={center + radii.mid * Math.sin(tickRad)}
                  r={isActive ? ringWidth / 2 + 1 : 1.5}
                  fill={isActive ? VALUE_COLOR : '#666'}
                  stroke={isActive ? '#fff' : 'none'}
                  strokeWidth={isActive ? 1.5 : 0}
                />
              );
            })}
          </g>
        );
      })}

      {/* Center date/time display */}
      <text
        x={center}
        y={center - 6}
        textAnchor="middle"
        fontSize={10}
      >
        <tspan fill={activeScale === 'year' ? VALUE_COLOR : '#888'}>{year}</tspan>
        <tspan fill="#888">/</tspan>
        <tspan fill={activeScale === 'month' ? VALUE_COLOR : '#888'}>{month}</tspan>
        <tspan fill="#888">/</tspan>
        <tspan fill={activeScale === 'day' ? VALUE_COLOR : '#888'}>{day}</tspan>
      </text>
      <text
        x={center}
        y={center + 10}
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
      >
        <tspan fill={activeScale === 'hour' ? VALUE_COLOR : '#fff'}>{hour}</tspan>
        <tspan fill="#888">:</tspan>
        <tspan fill={activeScale === 'minute' ? VALUE_COLOR : '#fff'}>{minute}</tspan>
      </text>
    </svg>
  );
}

import { useDateTimeKnob, SCALES, SCALE_CONFIG, type TimeScale } from './useDateTimeKnob';
import { DEG_TO_RAD } from './svgUtils';

const VALUE_COLOR = '#4fc3f7';
const TRACK_COLOR = '#333';

interface RotaryKnobDateTimeProps {
  value?: Date;
  size?: number;
  onChange?: (date: Date) => void;
}

export function RotaryKnobDateTime({
  value = new Date(),
  size = 280,
  onChange,
}: RotaryKnobDateTimeProps) {
  const center = size / 2;
  const padding = 10;
  const innerRadius = 35;
  const outerRadius = center - padding;

  const { knobRef, getScaleRadii, handleMouseDown, handleTouchStart } = useDateTimeKnob({
    center,
    innerRadius,
    outerRadius,
    onChange,
  });

  const getValueForScale = (scale: TimeScale): number => {
    switch (scale) {
      case 'minute':
        return value.getMinutes();
      case 'hour':
        return value.getHours();
      case 'day':
        return value.getDate() - 1; // 0-indexed for display
      case 'month':
        return value.getMonth();
      case 'year':
        return value.getFullYear() % 10;
    }
  };

  const getAngleForValue = (val: number, ticks: number): number => {
    return (val / ticks) * 360 - 90;
  };

  return (
    <svg
      ref={knobRef}
      width={size}
      height={size}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      onMouseDown={(e) => handleMouseDown(e, value)}
      onTouchStart={(e) => handleTouchStart(e, value)}
    >
      {/* Center display */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 4}
        fill="#1a1a1a"
        stroke="#444"
        strokeWidth={2}
      />

      {/* Scale rings */}
      {SCALES.map((scale) => {
        const { ticks, label } = SCALE_CONFIG[scale];
        const radii = getScaleRadii(scale);
        const currentValue = getValueForScale(scale);
        const indicatorAngle = getAngleForValue(currentValue, ticks);
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

            {/* Tick marks */}
            {Array.from({ length: ticks }).map((_, i) => {
              const tickAngle = (i / ticks) * 360 - 90;
              const tickRad = tickAngle * DEG_TO_RAD;
              const isActive = i === currentValue;
              const isMajor = scale === 'minute' || scale === 'hour'
                ? i % (scale === 'minute' ? 15 : 6) === 0
                : true;

              if (!isMajor && !isActive) return null;

              const tickInner = radii.inner + 1;
              const tickOuter = radii.outer - 1;

              return (
                <line
                  key={i}
                  x1={center + tickInner * Math.cos(tickRad)}
                  y1={center + tickInner * Math.sin(tickRad)}
                  x2={center + tickOuter * Math.cos(tickRad)}
                  y2={center + tickOuter * Math.sin(tickRad)}
                  stroke={isActive ? VALUE_COLOR : '#555'}
                  strokeWidth={isActive ? 3 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Current value indicator */}
            <circle
              cx={center + radii.mid * Math.cos(indicatorAngle * DEG_TO_RAD)}
              cy={center + radii.mid * Math.sin(indicatorAngle * DEG_TO_RAD)}
              r={ringWidth / 2}
              fill={VALUE_COLOR}
              stroke="#fff"
              strokeWidth={1.5}
            />

            {/* Scale label (at 12 o'clock position, outside) */}
            <text
              x={center + (radii.outer + 2) * Math.cos(-90 * DEG_TO_RAD)}
              y={center + (radii.outer + 2) * Math.sin(-90 * DEG_TO_RAD) - 2}
              textAnchor="middle"
              fill="#666"
              fontSize={8}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Center date/time display */}
      <text
        x={center}
        y={center - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={11}
        fontWeight="bold"
      >
        {value.getFullYear()}/{(value.getMonth() + 1).toString().padStart(2, '0')}/{value.getDate().toString().padStart(2, '0')}
      </text>
      <text
        x={center}
        y={center + 8}
        textAnchor="middle"
        fill={VALUE_COLOR}
        fontSize={13}
        fontWeight="bold"
      >
        {value.getHours().toString().padStart(2, '0')}:{value.getMinutes().toString().padStart(2, '0')}
      </text>
    </svg>
  );
}

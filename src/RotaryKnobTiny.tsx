import { useRotaryKnobBidirectional, START_ANGLE, END_ANGLE } from './useRotaryKnobBidirectional';
import { describeArc, DEG_TO_RAD } from './svgUtils';

interface RotaryKnobTinyProps {
  value?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function RotaryKnobTiny({
  value = 0,
  min = 0,
  max = 100,
  onChange,
}: RotaryKnobTinyProps) {
  const { knobRef, valueToAngle, handleMouseDown, handleTouchStart } = useRotaryKnobBidirectional({
    min,
    max,
    value,
    onChange,
  });

  const size = 24;
  const angle = valueToAngle(value);
  const center = size / 2;
  const radius = center - 2;
  const trackRadius = radius - 2;

  return (
    <svg
      ref={knobRef}
      width={size}
      height={size}
      style={{ cursor: 'move', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="#2a2a2a"
        stroke="#444"
        strokeWidth={1}
      />
      <path
        d={describeArc(center, center, trackRadius, START_ANGLE, END_ANGLE)}
        fill="none"
        stroke="#555"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={describeArc(center, center, trackRadius, START_ANGLE, angle)}
        fill="none"
        stroke="#4fc3f7"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <line
        x1={center}
        y1={center}
        x2={center + (radius - 4) * Math.cos((angle - 90) * DEG_TO_RAD)}
        y2={center + (radius - 4) * Math.sin((angle - 90) * DEG_TO_RAD)}
        stroke="#fff"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

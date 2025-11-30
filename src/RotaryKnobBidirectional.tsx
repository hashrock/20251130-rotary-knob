import { useRotaryKnobBidirectional, START_ANGLE, END_ANGLE } from './useRotaryKnobBidirectional';
import { describeArc, DEG_TO_RAD } from './svgUtils';

const PADDING = 10;
const TRACK_OFFSET = 8;
const INDICATOR_OFFSET = 20;
const STROKE_WIDTH = 3;
const TRACK_STROKE_WIDTH = 4;

interface RotaryKnobBidirectionalProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
}

export function RotaryKnobBidirectional({
  value = 0,
  min = 0,
  max = 100,
  size = 100,
  onChange,
}: RotaryKnobBidirectionalProps) {
  const { knobRef, valueToAngle, handleMouseDown, handleTouchStart } = useRotaryKnobBidirectional({
    min,
    max,
    value,
    onChange,
  });

  const angle = valueToAngle(value);
  const center = size / 2;
  const radius = center - PADDING;
  const trackRadius = radius - TRACK_OFFSET;
  const indicatorLength = radius - INDICATOR_OFFSET;

  return (
    <svg
      ref={knobRef}
      width={size}
      height={size}
      style={{ cursor: 'move', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* 背景の円 */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="#2a2a2a"
        stroke="#444"
        strokeWidth={STROKE_WIDTH}
      />

      {/* トラック（目盛り背景） */}
      <path
        d={describeArc(center, center, trackRadius, START_ANGLE, END_ANGLE)}
        fill="none"
        stroke="#555"
        strokeWidth={TRACK_STROKE_WIDTH}
        strokeLinecap="round"
      />

      {/* 値を示すアーク */}
      <path
        d={describeArc(center, center, trackRadius, START_ANGLE, angle)}
        fill="none"
        stroke="#4fc3f7"
        strokeWidth={TRACK_STROKE_WIDTH}
        strokeLinecap="round"
      />

      {/* ノブのインジケーター */}
      <line
        x1={center}
        y1={center}
        x2={center + indicatorLength * Math.cos((angle - 90) * DEG_TO_RAD)}
        y2={center + indicatorLength * Math.sin((angle - 90) * DEG_TO_RAD)}
        stroke="#fff"
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
    </svg>
  );
}

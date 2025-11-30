import { useRotaryKnobGari, START_ANGLE, END_ANGLE } from './useRotaryKnobGari';
import { describeArc, DEG_TO_RAD } from './svgUtils';

const PADDING = 10;
const TRACK_OFFSET = 8;
const INDICATOR_OFFSET = 20;
const STROKE_WIDTH = 3;
const TRACK_STROKE_WIDTH = 4;

const GARI_POSITIONS = [25, 50, 75];

interface RotaryKnobGariProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
}

export function RotaryKnobGari({
  value = 0,
  min = 0,
  max = 100,
  size = 100,
  onChange,
}: RotaryKnobGariProps) {
  const { knobRef, valueToAngle, handleMouseDown, handleTouchStart } = useRotaryKnobGari({
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
      style={{ cursor: 'grab', touchAction: 'none' }}
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

      {/* ガリ位置のマーカー */}
      {GARI_POSITIONS.map((pos) => {
        const gariAngle = valueToAngle(pos);
        const markerRadius = radius + 5;
        const x = center + markerRadius * Math.cos((gariAngle - 90) * DEG_TO_RAD);
        const y = center + markerRadius * Math.sin((gariAngle - 90) * DEG_TO_RAD);
        return (
          <circle
            key={pos}
            cx={x}
            cy={y}
            r={3}
            fill="#ff6b6b"
            opacity={0.7}
          />
        );
      })}

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

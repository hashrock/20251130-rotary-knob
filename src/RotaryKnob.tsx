import { useRef } from 'react';

// 角度関連の定数
const START_ANGLE = -135;
const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE; // 270度

// サイズ関連の定数
const PADDING = 10;
const TRACK_OFFSET = 8;
const INDICATOR_OFFSET = 20;
const STROKE_WIDTH = 3;
const TRACK_STROKE_WIDTH = 4;

// 角度変換用
const DEG_TO_RAD = Math.PI / 180;

interface RotaryKnobProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
}

export function RotaryKnob({
  value = 0,
  min = 0,
  max = 100,
  size = 100,
  onChange,
}: RotaryKnobProps) {
  const knobRef = useRef<SVGSVGElement>(null);

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  const angleToValue = (angle: number) => {
    const normalized = (angle - START_ANGLE) / ANGLE_RANGE;
    const clamped = Math.max(0, Math.min(1, normalized));
    return min + clamped * (max - min);
  };

  const getAngleFromEvent = (clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) / DEG_TO_RAD;
    angle = angle + 90;
    if (angle > 180) angle -= 360;
    return angle;
  };

  const updateValue = (clientX: number, clientY: number) => {
    const angle = getAngleFromEvent(clientX, clientY);
    const clampedAngle = Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
    const newValue = angleToValue(clampedAngle);
    onChange?.(Math.round(newValue));
  };

  // マウスイベント
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    updateValue(e.clientX, e.clientY);

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // タッチイベント
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    updateValue(touch.clientX, touch.clientY);

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      updateValue(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

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

// SVGアーク描画用のヘルパー関数
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

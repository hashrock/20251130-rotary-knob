import { useRef } from 'react';

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

  // 値を角度に変換 (0度から270度の範囲、-135度から始まる)
  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return -135 + normalized * 270;
  };

  // 角度を値に変換
  const angleToValue = (angle: number) => {
    // -135度から135度の範囲を0-1に正規化
    const normalized = (angle + 135) / 270;
    const clamped = Math.max(0, Math.min(1, normalized));
    return min + clamped * (max - min);
  };

  // マウス/タッチ位置から角度を計算
  const getAngleFromEvent = (clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    // 上が0度になるように調整
    angle = angle + 90;
    // -180から180の範囲に正規化
    if (angle > 180) angle -= 360;
    return angle;
  };

  const updateValue = (clientX: number, clientY: number) => {
    const angle = getAngleFromEvent(clientX, clientY);
    const clampedAngle = Math.max(-135, Math.min(135, angle));
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
  const radius = size / 2 - 10;

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
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="#2a2a2a"
        stroke="#444"
        strokeWidth="3"
      />

      {/* トラック（目盛り背景） */}
      <path
        d={describeArc(size / 2, size / 2, radius - 8, -135, 135)}
        fill="none"
        stroke="#555"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 値を示すアーク */}
      <path
        d={describeArc(size / 2, size / 2, radius - 8, -135, angle)}
        fill="none"
        stroke="#4fc3f7"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* ノブのインジケーター */}
      <line
        x1={size / 2}
        y1={size / 2}
        x2={size / 2 + (radius - 20) * Math.cos((angle - 90) * Math.PI / 180)}
        y2={size / 2 + (radius - 20) * Math.sin((angle - 90) * Math.PI / 180)}
        stroke="#fff"
        strokeWidth="3"
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

import { useState, useRef, useCallback } from 'react';
import { DEG_TO_RAD } from './svgUtils';
import { describeArc } from './svgUtils';

const VALUE_COLOR = '#4fc3f7';
const TRACK_COLOR = '#555';

type TimeScale = 'minute' | 'hour' | 'day' | 'month' | 'year';

const SCALE_CONFIG: Record<TimeScale, { ticks: number; label: string }> = {
  minute: { ticks: 60, label: '分' },
  hour: { ticks: 24, label: '時' },
  day: { ticks: 31, label: '日' },
  month: { ticks: 12, label: '月' },
  year: { ticks: 10, label: '年' },
};

const SCALES: TimeScale[] = ['minute', 'hour', 'day', 'month', 'year'];

interface RotaryKnobDateTimeSimpleProps {
  value?: Date;
  size?: number;
  onChange?: (date: Date) => void;
}

export function RotaryKnobDateTimeSimple({
  value = new Date(),
  size = 150,
  onChange,
}: RotaryKnobDateTimeSimpleProps) {
  const [activeScale, setActiveScale] = useState<TimeScale>('minute');
  const knobRef = useRef<SVGSVGElement>(null);
  const lastAngle = useRef<number>(0);
  const totalRotation = useRef<number>(0);

  const center = size / 2;
  const padding = 10;
  const radius = center - padding;
  const trackRadius = radius - 8;

  const getScaleFromDistance = useCallback((distance: number): TimeScale => {
    // 距離に応じてスケールを決定（近い=分、遠い=年）
    const normalized = Math.min(1, Math.max(0, distance / (size * 0.8)));
    const index = Math.min(SCALES.length - 1, Math.floor(normalized * SCALES.length));
    return SCALES[index];
  }, [size]);

  const getAngleFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return { angle: 0, distance: 0 };
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    let angle = Math.atan2(deltaY, deltaX) / DEG_TO_RAD;
    angle = angle + 90;
    if (angle > 180) angle -= 360;

    return { angle, distance };
  }, []);

  const snapToTick = useCallback((angle: number, scale: TimeScale): number => {
    const { ticks } = SCALE_CONFIG[scale];
    const tickAngle = 360 / ticks;
    return Math.round(angle / tickAngle) * tickAngle;
  }, []);

  const updateDate = useCallback((currentDate: Date, scale: TimeScale, angleDelta: number): Date => {
    const { ticks } = SCALE_CONFIG[scale];
    const tickAngle = 360 / ticks;
    const tickDelta = Math.round(angleDelta / tickAngle);

    if (tickDelta === 0) return currentDate;

    const newDate = new Date(currentDate);

    switch (scale) {
      case 'minute':
        newDate.setMinutes(newDate.getMinutes() + tickDelta);
        break;
      case 'hour':
        newDate.setHours(newDate.getHours() + tickDelta);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + tickDelta);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + tickDelta);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + tickDelta);
        break;
    }

    return newDate;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const { angle, distance } = getAngleFromEvent(e.clientX, e.clientY);
    const scale = getScaleFromDistance(distance);

    setActiveScale(scale);
    lastAngle.current = angle;
    totalRotation.current = 0;

    let currentDate = value;
    let currentScale = scale;

    const handleMouseMove = (e: MouseEvent) => {
      const { angle: newAngle, distance: newDistance } = getAngleFromEvent(e.clientX, e.clientY);
      const newScale = getScaleFromDistance(newDistance);

      if (newScale !== currentScale) {
        currentScale = newScale;
        setActiveScale(newScale);
        totalRotation.current = 0;
      }

      let angleDelta = newAngle - lastAngle.current;
      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;

      totalRotation.current += angleDelta;
      lastAngle.current = newAngle;

      const snappedRotation = snapToTick(totalRotation.current, currentScale);
      if (snappedRotation !== 0) {
        const newDate = updateDate(currentDate, currentScale, snappedRotation);
        currentDate = newDate;
        totalRotation.current -= snappedRotation;
        onChange?.(newDate);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [value, getAngleFromEvent, getScaleFromDistance, snapToTick, updateDate, onChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const { angle, distance } = getAngleFromEvent(touch.clientX, touch.clientY);
    const scale = getScaleFromDistance(distance);

    setActiveScale(scale);
    lastAngle.current = angle;
    totalRotation.current = 0;

    let currentDate = value;
    let currentScale = scale;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const { angle: newAngle, distance: newDistance } = getAngleFromEvent(touch.clientX, touch.clientY);
      const newScale = getScaleFromDistance(newDistance);

      if (newScale !== currentScale) {
        currentScale = newScale;
        setActiveScale(newScale);
        totalRotation.current = 0;
      }

      let angleDelta = newAngle - lastAngle.current;
      if (angleDelta > 180) angleDelta -= 360;
      if (angleDelta < -180) angleDelta += 360;

      totalRotation.current += angleDelta;
      lastAngle.current = newAngle;

      const snappedRotation = snapToTick(totalRotation.current, currentScale);
      if (snappedRotation !== 0) {
        const newDate = updateDate(currentDate, currentScale, snappedRotation);
        currentDate = newDate;
        totalRotation.current -= snappedRotation;
        onChange?.(newDate);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }, [value, getAngleFromEvent, getScaleFromDistance, snapToTick, updateDate, onChange]);

  const getValueForScale = (scale: TimeScale): number => {
    switch (scale) {
      case 'minute': return value.getMinutes();
      case 'hour': return value.getHours();
      case 'day': return value.getDate() - 1;
      case 'month': return value.getMonth();
      case 'year': return value.getFullYear() % 10;
    }
  };

  const { ticks } = SCALE_CONFIG[activeScale];
  const currentValue = getValueForScale(activeScale);
  const angle = -135 + (currentValue / ticks) * 270;

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
      style={{ cursor: 'grab', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="#2a2a2a"
        stroke="#444"
        strokeWidth={3}
      />

      {/* Track */}
      <path
        d={describeArc(center, center, trackRadius, -135, 135)}
        fill="none"
        stroke={TRACK_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Value arc */}
      <path
        d={describeArc(center, center, trackRadius, -135, angle)}
        fill="none"
        stroke={VALUE_COLOR}
        strokeWidth={4}
        strokeLinecap="round"
      />

      {/* Indicator line */}
      <line
        x1={center}
        y1={center}
        x2={center + (radius - 20) * Math.cos((angle - 90) * DEG_TO_RAD)}
        y2={center + (radius - 20) * Math.sin((angle - 90) * DEG_TO_RAD)}
        stroke="#fff"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Scale label */}
      <text
        x={center}
        y={center - 18}
        textAnchor="middle"
        fill={VALUE_COLOR}
        fontSize={10}
        fontWeight="bold"
      >
        {SCALE_CONFIG[activeScale].label}
      </text>

      {/* Date display */}
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        fontSize={9}
      >
        <tspan fill={activeScale === 'year' ? VALUE_COLOR : '#666'}>{year}</tspan>
        <tspan fill="#666">/</tspan>
        <tspan fill={activeScale === 'month' ? VALUE_COLOR : '#666'}>{month}</tspan>
        <tspan fill="#666">/</tspan>
        <tspan fill={activeScale === 'day' ? VALUE_COLOR : '#666'}>{day}</tspan>
      </text>

      {/* Time display */}
      <text
        x={center}
        y={center + 10}
        textAnchor="middle"
        fontSize={12}
        fontWeight="bold"
      >
        <tspan fill={activeScale === 'hour' ? VALUE_COLOR : '#fff'}>{hour}</tspan>
        <tspan fill="#666">:</tspan>
        <tspan fill={activeScale === 'minute' ? VALUE_COLOR : '#fff'}>{minute}</tspan>
      </text>
    </svg>
  );
}

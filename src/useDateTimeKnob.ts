import { useRef, useCallback } from 'react';
import { DEG_TO_RAD } from './svgUtils';

export type TimeScale = 'minute' | 'hour' | 'day' | 'month' | 'year';

export const SCALE_CONFIG: Record<TimeScale, { ticks: number; label: string }> = {
  minute: { ticks: 60, label: '分' },
  hour: { ticks: 24, label: '時' },
  day: { ticks: 31, label: '日' },
  month: { ticks: 12, label: '月' },
  year: { ticks: 10, label: '年' },
};

export const SCALES: TimeScale[] = ['minute', 'hour', 'day', 'month', 'year'];

interface UseDateTimeKnobOptions {
  center: number;
  innerRadius: number;
  outerRadius: number;
  onChange?: (date: Date) => void;
  onActiveScaleChange?: (scale: TimeScale | null) => void;
}

export function useDateTimeKnob({
  center,
  innerRadius,
  outerRadius,
  onChange,
  onActiveScaleChange,
}: UseDateTimeKnobOptions) {
  const knobRef = useRef<SVGSVGElement>(null);
  const activeScale = useRef<TimeScale | null>(null);
  const lastAngle = useRef<number>(0);
  const totalRotation = useRef<number>(0);

  const getScaleFromDistance = useCallback(
    (distance: number): TimeScale | null => {
      const range = outerRadius - innerRadius;
      const scaleWidth = range / SCALES.length;
      const scaleIndex = Math.floor((distance - innerRadius) / scaleWidth);

      if (scaleIndex >= 0 && scaleIndex < SCALES.length) {
        return SCALES[scaleIndex];
      }
      return null;
    },
    [innerRadius, outerRadius]
  );

  const getScaleRadii = useCallback(
    (scale: TimeScale) => {
      const range = outerRadius - innerRadius;
      const scaleWidth = range / SCALES.length;
      const index = SCALES.indexOf(scale);
      const inner = innerRadius + index * scaleWidth;
      const outer = inner + scaleWidth;
      return { inner, outer, mid: (inner + outer) / 2 };
    },
    [innerRadius, outerRadius]
  );

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!knobRef.current) return { angle: 0, distance: 0 };
      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const scale = rect.width / (center * 2);
      const scaledDistance = distance / scale;

      let angle = Math.atan2(deltaY, deltaX) / DEG_TO_RAD;
      angle = angle + 90;
      if (angle > 180) angle -= 360;

      return { angle, distance: scaledDistance };
    },
    [center]
  );

  const snapToTick = useCallback((angle: number, scale: TimeScale): number => {
    const { ticks } = SCALE_CONFIG[scale];
    const tickAngle = 360 / ticks;
    return Math.round(angle / tickAngle) * tickAngle;
  }, []);

  const updateDate = useCallback(
    (currentDate: Date, scale: TimeScale, angleDelta: number): Date => {
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
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, currentDate: Date) => {
      e.preventDefault();
      const { angle, distance } = getAngleFromEvent(e.clientX, e.clientY);
      const scale = getScaleFromDistance(distance);

      if (!scale) return;

      activeScale.current = scale;
      onActiveScaleChange?.(scale);
      lastAngle.current = angle;
      totalRotation.current = 0;

      const handleMouseMove = (e: MouseEvent) => {
        if (!activeScale.current) return;

        const { angle: newAngle } = getAngleFromEvent(e.clientX, e.clientY);
        let angleDelta = newAngle - lastAngle.current;

        // Handle wrap-around
        if (angleDelta > 180) angleDelta -= 360;
        if (angleDelta < -180) angleDelta += 360;

        totalRotation.current += angleDelta;
        lastAngle.current = newAngle;

        const snappedRotation = snapToTick(totalRotation.current, activeScale.current);
        if (snappedRotation !== 0) {
          const newDate = updateDate(currentDate, activeScale.current, snappedRotation);
          currentDate = newDate;
          totalRotation.current -= snappedRotation;
          onChange?.(newDate);
        }
      };

      const handleMouseUp = () => {
        activeScale.current = null;
        onActiveScaleChange?.(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [getAngleFromEvent, getScaleFromDistance, snapToTick, updateDate, onChange, onActiveScaleChange]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, currentDate: Date) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { angle, distance } = getAngleFromEvent(touch.clientX, touch.clientY);
      const scale = getScaleFromDistance(distance);

      if (!scale) return;

      activeScale.current = scale;
      onActiveScaleChange?.(scale);
      lastAngle.current = angle;
      totalRotation.current = 0;

      const handleTouchMove = (e: TouchEvent) => {
        if (!activeScale.current) return;

        const touch = e.touches[0];
        const { angle: newAngle } = getAngleFromEvent(touch.clientX, touch.clientY);
        let angleDelta = newAngle - lastAngle.current;

        if (angleDelta > 180) angleDelta -= 360;
        if (angleDelta < -180) angleDelta += 360;

        totalRotation.current += angleDelta;
        lastAngle.current = newAngle;

        const snappedRotation = snapToTick(totalRotation.current, activeScale.current);
        if (snappedRotation !== 0) {
          const newDate = updateDate(currentDate, activeScale.current, snappedRotation);
          currentDate = newDate;
          totalRotation.current -= snappedRotation;
          onChange?.(newDate);
        }
      };

      const handleTouchEnd = () => {
        activeScale.current = null;
        onActiveScaleChange?.(null);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    },
    [getAngleFromEvent, getScaleFromDistance, snapToTick, updateDate, onChange, onActiveScaleChange]
  );

  return {
    knobRef,
    getScaleRadii,
    handleMouseDown,
    handleTouchStart,
  };
}

import { useRef } from 'react';
import { DEG_TO_RAD } from './svgUtils';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;

interface UseRotaryKnobOptions {
  min: number;
  max: number;
  onChange?: (value: number) => void;
}

export function useRotaryKnob({ min, max, onChange }: UseRotaryKnobOptions) {
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

  return {
    knobRef,
    valueToAngle,
    handleMouseDown,
    handleTouchStart,
  };
}

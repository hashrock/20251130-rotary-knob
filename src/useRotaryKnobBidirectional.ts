import { useRef } from 'react';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;
const SENSITIVITY = 2;

interface UseRotaryKnobBidirectionalOptions {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}

export function useRotaryKnobBidirectional({ min, max, value, onChange }: UseRotaryKnobBidirectionalOptions) {
  const knobRef = useRef<SVGSVGElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startValueRef = useRef(0);

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  const clampValue = (val: number) => {
    return Math.max(min, Math.min(max, Math.round(val)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startValueRef.current = value;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = startPosRef.current.y - e.clientY;
      const delta = (deltaX + deltaY) / SENSITIVITY;
      const newValue = clampValue(startValueRef.current + delta);
      onChange?.(newValue);
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
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    startValueRef.current = value;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touch.clientX - startPosRef.current.x;
      const deltaY = startPosRef.current.y - touch.clientY;
      const delta = (deltaX + deltaY) / SENSITIVITY;
      const newValue = clampValue(startValueRef.current + delta);
      onChange?.(newValue);
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

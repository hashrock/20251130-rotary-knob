import { useRef } from 'react';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;
const SENSITIVITY = 2; // ピクセルあたりの値変化量

interface UseRotaryKnobVerticalOptions {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}

export function useRotaryKnobVertical({ min, max, value, onChange }: UseRotaryKnobVerticalOptions) {
  const knobRef = useRef<SVGSVGElement>(null);
  const startYRef = useRef(0);
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
    startYRef.current = e.clientY;
    startValueRef.current = value;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const deltaValue = deltaY / SENSITIVITY;
      const newValue = clampValue(startValueRef.current + deltaValue);
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
    startYRef.current = touch.clientY;
    startValueRef.current = value;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaY = startYRef.current - touch.clientY;
      const deltaValue = deltaY / SENSITIVITY;
      const newValue = clampValue(startValueRef.current + deltaValue);
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

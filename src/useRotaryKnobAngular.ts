import { useRef } from 'react';
import { DEG_TO_RAD } from './svgUtils';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;
const ANGLE_TO_VALUE_RATIO = 0.5; // 角度1度あたりの値変化量

interface UseRotaryKnobAngularOptions {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}

export function useRotaryKnobAngular({ min, max, value, onChange }: UseRotaryKnobAngularOptions) {
  const knobRef = useRef<SVGSVGElement>(null);
  const startAngleRef = useRef(0);
  const startValueRef = useRef(0);

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  const clampValue = (val: number) => {
    return Math.max(min, Math.min(max, Math.round(val)));
  };

  const getAngleFromCenter = (clientX: number, clientY: number) => {
    if (!knobRef.current) return 0;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.atan2(deltaY, deltaX) / DEG_TO_RAD;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startAngleRef.current = getAngleFromCenter(e.clientX, e.clientY);
    startValueRef.current = value;

    const handleMouseMove = (e: MouseEvent) => {
      const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
      let deltaAngle = currentAngle - startAngleRef.current;

      // -180〜180の範囲に正規化（急激な変化を防ぐ）
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      const deltaValue = deltaAngle * ANGLE_TO_VALUE_RATIO;
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
    startAngleRef.current = getAngleFromCenter(touch.clientX, touch.clientY);
    startValueRef.current = value;

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const currentAngle = getAngleFromCenter(touch.clientX, touch.clientY);
      let deltaAngle = currentAngle - startAngleRef.current;

      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      const deltaValue = deltaAngle * ANGLE_TO_VALUE_RATIO;
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

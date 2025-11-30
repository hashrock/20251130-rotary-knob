import { useRef } from 'react';
import { DEG_TO_RAD } from './svgUtils';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;
const ANGLE_TO_VALUE_RATIO = 0.5;

// 金庫の暗証番号（0-99の3桁）
const SAFE_COMBINATION = [25, 75, 50];

interface UseRotaryKnobSafeOptions {
  min: number;
  max: number;
  value: number;
  dialValue: number;
  isUnlocked: boolean;
  combination: number[];
  currentStep: number;
  onChange?: (value: number) => void;
  onDialChange?: (value: number) => void;
  onUnlock?: () => void;
  onCombinationStep?: (step: number) => void;
}

export function useRotaryKnobSafe({
  min,
  max,
  value,
  dialValue,
  isUnlocked,
  combination,
  currentStep,
  onChange,
  onDialChange,
  onUnlock,
  onCombinationStep,
}: UseRotaryKnobSafeOptions) {
  const innerKnobRef = useRef<SVGGElement>(null);
  const outerKnobRef = useRef<SVGGElement>(null);
  const startAngleRef = useRef(0);
  const startValueRef = useRef(0);

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  const dialValueToAngle = (val: number) => {
    // ダイヤルは0-99で一周
    return (val / 100) * 360;
  };

  const clampValue = (val: number) => {
    return Math.max(min, Math.min(max, Math.round(val)));
  };

  const clampDialValue = (val: number) => {
    // 0-99でループ
    let result = val % 100;
    if (result < 0) result += 100;
    return Math.round(result);
  };

  const getAngleFromCenter = (
    clientX: number,
    clientY: number,
    element: SVGGElement | null
  ) => {
    if (!element) return 0;
    const svg = element.ownerSVGElement;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    return Math.atan2(deltaY, deltaX) / DEG_TO_RAD;
  };

  // 内側ノブのハンドラ
  const handleInnerMouseDown = (e: React.MouseEvent) => {
    if (!isUnlocked) return; // ロック中は操作不可
    e.preventDefault();
    e.stopPropagation();
    startAngleRef.current = getAngleFromCenter(e.clientX, e.clientY, innerKnobRef.current);
    startValueRef.current = value;

    const handleMouseMove = (e: MouseEvent) => {
      const currentAngle = getAngleFromCenter(e.clientX, e.clientY, innerKnobRef.current);
      let deltaAngle = currentAngle - startAngleRef.current;
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

  // 外側ダイヤルのハンドラ
  const handleOuterMouseDown = (e: React.MouseEvent) => {
    if (isUnlocked) return; // 解除済みなら操作不可
    e.preventDefault();
    e.stopPropagation();
    startAngleRef.current = getAngleFromCenter(e.clientX, e.clientY, outerKnobRef.current);
    startValueRef.current = dialValue;

    const handleMouseMove = (e: MouseEvent) => {
      const currentAngle = getAngleFromCenter(e.clientX, e.clientY, outerKnobRef.current);
      let deltaAngle = currentAngle - startAngleRef.current;
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;
      const deltaValue = deltaAngle * 0.3;
      const newValue = clampDialValue(startValueRef.current + deltaValue);
      onDialChange?.(newValue);
    };

    const handleMouseUp = () => {
      // マウスアップ時に暗証番号チェック
      checkCombination();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const checkCombination = () => {
    const targetValue = combination[currentStep];
    const tolerance = 3; // 許容誤差

    if (Math.abs(dialValue - targetValue) <= tolerance) {
      const nextStep = currentStep + 1;
      if (nextStep >= combination.length) {
        onUnlock?.();
      } else {
        onCombinationStep?.(nextStep);
      }
    } else if (currentStep > 0) {
      // 間違えたらリセット
      onCombinationStep?.(0);
    }
  };

  return {
    innerKnobRef,
    outerKnobRef,
    valueToAngle,
    dialValueToAngle,
    handleInnerMouseDown,
    handleOuterMouseDown,
    SAFE_COMBINATION,
  };
}

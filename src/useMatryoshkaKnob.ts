import { useRef, useCallback } from 'react';
import { DEG_TO_RAD } from './svgUtils';

export const START_ANGLE = -135;
export const END_ANGLE = 135;
const ANGLE_RANGE = END_ANGLE - START_ANGLE;

interface UseMatryoshkaKnobOptions {
  layers: number;
  min: number;
  max: number;
  layerWidths: number[];
  center: number;
  innerRadius: number;
  gap?: number;
  onChange?: (layerIndex: number, value: number) => void;
}

export function useMatryoshkaKnob({
  layers,
  min,
  max,
  layerWidths,
  center,
  innerRadius,
  gap = 2,
  onChange,
}: UseMatryoshkaKnobOptions) {
  const knobRef = useRef<SVGSVGElement>(null);
  const activeLayer = useRef<number | null>(null);

  const valueToAngle = (val: number) => {
    const normalized = (val - min) / (max - min);
    return START_ANGLE + normalized * ANGLE_RANGE;
  };

  const angleToValue = (angle: number) => {
    const normalized = (angle - START_ANGLE) / ANGLE_RANGE;
    const clamped = Math.max(0, Math.min(1, normalized));
    return min + clamped * (max - min);
  };

  const getLayerRadii = useCallback(() => {
    const radii: { inner: number; outer: number; mid: number }[] = [];
    let currentRadius = innerRadius;

    for (let i = 0; i < layers; i++) {
      const width = layerWidths[i] || 20;
      radii.push({
        inner: currentRadius,
        outer: currentRadius + width,
        mid: currentRadius + width / 2,
      });
      currentRadius += width + gap;
    }
    return radii;
  }, [layers, layerWidths, innerRadius, gap]);

  const getLayerFromPosition = useCallback(
    (clientX: number, clientY: number): number | null => {
      if (!knobRef.current) return null;

      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      const scale = rect.width / (center * 2);
      const scaledDistance = distance / scale;

      const radii = getLayerRadii();
      for (let i = 0; i < radii.length; i++) {
        if (scaledDistance >= radii[i].inner && scaledDistance <= radii[i].outer) {
          return i;
        }
      }
      return null;
    },
    [center, getLayerRadii]
  );

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
    if (activeLayer.current === null) return;

    const angle = getAngleFromEvent(clientX, clientY);
    const clampedAngle = Math.max(START_ANGLE, Math.min(END_ANGLE, angle));
    const newValue = angleToValue(clampedAngle);
    onChange?.(activeLayer.current, Math.round(newValue));
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const layer = getLayerFromPosition(e.clientX, e.clientY);
      if (layer === null) return;

      activeLayer.current = layer;
      updateValue(e.clientX, e.clientY);

      const handleMouseMove = (e: MouseEvent) => {
        updateValue(e.clientX, e.clientY);
      };

      const handleMouseUp = () => {
        activeLayer.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [getLayerFromPosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const layer = getLayerFromPosition(touch.clientX, touch.clientY);
      if (layer === null) return;

      activeLayer.current = layer;
      updateValue(touch.clientX, touch.clientY);

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        updateValue(touch.clientX, touch.clientY);
      };

      const handleTouchEnd = () => {
        activeLayer.current = null;
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    },
    [getLayerFromPosition]
  );

  return {
    knobRef,
    valueToAngle,
    getLayerRadii,
    handleMouseDown,
    handleTouchStart,
  };
}

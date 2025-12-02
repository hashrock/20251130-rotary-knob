import { useRef, useCallback } from 'react';

export interface Rotation3D {
  x: number;
  y: number;
  z: number;
}

interface Use3DRotaryKnobOptions {
  onChange?: (rotation: Rotation3D) => void;
  sensitivity?: number;
}

export function use3DRotaryKnob({ onChange, sensitivity = 0.5 }: Use3DRotaryKnobOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const updateRotation = useCallback(
    (deltaX: number, deltaY: number, currentRotation: Rotation3D) => {
      const newRotation: Rotation3D = {
        x: currentRotation.x + deltaY * sensitivity,
        y: currentRotation.y + deltaX * sensitivity,
        z: currentRotation.z,
      };
      onChange?.(newRotation);
    },
    [onChange, sensitivity]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, currentRotation: Rotation3D) => {
      e.preventDefault();
      isDragging.current = true;
      lastPosition.current = { x: e.clientX, y: e.clientY };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const deltaX = e.clientX - lastPosition.current.x;
        const deltaY = e.clientY - lastPosition.current.y;
        lastPosition.current = { x: e.clientX, y: e.clientY };
        updateRotation(deltaX, deltaY, currentRotation);
        currentRotation = {
          x: currentRotation.x + deltaY * sensitivity,
          y: currentRotation.y + deltaX * sensitivity,
          z: currentRotation.z,
        };
      };

      const handleMouseUp = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [updateRotation, sensitivity]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, currentRotation: Rotation3D) => {
      e.preventDefault();
      isDragging.current = true;
      const touch = e.touches[0];
      lastPosition.current = { x: touch.clientX, y: touch.clientY };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging.current) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastPosition.current.x;
        const deltaY = touch.clientY - lastPosition.current.y;
        lastPosition.current = { x: touch.clientX, y: touch.clientY };
        updateRotation(deltaX, deltaY, currentRotation);
        currentRotation = {
          x: currentRotation.x + deltaY * sensitivity,
          y: currentRotation.y + deltaX * sensitivity,
          z: currentRotation.z,
        };
      };

      const handleTouchEnd = () => {
        isDragging.current = false;
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    },
    [updateRotation, sensitivity]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent, currentRotation: Rotation3D) => {
      e.preventDefault();
      const newRotation: Rotation3D = {
        x: currentRotation.x,
        y: currentRotation.y,
        z: currentRotation.z + e.deltaY * sensitivity * 0.1,
      };
      onChange?.(newRotation);
    },
    [onChange, sensitivity]
  );

  return {
    containerRef,
    handleMouseDown,
    handleTouchStart,
    handleWheel,
  };
}

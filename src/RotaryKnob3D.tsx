import { useMemo } from 'react';
import { use3DRotaryKnob, type Rotation3D } from './use3DRotaryKnob';

export type { Rotation3D };

interface RotaryKnob3DProps {
  rotation?: Rotation3D;
  size?: number;
  onChange?: (rotation: Rotation3D) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function rotatePoint(point: Point3D, rotation: Rotation3D): Point3D {
  const { x, y, z } = point;
  const radX = (rotation.x * Math.PI) / 180;
  const radY = (rotation.y * Math.PI) / 180;
  const radZ = (rotation.z * Math.PI) / 180;

  // Rotate around X axis
  let y1 = y * Math.cos(radX) - z * Math.sin(radX);
  let z1 = y * Math.sin(radX) + z * Math.cos(radX);

  // Rotate around Y axis
  let x2 = x * Math.cos(radY) + z1 * Math.sin(radY);
  let z2 = -x * Math.sin(radY) + z1 * Math.cos(radY);

  // Rotate around Z axis
  let x3 = x2 * Math.cos(radZ) - y1 * Math.sin(radZ);
  let y3 = x2 * Math.sin(radZ) + y1 * Math.cos(radZ);

  return { x: x3, y: y3, z: z2 };
}

function generateSpherePoints(radius: number): { latLines: Point3D[][]; lonLines: Point3D[][] } {
  const latLines: Point3D[][] = [];
  const lonLines: Point3D[][] = [];
  const segments = 24;

  // Latitude lines (horizontal circles)
  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const r = radius * Math.cos(latRad);
    const y = radius * Math.sin(latRad);
    const line: Point3D[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      line.push({
        x: r * Math.cos(angle),
        y: y,
        z: r * Math.sin(angle),
      });
    }
    latLines.push(line);
  }

  // Longitude lines (vertical circles)
  for (let lon = 0; lon < 180; lon += 30) {
    const lonRad = (lon * Math.PI) / 180;
    const line: Point3D[] = [];
    for (let i = 0; i <= segments; i++) {
      const latAngle = (i / segments) * Math.PI * 2;
      line.push({
        x: radius * Math.cos(latAngle) * Math.cos(lonRad),
        y: radius * Math.sin(latAngle),
        z: radius * Math.cos(latAngle) * Math.sin(lonRad),
      });
    }
    lonLines.push(line);
  }

  return { latLines, lonLines };
}

function generateAxisMarkers(radius: number): { point: Point3D; color: string; label: string }[] {
  return [
    { point: { x: radius * 0.9, y: 0, z: 0 }, color: '#ff4444', label: 'X' },
    { point: { x: -radius * 0.9, y: 0, z: 0 }, color: '#ff4444', label: '' },
    { point: { x: 0, y: radius * 0.9, z: 0 }, color: '#44ff44', label: 'Y' },
    { point: { x: 0, y: -radius * 0.9, z: 0 }, color: '#44ff44', label: '' },
    { point: { x: 0, y: 0, z: radius * 0.9 }, color: '#4444ff', label: 'Z' },
    { point: { x: 0, y: 0, z: -radius * 0.9 }, color: '#4444ff', label: '' },
  ];
}

function pointsToPath(points: Point3D[], rotation: Rotation3D, center: number): string {
  const rotated = points.map((p) => rotatePoint(p, rotation));
  let path = '';
  for (let i = 0; i < rotated.length; i++) {
    const p = rotated[i];
    const x = center + p.x;
    const y = center - p.y;
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  return path;
}

export function RotaryKnob3D({
  rotation = { x: 0, y: 0, z: 0 },
  size = 200,
  onChange,
}: RotaryKnob3DProps) {
  const { containerRef, handleMouseDown, handleTouchStart, handleWheel } = use3DRotaryKnob({
    onChange,
    sensitivity: 0.5,
  });

  const center = size / 2;
  const radius = size * 0.4;

  const { latLines, lonLines } = useMemo(() => generateSpherePoints(radius), [radius]);
  const axisMarkers = useMemo(() => generateAxisMarkers(radius), [radius]);

  const getLineOpacity = (points: Point3D[], rotation: Rotation3D): number => {
    const midIndex = Math.floor(points.length / 2);
    const rotated = rotatePoint(points[midIndex], rotation);
    return Math.max(0.1, (rotated.z + radius) / (radius * 2));
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: size,
        height: size,
        cursor: 'grab',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onMouseDown={(e) => handleMouseDown(e, rotation)}
      onTouchStart={(e) => handleTouchStart(e, rotation)}
      onWheel={(e) => handleWheel(e, rotation)}
    >
      <svg width={size} height={size}>
        {/* Background gradient */}
        <defs>
          <radialGradient id="sphereGradient" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#4a4a4a" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main sphere */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#sphereGradient)"
          stroke="#666"
          strokeWidth={2}
        />

        {/* Latitude lines */}
        {latLines.map((line, i) => {
          const opacity = getLineOpacity(line, rotation);
          return (
            <path
              key={`lat-${i}`}
              d={pointsToPath(line, rotation, center)}
              fill="none"
              stroke="#888"
              strokeWidth={1}
              opacity={opacity * 0.6}
            />
          );
        })}

        {/* Longitude lines */}
        {lonLines.map((line, i) => {
          const opacity = getLineOpacity(line, rotation);
          return (
            <path
              key={`lon-${i}`}
              d={pointsToPath(line, rotation, center)}
              fill="none"
              stroke="#888"
              strokeWidth={1}
              opacity={opacity * 0.6}
            />
          );
        })}

        {/* Axis markers */}
        {axisMarkers.map((marker, i) => {
          const rotated = rotatePoint(marker.point, rotation);
          const x = center + rotated.x;
          const y = center - rotated.y;
          const isVisible = rotated.z > 0;
          const opacity = isVisible ? 0.9 : 0.2;
          const markerRadius = isVisible ? 8 : 5;

          return (
            <g key={`marker-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={markerRadius}
                fill={marker.color}
                opacity={opacity}
                filter={isVisible ? 'url(#glow)' : undefined}
              />
              {marker.label && isVisible && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize={10}
                  fontWeight="bold"
                >
                  {marker.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Center highlight */}
        <circle
          cx={center - radius * 0.3}
          cy={center - radius * 0.3}
          r={radius * 0.15}
          fill="rgba(255,255,255,0.15)"
        />
      </svg>
    </div>
  );
}

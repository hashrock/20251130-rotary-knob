import { useMemo } from 'react';
import { use3DRotaryKnob } from './use3DRotaryKnob';

export interface HSVColor {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface HSVKnob3DProps {
  hsv?: HSVColor;
  size?: number;
  onChange?: (hsv: HSVColor) => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

// HSV to RGB conversion
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const vNorm = v / 100;
  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function hsvToHex(h: number, s: number, v: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function rotatePoint(point: Point3D, rotation: { x: number; y: number; z: number }): Point3D {
  const { x, y, z } = point;
  const radX = (rotation.x * Math.PI) / 180;
  const radY = (rotation.y * Math.PI) / 180;
  const radZ = (rotation.z * Math.PI) / 180;

  let y1 = y * Math.cos(radX) - z * Math.sin(radX);
  let z1 = y * Math.sin(radX) + z * Math.cos(radX);
  let x2 = x * Math.cos(radY) + z1 * Math.sin(radY);
  let z2 = -x * Math.sin(radY) + z1 * Math.cos(radY);
  let x3 = x2 * Math.cos(radZ) - y1 * Math.sin(radZ);
  let y3 = x2 * Math.sin(radZ) + y1 * Math.cos(radZ);

  return { x: x3, y: y3, z: z2 };
}

function generateSpherePoints(radius: number): { latLines: Point3D[][]; lonLines: Point3D[][] } {
  const latLines: Point3D[][] = [];
  const lonLines: Point3D[][] = [];
  const segments = 24;

  for (let lat = -60; lat <= 60; lat += 30) {
    const latRad = (lat * Math.PI) / 180;
    const r = radius * Math.cos(latRad);
    const y = radius * Math.sin(latRad);
    const line: Point3D[] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      line.push({ x: r * Math.cos(angle), y: y, z: r * Math.sin(angle) });
    }
    latLines.push(line);
  }

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

function pointsToPath(points: Point3D[], rotation: { x: number; y: number; z: number }, center: number): string {
  const rotated = points.map((p) => rotatePoint(p, rotation));
  let path = '';
  for (let i = 0; i < rotated.length; i++) {
    const p = rotated[i];
    const x = center + p.x;
    const y = center - p.y;
    path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return path;
}

// Convert HSV to internal rotation for 3D visualization
function hsvToRotation(hsv: HSVColor): { x: number; y: number; z: number } {
  return {
    x: ((hsv.v - 50) / 50) * 45, // V controls X rotation (-45 to 45)
    y: (hsv.h / 360) * 360,       // H controls Y rotation (full 360)
    z: ((hsv.s - 50) / 50) * 45,  // S controls Z rotation (-45 to 45)
  };
}

export function HSVKnob3D({
  hsv = { h: 0, s: 100, v: 100 },
  size = 200,
  onChange,
}: HSVKnob3DProps) {
  const rotation = hsvToRotation(hsv);

  const { containerRef, handleMouseDown, handleTouchStart, handleWheel } = use3DRotaryKnob({
    onChange: (newRotation) => {
      // Convert rotation back to HSV
      let newH = (newRotation.y % 360 + 360) % 360;
      let newS = Math.max(0, Math.min(100, 50 + (newRotation.z / 45) * 50));
      let newV = Math.max(0, Math.min(100, 50 + (newRotation.x / 45) * 50));
      onChange?.({ h: newH, s: newS, v: newV });
    },
    sensitivity: 0.8,
  });

  const center = size / 2;
  const radius = size * 0.4;
  const currentColor = hsvToHex(hsv.h, hsv.s, hsv.v);
  const highlightColor = hsvToHex(hsv.h, Math.max(0, hsv.s - 30), Math.min(100, hsv.v + 20));

  const { latLines, lonLines } = useMemo(() => generateSpherePoints(radius), [radius]);

  const getLineOpacity = (points: Point3D[]): number => {
    const midIndex = Math.floor(points.length / 2);
    const rotated = rotatePoint(points[midIndex], rotation);
    return Math.max(0.1, (rotated.z + radius) / (radius * 2));
  };

  // HSV axis markers
  const axisMarkers = useMemo(() => [
    { point: { x: radius * 0.85, y: 0, z: 0 }, label: 'H', desc: 'Hue' },
    { point: { x: -radius * 0.85, y: 0, z: 0 }, label: '', desc: '' },
    { point: { x: 0, y: radius * 0.85, z: 0 }, label: 'V', desc: 'Value' },
    { point: { x: 0, y: -radius * 0.85, z: 0 }, label: '', desc: '' },
    { point: { x: 0, y: 0, z: radius * 0.85 }, label: 'S', desc: 'Sat' },
    { point: { x: 0, y: 0, z: -radius * 0.85 }, label: '', desc: '' },
  ], [radius]);

  // Generate hue ring colors
  const hueRingSegments = 36;
  const hueRingRadius = radius * 1.15;

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
        <defs>
          <radialGradient id="hsvSphereGradient" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor={highlightColor} />
            <stop offset="100%" stopColor={currentColor} />
          </radialGradient>
          <filter id="hsvGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Hue ring */}
        {Array.from({ length: hueRingSegments }).map((_, i) => {
          const startAngle = (i / hueRingSegments) * 360;
          const endAngle = ((i + 1) / hueRingSegments) * 360;
          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((endAngle - 90) * Math.PI) / 180;
          const x1 = center + hueRingRadius * Math.cos(startRad);
          const y1 = center + hueRingRadius * Math.sin(startRad);
          const x2 = center + hueRingRadius * Math.cos(endRad);
          const y2 = center + hueRingRadius * Math.sin(endRad);
          const segmentColor = hsvToHex(startAngle, 100, 100);

          return (
            <line
              key={`hue-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={segmentColor}
              strokeWidth={6}
              strokeLinecap="round"
              opacity={0.7}
            />
          );
        })}

        {/* Hue indicator on ring */}
        {(() => {
          const hueRad = ((hsv.h - 90) * Math.PI) / 180;
          const indicatorX = center + hueRingRadius * Math.cos(hueRad);
          const indicatorY = center + hueRingRadius * Math.sin(hueRad);
          return (
            <circle
              cx={indicatorX}
              cy={indicatorY}
              r={8}
              fill={hsvToHex(hsv.h, 100, 100)}
              stroke="#fff"
              strokeWidth={2}
              filter="url(#hsvGlow)"
            />
          );
        })()}

        {/* Main sphere */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#hsvSphereGradient)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={2}
          filter="url(#shadow)"
        />

        {/* Grid lines */}
        {latLines.map((line, i) => (
          <path
            key={`lat-${i}`}
            d={pointsToPath(line, rotation, center)}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
            opacity={getLineOpacity(line) * 0.5}
          />
        ))}
        {lonLines.map((line, i) => (
          <path
            key={`lon-${i}`}
            d={pointsToPath(line, rotation, center)}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
            opacity={getLineOpacity(line) * 0.5}
          />
        ))}

        {/* Axis markers */}
        {axisMarkers.map((marker, i) => {
          const rotated = rotatePoint(marker.point, rotation);
          const x = center + rotated.x;
          const y = center - rotated.y;
          const isVisible = rotated.z > 0;
          const opacity = isVisible ? 1 : 0.3;
          const markerRadius = isVisible ? 12 : 6;

          const markerColors: Record<string, string> = {
            'H': hsvToHex(hsv.h, 100, 100),
            'S': hsvToHex(hsv.h, hsv.s, 100),
            'V': hsvToHex(0, 0, hsv.v),
          };

          return (
            <g key={`marker-${i}`}>
              {marker.label && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={markerRadius}
                    fill={markerColors[marker.label] || '#888'}
                    opacity={opacity}
                    stroke={isVisible ? '#fff' : 'none'}
                    strokeWidth={2}
                    filter={isVisible ? 'url(#hsvGlow)' : undefined}
                  />
                  {isVisible && (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={marker.label === 'V' && hsv.v > 50 ? '#000' : '#fff'}
                      fontSize={10}
                      fontWeight="bold"
                    >
                      {marker.label}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Highlight */}
        <circle
          cx={center - radius * 0.3}
          cy={center - radius * 0.3}
          r={radius * 0.12}
          fill="rgba(255,255,255,0.25)"
        />
      </svg>
    </div>
  );
}

import { useMatryoshkaKnob, START_ANGLE, END_ANGLE } from './useMatryoshkaKnob';
import { describeArc, DEG_TO_RAD } from './svgUtils';

const VALUE_COLOR = '#4fc3f7';
const TRACK_COLOR = '#444';

interface RotaryKnobMatryoshkaProps {
  values: number[];
  min?: number;
  max?: number;
  size?: number;
  onChange?: (values: number[]) => void;
}

export function RotaryKnobMatryoshka({
  values,
  min = 0,
  max = 100,
  size = 200,
  onChange,
}: RotaryKnobMatryoshkaProps) {
  const layers = values.length;
  const center = size / 2;
  const innerRadius = 20;
  const gap = 2;
  const availableSpace = size / 2 - innerRadius - 10;
  const layerWidth = Math.max(8, (availableSpace - gap * (layers - 1)) / layers);
  const layerWidths = Array(layers).fill(layerWidth);

  const { knobRef, valueToAngle, getLayerRadii, handleMouseDown, handleTouchStart } =
    useMatryoshkaKnob({
      layers,
      min,
      max,
      layerWidths,
      center,
      innerRadius,
      gap,
      onChange: (layerIndex, value) => {
        const newValues = [...values];
        newValues[layerIndex] = value;
        onChange?.(newValues);
      },
    });

  const layerRadii = getLayerRadii();

  return (
    <svg
      ref={knobRef}
      width={size}
      height={size}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Center circle */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 2}
        fill="#2a2a2a"
        stroke="#555"
        strokeWidth={2}
      />

      {/* Layers from inside to outside */}
      {layerRadii.map((radii, i) => {
        const angle = valueToAngle(values[i]);
        const strokeWidth = radii.outer - radii.inner;

        return (
          <g key={i}>
            {/* Track background */}
            <path
              d={describeArc(center, center, radii.mid, START_ANGLE, END_ANGLE)}
              fill="none"
              stroke={TRACK_COLOR}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Value arc */}
            <path
              d={describeArc(center, center, radii.mid, START_ANGLE, angle)}
              fill="none"
              stroke={VALUE_COLOR}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Indicator dot */}
            <circle
              cx={center + radii.mid * Math.cos((angle - 90) * DEG_TO_RAD)}
              cy={center + radii.mid * Math.sin((angle - 90) * DEG_TO_RAD)}
              r={strokeWidth / 2 + 1}
              fill={VALUE_COLOR}
              stroke="#fff"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Center label */}
      <text
        x={center}
        y={center + 4}
        textAnchor="middle"
        fill="#888"
        fontSize={10}
        fontWeight="bold"
      >
        {layers}
      </text>
    </svg>
  );
}

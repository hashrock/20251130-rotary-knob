import { useState } from 'react';
import { useRotaryKnobSafe, START_ANGLE, END_ANGLE } from './useRotaryKnobSafe';
import { describeArc, DEG_TO_RAD } from './svgUtils';

const PADDING = 10;
const TRACK_OFFSET = 8;
const INDICATOR_OFFSET = 20;
const STROKE_WIDTH = 3;
const TRACK_STROKE_WIDTH = 4;

const DIAL_WIDTH = 25;

interface RotaryKnobSafeProps {
  value?: number;
  min?: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
}

export function RotaryKnobSafe({
  value = 0,
  min = 0,
  max = 100,
  size = 200,
  onChange,
}: RotaryKnobSafeProps) {
  const [dialValue, setDialValue] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const combination = [25, 75, 50];

  const {
    innerKnobRef,
    outerKnobRef,
    valueToAngle,
    dialValueToAngle,
    handleInnerMouseDown,
    handleOuterMouseDown,
  } = useRotaryKnobSafe({
    min,
    max,
    value,
    dialValue,
    isUnlocked,
    combination,
    currentStep,
    onChange,
    onDialChange: setDialValue,
    onUnlock: () => setIsUnlocked(true),
    onCombinationStep: setCurrentStep,
  });

  const angle = valueToAngle(value);
  const dialAngle = dialValueToAngle(dialValue);
  const center = size / 2;
  const outerRadius = center - PADDING;
  const innerRadius = outerRadius - DIAL_WIDTH - 5;
  const trackRadius = innerRadius - TRACK_OFFSET;
  const indicatorLength = innerRadius - INDICATOR_OFFSET;

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={size}
        height={size}
        style={{ touchAction: 'none' }}
      >
        {/* 外側ダイヤル（金庫） */}
        <g
          ref={outerKnobRef}
          onMouseDown={handleOuterMouseDown}
          style={{ cursor: isUnlocked ? 'default' : 'grab' }}
        >
          {/* ダイヤル背景 */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill={isUnlocked ? '#2d4a2d' : '#3a3a3a'}
            stroke={isUnlocked ? '#4a7a4a' : '#666'}
            strokeWidth={2}
          />

          {/* ダイヤル目盛り */}
          {Array.from({ length: 100 }).map((_, i) => {
            const tickAngle = (i / 100) * 360 - 90;
            const isMajor = i % 10 === 0;
            const tickLength = isMajor ? 8 : 4;
            const r1 = outerRadius - 2;
            const r2 = r1 - tickLength;
            return (
              <line
                key={i}
                x1={center + r1 * Math.cos(tickAngle * DEG_TO_RAD)}
                y1={center + r1 * Math.sin(tickAngle * DEG_TO_RAD)}
                x2={center + r2 * Math.cos(tickAngle * DEG_TO_RAD)}
                y2={center + r2 * Math.sin(tickAngle * DEG_TO_RAD)}
                stroke={isUnlocked ? '#6a9a6a' : '#888'}
                strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}

          {/* ダイヤル数字 */}
          {[0, 25, 50, 75].map((num) => {
            const numAngle = (num / 100) * 360 - 90;
            const r = outerRadius - 18;
            return (
              <text
                key={num}
                x={center + r * Math.cos(numAngle * DEG_TO_RAD)}
                y={center + r * Math.sin(numAngle * DEG_TO_RAD)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isUnlocked ? '#8aba8a' : '#aaa'}
                fontSize="10"
                fontWeight="bold"
              >
                {num}
              </text>
            );
          })}

          {/* ダイヤルインジケーター（回転する） */}
          <g transform={`rotate(${dialAngle}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center - outerRadius + 2}
              x2={center}
              y2={center - outerRadius + 12}
              stroke={isUnlocked ? '#8f8' : '#f88'}
              strokeWidth={3}
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* 固定のポインター（上部） */}
        <polygon
          points={`${center},${PADDING - 5} ${center - 6},${PADDING + 8} ${center + 6},${PADDING + 8}`}
          fill="#ff6b6b"
        />

        {/* 内側ノブ */}
        <g
          ref={innerKnobRef}
          onMouseDown={handleInnerMouseDown}
          style={{
            cursor: isUnlocked ? 'grab' : 'not-allowed',
            opacity: isUnlocked ? 1 : 0.5,
          }}
        >
          {/* 内側背景 */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#2a2a2a"
            stroke="#444"
            strokeWidth={STROKE_WIDTH}
          />

          {/* トラック */}
          <path
            d={describeArc(center, center, trackRadius, START_ANGLE, END_ANGLE)}
            fill="none"
            stroke="#555"
            strokeWidth={TRACK_STROKE_WIDTH}
            strokeLinecap="round"
          />

          {/* 値を示すアーク */}
          <path
            d={describeArc(center, center, trackRadius, START_ANGLE, angle)}
            fill="none"
            stroke={isUnlocked ? '#4fc3f7' : '#666'}
            strokeWidth={TRACK_STROKE_WIDTH}
            strokeLinecap="round"
          />

          {/* ノブのインジケーター */}
          <line
            x1={center}
            y1={center}
            x2={center + indicatorLength * Math.cos((angle - 90) * DEG_TO_RAD)}
            y2={center + indicatorLength * Math.sin((angle - 90) * DEG_TO_RAD)}
            stroke={isUnlocked ? '#fff' : '#666'}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />

          {/* ロックアイコン */}
          {!isUnlocked && (
            <text
              x={center}
              y={center}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="20"
            >
              🔒
            </text>
          )}
        </g>
      </svg>

      {/* ステータス表示 */}
      <div
        style={{
          position: 'absolute',
          bottom: -25,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '12px',
          color: '#888',
        }}
      >
        {isUnlocked ? (
          <span style={{ color: '#4a4' }}>解除済み</span>
        ) : (
          <span>
            暗証番号: {combination.map((n, i) => (
              <span
                key={i}
                style={{
                  color: i < currentStep ? '#4a4' : i === currentStep ? '#ff6b6b' : '#666',
                  fontWeight: i === currentStep ? 'bold' : 'normal',
                }}
              >
                {i < currentStep ? '✓' : n}
                {i < combination.length - 1 ? ' - ' : ''}
              </span>
            ))}
            {' '}(現在: {dialValue})
          </span>
        )}
      </div>
    </div>
  );
}

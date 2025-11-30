import { useRef, useCallback } from 'react';

const GARI_POSITIONS = [25, 50, 75]; // ガリが発生する値の位置
const GARI_THRESHOLD = 2; // この範囲内に入ったらガリを発生

export function useGariNoise() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastGariPositionRef = useRef<number | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  };

  const playGariNoise = useCallback(() => {
    const ctx = getAudioContext();
    const duration = 0.05 + Math.random() * 0.05; // 50-100ms

    // ノイズバッファを作成
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // クラックルノイズ（不規則なパルス）
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.3) {
        data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.5 ? 1 : 0.3);
      } else {
        data[i] = 0;
      }
    }

    // バッファソース
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // フィルターでより「ガリッ」とした音に
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800 + Math.random() * 400;

    // ゲイン
    const gain = ctx.createGain();
    gain.gain.value = 0.15 + Math.random() * 0.1;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    source.stop(ctx.currentTime + duration);
  }, []);

  const checkAndPlayGari = useCallback((value: number) => {
    for (const pos of GARI_POSITIONS) {
      const distance = Math.abs(value - pos);
      if (distance < GARI_THRESHOLD) {
        // 同じ位置で連続して鳴らさない
        if (lastGariPositionRef.current !== pos) {
          lastGariPositionRef.current = pos;
          playGariNoise();
        }
        return;
      }
    }
    // どのガリ位置からも離れたらリセット
    lastGariPositionRef.current = null;
  }, [playGariNoise]);

  return { checkAndPlayGari };
}

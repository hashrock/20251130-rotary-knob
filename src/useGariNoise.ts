import { useRef, useCallback } from 'react';

const GARI_PROBABILITY = 0.08; // 値が変わるたびにガリが発生する確率

export function useGariNoise() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastValueRef = useRef<number | null>(null);

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
    // 値が変わった時だけ判定
    if (lastValueRef.current !== value) {
      lastValueRef.current = value;
      if (Math.random() < GARI_PROBABILITY) {
        playGariNoise();
      }
    }
  }, [playGariNoise]);

  return { checkAndPlayGari };
}

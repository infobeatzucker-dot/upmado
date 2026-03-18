"use client";

/**
 * AudioEngineContext
 * Singleton Web Audio API engine shared across:
 *  - ABPlayer (playback + UI)
 *  - SpectrumAnalyzer, WaveformViewer, LUFSMeter, StereoField, DynamicsGraph (real-time data)
 *
 * Initialised lazily on first play click to satisfy browser autoplay policy.
 */

import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export interface AudioEngineContextType {
  // AnalyserNodes for visualizers (null until first play)
  analyserMono: AnalyserNode | null;
  analyserL: AnalyserNode | null;
  analyserR: AnalyserNode | null;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;

  // A/B state
  mode: "A" | "B";
  masterUnavailable: boolean;

  // Controls
  setMode: (m: "A" | "B") => void;
  togglePlay: () => void;
  seek: (t: number) => void;

  // Current URLs (for display)
  originalUrl: string;
  masteredUrl: string;

  // Pre-decoded static waveform (null until decoded)
  staticWaveform:  Float32Array | null;   // A (original)
  peakWaveform:    Float32Array | null;   // A peaks
  staticWaveformB: Float32Array | null;   // B (mastered)
  peakWaveformB:   Float32Array | null;   // B peaks
}

const AudioEngineContext = createContext<AudioEngineContextType | null>(null);

export function AudioEngineProvider({
  children,
  originalUrl,
  masteredUrl,
}: {
  children: ReactNode;
  originalUrl: string;
  masteredUrl: string;
}) {
  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const rafRef         = useRef<number>(0);

  const [analyserMono, setAnalyserMono] = useState<AnalyserNode | null>(null);
  const [analyserL,    setAnalyserL]    = useState<AnalyserNode | null>(null);
  const [analyserR,    setAnalyserR]    = useState<AnalyserNode | null>(null);

  const [isPlaying,         setIsPlaying]         = useState(false);
  const [currentTime,       setCurrentTime]       = useState(0);
  const [duration,          setDuration]          = useState(0);
  const [mode,              setModeState]         = useState<"A" | "B">("A");
  const [masterUnavailable, setMasterUnavailable] = useState(false);

  const [staticWaveform,  setStaticWaveform]  = useState<Float32Array | null>(null);
  const [peakWaveform,    setPeakWaveform]    = useState<Float32Array | null>(null);
  const [staticWaveformB, setStaticWaveformB] = useState<Float32Array | null>(null);
  const [peakWaveformB,   setPeakWaveformB]   = useState<Float32Array | null>(null);

  // ── Create audio element ────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (audioRef.current) return;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    if (originalUrl) audio.src = originalUrl;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("play",  () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("ended", () => setIsPlaying(false));

    // currentTime ticker
    const tick = () => {
      setCurrentTime(audio.currentTime || 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Decode static waveform helper ────────────────────────────────────────────
  const decodeWaveform = useCallback(async (url: string): Promise<{
    rms: Float32Array; peaks: Float32Array;
  } | null> => {
    if (!url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const tmpCtx = new AudioContext();
      const decoded = await tmpCtx.decodeAudioData(arrayBuffer);
      await tmpCtx.close();

      const channel = decoded.getChannelData(0);
      const bars    = 800;
      const winSize = Math.floor(channel.length / bars);
      const rmsData  = new Float32Array(bars);
      const peakData = new Float32Array(bars);
      for (let i = 0; i < bars; i++) {
        let sum = 0, peak = 0;
        for (let j = 0; j < winSize; j++) {
          const s = Math.abs(channel[i * winSize + j] || 0);
          sum    += s * s;
          if (s > peak) peak = s;
        }
        rmsData[i]  = Math.sqrt(sum / winSize);
        peakData[i] = peak;
      }
      return { rms: rmsData, peaks: peakData };
    } catch {
      return null;
    }
  }, []);

  // ── Update src when originalUrl changes + decode A waveform ─────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !originalUrl) return;

    if (mode === "A") {
      if (!audio.src.endsWith(originalUrl)) {
        audio.src = originalUrl;
        audio.load();
      }
    }

    decodeWaveform(originalUrl).then((result) => {
      if (result) {
        setStaticWaveform(result.rms);
        setPeakWaveform(result.peaks);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalUrl]);

  // ── When masteredUrl becomes available: unlock B + decode B waveform ─────────
  useEffect(() => {
    if (!masteredUrl) return;

    // Unlock B button whenever a real master URL arrives
    setMasterUnavailable(false);

    decodeWaveform(masteredUrl).then((result) => {
      if (result) {
        setStaticWaveformB(result.rms);
        setPeakWaveformB(result.peaks);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [masteredUrl]);

  // ── Init Web Audio API on first play ────────────────────────────────────────
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const src = ctx.createMediaElementSource(audio);

      // Mono analyser (spectrum + waveform)
      const mono = ctx.createAnalyser();
      mono.fftSize = 2048;
      mono.smoothingTimeConstant = 0.85;

      // Stereo split for VU meters
      const splitter = ctx.createChannelSplitter(2);
      const aL = ctx.createAnalyser();
      aL.fftSize = 512;
      aL.smoothingTimeConstant = 0.8;
      const aR = ctx.createAnalyser();
      aR.fftSize = 512;
      aR.smoothingTimeConstant = 0.8;

      src.connect(mono);
      src.connect(splitter);
      splitter.connect(aL, 0);
      splitter.connect(aR, 1);
      mono.connect(ctx.destination);

      setAnalyserMono(mono);
      setAnalyserL(aL);
      setAnalyserR(aR);
    } catch (e) {
      console.warn("Web Audio init failed:", e);
    }
  }, []);

  // ── Mode switch (A = original, B = mastered) ────────────────────────────────
  const setMode = useCallback((newMode: "A" | "B") => {
    // Guard: B only allowed when a real master URL exists
    if (newMode === "B" && (!masteredUrl || masterUnavailable)) return;

    const audio = audioRef.current;
    if (!audio) return;

    const time       = audio.currentTime;
    const wasPlaying = isPlaying;
    audio.pause();

    const url = newMode === "A" ? originalUrl : masteredUrl;
    if (!url) return;

    audio.src = url;
    audio.load();

    audio.addEventListener("canplay", () => {
      audio.currentTime = time;
      if (wasPlaying) audio.play().catch(() => {});
    }, { once: true });

    audio.addEventListener("error", () => {
      if (newMode === "B") {
        setMasterUnavailable(true);
        setModeState("A");
        if (originalUrl) {
          audio.src = originalUrl;
          audio.load();
        }
      }
    }, { once: true });

    setModeState(newMode);
  }, [originalUrl, masteredUrl, masterUnavailable, isPlaying]);

  // ── Playback controls ────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      initAudioContext();
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [initAudioContext]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  return (
    <AudioEngineContext.Provider
      value={{
        analyserMono,
        analyserL,
        analyserR,
        isPlaying,
        currentTime,
        duration,
        mode,
        masterUnavailable,
        setMode,
        togglePlay,
        seek,
        originalUrl,
        masteredUrl,
        staticWaveform,
        peakWaveform,
        staticWaveformB,
        peakWaveformB,
      }}
    >
      {children}
    </AudioEngineContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────────────────────────
export function useAudioEngine(): AudioEngineContextType | null {
  return useContext(AudioEngineContext);
}

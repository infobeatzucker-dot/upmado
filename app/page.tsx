"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import AnalysisPanel from "@/components/AnalysisPanel";
import MasterButton from "@/components/MasterButton";
import DownloadPanel from "@/components/DownloadPanel";
import ABPlayer from "@/components/ABPlayer";
import PlatformTargets from "@/components/PlatformTargets";
import PresetSelector from "@/components/PresetSelector";
import MasteringIntensity from "@/components/MasteringIntensity";
import ReferenceTrack from "@/components/ReferenceTrack";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ProgressDisplay from "@/components/ProgressDisplay";
import { AudioEngineProvider } from "@/contexts/AudioEngineContext";

export type AppState = "idle" | "uploaded" | "analyzing" | "analyzed" | "mastering" | "done";
export type Platform  = "spotify" | "apple" | "youtube" | "club" | "tidal" | "amazon" | "deezer" | "tiktok" | "soundcloud" | "broadcast" | "custom";
export type Preset    = "auto" | "electronic" | "hiphop" | "rock" | "pop" | "jazz" | "classical" | "podcast" | "metal" | "rnb" | "ambient" | "lofi" | "country" | "trap" | "latin" | "dance" | "techno" | "edm";

export interface AnalysisData {
  integrated_lufs:    number;
  true_peak:          number;
  dr_value:           number;
  crest_factor:       number;
  rms_sub:            number;
  rms_low:            number;
  rms_mid:            number;
  rms_high:           number;
  rms_air:            number;
  spectral_centroid:  number;
  spectral_rolloff:   number;
  spectral_flatness:  number;
  stereo_width:       number;
  mono_compatibility: number;
  bpm:                number;
  key:                string;
  transient_density:  number;
  clipping_detected:  boolean;
  dc_offset:          number;
  duration_seconds:   number;
  sample_rate:        number;
  bit_depth:          number;
  channels:           number;
}

export interface MasterData {
  master_id: string;
  formats: {
    wav32:  string;
    wav24:  string;
    wav16:  string;
    flac:   string;
    mp3320: string;
    mp3128: string;
    aac256: string;
  };
  post_analysis: AnalysisData;
  notes: string;
}

export interface UploadedFile {
  file_id:  string;
  filename: string;
  duration: number;
  format:   string;
  size:     number;
}

export interface ProgressStep {
  step:     string;
  label:    string;
  progress: number;
}

const FORMAT_OPTIONS = [
  { key: "mp3128",  label: "MP3 128",    tier: "free", desc: "kostenlos" },
  { key: "mp3320",  label: "MP3 320",    tier: "paid", desc: "Premium" },
  { key: "wav16",   label: "WAV 16-bit", tier: "paid", desc: "CD-Qualität" },
  { key: "wav24",   label: "WAV 24-bit", tier: "paid", desc: "Studio" },
  { key: "flac",    label: "FLAC",       tier: "paid", desc: "Lossless" },
  { key: "aac256",  label: "AAC 256",    tier: "paid", desc: "Streaming" },
  { key: "wav32",   label: "WAV 32-bit", tier: "pro",  desc: "Pro" },
] as const;

export default function Home() {
  const [appState,         setAppState]         = useState<AppState>("idle");
  const [uploadedFile,     setUploadedFile]     = useState<UploadedFile | null>(null);
  const [analysis,         setAnalysis]         = useState<AnalysisData | null>(null);
  const [masterData,       setMasterData]       = useState<MasterData | null>(null);
  const [platform,         setPlatform]         = useState<Platform>("spotify");
  const [preset,           setPreset]           = useState<Preset>("auto");
  const [intensity,        setIntensity]        = useState<number>(65);
  const [currentProgress,  setCurrentProgress]  = useState<ProgressStep | null>(null);
  const [selectedFormat,   setSelectedFormat]   = useState<string>("mp3128");
  const [, setReferenceAnalysis] = useState<AnalysisData | null>(null);

  // Scroll targets
  const mainPanelRef      = useRef<HTMLDivElement>(null);   // for reset (scroll to top of panel)
  const progressAnchorRef = useRef<HTMLDivElement>(null);   // for mastering start (scroll to progress)

  // Guard: prevents stale handleMasteringComplete / handleMasteringError
  // callbacks from updating state after a reset or remaster.
  const isMasteringRef = useRef(false);

  const scrollToPanel = useCallback(() => {
    setTimeout(() => {
      const el = mainPanelRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }, 50);
  }, []);

  // Scroll to the progress section — wait 500 ms so React has rendered
  // ProgressDisplay, then use explicit window.scrollTo (more reliable
  // than scrollIntoView on a zero-height anchor div).
  const scrollToProgress = useCallback(() => {
    setTimeout(() => {
      const el = progressAnchorRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }, 500);
  }, []);

  const handleUploadComplete   = useCallback((file: UploadedFile) => { setUploadedFile(file); setAppState("uploaded"); }, []);
  const handleAnalysisComplete = useCallback((data: AnalysisData) => { setAnalysis(data); setAppState("analyzed"); }, []);

  const handleMasteringStart = useCallback(() => {
    isMasteringRef.current = true;
    setAppState("mastering");
    setCurrentProgress({ step: "analyzing", label: "Analyzing track…", progress: 5 });
    scrollToProgress();
  }, [scrollToProgress]);

  const handleProgressUpdate = useCallback((step: ProgressStep) => setCurrentProgress(step), []);

  const handleMasteringComplete = useCallback((data: MasterData) => {
    if (!isMasteringRef.current) return; // stale callback after reset/remaster — ignore
    isMasteringRef.current = false;
    setMasterData(data);
    setAppState("done");
    setCurrentProgress(null);
  }, []);

  const handleMasteringError = useCallback(() => {
    if (!isMasteringRef.current) return; // stale callback — ignore
    isMasteringRef.current = false;
    setAppState("analyzed");
    setCurrentProgress(null);
  }, []);

  const handleReset = useCallback(() => {
    isMasteringRef.current = false; // cancel any in-flight mastering callbacks
    setAppState("idle");
    setUploadedFile(null);
    setAnalysis(null);
    setMasterData(null);
    setCurrentProgress(null);
    scrollToPanel();
  }, [scrollToPanel]);

  // Remaster: keep file + analysis, just clear the master result
  const handleRemaster = useCallback(() => {
    isMasteringRef.current = false; // cancel any in-flight mastering callbacks
    setMasterData(null);
    setCurrentProgress(null);
    setAppState("analyzed");
    scrollToPanel();
  }, [scrollToPanel]);

  // Audio engine URLs
  const originalUrl = uploadedFile ? `/api/preview?file_id=${uploadedFile.file_id}` : "";
  const masteredUrl = masterData?.formats.mp3128 || masterData?.formats.mp3320 || masterData?.formats.wav16 || "";

  return (
    <div className="min-h-screen grid-bg">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-8 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {/* Video background — objectPosition: top to avoid top-clipping */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.28, filter: "blur(1px) saturate(1.4)", objectPosition: "top center" }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(8,10,18,0.3) 0%, rgba(8,10,18,0.05) 50%, rgba(8,10,18,0.7) 100%)" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse at center, rgba(124,111,255,0.08) 0%, transparent 70%)" }}
          />
        </div>
        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="label mb-4"
            style={{ color: "var(--accent-cyan)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            AI-Powered Professional Mastering
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">
            <span style={{ color: "var(--accent-purple)" }}>Up</span>
            <span style={{ color: "var(--accent-cyan)" }}>Ma</span>
            <span style={{ color: "#f59e0b" }}>Do</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4" style={{ color: "var(--text-muted)", fontSize: "0.85rem", letterSpacing: "0.05em" }}>
            <span style={{ color: "var(--accent-purple)" }}>Upload</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span style={{ color: "var(--accent-cyan)" }}>Mastern</span>
            <span style={{ opacity: 0.35 }}>·</span>
            <span style={{ color: "#f59e0b" }}>Download</span>
          </div>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Professional-grade mastering chain powered by AI. Spotify-compliant loudness,
            multiband compression, M/S processing — in seconds.
          </p>
        </motion.div>
      </section>

      {/* Main Mastering Interface */}
      <main className="max-w-6xl mx-auto px-4 pb-32" ref={mainPanelRef}>
        <AudioEngineProvider originalUrl={originalUrl} masteredUrl={masteredUrl}>
          <div
            className="glass-panel-elevated p-6 md:p-8 relative"
            style={{
              boxShadow: appState === "mastering"
                ? "0 0 40px rgba(124,111,255,0.2), 0 0 80px rgba(0,229,196,0.05)"
                : "0 4px 40px rgba(0,0,0,0.4)",
            }}
          >
            {/* Panel header row — Platform + Preset + optional "Neue Datei" link */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <PlatformTargets value={platform} onChange={setPlatform} />
              <div className="flex flex-col gap-1">
                <PresetSelector value={preset} onChange={setPreset} />
                {/* "Neue Datei" appears under preset when a file is loaded */}
                <AnimatePresence>
                  {appState !== "idle" && (
                    <motion.button
                      key="neue-datei-top"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={handleReset}
                      className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity self-end pt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                      </svg>
                      Neue Datei
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Intensity + Reference Track row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MasteringIntensity value={intensity} onChange={setIntensity} />
              <ReferenceTrack
                onReference={(a) => setReferenceAnalysis(a as AnalysisData | null)}
              />
            </div>

            {/* Upload Zone */}
            <AnimatePresence mode="wait">
              {(appState === "idle" || appState === "uploaded" || appState === "analyzing") && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <UploadZone
                    onUploadComplete={handleUploadComplete}
                    onAnalysisComplete={handleAnalysisComplete}
                    setAppState={setAppState}
                    uploadedFile={uploadedFile}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Player — shown after analysis (original only) */}
            <AnimatePresence>
              {appState === "analyzed" && uploadedFile && (
                <motion.div
                  key="player-pre"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ABPlayer filename={uploadedFile.filename} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analysis / Visualizers */}
            <AnimatePresence>
              {(appState === "analyzed" || appState === "mastering" || appState === "done") && analysis && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AnalysisPanel
                    preAnalysis={analysis}
                    postAnalysis={masterData?.post_analysis ?? null}
                    isProcessing={appState === "mastering"}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scroll anchor — always in DOM so progressAnchorRef is always set */}
            <div ref={progressAnchorRef} />

            {/* Progress Display */}
            <AnimatePresence>
              {appState === "mastering" && currentProgress && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <ProgressDisplay step={currentProgress} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inline format picker — only shown while mastering (progress reference) */}
            <AnimatePresence>
              {appState === "mastering" && uploadedFile && (
                <motion.div
                  key="masteringBtn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <MasterButton
                    fileId={uploadedFile.file_id}
                    platform={platform}
                    preset={preset}
                    intensity={intensity}
                    selectedFormat={selectedFormat}
                    analysis={analysis ?? undefined}
                    isProcessing={true}
                    onStart={handleMasteringStart}
                    onProgress={handleProgressUpdate}
                    onComplete={handleMasteringComplete}
                    onError={handleMasteringError}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Download Panel — includes A/B player with master */}
            <AnimatePresence>
              {appState === "done" && masterData && (
                <motion.div
                  key="download"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
                >
                  <DownloadPanel
                    masterData={masterData}
                    fileId={uploadedFile?.file_id ?? ""}
                    filename={uploadedFile?.filename ?? "track"}
                    platform={platform}
                    preset={preset}
                    intensity={intensity}
                    preAnalysis={analysis!}
                    onReset={handleReset}
                    onRemaster={handleRemaster}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </AudioEngineProvider>
      </main>

      {/* ── Sticky bottom "Master NOW" popup ───────────────────────────────────── */}
      <AnimatePresence>
        {appState === "analyzed" && uploadedFile && (
          <motion.div
            key="master-popup"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: "rgba(8,10,18,0.97)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(124,111,255,0.2)",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(124,111,255,0.08)",
            }}
          >
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Format pills */}
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const active = selectedFormat === fmt.key;
                    const isFree = fmt.tier === "free";
                    const isPro  = fmt.tier === "pro";
                    return (
                      <button
                        key={fmt.key}
                        onClick={() => setSelectedFormat(fmt.key)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: active
                            ? "linear-gradient(135deg, rgba(124,111,255,0.25), rgba(0,229,196,0.15))"
                            : "rgba(255,255,255,0.04)",
                          border: active
                            ? "1px solid rgba(124,111,255,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                          color: active ? "var(--accent-purple)" : "var(--text-muted)",
                          boxShadow: active ? "0 0 10px rgba(124,111,255,0.2)" : "none",
                        }}
                      >
                        {fmt.label}
                        {isFree && <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(0,229,196,0.15)", color: "var(--accent-cyan)" }}>FREE</span>}
                        {isPro  && <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: "rgba(245,200,66,0.15)", color: "var(--accent-gold)" }}>PRO</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Master NOW button */}
                <MasterButton
                  fileId={uploadedFile.file_id}
                  platform={platform}
                  preset={preset}
                  intensity={intensity}
                  selectedFormat={selectedFormat}
                  analysis={analysis ?? undefined}
                  isProcessing={false}
                  onStart={handleMasteringStart}
                  onProgress={handleProgressUpdate}
                  onComplete={handleMasteringComplete}
                  onError={handleMasteringError}
                  compact
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeaturesSection />
      <PricingSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
}

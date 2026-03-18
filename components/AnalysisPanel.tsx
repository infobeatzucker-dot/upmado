"use client";

import { AnalysisData } from "@/app/page";
import dynamic from "next/dynamic";
import { useAudioEngine } from "@/contexts/AudioEngineContext";

// Dynamic imports to avoid SSR issues with Canvas
const SpectrumAnalyzer     = dynamic(() => import("./Visualizer/SpectrumAnalyzer"),     { ssr: false });
const LUFSMeter            = dynamic(() => import("./Visualizer/LUFSMeter"),            { ssr: false });
const WaveformViewer       = dynamic(() => import("./Visualizer/WaveformViewer"),       { ssr: false });
const StereoField          = dynamic(() => import("./Visualizer/StereoField"),          { ssr: false });
const DynamicsGraph        = dynamic(() => import("./Visualizer/DynamicsGraph"),        { ssr: false });
const SpectrogramWaterfall = dynamic(() => import("./Visualizer/SpectrogramWaterfall"), { ssr: false });

interface Props {
  preAnalysis:  AnalysisData;
  postAnalysis: AnalysisData | null;
  isProcessing: boolean;
}

function StatRow({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="mono text-xs font-medium" style={{ color: color || "var(--accent-cyan)" }}>
        {value}{unit && <span style={{ color: "var(--text-muted)" }}> {unit}</span>}
      </span>
    </div>
  );
}

function CompareValue({ label, pre, post, unit }: { label: string; pre: number; post: number | null; unit?: string }) {
  const improved = post !== null && post > pre;
  return (
    <div className="flex justify-between items-center py-1.5 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <div className="flex items-center gap-2">
        <span className="mono text-xs" style={{ color: "var(--text-muted)" }}>
          {pre.toFixed(1)}{unit}
        </span>
        {post !== null && (
          <>
            <span style={{ color: "var(--text-muted)" }}>→</span>
            <span className="mono text-xs font-medium" style={{ color: improved ? "var(--accent-cyan)" : "var(--accent-purple)" }}>
              {post.toFixed(1)}{unit}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default function AnalysisPanel({ preAnalysis, postAnalysis, isProcessing }: Props) {
  // Grab live analyser nodes from the audio engine (null if engine not yet initialized)
  const engine = useAudioEngine();
  const analyserMono = engine?.analyserMono ?? null;
  const analyserL    = engine?.analyserL    ?? null;
  const analyserR    = engine?.analyserR    ?? null;

  return (
    <div className="mb-6">
      {/* Main visualizers grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Spectrum Analyzer */}
        <div className="glass-panel p-3 scanlines" style={{ height: 200 }}>
          <div className="label mb-2">Spectrum Analyzer</div>
          <SpectrumAnalyzer
            isProcessing={isProcessing}
            hasPostData={postAnalysis !== null}
            analyser={analyserMono}
          />
        </div>

        {/* Waveform Viewer */}
        <div className="glass-panel p-3 scanlines" style={{ height: 200 }}>
          <div className="label mb-2">Waveform</div>
          <WaveformViewer
            isProcessing={isProcessing}
            hasPostData={postAnalysis !== null}
            analyser={analyserMono}
          />
        </div>

        {/* Spectrogram Waterfall */}
        <div className="glass-panel p-3 scanlines" style={{ height: 200 }}>
          <div className="label mb-2">Spectrogram</div>
          <SpectrogramWaterfall
            analyser={analyserMono}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* LUFS Meter */}
        <div className="glass-panel p-3 scanlines" style={{ height: 180 }}>
          <div className="label mb-2">LUFS / True Peak</div>
          <LUFSMeter
            integrated={preAnalysis.integrated_lufs}
            truePeak={preAnalysis.true_peak}
            isProcessing={isProcessing}
            analyser={analyserMono}
          />
        </div>

        {/* Stereo Field */}
        <div className="glass-panel p-3 scanlines" style={{ height: 180 }}>
          <div className="label mb-2">Stereo Field</div>
          <StereoField
            stereoWidth={preAnalysis.stereo_width}
            monoCompatibility={preAnalysis.mono_compatibility}
            isProcessing={isProcessing}
            analyserL={analyserL}
            analyserR={analyserR}
          />
        </div>

        {/* Dynamics Graph */}
        <div className="glass-panel p-3 scanlines" style={{ height: 180 }}>
          <div className="label mb-2">Dynamics</div>
          <DynamicsGraph
            drValue={preAnalysis.dr_value}
            crestFactor={preAnalysis.crest_factor}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Loudness */}
        <div className="glass-panel p-4">
          <div className="label mb-3">Loudness</div>
          <CompareValue label="Integrated" pre={preAnalysis.integrated_lufs} post={postAnalysis?.integrated_lufs ?? null} unit=" LUFS" />
          <CompareValue label="True Peak"  pre={preAnalysis.true_peak}       post={postAnalysis?.true_peak ?? null}       unit=" dBTP" />
          <StatRow label="Dynamic Range" value={preAnalysis.dr_value.toFixed(0)} unit="DR" />
          <StatRow label="Crest Factor"  value={preAnalysis.crest_factor.toFixed(1)} unit="dB" />
        </div>

        {/* Spectral */}
        <div className="glass-panel p-4">
          <div className="label mb-3">Spectral</div>
          <StatRow label="Centroid" value={(preAnalysis.spectral_centroid / 1000).toFixed(1)} unit="kHz" />
          <StatRow label="Rolloff"  value={(preAnalysis.spectral_rolloff  / 1000).toFixed(1)} unit="kHz" />
          <StatRow label="Flatness" value={(preAnalysis.spectral_flatness * 100).toFixed(1)}  unit="%" />
          <StatRow
            label="Clipping"
            value={preAnalysis.clipping_detected ? "Detected!" : "None"}
            color={preAnalysis.clipping_detected ? "var(--accent-red)" : "var(--accent-cyan)"}
          />
        </div>

        {/* Track Info */}
        <div className="glass-panel p-4">
          <div className="label mb-3">Track Info</div>
          <StatRow label="BPM"         value={preAnalysis.bpm.toFixed(0)} />
          <StatRow label="Key"         value={preAnalysis.key} />
          <StatRow label="Sample Rate" value={(preAnalysis.sample_rate / 1000).toFixed(1)} unit="kHz" />
          <StatRow label="Channels"    value={preAnalysis.channels === 2 ? "Stereo" : "Mono"} />
        </div>
      </div>

      {/* Frequency bands */}
      <div className="glass-panel p-4 mt-4">
        <div className="label mb-3">Frequency Band Energy</div>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Sub",  value: preAnalysis.rms_sub,  post: postAnalysis?.rms_sub,  cls: "freq-sub"  },
            { label: "Low",  value: preAnalysis.rms_low,  post: postAnalysis?.rms_low,  cls: "freq-low"  },
            { label: "Mid",  value: preAnalysis.rms_mid,  post: postAnalysis?.rms_mid,  cls: "freq-mid"  },
            { label: "High", value: preAnalysis.rms_high, post: postAnalysis?.rms_high, cls: "freq-high" },
            { label: "Air",  value: preAnalysis.rms_air,  post: postAnalysis?.rms_air,  cls: "freq-air"  },
          ].map((band) => (
            <div key={band.label} className="text-center">
              <div className={`label mb-1 ${band.cls}`}>{band.label}</div>
              <div className="mono text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {band.value.toFixed(1)}
              </div>
              {band.post !== undefined && (
                <div className="mono text-xs" style={{ color: "var(--accent-cyan)" }}>
                  → {band.post.toFixed(1)}
                </div>
              )}
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>dB</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

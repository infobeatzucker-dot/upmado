"""
Audio Analysis Module
Returns comprehensive measurements for mastering parameter selection.
"""

import numpy as np
import soundfile as sf
import librosa
import pyloudnorm as pyln
from scipy import signal as scipy_signal
from dataclasses import dataclass, asdict
from typing import Optional


@dataclass
class AudioAnalysis:
    # Loudness
    integrated_lufs: float
    true_peak: float
    dr_value: float
    crest_factor: float

    # Per-band RMS (dB)
    rms_sub: float   # 20-80 Hz
    rms_low: float   # 80-500 Hz
    rms_mid: float   # 500-5000 Hz
    rms_high: float  # 5000-12000 Hz
    rms_air: float   # 12000-20000 Hz

    # Spectral
    spectral_centroid: float
    spectral_rolloff: float
    spectral_flatness: float

    # Stereo
    stereo_width: float
    mono_compatibility: float

    # Musical
    bpm: float
    key: str

    # Technical
    transient_density: float
    clipping_detected: bool
    dc_offset: float
    duration_seconds: float
    sample_rate: int
    bit_depth: int
    channels: int


def rms_band(audio: np.ndarray, sr: int, low_hz: float, high_hz: float) -> float:
    """Compute RMS energy in a frequency band, returned in dB."""
    nyq = sr / 2
    low = max(0.001, low_hz / nyq)
    high = min(0.999, high_hz / nyq)

    if low >= high:
        return -80.0

    b, a = scipy_signal.butter(4, [low, high], btype="bandpass")
    filtered = scipy_signal.filtfilt(b, a, audio)
    rms = np.sqrt(np.mean(filtered ** 2))

    if rms < 1e-10:
        return -80.0
    return float(20 * np.log10(rms))


def compute_dr(audio: np.ndarray, block_size: int = 4096) -> float:
    """Compute Dynamic Range value (DR14 algorithm approximation)."""
    num_blocks = len(audio) // block_size
    if num_blocks < 2:
        return 0.0

    block_rms = []
    block_peak = []

    for i in range(num_blocks):
        block = audio[i * block_size:(i + 1) * block_size]
        rms = np.sqrt(np.mean(block ** 2))
        peak = np.max(np.abs(block))
        block_rms.append(rms)
        block_peak.append(peak)

    block_rms.sort(reverse=True)
    block_peak.sort(reverse=True)

    # Take top 20% for peak average
    top_n = max(1, len(block_rms) // 5)
    avg_peak = np.mean(block_peak[:top_n])
    avg_rms = np.mean(block_rms[:top_n])

    if avg_rms < 1e-10:
        return 0.0

    dr = 20 * np.log10(avg_peak / avg_rms)
    return float(np.clip(dr, 0, 30))


def detect_key(y: np.ndarray, sr: int) -> str:
    """Detect musical key using chroma features."""
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    mean_chroma = np.mean(chroma, axis=1)
    note_idx = int(np.argmax(mean_chroma))

    notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

    # Simple major/minor detection via chroma profile correlation
    major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
    minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

    best_key = note_idx
    best_score = -1
    is_minor = False

    for root in range(12):
        shifted_major = np.roll(major_profile, root)
        shifted_minor = np.roll(minor_profile, root)

        score_major = np.corrcoef(mean_chroma, shifted_major)[0, 1]
        score_minor = np.corrcoef(mean_chroma, shifted_minor)[0, 1]

        if score_major > best_score:
            best_score = score_major
            best_key = root
            is_minor = False
        if score_minor > best_score:
            best_score = score_minor
            best_key = root
            is_minor = True

    return f"{notes[best_key]} {'minor' if is_minor else 'major'}"


def compute_true_peak(audio: np.ndarray, oversample: int = 4) -> float:
    """Compute True Peak using oversampling (ITU-R BS.1770-4)."""
    # Simple upsampling approach
    upsampled = scipy_signal.resample_poly(audio, oversample, 1)
    peak = np.max(np.abs(upsampled))
    if peak < 1e-10:
        return -120.0
    return float(20 * np.log10(peak))


def analyze_audio(file_path: str) -> AudioAnalysis:
    """Perform full audio analysis on a file."""
    # Load audio
    y, sr = librosa.load(file_path, sr=None, mono=False)
    info = sf.info(file_path)

    channels = y.ndim
    is_stereo = channels == 2

    # Mono mix for analysis
    if is_stereo:
        mono = librosa.to_mono(y)
        left = y[0]
        right = y[1]
    else:
        mono = y if y.ndim == 1 else y[0]
        left = mono
        right = mono

    duration = len(mono) / sr

    # Integrated LUFS (ITU-R BS.1770-4)
    meter = pyln.Meter(sr)
    if is_stereo:
        lufs_input = np.stack([left, right], axis=1)
    else:
        lufs_input = mono.reshape(-1, 1)
    integrated_lufs = float(meter.integrated_loudness(lufs_input))

    # True Peak
    true_peak = compute_true_peak(mono)

    # Dynamic Range
    dr_value = compute_dr(mono)

    # Crest factor
    rms_total = np.sqrt(np.mean(mono ** 2))
    peak_total = np.max(np.abs(mono))
    crest_factor = float(20 * np.log10(peak_total / max(rms_total, 1e-10)))

    # Per-band RMS
    rms_sub  = rms_band(mono, sr,    20,    80)
    rms_low  = rms_band(mono, sr,    80,   500)
    rms_mid  = rms_band(mono, sr,   500,  5000)
    rms_high = rms_band(mono, sr,  5000, 12000)
    rms_air  = rms_band(mono, sr, 12000, 20000)

    # Spectral features
    spectral_centroid = float(np.mean(librosa.feature.spectral_centroid(y=mono, sr=sr)))
    spectral_rolloff  = float(np.mean(librosa.feature.spectral_rolloff(y=mono, sr=sr, roll_percent=0.85)))
    spectral_flatness = float(np.mean(librosa.feature.spectral_flatness(y=mono)))

    # Stereo analysis
    if is_stereo:
        mid  = (left + right) / 2
        side = (left - right) / 2
        mid_rms  = np.sqrt(np.mean(mid  ** 2))
        side_rms = np.sqrt(np.mean(side ** 2))
        stereo_width = float(side_rms / max(mid_rms, 1e-10))

        # Mono compatibility: correlation between L and R
        if np.std(left) > 0 and np.std(right) > 0:
            mono_compat = float(np.corrcoef(left, right)[0, 1])
        else:
            mono_compat = 1.0
    else:
        stereo_width = 0.0
        mono_compat = 1.0

    # BPM
    try:
        tempo, _ = librosa.beat.beat_track(y=mono, sr=sr)
        bpm = float(tempo) if np.isscalar(tempo) else float(tempo[0])
    except Exception:
        bpm = 0.0

    # Key
    try:
        key = detect_key(mono, sr)
    except Exception:
        key = "Unknown"

    # Transient density
    try:
        onset_env = librosa.onset.onset_strength(y=mono, sr=sr)
        onsets = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
        transient_density = float(len(onsets) / max(duration, 1.0))
    except Exception:
        transient_density = 0.0

    # Clipping detection
    clipping_detected = bool(np.any(np.abs(mono) > 0.99))

    # DC offset
    dc_offset = float(np.mean(mono))

    return AudioAnalysis(
        integrated_lufs=integrated_lufs,
        true_peak=true_peak,
        dr_value=dr_value,
        crest_factor=crest_factor,
        rms_sub=rms_sub,
        rms_low=rms_low,
        rms_mid=rms_mid,
        rms_high=rms_high,
        rms_air=rms_air,
        spectral_centroid=spectral_centroid,
        spectral_rolloff=spectral_rolloff,
        spectral_flatness=spectral_flatness,
        stereo_width=stereo_width,
        mono_compatibility=mono_compat,
        bpm=bpm,
        key=key,
        transient_density=transient_density,
        clipping_detected=clipping_detected,
        dc_offset=dc_offset,
        duration_seconds=duration,
        sample_rate=sr,
        bit_depth=info.subtype_info.split()[0].replace("PCM_", "").replace("FLOAT", "32") if info.subtype_info else "24",
        channels=2 if is_stereo else 1,
    )


def analysis_to_dict(a: AudioAnalysis) -> dict:
    return asdict(a)

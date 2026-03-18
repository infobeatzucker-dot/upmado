"""
Professional Mastering Chain
12-stage DSP pipeline using pedalboard, scipy, pyloudnorm
"""

import numpy as np
import soundfile as sf
import librosa
import pyloudnorm as pyln
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, HighShelfFilter, PeakFilter, Distortion, Gain
from scipy import signal as scipy_signal
import os
import uuid
from dataclasses import dataclass
from typing import Callable, Optional

from ai_params import MasteringParams


@dataclass
class MasteringResult:
    master_id: str
    paths: dict  # format -> file_path
    post_analysis: dict
    notes: str


def db_to_linear(db: float) -> float:
    return 10 ** (db / 20)


def linear_to_db(linear: float) -> float:
    if linear < 1e-10:
        return -120.0
    return 20 * np.log10(linear)


# ─── 1. INPUT STAGE ────────────────────────────────────────────────────────────

def remove_dc_offset(audio: np.ndarray) -> np.ndarray:
    """Remove DC offset using high-pass filter."""
    if audio.ndim == 2:
        return np.stack([remove_dc_offset(audio[0]), remove_dc_offset(audio[1])])
    b, a = scipy_signal.butter(2, 2.0 / (audio.shape[0] * 0.001), btype="highpass", fs=44100)
    return scipy_signal.filtfilt(b, a, audio)


def remove_dc_simple(audio: np.ndarray) -> np.ndarray:
    """Simple DC offset removal via mean subtraction."""
    if audio.ndim == 2:
        audio[0] -= np.mean(audio[0])
        audio[1] -= np.mean(audio[1])
    else:
        audio -= np.mean(audio)
    return audio


def check_phase_correlation(left: np.ndarray, right: np.ndarray) -> float:
    """Check L/R phase correlation."""
    corr = np.corrcoef(left, right)[0, 1]
    return float(corr)


# ─── 4. CORRECTION EQ ──────────────────────────────────────────────────────────

def apply_correction_eq(audio: np.ndarray, sr: int, params: MasteringParams) -> np.ndarray:
    """Apply correction EQ using pedalboard."""
    board = Pedalboard([
        HighpassFilter(cutoff_frequency_hz=params.highpass_freq),
        LowShelfFilter(
            cutoff_frequency_hz=params.low_shelf_freq,
            gain_db=params.low_shelf_gain,
            q=0.707,
        ),
        PeakFilter(
            cutoff_frequency_hz=params.mid_notch_freq,
            gain_db=params.mid_notch_gain,
            q=params.mid_notch_q,
        ),
        PeakFilter(
            cutoff_frequency_hz=params.presence_freq,
            gain_db=params.presence_gain,
            q=1.2,
        ),
        HighShelfFilter(
            cutoff_frequency_hz=params.air_freq,
            gain_db=params.air_gain,
            q=0.707,
        ),
    ])

    if audio.ndim == 2:
        processed = np.stack([
            board(audio[0:1].T, sr).T[0],
            board(audio[1:2].T, sr).T[0],
        ])
    else:
        processed = board(audio.reshape(1, -1).T, sr).T[0]

    return processed


# ─── 5. MULTIBAND COMPRESSION ──────────────────────────────────────────────────

def linkwitz_riley_crossover(audio: np.ndarray, sr: int, crossover_hz: float, order: int = 4):
    """Split audio into low and high bands using LR crossover filters."""
    nyq = sr / 2
    norm_freq = crossover_hz / nyq

    if norm_freq >= 0.99:
        norm_freq = 0.99
    if norm_freq <= 0.01:
        norm_freq = 0.01

    # Butterworth 2nd order (cascade for LR 4th order)
    b_low, a_low = scipy_signal.butter(order // 2, norm_freq, btype="low")
    b_high, a_high = scipy_signal.butter(order // 2, norm_freq, btype="high")

    if audio.ndim == 2:
        low  = np.stack([scipy_signal.filtfilt(b_low,  a_low,  ch) for ch in audio])
        high = np.stack([scipy_signal.filtfilt(b_high, a_high, ch) for ch in audio])
    else:
        low  = scipy_signal.filtfilt(b_low,  a_low,  audio)
        high = scipy_signal.filtfilt(b_high, a_high, audio)

    return low, high


def compress_band(audio: np.ndarray, sr: int, threshold_db: float, ratio: float,
                  attack_ms: float = 20, release_ms: float = 100) -> np.ndarray:
    """Simple single-band compressor (numpy implementation)."""
    threshold = db_to_linear(threshold_db)
    attack_coeff  = np.exp(-1.0 / (sr * attack_ms / 1000))
    release_coeff = np.exp(-1.0 / (sr * release_ms / 1000))

    if audio.ndim == 2:
        return np.stack([
            compress_band(audio[0], sr, threshold_db, ratio, attack_ms, release_ms),
            compress_band(audio[1], sr, threshold_db, ratio, attack_ms, release_ms),
        ])

    envelope = np.zeros_like(audio)
    gain_reduction = np.ones_like(audio)
    env = 0.0

    for i, sample in enumerate(np.abs(audio)):
        if sample > env:
            env = attack_coeff * env + (1 - attack_coeff) * sample
        else:
            env = release_coeff * env + (1 - release_coeff) * sample
        envelope[i] = env

        if env > threshold:
            gr = threshold * (env / threshold) ** (1 / ratio) / env
        else:
            gr = 1.0

        gain_reduction[i] = gr

    return audio * gain_reduction


def apply_multiband_compression(audio: np.ndarray, sr: int, params: MasteringParams) -> np.ndarray:
    """4-band multiband compression with LR crossovers."""
    # Split into 4 bands
    sub,  rest1  = linkwitz_riley_crossover(audio,  sr,    80)
    low,  rest2  = linkwitz_riley_crossover(rest1,  sr,   500)
    mid,  high   = linkwitz_riley_crossover(rest2,  sr,  5000)

    # Compress each band
    sub_c  = compress_band(sub,  sr, params.mb_sub_threshold,  params.mb_sub_ratio,  params.mb_sub_attack, params.mb_sub_release)
    low_c  = compress_band(low,  sr, params.mb_low_threshold,  params.mb_low_ratio,  30, 120)
    mid_c  = compress_band(mid,  sr, params.mb_mid_threshold,  params.mb_mid_ratio,  15, 80)
    high_c = compress_band(high, sr, params.mb_high_threshold, params.mb_high_ratio, 8,  40)

    return sub_c + low_c + mid_c + high_c


# ─── 6. MID/SIDE PROCESSING ────────────────────────────────────────────────────

def encode_ms(left: np.ndarray, right: np.ndarray):
    mid  = (left + right) / np.sqrt(2)
    side = (left - right) / np.sqrt(2)
    return mid, side


def decode_ms(mid: np.ndarray, side: np.ndarray):
    left  = (mid + side) / np.sqrt(2)
    right = (mid - side) / np.sqrt(2)
    return left, right


def apply_ms_processing(audio: np.ndarray, sr: int, params: MasteringParams) -> np.ndarray:
    """Mid/Side processing with mono-below-120Hz."""
    if audio.ndim != 2:
        return audio

    left, right = audio[0], audio[1]
    mid, side = encode_ms(left, right)

    # Apply stereo width to side channel
    side *= params.stereo_width

    # Mono below 120 Hz (cut side below 120Hz)
    nyq = sr / 2
    b, a = scipy_signal.butter(4, 120 / nyq, btype="low")
    side_low = scipy_signal.filtfilt(b, a, side)
    b_high, a_high = scipy_signal.butter(4, 120 / nyq, btype="high")
    side_high = scipy_signal.filtfilt(b_high, a_high, side)
    side = side_high  # Remove low-frequency side content

    left_out, right_out = decode_ms(mid, side)

    return np.stack([left_out, right_out])


# ─── 8. SATURATION / HARMONIC EXCITER ──────────────────────────────────────────

def soft_clip(x: np.ndarray, drive: float = 1.0) -> np.ndarray:
    """Soft tape saturation via tanh."""
    return np.tanh(x * (1 + drive * 2)) / (1 + drive * 2)


def apply_saturation(audio: np.ndarray, sr: int, amount: float) -> np.ndarray:
    """Subtle tape saturation on mid-lows only."""
    if amount < 0.01:
        return audio

    nyq = sr / 2
    b_low, a_low = scipy_signal.butter(4, 5000 / nyq, btype="low")
    b_high, a_high = scipy_signal.butter(4, 5000 / nyq, btype="high")

    if audio.ndim == 2:
        result = np.zeros_like(audio)
        for i in range(2):
            low_part  = scipy_signal.filtfilt(b_low,  a_low,  audio[i])
            high_part = scipy_signal.filtfilt(b_high, a_high, audio[i])
            saturated_low = soft_clip(low_part, drive=amount)
            result[i] = saturated_low + high_part
        return result
    else:
        low_part  = scipy_signal.filtfilt(b_low,  a_low,  audio)
        high_part = scipy_signal.filtfilt(b_high, a_high, audio)
        return soft_clip(low_part, drive=amount) + high_part


# ─── 10. BUS COMPRESSION ───────────────────────────────────────────────────────

def apply_bus_compression(audio: np.ndarray, sr: int, params: MasteringParams) -> np.ndarray:
    """Stereo bus compressor — glue compression (2:1, slow attack)."""
    return compress_band(audio, sr,
                         params.bus_comp_threshold,
                         params.bus_comp_ratio,
                         attack_ms=50.0,
                         release_ms=100.0)


# ─── 11. LIMITING ──────────────────────────────────────────────────────────────

def apply_true_peak_limiter(audio: np.ndarray, sr: int, ceiling_db: float, target_lufs: float) -> np.ndarray:
    """Gain + True Peak ceiling + LUFS normalization."""
    # First, LUFS normalization
    meter = pyln.Meter(sr)
    if audio.ndim == 2:
        lufs_in = audio.T
    else:
        lufs_in = audio.reshape(-1, 1)

    current_lufs = meter.integrated_loudness(lufs_in)
    if np.isfinite(current_lufs):
        gain_db = target_lufs - current_lufs
        gain_lin = db_to_linear(gain_db)
        audio = audio * gain_lin

    # Hard True Peak ceiling
    ceiling_lin = db_to_linear(ceiling_db)
    peak = np.max(np.abs(audio))
    if peak > ceiling_lin:
        audio = audio * (ceiling_lin / peak)

    # Lookahead limiting: simple lookahead peak limiter
    lookahead_samples = int(sr * 0.005)  # 5ms
    if audio.ndim == 2:
        combined = np.max(np.abs(audio), axis=0)
    else:
        combined = np.abs(audio)

    gain = np.ones(len(combined))
    for i in range(lookahead_samples, len(combined)):
        peak_ahead = np.max(combined[i - lookahead_samples:i + 1])
        if peak_ahead > ceiling_lin:
            gain[i - lookahead_samples:i + 1] = np.minimum(
                gain[i - lookahead_samples:i + 1],
                ceiling_lin / peak_ahead
            )

    if audio.ndim == 2:
        audio = audio * gain
    else:
        audio = audio * gain

    return audio


# ─── 12. OUTPUT STAGE ──────────────────────────────────────────────────────────

def apply_dither(audio: np.ndarray, target_bit_depth: int = 16) -> np.ndarray:
    """Apply TPDF dither for bit-depth reduction."""
    if target_bit_depth >= 24:
        return audio  # No dither needed for high bit depth

    amplitude = 1.0 / (2 ** target_bit_depth)
    # TPDF = difference of two uniform distributions
    dither = amplitude * (np.random.uniform(size=audio.shape) - np.random.uniform(size=audio.shape))
    return audio + dither


def export_formats(audio: np.ndarray, sr: int, output_dir: str, master_id: str, selected_format: str = "mp3128") -> dict:
    """Export only the selected format (plus mp3128 as preview fallback)."""
    os.makedirs(output_dir, exist_ok=True)
    paths = {}

    # Always produce mp3128 as a free preview fallback
    formats_to_render = {selected_format, "mp3128"}

    # WAV formats (soundfile)
    if "wav32" in formats_to_render:
        p = os.path.join(output_dir, f"{master_id}_wav32.wav")
        sf.write(p, audio.T if audio.ndim == 2 else audio, sr, subtype="FLOAT")
        paths["wav32"] = p

    if "wav24" in formats_to_render:
        p = os.path.join(output_dir, f"{master_id}_wav24.wav")
        sf.write(p, audio.T if audio.ndim == 2 else audio, sr, subtype="PCM_24")
        paths["wav24"] = p

    if "wav16" in formats_to_render:
        audio16 = apply_dither(audio, 16)
        p = os.path.join(output_dir, f"{master_id}_wav16.wav")
        sf.write(p, audio16.T if audio16.ndim == 2 else audio16, sr, subtype="PCM_16")
        paths["wav16"] = p

    if "flac" in formats_to_render:
        p = os.path.join(output_dir, f"{master_id}_flac.flac")
        sf.write(p, audio.T if audio.ndim == 2 else audio, sr, format="FLAC", subtype="PCM_24")
        paths["flac"] = p

    # FFmpeg formats (mp3/aac)
    need_ffmpeg = formats_to_render & {"mp3320", "mp3128", "aac256"}
    if need_ffmpeg:
        try:
            import ffmpeg
            tmp_wav = os.path.join(output_dir, f"{master_id}_tmp.wav")
            sf.write(tmp_wav, audio.T if audio.ndim == 2 else audio, sr, subtype="PCM_24")

            if "mp3320" in need_ffmpeg:
                p = os.path.join(output_dir, f"{master_id}_mp3320.mp3")
                ffmpeg.input(tmp_wav).output(p, audio_bitrate="320k", acodec="libmp3lame").overwrite_output().run(quiet=True)
                paths["mp3320"] = p

            if "mp3128" in need_ffmpeg:
                p = os.path.join(output_dir, f"{master_id}_mp3128.mp3")
                ffmpeg.input(tmp_wav).output(p, audio_bitrate="128k", acodec="libmp3lame").overwrite_output().run(quiet=True)
                paths["mp3128"] = p

            if "aac256" in need_ffmpeg:
                p = os.path.join(output_dir, f"{master_id}_aac256.m4a")
                ffmpeg.input(tmp_wav).output(p, audio_bitrate="256k", acodec="aac").overwrite_output().run(quiet=True)
                paths["aac256"] = p

            os.remove(tmp_wav)
        except Exception as e:
            print(f"FFmpeg export error: {e}")
            # Fallback: WAV 24-bit copy
            fallback = os.path.join(output_dir, f"{master_id}_wav24.wav")
            if not os.path.exists(fallback):
                sf.write(fallback, audio.T if audio.ndim == 2 else audio, sr, subtype="PCM_24")
            for fmt in need_ffmpeg:
                paths[fmt] = fallback

    return paths


# ─── MAIN MASTERING FUNCTION ───────────────────────────────────────────────────

def master_audio(
    file_path: str,
    params: MasteringParams,
    output_dir: str,
    progress_callback: Optional[Callable[[str, int], None]] = None,
    selected_format: str = "mp3128",
) -> MasteringResult:
    """Execute the full 12-stage mastering chain."""

    def emit(step: str, progress: int):
        if progress_callback:
            progress_callback(step, progress)

    emit("analyzing", 5)

    # 1. Load audio
    audio, sr = librosa.load(file_path, sr=None, mono=False)
    if audio.ndim == 1:
        audio = np.stack([audio, audio])  # Mono to stereo

    emit("analyzing", 12)

    # 1b. Remove DC offset
    audio = remove_dc_simple(audio)

    emit("eq", 20)

    # 4. Correction EQ
    audio = apply_correction_eq(audio, sr, params)

    emit("compression", 38)

    # 5. Multiband compression
    audio = apply_multiband_compression(audio, sr, params)

    emit("ms", 52)

    # 6. M/S processing
    audio = apply_ms_processing(audio, sr, params)

    emit("saturation", 65)

    # 8. Saturation
    audio = apply_saturation(audio, sr, params.saturation_amount)

    # 9. Final EQ (gentle air shelf)
    final_board = Pedalboard([
        HighShelfFilter(cutoff_frequency_hz=12000, gain_db=0.8, q=0.707),
    ])
    audio = np.stack([
        final_board(audio[0:1].T, sr).T[0],
        final_board(audio[1:2].T, sr).T[0],
    ])

    emit("limiting", 74)

    # 10. Bus compression
    audio = apply_bus_compression(audio, sr, params)

    # 11. True Peak limiting + LUFS normalization
    audio = apply_true_peak_limiter(audio, sr, params.true_peak_ceiling, params.target_lufs)

    emit("rendering", 88)

    # 12. Export all formats
    master_id = str(uuid.uuid4())
    paths = export_formats(audio, sr, output_dir, master_id, selected_format)

    # Post-analysis
    from analyzer import analyze_audio, analysis_to_dict
    # Write temp file for analysis
    tmp = os.path.join(output_dir, f"{master_id}_analysis_tmp.wav")
    sf.write(tmp, audio.T, sr, subtype="PCM_24")
    post_analysis = analysis_to_dict(analyze_audio(tmp))
    os.remove(tmp)

    emit("complete", 100)

    return MasteringResult(
        master_id=master_id,
        paths=paths,
        post_analysis=post_analysis,
        notes=params.notes,
    )

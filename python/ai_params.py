"""
AI Parameter Selection via Claude API.
Takes audio analysis data and returns professional mastering parameters.
"""

import json
import os
from dataclasses import dataclass, asdict
from typing import Optional
import anthropic


SYSTEM_PROMPT = """You are a world-class audio mastering engineer with 30 years experience.
You receive technical audio analysis data and must return precise, professional mastering parameters as JSON.
When a Reference Track section is present, shape the tonal balance, dynamic character, and stereo width to match it as closely as possible — EQ bands, compression ratios and stereo width must directly compensate for differences between source and reference spectra.
Consider genre, energy, dynamics, and spectral balance. Aim for a sound that is:
- Punchy, clear, and wide
- Tonally balanced and genre-appropriate
- Loud enough for the target platform without pumping or distortion
- Preserved transients where the genre demands it
Return ONLY valid JSON, no explanation."""

USER_PROMPT_TEMPLATE = """Audio Analysis:
- Integrated LUFS: {integrated_lufs:.1f}
- True Peak: {true_peak:.1f} dBTP
- Dynamic Range: DR{dr_value:.0f}
- Crest Factor: {crest_factor:.1f} dB
- BPM: {bpm:.0f}
- Key: {key}
- Spectral Centroid: {spectral_centroid:.0f} Hz
- Spectral Rolloff: {spectral_rolloff:.0f} Hz
- Spectral Flatness: {spectral_flatness:.3f}
- Stereo Width: {stereo_width:.2f}
- Mono Compatibility: {mono_compatibility:.2f}
- RMS Sub (20-80Hz): {rms_sub:.1f} dB
- RMS Low (80-500Hz): {rms_low:.1f} dB
- RMS Mid (500-5kHz): {rms_mid:.1f} dB
- RMS High (5-12kHz): {rms_high:.1f} dB
- RMS Air (12-20kHz): {rms_air:.1f} dB
- Clipping Detected: {clipping_detected}
- Duration: {duration_seconds:.1f} sec
- Sample Rate: {sample_rate} Hz
- Channels: {channels}

Target Platform: {platform}
Genre Preset: {preset}

Return JSON mastering parameters:
{{
  "genre": "detected genre string",
  "style": "processing style description",
  "target_lufs": <float, e.g. -14.0>,
  "true_peak_ceiling": <float, e.g. -1.0>,
  "highpass_freq": <int, e.g. 30>,
  "low_shelf_freq": <int>, "low_shelf_gain": <float>,
  "mid_notch_freq": <int>, "mid_notch_gain": <float>, "mid_notch_q": <float>,
  "presence_freq": <int>, "presence_gain": <float>,
  "air_freq": <int>, "air_gain": <float>,
  "mb_sub_threshold": <float>, "mb_sub_ratio": <float>, "mb_sub_attack": <int>, "mb_sub_release": <int>,
  "mb_low_threshold": <float>, "mb_low_ratio": <float>,
  "mb_mid_threshold": <float>, "mb_mid_ratio": <float>,
  "mb_high_threshold": <float>, "mb_high_ratio": <float>,
  "stereo_width": <float, 0.5-2.0>,
  "saturation_amount": <float, 0.0-0.5>,
  "bus_comp_threshold": <float>, "bus_comp_ratio": <float>,
  "notes": "brief description of mastering approach"
}}"""


REFERENCE_SECTION_TEMPLATE = """
Reference Track (match this tonal character and dynamics):
- Ref Integrated LUFS: {ref_integrated_lufs:.1f}
- Ref True Peak: {ref_true_peak:.1f} dBTP
- Ref Sub RMS (20-80Hz): {ref_rms_sub:.1f} dB
- Ref Low RMS (80-500Hz): {ref_rms_low:.1f} dB
- Ref Mid RMS (500-5kHz): {ref_rms_mid:.1f} dB
- Ref High RMS (5-12kHz): {ref_rms_high:.1f} dB
- Ref Air RMS (12-20kHz): {ref_rms_air:.1f} dB
- Ref Spectral Centroid: {ref_spectral_centroid:.0f} Hz
- Ref Spectral Flatness: {ref_spectral_flatness:.3f}
- Ref Stereo Width: {ref_stereo_width:.2f}

Use these reference values to compensate: if ref has more high-end (higher centroid), increase air/presence EQ; if ref is narrower/wider, adjust stereo_width accordingly; match the relative band energies by setting EQ shelves and multiband ratios."""


@dataclass
class MasteringParams:
    genre: str = "Unknown"
    style: str = "Balanced"
    target_lufs: float = -14.0
    true_peak_ceiling: float = -1.0
    highpass_freq: int = 30
    low_shelf_freq: int = 80
    low_shelf_gain: float = 0.0
    mid_notch_freq: int = 280
    mid_notch_gain: float = -1.0
    mid_notch_q: float = 2.0
    presence_freq: int = 3000
    presence_gain: float = 0.5
    air_freq: int = 12000
    air_gain: float = 1.5
    mb_sub_threshold: float = -18.0
    mb_sub_ratio: float = 3.0
    mb_sub_attack: int = 80
    mb_sub_release: int = 200
    mb_low_threshold: float = -20.0
    mb_low_ratio: float = 2.5
    mb_mid_threshold: float = -22.0
    mb_mid_ratio: float = 2.0
    mb_high_threshold: float = -24.0
    mb_high_ratio: float = 1.8
    stereo_width: float = 1.0
    saturation_amount: float = 0.15
    bus_comp_threshold: float = -6.0
    bus_comp_ratio: float = 2.0
    notes: str = ""


PLATFORM_LUFS = {
    "spotify":    -14.0,
    "apple":      -16.0,
    "youtube":    -14.0,
    "tidal":      -14.0,
    "amazon":     -14.0,
    "deezer":     -15.0,
    "tiktok":     -13.0,
    "soundcloud":  -8.0,
    "club":        -9.0,
    "broadcast":  -23.0,
    "custom":     -14.0,
}


def apply_intensity_scaling(params: MasteringParams, intensity: int) -> MasteringParams:
    """Scale all processing parameters based on intensity (0–100).

    0%   = fully transparent (unity gain, no compression, no saturation)
    65%  = balanced default
    100% = maximum processing
    """
    t = max(0.0, min(1.0, intensity / 100.0))

    # EQ gains — scale toward 0 at low intensity
    params.low_shelf_gain *= t
    params.mid_notch_gain *= t
    params.presence_gain  *= t
    params.air_gain       *= t

    # Compression ratios — blend from 1.0 (unity) toward AI-selected ratio
    params.mb_sub_ratio   = 1.0 + (params.mb_sub_ratio  - 1.0) * t
    params.mb_low_ratio   = 1.0 + (params.mb_low_ratio  - 1.0) * t
    params.mb_mid_ratio   = 1.0 + (params.mb_mid_ratio  - 1.0) * t
    params.mb_high_ratio  = 1.0 + (params.mb_high_ratio - 1.0) * t
    params.bus_comp_ratio = 1.0 + (params.bus_comp_ratio - 1.0) * t

    # Bus comp threshold — ease back at low intensity (–3 dB = barely touching)
    params.bus_comp_threshold = -3.0 + (params.bus_comp_threshold - (-3.0)) * t

    # Saturation — scale linearly
    params.saturation_amount *= t

    # Stereo width — blend toward 1.0 (no widening) at low intensity
    params.stereo_width = 1.0 + (params.stereo_width - 1.0) * t

    params.notes += f" Intensity: {intensity}%."
    return params


def get_mastering_params(
    analysis: dict,
    platform: str = "spotify",
    preset: str = "auto",
    intensity: int = 65,
    reference_analysis: Optional[dict] = None,
) -> MasteringParams:
    """Get AI-selected mastering parameters from Claude API."""

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return get_default_params(analysis, platform, preset, intensity, reference_analysis)

    try:
        client = anthropic.Anthropic(api_key=api_key)

        prompt = USER_PROMPT_TEMPLATE.format(**{**analysis, "platform": platform, "preset": preset})

        # Append reference track section if provided
        if reference_analysis:
            ref = reference_analysis
            prompt += REFERENCE_SECTION_TEMPLATE.format(
                ref_integrated_lufs=ref.get("integrated_lufs", -14.0),
                ref_true_peak=ref.get("true_peak", -1.0),
                ref_rms_sub=ref.get("rms_sub", -24.0),
                ref_rms_low=ref.get("rms_low", -20.0),
                ref_rms_mid=ref.get("rms_mid", -18.0),
                ref_rms_high=ref.get("rms_high", -24.0),
                ref_rms_air=ref.get("rms_air", -30.0),
                ref_spectral_centroid=ref.get("spectral_centroid", 2000.0),
                ref_spectral_flatness=ref.get("spectral_flatness", 0.1),
                ref_stereo_width=ref.get("stereo_width", 1.0),
            )

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
            timeout=10.0,  # fall back to defaults within 10s if API is slow
        )

        response_text = message.content[0].text.strip()

        # Extract JSON (handle potential markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        params_dict = json.loads(response_text)

        # Build MasteringParams from response
        params = MasteringParams()
        for key, value in params_dict.items():
            if hasattr(params, key):
                setattr(params, key, value)

        # Override target LUFS from platform
        params.target_lufs = PLATFORM_LUFS.get(platform, -14.0)

        return apply_intensity_scaling(params, intensity)

    except Exception as e:
        print(f"Claude API error: {e}, using default params")
        params = get_default_params(analysis, platform, preset, intensity, reference_analysis)
        # Prepend a visible marker so the frontend can show a warning
        params.notes = f"[Preset-Fallback — KI-Parameter nicht verfügbar: {type(e).__name__}] " + params.notes
        return params


def get_default_params(analysis: dict, platform: str, preset: str, intensity: int = 65, reference_analysis: Optional[dict] = None) -> MasteringParams:
    """Fallback parameters based on preset and analysis."""
    params = MasteringParams()
    params.target_lufs = PLATFORM_LUFS.get(platform, -14.0)

    # Adjust based on preset
    preset_configs = {
        "electronic": {"stereo_width": 1.2, "saturation_amount": 0.2,  "air_gain": 2.0,  "mb_sub_threshold": -16.0},
        "hiphop":     {"stereo_width": 1.0, "saturation_amount": 0.25, "mb_sub_threshold": -14.0, "mb_sub_ratio": 4.0},
        "trap":       {"stereo_width": 1.05,"saturation_amount": 0.2,  "mb_sub_threshold": -12.0, "mb_sub_ratio": 5.0, "air_gain": 2.0},
        "dance":      {"stereo_width": 1.15,"saturation_amount": 0.18, "air_gain": 1.8,  "mb_sub_threshold": -15.0, "bus_comp_ratio": 2.5},
        "rock":       {"stereo_width": 0.95,"saturation_amount": 0.3,  "presence_gain": 1.5, "presence_freq": 2500},
        "metal":      {"stereo_width": 0.9, "saturation_amount": 0.4,  "presence_gain": 2.0, "presence_freq": 3000, "mb_mid_ratio": 2.5, "bus_comp_ratio": 2.5},
        "pop":        {"stereo_width": 1.1, "saturation_amount": 0.15, "air_gain": 2.5},
        "rnb":        {"stereo_width": 1.05,"saturation_amount": 0.2,  "low_shelf_gain": 1.0, "presence_gain": 0.8, "mb_sub_threshold": -16.0},
        "latin":      {"stereo_width": 1.1, "saturation_amount": 0.15, "presence_gain": 1.2, "air_gain": 1.5},
        "country":    {"stereo_width": 0.9, "saturation_amount": 0.12, "presence_gain": 1.0, "presence_freq": 2800},
        "jazz":       {"stereo_width": 0.8, "saturation_amount": 0.05, "mb_sub_ratio": 1.5},
        "classical":  {"stereo_width": 1.2, "saturation_amount": 0.02, "bus_comp_ratio": 1.5, "mb_sub_ratio": 1.5},
        "ambient":    {"stereo_width": 1.3, "saturation_amount": 0.03, "air_gain": 2.0,  "bus_comp_ratio": 1.3, "mb_sub_ratio": 1.3},
        "techno":     {"stereo_width": 1.0, "saturation_amount": 0.22, "mb_sub_threshold": -13.0, "mb_sub_ratio": 4.5, "presence_gain": 1.2, "bus_comp_ratio": 2.5},
        "edm":        {"stereo_width": 1.25,"saturation_amount": 0.18, "mb_sub_threshold": -14.0, "mb_sub_ratio": 4.0, "air_gain": 2.5, "bus_comp_ratio": 2.5},
        "lofi":       {"stereo_width": 0.85,"saturation_amount": 0.35, "low_shelf_gain": 1.5, "air_gain": -1.0, "bus_comp_ratio": 2.0},
        "podcast":    {"stereo_width": 0.7, "highpass_freq": 80, "presence_gain": 2.0, "presence_freq": 2000},
    }

    if preset in preset_configs:
        for key, value in preset_configs[preset].items():
            setattr(params, key, value)

    # Auto-adjust based on analysis
    integrated = analysis.get("integrated_lufs", -18.0)
    if integrated > -12:
        params.bus_comp_threshold = -4.0  # Tighter compression for loud sources
    elif integrated < -24:
        params.bus_comp_threshold = -8.0  # Gentler for quiet sources

    # Sub-bass adjustment
    rms_sub = analysis.get("rms_sub", -30.0)
    if rms_sub > -18:
        params.mb_sub_threshold = -12.0
        params.mb_sub_ratio = 4.0

    params.notes = f"Auto-selected for {preset} preset targeting {platform} at {params.target_lufs} LUFS."
    params.genre = preset if preset != "auto" else "Unknown"

    # Basic reference-matching adjustments (used when Claude API unavailable)
    if reference_analysis:
        src_centroid = analysis.get("spectral_centroid", 2000.0)
        ref_centroid = reference_analysis.get("spectral_centroid", 2000.0)
        centroid_diff = ref_centroid - src_centroid
        # Brighter reference → add air/presence; darker → reduce
        params.air_gain      = float(max(-3.0, min(4.0, params.air_gain      + centroid_diff / 2000.0 * 2.0)))
        params.presence_gain = float(max(-2.0, min(4.0, params.presence_gain + centroid_diff / 2000.0 * 1.0)))

        # Stereo width match
        ref_width = reference_analysis.get("stereo_width", 1.0)
        params.stereo_width = float(max(0.5, min(2.0, ref_width)))

        # Sub bass: if reference has less sub, tighten compression
        ref_rms_sub = reference_analysis.get("rms_sub", -24.0)
        src_rms_sub = analysis.get("rms_sub", -24.0)
        if src_rms_sub > ref_rms_sub + 3:          # source has significantly more sub
            params.mb_sub_ratio = min(6.0, params.mb_sub_ratio + 1.0)
            params.mb_sub_threshold = max(-20.0, params.mb_sub_threshold + 2.0)

        params.notes += " Reference track used for fallback spectral matching."

    return apply_intensity_scaling(params, intensity)

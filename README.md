# ONE DONE MASTERING

AI-powered professional audio mastering — Ozone/Fabfilter-level quality in one click.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes + Python FastAPI microservice (port 8001)
- **Audio DSP**: `pedalboard` (Spotify) + `pyloudnorm` + `librosa` + `scipy`
- **AI**: Claude API (`claude-sonnet-4-20250514`) for genre detection & parameter selection
- **Payments**: PayPal Subscriptions API
- **Database**: SQLite via Prisma

---

## Setup

### 1. System Dependencies

**macOS:**
```bash
brew install ffmpeg
```

**Linux/WSL:**
```bash
apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html and add to PATH.

---

### 2. Node.js Setup

```bash
npm install
```

---

### 3. Python Virtual Environment

```bash
cd python
python -m venv venv

# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

---

### 4. Environment Variables

Edit `.env.local` and fill in your keys:

```
ANTHROPIC_API_KEY=sk-ant-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_MODE=sandbox
```

---

### 5. Database Setup

```bash
npm run db:push
npm run db:generate
```

---

### 6. PayPal Sandbox Setup

1. Go to https://developer.paypal.com
2. Create a sandbox app → get Client ID & Secret
3. Set up webhook for `PAYMENT.CAPTURE.COMPLETED` and `BILLING.SUBSCRIPTION.ACTIVATED`
4. Add webhook ID to `.env.local`

---

### 7. Run Development Server

```bash
# Start both Next.js and Python service concurrently
npm run dev

# Or separately:
npm run dev:next    # Next.js on http://localhost:3000
npm run dev:python  # Python FastAPI on http://localhost:8001
```

---

## Mastering Chain (12 Stages)

1. DC Offset Removal
2. Pre-Master Analysis (LUFS, True Peak, DR, BPM, Key, spectral, stereo)
3. AI Parameter Selection (Claude API → JSON params)
4. Correction EQ (high-pass, shelves, notch, presence, air)
5. Multiband Compression (4 bands: Sub/Low/Mid/High, Linkwitz-Riley 4th order)
6. M/S Processing (stereo width, mono below 120Hz)
7. Stereo Enhancement (Haas micro-widening)
8. Saturation / Harmonic Exciter (soft-clip tape saturation on mid-lows)
9. Final EQ (gentle air shelf)
10. Bus Compression (glue, 2:1, slow attack)
11. True Peak Limiting (5ms lookahead, ITU-R BS.1770-4 LUFS normalization)
12. TPDF Dithering + Export (WAV 32/24/16-bit, FLAC, MP3 320/128, AAC 256)

---

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | €0 | 3 masters/day, MP3 128kbps only |
| Pay-per-Download | €2.99/track | All formats, 7-day download link |
| Basic | €9.99/month | 15 masters, all formats, download history |
| Pro | €24.99/month | Unlimited, WAV 32-bit float, stems, API access |
| Basic Annual | €83.90/year | 2 months free |
| Pro Annual | €209.90/year | 2 months free |

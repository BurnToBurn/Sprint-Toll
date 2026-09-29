import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Hexagon,
  Ship,
  Palette,
  Layers,
  Sparkles,
  CheckCircle2,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { sound } from '../utils/audio';

interface LogoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. Primary Landscape Logo SVG string
export const SPRINT_TOLLS_LANDSCAPE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 220" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#1E222A"/>
      <stop offset="100%" stopColor="#15181E"/>
    </linearGradient>
    <linearGradient id="huntGreen" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#004831"/>
      <stop offset="100%" stopColor="#66BD29"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#FFD200"/>
      <stop offset="100%" stopColor="#F59E0B"/>
    </linearGradient>
    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#48A2D8"/>
      <stop offset="100%" stopColor="#2563EB"/>
    </linearGradient>
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5"/>
    </filter>
  </defs>

  <!-- Container Box with Industrial Toy 3D Borders -->
  <rect x="6" y="6" width="708" height="208" rx="28" fill="url(#bgGrad)" stroke="#66BD29" stroke-width="4" filter="url(#badgeShadow)"/>

  <!-- Corner Rivets -->
  <circle cx="28" cy="28" r="4.5" fill="#4B5563" stroke="#1E222A" stroke-width="2"/>
  <circle cx="692" cy="28" r="4.5" fill="#4B5563" stroke="#1E222A" stroke-width="2"/>
  <circle cx="28" cy="192" r="4.5" fill="#4B5563" stroke="#1E222A" stroke-width="2"/>
  <circle cx="692" cy="192" r="4.5" fill="#4B5563" stroke="#1E222A" stroke-width="2"/>

  <!-- Left Emblem: Geometric Hexagon + Ferry Ship + Toll Barrier -->
  <g transform="translate(36, 26)">
    <!-- Hexagon Outer Ring in Huntington Lime Green -->
    <polygon points="80,4 150,44 150,124 80,164 10,124 10,44" fill="#003624" stroke="#66BD29" stroke-width="5" stroke-linejoin="round"/>
    <!-- Hexagon Inner Accent -->
    <polygon points="80,14 140,48 140,118 80,152 20,118 20,48" fill="#004831" stroke="#002619" stroke-width="2" stroke-linejoin="round"/>

    <!-- Water Waves -->
    <path d="M 28 116 Q 52 108, 80 116 T 132 116" fill="none" stroke="url(#waterGrad)" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 36 128 Q 58 122, 80 128 T 124 128" fill="none" stroke="#48A2D8" stroke-width="3" stroke-linecap="round" opacity="0.7"/>

    <!-- Ferry Vessel Hull -->
    <path d="M 38 98 L 122 98 L 112 116 L 48 116 Z" fill="#F4F6F9" stroke="#1E222A" stroke-width="2.5"/>
    <rect x="52" y="78" width="56" height="20" rx="3" fill="#FFD200" stroke="#1E222A" stroke-width="2"/>
    <!-- Windows -->
    <rect x="58" y="83" width="9" height="7" rx="1.5" fill="#1E222A"/>
    <rect x="71" y="83" width="9" height="7" rx="1.5" fill="#1E222A"/>
    <rect x="84" y="83" width="9" height="7" rx="1.5" fill="#1E222A"/>
    <rect x="97" y="83" width="9" height="7" rx="1.5" fill="#1E222A"/>

    <!-- Radar mast & funnel -->
    <rect x="76" y="66" width="8" height="12" rx="1" fill="#E85D04" stroke="#1E222A" stroke-width="1.5"/>
    <line x1="80" y1="58" x2="80" y2="66" stroke="#F4F6F9" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="80" cy="56" r="3" fill="#66BD29"/>

    <!-- Automated Toll Gate Barrier (diagonal safety stripes) -->
    <g transform="translate(18, 54)">
      <rect x="0" y="0" width="10" height="24" rx="2" fill="#1E222A" stroke="#FFD200" stroke-width="1.5"/>
      <circle cx="5" cy="6" r="3" fill="#66BD29"/>
      <!-- Boom Barrier Arm angled up at 30 deg -->
      <line x1="8" y1="12" x2="68" y2="-8" stroke="#FFD200" stroke-width="4.5" stroke-linecap="round"/>
      <line x1="18" y1="9" x2="28" y2="5" stroke="#1E222A" stroke-width="4"/>
      <line x1="38" y1="2" x2="48" y2="-2" stroke="#1E222A" stroke-width="4"/>
      <line x1="58" y1="-5" x2="68" y2="-8" stroke="#1E222A" stroke-width="4"/>
    </g>
  </g>

  <!-- Typography & Wordmark -->
  <!-- "SPRINT TOLLS" Big Impact Title -->
  <text x="216" y="98" fill="#FFD200" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="54" letter-spacing="2">
    SPRINT TOLLS
  </text>
  <text x="216" y="98" fill="none" stroke="#1E222A" stroke-width="2" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="54" letter-spacing="2">
    SPRINT TOLLS
  </text>

  <!-- Tagline: Agile Port Simulator -->
  <g transform="translate(218, 116)">
    <rect x="0" y="0" width="220" height="28" rx="8" fill="#FFD200" stroke="#1E222A" stroke-width="2"/>
    <text x="110" y="19" fill="#1E222A" font-family="ui-monospace, monospace" font-weight="900" font-size="13" text-anchor="middle" letter-spacing="2">
      PORT SIMULATOR
    </text>

    <!-- Lean & Little's Law Badge -->
    <rect x="228" y="0" width="170" height="28" rx="8" fill="#003624" stroke="#66BD29" stroke-width="1.5"/>
    <text x="313" y="18" fill="#66BD29" font-family="ui-monospace, monospace" font-weight="800" font-size="11" text-anchor="middle" letter-spacing="1">
      LEAN FLOW ENGINE
    </text>
  </g>

  <!-- Bottom HEXperience & Huntington Endorsement -->
  <g transform="translate(218, 160)">
    <polygon points="12,2 22,8 22,20 12,26 2,20 2,8" fill="#004831" stroke="#66BD29" stroke-width="1.5"/>
    <text x="7" y="17" fill="#66BD29" font-family="ui-monospace, monospace" font-weight="900" font-size="7">HEX</text>
    <text x="28" y="18" fill="#F4F6F9" font-family="ui-monospace, monospace" font-weight="800" font-size="12" letter-spacing="0.5">
      HEX<tspan fill="#66BD29">perience</tspan>
      <tspan fill="#776F67" font-weight="600" font-size="11"> · Huntington Bank Colorway Design System</tspan>
    </text>
  </g>
</svg>`;

// 2. Square Badge / App Icon SVG string (1:1 Aspect Ratio)
export const SPRINT_TOLLS_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#1E222A"/>
      <stop offset="50%" stopColor="#252B35"/>
      <stop offset="100%" stopColor="#14171D"/>
    </linearGradient>
    <linearGradient id="huntGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#004831"/>
      <stop offset="100%" stopColor="#66BD29"/>
    </linearGradient>
    <linearGradient id="waterFlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#48A2D8"/>
      <stop offset="100%" stopColor="#1D4ED8"/>
    </linearGradient>
    <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#66BD29" floodOpacity="0.35"/>
    </filter>
  </defs>

  <!-- Rounded Squircle Canvas -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="url(#iconBg)" stroke="#66BD29" stroke-width="12" filter="url(#iconGlow)"/>

  <!-- Decorative Corner Bolts -->
  <circle cx="56" cy="56" r="10" fill="#374151" stroke="#1E222A" stroke-width="4"/>
  <circle cx="456" cy="56" r="10" fill="#374151" stroke="#1E222A" stroke-width="4"/>
  <circle cx="56" cy="456" r="10" fill="#374151" stroke="#1E222A" stroke-width="4"/>
  <circle cx="456" cy="456" r="10" fill="#374151" stroke="#1E222A" stroke-width="4"/>

  <!-- Giant Hexagon Portal Shield -->
  <polygon points="256,52 420,146 420,336 256,430 92,336 92,146" fill="#003624" stroke="#66BD29" stroke-width="10" stroke-linejoin="round"/>
  <polygon points="256,76 396,156 396,320 256,400 116,320 116,156" fill="#004831" stroke="#002418" stroke-width="4" stroke-linejoin="round"/>

  <!-- Water Waves -->
  <path d="M 136 295 Q 196 280, 256 295 T 376 295" fill="none" stroke="url(#waterFlow)" stroke-width="10" stroke-linecap="round"/>
  <path d="M 156 320 Q 206 310, 256 320 T 356 320" fill="none" stroke="#48A2D8" stroke-width="7" stroke-linecap="round" opacity="0.8"/>

  <!-- Ferry Ship -->
  <path d="M 160 250 L 352 250 L 332 290 L 180 290 Z" fill="#F4F6F9" stroke="#1E222A" stroke-width="5"/>
  <rect x="188" y="200" width="136" height="50" rx="6" fill="#FFD200" stroke="#1E222A" stroke-width="5"/>
  <rect x="202" y="214" width="22" height="18" rx="3" fill="#1E222A"/>
  <rect x="234" y="214" width="22" height="18" rx="3" fill="#1E222A"/>
  <rect x="266" y="214" width="22" height="18" rx="3" fill="#1E222A"/>
  <rect x="298" y="214" width="22" height="18" rx="3" fill="#1E222A"/>
  <rect x="246" y="172" width="20" height="28" rx="3" fill="#E85D04" stroke="#1E222A" stroke-width="4"/>
  <line x1="256" y1="150" x2="256" y2="172" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>
  <circle cx="256" cy="144" r="8" fill="#66BD29"/>

  <!-- Toll Barrier Arm sweeping across -->
  <g transform="translate(100, 140)">
    <rect x="0" y="0" width="24" height="60" rx="4" fill="#1E222A" stroke="#FFD200" stroke-width="3"/>
    <circle cx="12" cy="15" r="7" fill="#66BD29"/>
    <!-- Yellow & Black striped boom barrier arm -->
    <line x1="20" y1="30" x2="160" y2="-20" stroke="#FFD200" stroke-width="10" stroke-linecap="round"/>
    <line x1="40" y1="23" x2="60" y2="16" stroke="#1E222A" stroke-width="10"/>
    <line x1="80" y1="9" x2="100" y2="2" stroke="#1E222A" stroke-width="10"/>
    <line x1="120" y1="-5" x2="140" y2="-12" stroke="#1E222A" stroke-width="10"/>
  </g>

  <!-- Bottom Brand Title Plate -->
  <g transform="translate(66, 420)">
    <rect x="0" y="0" width="380" height="52" rx="16" fill="#FFD200" stroke="#1E222A" stroke-width="4"/>
    <text x="190" y="36" fill="#1E222A" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="3">
      SPRINT TOLLS
    </text>
  </g>
</svg>`;

// 3. HEXperience Developer Logo SVG string
export const HEXPERIENCE_BRAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="100%" height="100%">
  <defs>
    <linearGradient id="hexBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#004831"/>
      <stop offset="100%" stopColor="#002D1E"/>
    </linearGradient>
    <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#66BD29"/>
      <stop offset="100%" stopColor="#8AE34A"/>
    </linearGradient>
  </defs>

  <rect x="4" y="4" width="592" height="192" rx="24" fill="url(#hexBg)" stroke="#66BD29" stroke-width="4"/>

  <!-- Geometric Hexagon Emblem -->
  <g transform="translate(40, 36)">
    <polygon points="64,4 120,36 120,100 64,132 8,100 8,36" fill="#003624" stroke="#66BD29" stroke-width="6" stroke-linejoin="round"/>
    <polygon points="64,16 108,42 108,92 64,118 20,92 20,42" fill="#004831" stroke="#66BD29" stroke-width="2" stroke-linejoin="round" opacity="0.8"/>
    <!-- Glowing HEX letters -->
    <text x="64" y="78" fill="#FFFFFF" font-family="ui-monospace, monospace" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="-1">
      HEX
    </text>
    <circle cx="64" cy="98" r="4" fill="#66BD29"/>
  </g>

  <!-- Typography -->
  <text x="190" y="96" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" letter-spacing="-0.5">
    HEX<tspan fill="#66BD29">perience</tspan>
  </text>
  <text x="192" y="128" fill="#66BD29" font-family="ui-monospace, monospace" font-weight="800" font-size="14" letter-spacing="2">
    INTERACTIVE SOFTWARE &amp; WORKFLOWS
  </text>
  <text x="192" y="152" fill="#776F67" font-family="ui-monospace, monospace" font-weight="600" font-size="11" letter-spacing="1">
    Official Brand Identity · Huntington Bank Colorway
  </text>
</svg>`;

export const LogoDownloadModal: React.FC<LogoDownloadModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<'landscape' | 'icon' | 'hexperience'>('landscape');
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSvg =
    selectedFormat === 'landscape'
      ? SPRINT_TOLLS_LANDSCAPE_SVG
      : selectedFormat === 'icon'
      ? SPRINT_TOLLS_ICON_SVG
      : HEXPERIENCE_BRAND_SVG;

  const currentFilename =
    selectedFormat === 'landscape'
      ? 'sprint-tolls-logo-primary'
      : selectedFormat === 'icon'
      ? 'sprint-tolls-app-icon'
      : 'hexperience-brand-logo';

  // Trigger browser download for SVG vector
  const handleDownloadSvg = () => {
    sound.playClick();
    const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentFilename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotice('SVG Vector Downloaded!');
  };

  // Convert SVG to High-Resolution PNG on offscreen canvas and trigger download
  const handleDownloadPng = (dimension = 1024) => {
    sound.playLevelUp();
    const svgBlob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isSquare = selectedFormat === 'icon';
      canvas.width = dimension;
      canvas.height = isSquare ? dimension : Math.round(dimension * (selectedFormat === 'landscape' ? 220 / 720 : 200 / 600));

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `${currentFilename}-${dimension}x${canvas.height}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pngUrl);
            showNotice(`High-Res ${dimension}px PNG Downloaded!`);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const handleCopySvg = () => {
    sound.playClick();
    navigator.clipboard.writeText(currentSvg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotice('SVG Code Copied to Clipboard!');
    });
  };

  const showNotice = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 sm:p-8 text-[#1E222A] space-y-6 shadow-[0_10px_0_#1E222A]">
        {/* 3D Toy Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-[#1E222A]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#66BD29] text-[#003624] font-black text-[10px] uppercase font-mono tracking-wider">
                Official Brand Kit
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFD200] text-[#1E222A] font-black text-[10px] uppercase font-mono tracking-wider">
                Huntington Palette
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black text-[#1E222A] tracking-tight mt-1 flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Ship className="w-7 h-7 text-[#004831]" />
              <span>Sprint Tolls &bull; Brand Logo Download</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
              Download production-ready vector SVG and high-resolution PNG logos for Sprint Tolls &amp; HEXperience.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-2xl bg-[#1E222A] hover:bg-[#2B2F38] text-white border-2 border-[#1E222A] transition-colors cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5"
            title="Close (Esc)"
          >
            <X className="w-5 h-5 text-[#FFD200]" />
          </button>
        </div>

        {/* Logo Variant Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              setSelectedFormat('landscape');
            }}
            className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
              selectedFormat === 'landscape'
                ? 'bg-[#FFD200] text-[#1E222A] border-[#1E222A] shadow-[0_3px_0_#1E222A] font-black'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 font-bold'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#1E222A] text-[#FFD200]">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                Primary Logo
              </div>
              <div className="text-[10px] opacity-80 font-mono">Horizontal Wordmark</div>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedFormat('icon');
            }}
            className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
              selectedFormat === 'icon'
                ? 'bg-[#FFD200] text-[#1E222A] border-[#1E222A] shadow-[0_3px_0_#1E222A] font-black'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 font-bold'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#004831] text-[#66BD29]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                App Icon Badge
              </div>
              <div className="text-[10px] opacity-80 font-mono">1:1 Square Avatar / Emblem</div>
            </div>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setSelectedFormat('hexperience');
            }}
            className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
              selectedFormat === 'hexperience'
                ? 'bg-[#004831] text-white border-[#66BD29] shadow-[0_3px_0_#1E222A] font-black'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 font-bold'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#66BD29] text-[#003624]">
              <Hexagon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="text-xs font-black" style={{ fontFamily: 'var(--font-heading)' }}>
                HEXperience Mark
              </div>
              <div className="text-[10px] opacity-80 font-mono">Dev Co Brand Hallmark</div>
            </div>
          </button>
        </div>

        {/* Live Vector Logo Preview Box */}
        <div className="relative bg-[#1A1D24] p-6 sm:p-10 rounded-2xl border-[3px] border-[#1E222A] shadow-inner flex flex-col items-center justify-center min-h-[220px] max-h-[300px]">
          {/* Subtle checkerboard pattern to show transparency/bounds */}
          <div className="w-full max-w-xl max-h-[240px] flex items-center justify-center">
            <div
              className="w-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: currentSvg }}
            />
          </div>

          {/* Quick format watermark pill */}
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-white text-[10px] font-mono">
            {selectedFormat === 'landscape' ? '720 × 220 Vector' : selectedFormat === 'icon' ? '512 × 512 Squircle' : '600 × 200 Corporate'}
          </div>
        </div>

        {/* Notification Toast */}
        {downloadSuccess && (
          <div className="bg-[#004831] border-2 border-[#66BD29] p-3 rounded-2xl text-white flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#66BD29]" />
              <span>{downloadSuccess}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-200">Ready in your downloads folder</span>
          </div>
        )}

        {/* Download & Export Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-[#1E222A]/15">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download SVG Vector Button */}
            <button
              onClick={handleDownloadSvg}
              className="px-4 py-2.5 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] border-[2.5px] border-[#1E222A] rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-[0_3px_0_#1E222A] active:translate-y-1 active:shadow-none cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
              title="Download pure scalable vector SVG file (infinite resolution for print, web, or UI)"
            >
              <Download className="w-4 h-4" />
              <span>Download SVG (Vector)</span>
            </button>

            {/* Download High-Res PNG Button */}
            <button
              onClick={() => handleDownloadPng(1024)}
              className="px-4 py-2.5 bg-[#48A2D8] hover:bg-[#5CB5EB] text-white border-[2.5px] border-[#1E222A] rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-[0_3px_0_#1E222A] active:translate-y-1 active:shadow-none cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
              title="Download high-resolution raster PNG image (1024px width)"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Download High-Res PNG (1024px)</span>
            </button>

            {/* Copy SVG Markup */}
            <button
              onClick={handleCopySvg}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-[#1E222A] border-[2px] border-[#1E222A] rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="Copy raw SVG markup to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Copied!' : 'Copy SVG'}</span>
            </button>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2.5 bg-[#1E222A] hover:bg-[#2B2F38] text-white border-[2px] border-[#1E222A] rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-[0_2px_0_#1E222A] active:translate-y-0.5 active:shadow-none"
          >
            Close
          </button>
        </div>

        {/* Brand Palette Reference Guide */}
        <div className="bg-white border-2 border-[#1E222A] p-4 rounded-2xl space-y-2 text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#004831]" />
              Official Brand Swatches &amp; Color Specifications
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Huntington Bank Color System</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-lg bg-[#004831] border border-black/20 shrink-0" />
              <div className="leading-tight">
                <div className="font-bold text-[11px] text-[#1E222A]">Forest Green</div>
                <div className="font-mono text-[9px] text-slate-500">#004831</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-lg bg-[#66BD29] border border-black/20 shrink-0" />
              <div className="leading-tight">
                <div className="font-bold text-[11px] text-[#1E222A]">Huntington Lime</div>
                <div className="font-mono text-[9px] text-slate-500">#66BD29</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-lg bg-[#FFD200] border border-black/20 shrink-0" />
              <div className="leading-tight">
                <div className="font-bold text-[11px] text-[#1E222A]">Safety Yellow</div>
                <div className="font-mono text-[9px] text-slate-500">#FFD200</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-5 h-5 rounded-lg bg-[#1E222A] border border-black/20 shrink-0" />
              <div className="leading-tight">
                <div className="font-bold text-[11px] text-[#1E222A]">Industrial Charcoal</div>
                <div className="font-mono text-[9px] text-slate-500">#1E222A</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Hexagon,
  Download,
  Copy,
  Check,
  X,
  Palette,
  Sparkles,
  Ship,
  ShieldCheck,
  FileCode2,
  Image as ImageIcon
} from 'lucide-react';

interface BrandLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LogoVariant = 'hexperience-full' | 'hexperience-badge' | 'sprint-tolls' | 'master-lockup';
type BackgroundStyle = 'forest' | 'dark' | 'white' | 'transparent';

export const BrandLogoModal: React.FC<BrandLogoModalProps> = ({ isOpen, onClose }) => {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>('hexperience-full');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('forest');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    if (label === 'svg') {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } else {
      setCopiedColor(text);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  const getSvgString = (): string => {
    if (!svgRef.current) return '';
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return source;
  };

  const downloadSvg = () => {
    const svgStr = getSvgString();
    if (!svgStr) return;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedVariant}-logo.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPng = (transparent: boolean = false) => {
    const svgStr = getSvgString();
    if (!svgStr) return;

    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = typeof window !== 'undefined' && window.URL ? window.URL : URL;
    const blobURL = URLObject.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High resolution retina 2x
      canvas.width = 1200 * scale;
      canvas.height = 600 * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.scale(scale, scale);

      if (!transparent) {
        if (backgroundStyle === 'forest') {
          ctx.fillStyle = '#004831';
        } else if (backgroundStyle === 'dark') {
          ctx.fillStyle = '#1E222A';
        } else if (backgroundStyle === 'white') {
          ctx.fillStyle = '#FFFFFF';
        } else {
          ctx.fillStyle = '#004831';
        }
        ctx.fillRect(0, 0, 1200, 600);
      }

      ctx.drawImage(img, 0, 0, 1200, 600);
      URLObject.revokeObjectURL(blobURL);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${selectedVariant}-${transparent ? 'transparent' : backgroundStyle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');
    };

    img.src = blobURL;
  };

  const getBgClass = () => {
    switch (backgroundStyle) {
      case 'forest':
        return 'bg-[#004831] border-[#66BD29]/40';
      case 'dark':
        return 'bg-[#1E222A] border-[#384050]';
      case 'white':
        return 'bg-white border-slate-300';
      case 'transparent':
        return 'bg-[radial-gradient(#384050_1px,transparent_1px)] [background-size:16px_16px] bg-[#11141a] border-[#384050]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#1E222A]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#242933] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_16px_0_#1E222A] text-white overflow-hidden flex flex-col max-h-[92vh]">
        {/* Industrial Corner Rivets */}
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Top Accent Strip in Huntington Bank Green Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#004831] via-[#66BD29] to-[#776F67]" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b-2 border-[#1E222A] bg-[#1E222A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004831] border-2 border-[#66BD29] flex items-center justify-center text-[#66BD29] shadow-[0_2px_0_#002418]">
              <Hexagon className="w-6 h-6 fill-[#66BD29]/20 stroke-[#66BD29] stroke-2" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-mono tracking-tight leading-none">
                  Official Brand Assets &amp; Logo Download
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#66BD29] text-[#003624] font-black font-mono text-[10px] uppercase">
                  Vector SVG &bull; High-Res PNG
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Huntington Bank Color Palette (#004831, #66BD29, #776F67) &bull; Licensed by HEXperience
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Logo Variant Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'hexperience-full', name: 'HEXperience Full Lockup', icon: Hexagon, tag: 'Primary Brand' },
              { id: 'hexperience-badge', name: 'HEX Hexagon Emblem', icon: ShieldCheck, tag: 'Icon / Badge' },
              { id: 'sprint-tolls', name: 'Sprint Tolls Game Logo', icon: Ship, tag: 'Product' },
              { id: 'master-lockup', name: 'Master Co-Brand Lockup', icon: Sparkles, tag: 'Enterprise' }
            ].map((variant) => {
              const Icon = variant.icon;
              const isSelected = selectedVariant === variant.id;
              return (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id as LogoVariant)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#004831] border-[#66BD29] text-white shadow-[0_4px_0_#1E222A]'
                      : 'bg-[#1E222A] border-[#384050] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-[#66BD29]' : 'text-slate-400'}`} />
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-[#66BD29] text-[#003624]' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {variant.tag}
                    </span>
                  </div>
                  <div className="font-bold text-xs leading-tight font-mono">{variant.name}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Logo Stage / Canvas Preview */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#66BD29]" />
                Preview Canvas &amp; Background Style:
              </span>

              {/* Background Color Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1E222A] border border-[#384050]">
                {[
                  { id: 'forest', name: 'Huntington Forest', color: '#004831' },
                  { id: 'dark', name: 'Industrial Dark', color: '#1E222A' },
                  { id: 'white', name: 'Clean White', color: '#FFFFFF' },
                  { id: 'transparent', name: 'Transparent Grid', color: 'transparent' }
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setBackgroundStyle(bg.id as BackgroundStyle)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      backgroundStyle === bg.id
                        ? 'bg-[#66BD29] text-[#003624] shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/30 inline-block"
                      style={{
                        backgroundColor: bg.color === 'transparent' ? '#64748b' : bg.color,
                        backgroundImage:
                          bg.color === 'transparent'
                            ? 'radial-gradient(#ffffff 1px, transparent 1px)'
                            : undefined
                      }}
                    />
                    <span className="hidden sm:inline">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Render Stage */}
            <div
              className={`w-full rounded-2xl border-2 p-6 sm:p-10 flex items-center justify-center transition-all shadow-inner min-h-[220px] sm:min-h-[260px] ${getBgClass()}`}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 1200 600"
                className="w-full max-w-[700px] h-auto select-none drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="huntGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#004831" />
                    <stop offset="100%" stopColor="#003624" />
                  </linearGradient>
                  <linearGradient id="limeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#76d034" />
                    <stop offset="100%" stopColor="#5bae23" />
                  </linearGradient>
                  <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE043" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>

                {/* 1. VARIANT: HEXperience Full Lockup */}
                {selectedVariant === 'hexperience-full' && (
                  <g transform="translate(180, 150)">
                    {/* Hexagon Emblem Icon */}
                    <g transform="translate(0, 0)">
                      <polygon
                        points="150,0 270,70 270,210 150,280 30,210 30,70"
                        fill="#003624"
                        stroke="#66BD29"
                        strokeWidth="14"
                        strokeLinejoin="round"
                      />
                      <polygon
                        points="150,25 245,80 245,200 150,255 55,200 55,80"
                        fill="none"
                        stroke="#66BD29"
                        strokeWidth="4"
                        strokeDasharray="10 8"
                        opacity="0.6"
                      />
                      <text
                        x="150"
                        y="165"
                        fill="#FFFFFF"
                        fontSize="76"
                        fontWeight="900"
                        fontFamily="monospace, system-ui"
                        textAnchor="middle"
                        letterSpacing="1"
                      >
                        HEX
                      </text>
                    </g>

                    {/* Wordmark and Tagline */}
                    <g transform="translate(320, 60)">
                      <text
                        x="0"
                        y="80"
                        fontSize="92"
                        fontWeight="900"
                        fontFamily="monospace, system-ui"
                        fill={backgroundStyle === 'white' ? '#004831' : '#FFFFFF'}
                        letterSpacing="-2"
                      >
                        HEX<tspan fill="#66BD29">perience</tspan>
                      </text>

                      {/* Corporate Descriptor Pill */}
                      <rect x="0" y="115" width="220" height="34" rx="8" fill="#66BD29" />
                      <text
                        x="110"
                        y="138"
                        fill="#003624"
                        fontSize="18"
                        fontWeight="900"
                        fontFamily="monospace, system-ui"
                        textAnchor="middle"
                        letterSpacing="2"
                      >
                        DEV CO &bull; SIMULATION
                      </text>

                      <text
                        x="0"
                        y="180"
                        fontSize="22"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                        fill={backgroundStyle === 'white' ? '#776F67' : '#bae6fd'}
                      >
                        High-Precision Agile Workflow &amp; Queuing Systems
                      </text>

                      <text
                        x="0"
                        y="210"
                        fontSize="16"
                        fontWeight="600"
                        fontFamily="monospace, system-ui"
                        fill={backgroundStyle === 'white' ? '#004831' : '#66BD29'}
                      >
                        Huntington Bank Color Palette Compliant (#004831 &bull; #66BD29 &bull; #776F67)
                      </text>
                    </g>
                  </g>
                )}

                {/* 2. VARIANT: HEX Hexagon Emblem Badge */}
                {selectedVariant === 'hexperience-badge' && (
                  <g transform="translate(380, 80)">
                    {/* Outer glow ring */}
                    <polygon
                      points="220,10 395,110 395,310 220,410 45,310 45,110"
                      fill="none"
                      stroke="#66BD29"
                      strokeWidth="6"
                      opacity="0.3"
                      strokeDasharray="14 10"
                    />
                    {/* Solid Base Hexagon */}
                    <polygon
                      points="220,30 375,120 375,290 220,380 65,290 65,120"
                      fill="#003624"
                      stroke="#66BD29"
                      strokeWidth="22"
                      strokeLinejoin="round"
                    />
                    {/* Inner Accent Hexagon */}
                    <polygon
                      points="220,55 350,130 350,280 220,355 90,280 90,130"
                      fill="#004831"
                      stroke="#776F67"
                      strokeWidth="5"
                    />
                    {/* Bold Monogram */}
                    <text
                      x="220"
                      y="235"
                      fill="#FFFFFF"
                      fontSize="110"
                      fontWeight="900"
                      fontFamily="monospace, system-ui"
                      textAnchor="middle"
                      letterSpacing="3"
                    >
                      HEX
                    </text>
                    <text
                      x="220"
                      y="285"
                      fill="#66BD29"
                      fontSize="24"
                      fontWeight="900"
                      fontFamily="monospace, system-ui"
                      textAnchor="middle"
                      letterSpacing="6"
                    >
                      EXPERIENCE
                    </text>
                  </g>
                )}

                {/* 3. VARIANT: Sprint Tolls Game Logo */}
                {selectedVariant === 'sprint-tolls' && (
                  <g transform="translate(200, 140)">
                    {/* Safety Yellow Badge Backing */}
                    <rect
                      x="0"
                      y="0"
                      width="800"
                      height="310"
                      rx="44"
                      fill="#FFD200"
                      stroke="#1E222A"
                      strokeWidth="18"
                    />

                    {/* Ferry Icon Badge */}
                    <g transform="translate(50, 45)">
                      <rect x="0" y="0" width="130" height="130" rx="28" fill="#1E222A" />
                      {/* Ship Graphic */}
                      <path
                        d="M 25 80 L 105 80 L 95 105 L 35 105 Z"
                        fill="#FFD200"
                        stroke="#FFD200"
                        strokeWidth="3"
                      />
                      <rect x="45" y="45" width="40" height="30" rx="6" fill="#48A2D8" />
                      <circle cx="65" cy="60" r="7" fill="#1E222A" />
                      <rect x="58" y="30" width="14" height="15" fill="#EF4444" rx="2" />
                    </g>

                    {/* Sprint Tolls Typography */}
                    <g transform="translate(210, 60)">
                      <text
                        x="0"
                        y="75"
                        fontSize="78"
                        fontWeight="900"
                        fontFamily="system-ui, sans-serif"
                        fill="#1E222A"
                        letterSpacing="1"
                      >
                        SPRINT TOLLS
                      </text>
                      <text
                        x="0"
                        y="120"
                        fontSize="26"
                        fontWeight="900"
                        fontFamily="monospace, system-ui"
                        fill="#1E222A"
                        opacity="0.85"
                        letterSpacing="4"
                      >
                        PORT &bull; HARBOR &bull; QUEUING SIMULATOR
                      </text>

                      {/* Agile Tags */}
                      <g transform="translate(0, 145)">
                        <rect x="0" y="0" width="135" height="30" rx="6" fill="#1E222A" />
                        <text x="67" y="20" fill="#FFD200" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          LITTLE&apos;S LAW
                        </text>

                        <rect x="145" y="0" width="130" height="30" rx="6" fill="#1E222A" />
                        <text x="210" y="20" fill="#48A2D8" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          LEAN FLOW
                        </text>

                        <rect x="285" y="0" width="140" height="30" rx="6" fill="#004831" />
                        <text x="355" y="20" fill="#66BD29" fontSize="13" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                          BY HEXPERIENCE
                        </text>
                      </g>
                    </g>
                  </g>
                )}

                {/* 4. VARIANT: Master Co-Brand Lockup */}
                {selectedVariant === 'master-lockup' && (
                  <g transform="translate(120, 130)">
                    {/* Sprint Tolls Section */}
                    <g transform="translate(0, 50)">
                      <rect x="0" y="0" width="460" height="190" rx="28" fill="#FFD200" stroke="#1E222A" strokeWidth="12" />
                      <text x="30" y="90" fontSize="56" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#1E222A">
                        SPRINT TOLLS
                      </text>
                      <text x="30" y="130" fontSize="20" fontWeight="900" fontFamily="monospace" fill="#1E222A" opacity="0.85" letterSpacing="3">
                        PORT SIMULATOR
                      </text>
                    </g>

                    {/* Divider Symbol */}
                    <g transform="translate(485, 120)">
                      <circle cx="25" cy="25" r="22" fill="#1E222A" />
                      <text x="25" y="32" fill="#66BD29" fontSize="24" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                        &times;
                      </text>
                    </g>

                    {/* HEXperience Section */}
                    <g transform="translate(560, 30)">
                      <polygon
                        points="90,10 160,50 160,130 90,170 20,130 20,50"
                        fill="#003624"
                        stroke="#66BD29"
                        strokeWidth="10"
                        strokeLinejoin="round"
                      />
                      <text x="90" y="105" fill="#FFFFFF" fontSize="42" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                        HEX
                      </text>

                      <g transform="translate(180, 55)">
                        <text x="0" y="55" fontSize="52" fontWeight="900" fontFamily="monospace" fill={backgroundStyle === 'white' ? '#004831' : '#FFFFFF'}>
                          HEX<tspan fill="#66BD29">perience</tspan>
                        </text>
                        <text x="0" y="90" fontSize="16" fontWeight="800" fontFamily="system-ui" fill={backgroundStyle === 'white' ? '#776F67' : '#bae6fd'}>
                          Precision Workflow Engineering
                        </text>
                        <text x="0" y="115" fontSize="13" fontWeight="bold" fontFamily="monospace" fill="#66BD29">
                          Huntington Bank Color Palette (#66BD29)
                        </text>
                      </g>
                    </g>
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Download & Export Action Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#1E222A] border-2 border-[#384050] space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-mono font-black text-sm text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#66BD29]" />
                  Download Available Formats
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  High-fidelity vector SVG (infinite zoom) and high-resolution 2400&times;1200 PNG
                </p>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#004831] text-[#66BD29] border border-[#66BD29]/40 font-bold">
                Commercial &bull; Free to Export
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Button 1: Download SVG */}
              <button
                onClick={downloadSvg}
                className="px-4 py-3 rounded-xl bg-[#66BD29] hover:bg-[#58a623] text-[#003624] font-black font-mono text-xs sm:text-sm border-2 border-[#1E222A] shadow-[0_4px_0_#003624] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Download scalable vector SVG for print, websites, and design tools"
              >
                <FileCode2 className="w-4 h-4" />
                <span>Download SVG (Vector)</span>
              </button>

              {/* Button 2: Download High-Res PNG */}
              <button
                onClick={() => downloadPng(false)}
                className="px-4 py-3 rounded-xl bg-[#48A2D8] hover:bg-[#3b8ebd] text-[#1E222A] font-black font-mono text-xs sm:text-sm border-2 border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Download 2400x1200 High Resolution PNG image with current background"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Download PNG (High-Res)</span>
              </button>

              {/* Button 3: Download Transparent PNG */}
              <button
                onClick={() => downloadPng(true)}
                className="px-4 py-3 rounded-xl bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black font-mono text-xs sm:text-sm border-2 border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                title="Download PNG with transparent alpha background for slides and overlays"
              >
                <Sparkles className="w-4 h-4" />
                <span>Download Transparent PNG</span>
              </button>
            </div>

            {/* Copy SVG Code directly to clipboard */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-3 text-xs font-mono">
              <span className="text-slate-400">Want to embed directly in HTML/React code?</span>
              <button
                onClick={() => copyToClipboard(getSvgString(), 'svg')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copiedSvg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">SVG Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SVG Markup</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Official Huntington Bank Color Palette Swatches */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#004831] border-2 border-[#66BD29]/60 text-white space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-black text-xs text-[#66BD29] uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                <span>Huntington Bank Official Brand Colors</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#66BD29] text-[#003624] font-black">
                Click color to copy HEX
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Huntington Lime Green', hex: '#66BD29', desc: 'Primary Accent & Monogram' },
                { name: 'Huntington Deep Forest', hex: '#004831', desc: 'Primary Corporate Field' },
                { name: 'Huntington Sandstone', hex: '#776F67', desc: 'Neutral Tertiary Stone' },
                { name: 'Safety Industrial Yellow', hex: '#FFD200', desc: 'Sprint Tolls Emblem' }
              ].map((color) => (
                <button
                  key={color.hex}
                  onClick={() => copyToClipboard(color.hex, 'hex')}
                  className="p-3 rounded-xl bg-[#003624] border border-[#66BD29]/40 hover:border-[#66BD29] text-left transition-all cursor-pointer group relative"
                  title={`Click to copy ${color.hex}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-4 h-4 rounded-md border border-white/30 inline-block shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-mono font-black text-xs text-white group-hover:text-[#66BD29] transition-colors">
                      {color.hex}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] text-emerald-100">{color.name}</div>
                  <div className="text-[10px] text-emerald-200/70 font-mono mt-0.5">{color.desc}</div>

                  {copiedColor === color.hex && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#66BD29] text-[#003624] text-[9px] font-black font-mono animate-bounce">
                      COPIED!
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#1E222A] border-t-2 border-[#1E222A] flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            &copy; {new Date().getFullYear()} HEXperience. Official brand design system.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

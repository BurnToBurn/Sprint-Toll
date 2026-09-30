import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SprintSummary, RetrospectiveLesson } from '../types/game';
import {
  Ship,
  Award,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ArrowRight,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Split,
  Layers,
  BarChart3,
  CheckSquare,
  ShieldCheck,
  Flag,
  Receipt,
  Pause,
  Target,
  X,
  Share2,
  Download,
  Copy,
  Check,
  Camera,
  Image,
  ExternalLink
} from 'lucide-react';
import { generateSprintReportImage } from '../utils/generateSprintReportImage';

interface SprintRetrospectiveModalProps {
  summary: SprintSummary | null;
  onClose: () => void;
  onAcceptAndStartNextDay?: () => void;
}

export const SprintRetrospectiveModal: React.FC<SprintRetrospectiveModalProps> = ({ summary, onClose, onAcceptAndStartNextDay }) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'lessons' | 'kaizen'>('highlights');
  const [committedActions, setCommittedActions] = useState<Record<string, boolean>>({
    sliceLargeStories: true,
    enforceWip: true,
    upgradeBottleneck: false
  });
  const [shareData, setShareData] = useState<{ dataUrl: string; blob: Blob } | null>(null);
  const [isGeneratingShare, setIsGeneratingShare] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Auto-populate the report picture as soon as the report opens
  useEffect(() => {
    if (summary) {
      generateSprintReportImage(summary)
        .then((res) => setShareData(res))
        .catch((err) => console.error('Failed to pre-generate report image', err));
    }
  }, [summary]);

  const shareText = summary
    ? `🚀 Shipped ${summary.deliveredPoints} story points on Day #${summary.dayNumber} with a Flow Grade of ${summary.grade} and ${summary.flowEfficiency}% flow efficiency in the Toll Plaza Agile Flow Simulator! 🚗💨 #HuntingtonBankHackathon2026`
    : '#HuntingtonBankHackathon2026';

  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    if (!shareData && summary) {
      setIsGeneratingShare(true);
      try {
        const res = await generateSprintReportImage(summary);
        setShareData(res);
      } catch (err) {
        console.error('Failed to generate sprint report image', err);
      } finally {
        setIsGeneratingShare(false);
      }
    }
  };

  const handleShareTwitter = () => {
    if (!summary) return;
    const url = window.location.href;
    const intentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(intentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    if (!summary) return;
    const url = window.location.href;
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async () => {
    if (!summary) return;
    try {
      let currentData = shareData;
      if (!currentData) {
        setIsGeneratingShare(true);
        currentData = await generateSprintReportImage(summary);
        setShareData(currentData);
        setIsGeneratingShare(false);
      }
      const link = document.createElement('a');
      link.download = `HuntingtonBankHackathon2026-Sprint-${summary.sprintNumber}-Day-${summary.dayNumber}-Report.png`;
      link.href = currentData.dataUrl;
      link.click();
      setCopiedStatus('Picture downloaded!');
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyImage = async () => {
    if (!summary) return;
    try {
      let currentData = shareData;
      if (!currentData) {
        setIsGeneratingShare(true);
        currentData = await generateSprintReportImage(summary);
        setShareData(currentData);
        setIsGeneratingShare(false);
      }
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': currentData.blob })
      ]);
      setCopiedStatus('Picture copied to clipboard!');
      setTimeout(() => setCopiedStatus(null), 2500);
    } catch (err) {
      await navigator.clipboard.writeText(shareText);
      setCopiedStatus('Post text & hashtag copied!');
      setTimeout(() => setCopiedStatus(null), 2500);
    }
  };

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopiedStatus('Post text & hashtag copied!');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (summary) {
      // Fire celebration confetti if exceptional or great
      if (summary.rating === 'exceptional' || summary.rating === 'great') {
        try {
          confetti({
            particleCount: 85,
            spread: 80,
            origin: { y: 0.55 }
          });
        } catch {
          // ignore
        }
      }
    }
  }, [summary]);

  if (!summary) return null;

  const gradeColors = {
    'A+': 'bg-emerald-100 text-[#10b981] border-[#10b981]',
    'A': 'bg-sky-100 text-[#48A2D8] border-[#48A2D8]',
    'B': 'bg-indigo-100 text-indigo-600 border-indigo-400',
    'C': 'bg-amber-100 text-[#E85D04] border-[#E85D04]',
    'D': 'bg-rose-100 text-[#D92525] border-[#D92525]'
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    littles_law: <TrendingUp className="w-4 h-4 text-[#48A2D8]" />,
    batch_size: <Split className="w-4 h-4 text-[#E85D04]" />,
    bottlenecks: <AlertTriangle className="w-4 h-4 text-[#D92525]" />,
    flow_efficiency: <Zap className="w-4 h-4 text-[#10b981]" />,
    continuous_flow: <Layers className="w-4 h-4 text-purple-600" />
  };

  const totalStories = summary.deliveredVehiclesCount + summary.leftBehindCount;
  const deliveryRatio = totalStories > 0 ? Math.round((summary.deliveredVehiclesCount / totalStories) * 100) : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1E222A]/70 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl my-auto bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl shadow-[0_12px_0_#1E222A] text-[#1E222A] overflow-hidden flex flex-col max-h-[92vh]">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b-2 border-[#1E222A] bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#48A2D8] border-2 border-[#1E222A] flex items-center justify-center text-white shadow-[0_3px_0_#1E222A] shrink-0">
                <Ship className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black text-[#E85D04] uppercase tracking-wider">
                    Sprint #{summary.sprintNumber} Retrospective
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#FFD200] text-[#1E222A] font-mono font-black border border-[#1E222A]">
                    Day #{summary.dayNumber}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-[#D92525] text-white font-mono font-black border border-[#1E222A] flex items-center gap-1 shadow-sm animate-pulse">
                    <Pause className="w-3 h-3 fill-current" />
                    SIMULATION &amp; ACTIONS PAUSED
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight mt-0.5"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Daily Sprint Performance Report
                </h2>
              </div>
            </div>

            {/* Sprint Grade Badge & Close 'X' Button */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] ${
                  gradeColors[summary.grade] || gradeColors['B']
                }`}
              >
                <div className="text-[10px] font-mono font-black tracking-widest uppercase opacity-75">
                  Flow Grade
                </div>
                <div className="text-3xl font-black tracking-tight font-mono leading-none mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  {summary.grade}
                </div>
              </div>

              {/* Close Button 'X' */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="w-11 h-11 rounded-2xl bg-white hover:bg-slate-100 text-[#1E222A] border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-[0_1px_0_#1E222A] transition-all cursor-pointer group flex items-center justify-center shrink-0"
                title="Close Report (Esc)"
                aria-label="Close Retrospective Report"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Departure Reason Status Bar */}
          <div className="mt-4 px-4 py-2 rounded-xl bg-[#F4F6F9] border-2 border-[#1E222A] flex items-center justify-between text-xs shadow-[0_1px_0_#1E222A]">
            <div className="flex items-center gap-2 font-semibold">
              {summary.departureReason === 'full' ? (
                <>
                  <Zap className="w-4 h-4 text-[#10b981] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>Full Ferry Capacity</strong> &bull; 100% load achieved before countdown!
                  </span>
                </>
              ) : summary.departureReason === 'timer' ? (
                <>
                  <Clock className="w-4 h-4 text-[#E85D04] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>Daily 05:00 PM Release Deadline</strong> &bull; Departure schedule honored!
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#48A2D8] shrink-0" />
                  <span className="text-[#1E222A]">
                    Triggered by <strong>On-Demand Manual Release</strong> &bull; Shipped batch on command!
                  </span>
                </>
              )}
            </div>
            <div className="font-mono text-[#10b981] font-black shrink-0 ml-2">
              +${summary.totalBonus.toLocaleString()} Payout
            </div>
          </div>

          {/* Huntington Bank Hackathon 2026 Social Share Ribbon */}
          <div className="mt-3.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#005A36]/15 via-[#10B981]/10 to-[#FFD200]/15 border-2 border-[#10B981]/40 flex flex-wrap items-center justify-between gap-2.5 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-black font-mono text-[#005A36] uppercase tracking-wider">
                #HuntingtonBankHackathon2026
              </span>
              <span className="hidden sm:inline text-[11px] text-slate-500 font-semibold">
                &bull; Auto-populate report picture to share
              </span>
              {copiedStatus && (
                <span className="px-2 py-0.5 rounded-md bg-[#10B981] text-white font-mono text-[10px] font-bold animate-fadeIn">
                  ✓ {copiedStatus}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* X / Twitter */}
              <button
                onClick={handleShareTwitter}
                className="px-2.5 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 border border-black shadow-sm cursor-pointer active:scale-95"
                title="Share on X / Twitter with #HuntingtonBankHackathon2026"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Post</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={handleShareLinkedIn}
                className="px-2.5 py-1 rounded-lg bg-[#0A66C2] hover:bg-[#084e96] text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 border border-[#0A66C2] shadow-sm cursor-pointer active:scale-95"
                title="Share on LinkedIn with #HuntingtonBankHackathon2026"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Share</span>
              </button>

              {/* Auto-Populate Picture Button */}
              <button
                onClick={handleOpenShare}
                className="px-3 py-1 rounded-lg bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-mono text-xs font-black transition-all flex items-center gap-1.5 border border-[#1E222A] shadow-sm cursor-pointer active:scale-95"
                title="Auto-populate picture of the report with #HuntingtonBankHackathon2026"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Auto-Picture</span>
              </button>

              {/* Download Image Button */}
              <button
                onClick={handleDownloadImage}
                className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold transition-all border border-slate-300 shadow-sm cursor-pointer active:scale-95"
                title="Download PNG picture of this report"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Copy Picture Button */}
              <button
                onClick={handleCopyImage}
                className="p-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold transition-all border border-slate-300 shadow-sm cursor-pointer active:scale-95"
                title="Copy picture to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t-2 border-[#1E222A]/10 font-bold text-xs">
            <button
              onClick={() => setActiveTab('highlights')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'highlights'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <BarChart3 className="w-4 h-4 text-[#48A2D8]" />
              <span>Performance Highlights</span>
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <BookOpen className="w-4 h-4 text-[#E85D04]" />
              <span>Agile Lessons Learned ({summary.lessonsLearned?.length || 4})</span>
            </button>
            <button
              onClick={() => setActiveTab('kaizen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'kaizen'
                  ? 'bg-[#FFD200] text-[#1E222A] border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A]'
                  : 'text-slate-600 hover:text-[#1E222A] hover:bg-slate-100 border-2 border-transparent'
              }`}
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <CheckSquare className="w-4 h-4 text-[#10b981]" />
              <span>Kaizen Next Steps</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: PERFORMANCE HIGHLIGHTS */}
          {activeTab === 'highlights' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Top Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Shipped Velocity</span>
                    <Award className="w-3.5 h-3.5 text-[#10b981]" />
                  </div>
                  <div className="text-2xl font-black text-[#10b981] mt-1.5">
                    {summary.deliveredPoints} <span className="text-xs font-normal text-slate-500">pts</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    {summary.deliveredVehiclesCount} stories loaded ({deliveryRatio}%)
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Avg Lead Time</span>
                    <Clock className="w-3.5 h-3.5 text-[#48A2D8]" />
                  </div>
                  <div className="text-2xl font-black text-[#48A2D8] mt-1.5">
                    {summary.averageCycleTime}s
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    Queue-to-exit latency
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Flow Efficiency</span>
                    <Zap className="w-3.5 h-3.5 text-[#E85D04]" />
                  </div>
                  <div className="text-2xl font-black text-[#E85D04] mt-1.5">
                    {summary.flowEfficiency}%
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    Active vs queue idle
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                    <span>Stranded Cargo</span>
                    <Layers className="w-3.5 h-3.5 text-[#D92525]" />
                  </div>
                  <div className={`text-2xl font-black mt-1.5 ${summary.leftBehindCount > 0 ? 'text-[#D92525]' : 'text-[#10b981]'}`}>
                    {summary.leftBehindCount} <span className="text-xs font-normal text-slate-500">items</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold mt-0.5">
                    {summary.leftBehindPoints} pts missed boat
                  </div>
                </div>
              </div>

              {/* Huntington Bank Hackathon 2026 Auto-Populated Picture Share Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#181D26] to-[#11141B] border-2 border-[#10B981]/50 text-white shadow-[0_4px_0_#1E222A] space-y-3.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-[#005A36] text-[#A7F3D0] border border-[#10B981]/40 font-mono text-xs font-black flex items-center gap-1.5">
                      🏛️ Huntington Bank Hackathon 2026
                    </span>
                    <span className="font-mono text-xs font-bold text-[#FFD200]">
                      #HuntingtonBankHackathon2026
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
                    {/* Share on X */}
                    <button
                      onClick={handleShareTwitter}
                      className="px-2.5 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white border border-neutral-700 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      title="Share on X / Twitter with #HuntingtonBankHackathon2026"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>Post</span>
                    </button>

                    {/* Share on LinkedIn */}
                    <button
                      onClick={handleShareLinkedIn}
                      className="px-2.5 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white border border-[#0A66C2] font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      title="Share on LinkedIn with #HuntingtonBankHackathon2026"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                      <span>LinkedIn</span>
                    </button>

                    {/* Copy Picture */}
                    <button
                      onClick={handleCopyImage}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      title="Copy picture to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Copy</span>
                    </button>

                    {/* Download PNG */}
                    <button
                      onClick={handleDownloadImage}
                      className="px-3 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white border border-[#10B981] font-mono text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      title="Download high-resolution report picture"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                  </div>
                </div>

                {/* Auto-populated live picture preview */}
                <div
                  className="relative rounded-xl overflow-hidden border-2 border-[#2E3848] bg-black/70 group cursor-pointer"
                  onClick={handleOpenShare}
                >
                  {shareData ? (
                    <img
                      src={shareData.dataUrl}
                      alt="Huntington Bank Hackathon 2026 Sprint Performance Report"
                      className="w-full h-auto object-cover max-h-[280px] rounded-lg transition-transform group-hover:scale-[1.01]"
                    />
                  ) : (
                    <div className="w-full h-44 flex flex-col items-center justify-center gap-2.5 text-slate-400 font-mono text-xs">
                      <Sparkles className="w-6 h-6 text-[#FFD200] animate-spin" />
                      <span>Auto-populating high-resolution report picture with #HuntingtonBankHackathon2026...</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-xl bg-white text-[#1E222A] font-black text-xs font-mono flex items-center gap-1.5 shadow-lg">
                      <Camera className="w-4 h-4 text-[#10B981]" />
                      <span>Click to Enlarge &amp; Share</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                  <span>Auto-populated 1200&times;675 social picture card with hashtag</span>
                  <button
                    onClick={handleOpenShare}
                    className="text-[#FFD200] hover:text-[#FFE043] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Fullscreen Picture &amp; Share Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Parking Lot Commitment vs Delivery Evaluation Card */}
              {summary.commitmentEvaluation && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#1E222A] space-y-4 shadow-[0_3px_0_#1E222A]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E222A]/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#1E222A] text-[#FFD200] flex items-center justify-center font-black shadow-sm text-sm">
                        🅿️
                      </div>
                      <div>
                        <div className="text-xs font-mono font-black uppercase text-slate-500 tracking-wider">
                          Sprint Planning Telemetry
                        </div>
                        <h3 className="text-sm sm:text-base font-black text-[#1E222A] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                          Parking Lot Commitment vs. Shipped Delivery
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {summary.commitmentEvaluation.evaluationStatus === 'over_delivered' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border-2 border-emerald-400 font-mono font-black text-xs flex items-center gap-1.5 shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 text-[#FFD200] fill-current" />
                          <span>Over-Delivered (+{summary.commitmentEvaluation.overDeliveredPoints} pts)</span>
                        </span>
                      ) : summary.commitmentEvaluation.evaluationStatus === 'exact_match' ? (
                        <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-800 border-2 border-sky-400 font-mono font-black text-xs flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>100% Commitment Match</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 border-2 border-amber-400 font-mono font-black text-xs flex items-center gap-1.5 shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Commitment Shortfall (-{summary.commitmentEvaluation.underDeliveredPoints} pts)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 3 Metric Badges: Committed vs Delivered vs Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Committed */}
                    <div className="p-3 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Committed in Staging
                        </div>
                        <div className="text-xl font-black font-mono text-[#1E222A]">
                          {summary.commitmentEvaluation.committedPoints} <span className="text-xs font-bold text-slate-500">pts</span>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-slate-200 border border-slate-400 text-slate-700 text-[10px] font-mono font-bold">
                        {summary.commitmentEvaluation.committedStoriesCount} Stories
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="p-3 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Delivered to Ferry Dock
                        </div>
                        <div className="text-xl font-black font-mono text-[#10b981]">
                          {summary.commitmentEvaluation.deliveredPoints} <span className="text-xs font-bold text-slate-500">pts</span>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-bold">
                        {summary.commitmentEvaluation.deliveredStoriesCount} Stories
                      </div>
                    </div>

                    {/* Execution Ratio */}
                    <div className="p-3 bg-[#F4F6F9] border-2 border-[#1E222A] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Commitment Execution
                        </div>
                        <div className={`text-xl font-black font-mono ${
                          summary.commitmentEvaluation.completionRate >= 100
                            ? 'text-[#10b981]'
                            : summary.commitmentEvaluation.completionRate >= 80
                            ? 'text-amber-600'
                            : 'text-[#D92525]'
                        }`}>
                          {summary.commitmentEvaluation.completionRate}%
                        </div>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-slate-500">
                        {summary.commitmentEvaluation.deliveredPoints >= summary.commitmentEvaluation.committedPoints
                          ? `+${summary.commitmentEvaluation.overDeliveredPoints} pts surge`
                          : `-${summary.commitmentEvaluation.underDeliveredPoints} pts roll`}
                      </div>
                    </div>
                  </div>

                  {/* Over-Delivery Rewards Banner: Cash Bonus & Next Sprint Capacity Adjustment */}
                  {summary.commitmentEvaluation.overDeliveredPoints > 0 ? (
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#004831] border-2 border-[#66BD29] text-[#FFD200] flex items-center justify-center font-black shrink-0 shadow-sm text-lg">
                          💰
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-emerald-950 uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                              Over-Delivery Velocity Bonus Awarded
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-black">
                              +$35/pt
                            </span>
                          </div>
                          <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                            Delivered <strong className="text-emerald-950">+{summary.commitmentEvaluation.overDeliveredPoints} extra story points</strong> beyond parking lot commitment!
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200">
                        {/* Cash Bonus */}
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-slate-500">Treasury Bonus</div>
                          <div className="text-xl font-black font-mono text-emerald-700">
                            +${summary.commitmentEvaluation.bonusAwarded.toLocaleString()}
                          </div>
                        </div>

                        {/* Next Sprint Capacity Adjustment */}
                        <div className="text-right pl-3 border-l-2 border-emerald-300">
                          <div className="text-[10px] uppercase font-bold text-slate-500">Next Sprint Capacity</div>
                          <div className="text-xl font-black font-mono text-sky-700 flex items-center justify-end gap-1">
                            <span>+{summary.commitmentEvaluation.capacityAdjustment} pts</span>
                            <span className="text-xs text-slate-500 font-normal">({summary.commitmentEvaluation.nextSprintCapacity} total)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : summary.commitmentEvaluation.underDeliveredPoints > 0 ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Under-delivery carried over {summary.commitmentEvaluation.underDeliveredPoints} points. Next sprint capacity is maintained at <strong>{summary.commitmentEvaluation.nextSprintCapacity} pts</strong> to protect pipeline balance.
                      </span>
                    </div>
                  ) : null}

                  {/* Evaluation Commentary */}
                  <div className="p-3 rounded-xl bg-[#F4F6F9] border border-slate-300 text-xs text-slate-700 font-medium leading-relaxed">
                    <strong className="text-[#1E222A] font-bold">Agile Commitment Assessment: </strong>
                    {summary.commitmentEvaluation.evaluationNotes}
                  </div>
                </div>
              )}

              {/* Little's Law In-Depth Simulation Equation Card */}
              <div className="p-4 rounded-2xl bg-[#FFD200]/20 border-2 border-[#FFD200] space-y-3 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black text-[#E85D04] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                    <TrendingUp className="w-4 h-4 text-[#48A2D8]" />
                    Little's Law Validation (WIP = Throughput &times; Cycle Time)
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-white border border-[#1E222A] text-[#1E222A]">
                    Lean Flow Mechanics
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  During this daily cycle, total active stories in the pipeline equaled{' '}
                  <strong className="text-[#1E222A]">{totalStories} tickets</strong>. With{' '}
                  <strong className="text-[#1E222A]">{summary.deliveredVehiclesCount} stories</strong> delivered across the
                  daily cycle, the measured lead time averaged{' '}
                  <strong className="text-[#48A2D8]">{summary.averageCycleTime} seconds</strong> per user story.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-white rounded-xl border-2 border-[#1E222A] font-mono text-center text-xs shadow-[0_1px_0_#1E222A]">
                  <div>
                    <span className="text-slate-500 font-bold">Pipeline Load (WIP)</span>
                    <div className="text-base font-black text-[#1E222A] mt-0.5">{totalStories} Stories</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Shipped Output (&lambda;)</span>
                    <div className="text-base font-black text-[#10b981] mt-0.5">{summary.deliveredVehiclesCount} Stories</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold">Avg Lead Latency (W)</span>
                    <div className="text-base font-black text-[#48A2D8] mt-0.5">{summary.averageCycleTime}s per car</div>
                  </div>
                </div>
              </div>

              {/* Daily Fiscal Settlement Statement */}
              {summary.financialSettlement && (
                <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-3 shadow-[0_2px_0_#1E222A]">
                  <div className="flex items-center justify-between border-b border-[#1E222A]/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                      <Receipt className="w-4 h-4 text-[#48A2D8]" />
                      Daily Fiscal Settlement &amp; Dues Statement
                    </div>
                    <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Day #{summary.dayNumber} Disbursal
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        Gross Daily Revenue
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Highway Tolls Collected:</span>
                        <span className="font-bold text-emerald-700">+${summary.financialSettlement.grossTollRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Ferry Cargo Delivery Bonus:</span>
                        <span className="font-bold text-emerald-700">+${summary.financialSettlement.ferryDeliveryBonus.toLocaleString()}</span>
                      </div>
                      {summary.financialSettlement.overDeliveryBonus && summary.financialSettlement.overDeliveryBonus > 0 ? (
                        <div className="flex justify-between text-slate-700 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-300">
                          <span className="text-emerald-950 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#FFD200] fill-current" />
                            Over-Delivery Cash Bonus:
                          </span>
                          <span className="font-black text-emerald-800">
                            +${summary.financialSettlement.overDeliveryBonus.toLocaleString()}
                          </span>
                        </div>
                      ) : null}
                      <div className="flex justify-between border-t border-emerald-200 pt-1 font-black text-emerald-950 text-sm">
                        <span>Gross Revenue:</span>
                        <span>+${summary.financialSettlement.totalGrossRevenue.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-rose-800">
                        Daily Dues &amp; Operating Taxes
                      </div>
                      <div className="flex justify-between text-slate-700" title="Higher efficiency booths require high-speed municipal telematics & grid power">
                        <span>Efficiency Booth Taxes:</span>
                        <span className="font-bold text-rose-700">-${summary.financialSettlement.efficiencyTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700" title="E-ZPass telemetry & squad mentorship upgrades maintenance">
                        <span>Upgrades &amp; Training Dues:</span>
                        <span className="font-bold text-rose-700">
                          -${(summary.financialSettlement.automationDues + summary.financialSettlement.trainingDues).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700" title="Vessel maintenance & open toll lane municipal licensing">
                        <span>Vessel &amp; Lane Dues:</span>
                        <span className="font-bold text-rose-700">
                          -${(summary.financialSettlement.ferryUpgradesTax + summary.financialSettlement.baseFacilityDues).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-rose-200 pt-1 font-black text-rose-950 text-sm">
                        <span>Total Dues Paid:</span>
                        <span>-${summary.financialSettlement.totalDailyDues.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFD200]/25 border-2 border-[#1E222A] font-mono">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                        Net Funding Awarded to Bank
                      </span>
                      <span className="text-[10px] text-slate-600 font-semibold">
                        Gross Earnings minus Daily Dues &amp; Efficiency Taxes
                      </span>
                    </div>
                    <span className="text-lg font-black text-emerald-800 tabular-nums">
                      +${summary.financialSettlement.netFundingAwarded.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Key Highlights Bullet List */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-2.5 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Sparkles className="w-4 h-4 text-[#FFD200]" />
                  Key Sprint Highlights
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
                  {summary.keyHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F4F6F9] border-2 border-[#1E222A]">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Advisory Quote */}
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-1.5 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#E85D04]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <MessageSquare className="w-4 h-4" />
                  Agile Coach Observation
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-semibold">
                  "{summary.coachAdvice}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AGILE LESSONS LEARNED */}
          {activeTab === 'lessons' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-xs text-slate-600 font-bold flex items-center justify-between">
                <span>Data-driven lessons derived directly from this sprint's simulation telemetry:</span>
                <span className="font-mono text-[#48A2D8] font-black">4 Lean Principles</span>
              </div>

              <div className="space-y-3">
                {summary.lessonsLearned.map((lesson: RetrospectiveLesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] space-y-3 shadow-[0_2px_0_#1E222A]"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {categoryIcons[lesson.category] || <BookOpen className="w-4 h-4 text-[#48A2D8]" />}
                        <h4 className="text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                          {lesson.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 border border-[#1E222A] text-slate-600 font-bold">
                        {lesson.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Observation */}
                    <div className="text-xs text-slate-700 font-semibold">
                      <strong className="text-[#1E222A]">Observed in Simulation: </strong>
                      {lesson.observation}
                    </div>

                    {/* Metric Evidence Box */}
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-[#48A2D8] text-[11px] font-mono text-[#48A2D8] font-bold flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#48A2D8] shrink-0" />
                      <span>{lesson.metricEvidence}</span>
                    </div>

                    {/* Agile Concept & Action */}
                    <div className="pt-2 border-t-2 border-[#1E222A]/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[11px] font-black text-[#1E222A] mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                          Agile Principle:
                        </div>
                        <p className="text-slate-600 text-[11px] font-semibold leading-relaxed">{lesson.agileConcept}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-[#FFD200]">
                        <div className="text-[11px] font-black text-[#E85D04] mb-0.5 flex items-center gap-1" style={{ fontFamily: 'var(--font-heading)' }}>
                          <Zap className="w-3 h-3" />
                          Recommended Next Action:
                        </div>
                        <p className="text-slate-700 text-[11px] font-semibold leading-relaxed">{lesson.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: KAIZEN ACTION PLAN */}
          {activeTab === 'kaizen' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-[#10b981] space-y-2 shadow-[0_2px_0_#1E222A]">
                <div className="flex items-center gap-2 text-xs font-black text-[#10b981]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <ShieldCheck className="w-4 h-4" />
                  Continuous Improvement Commitments (Kaizen)
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Select policy changes and engineering experiments to adopt for Day #{summary.dayNumber + 1}. In
                  high-performing agile teams, small incremental adjustments compound into massive flow acceleration.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'sliceLargeStories',
                    title: 'Aggressive Story Slicing Protocol',
                    desc: 'Slice all incoming 8pt and 21pt epics into 2-3pt tickets before toll entry to eliminate queue blocking.',
                    badge: 'Batch Size Control',
                    impact: '+30% Faster Cycle Times'
                  },
                  {
                    key: 'enforceWip',
                    title: 'Enforce Strict WIP Limit (Max 3/Lane)',
                    desc: 'Prevent vehicle accumulation in toll queues to protect lead time and maintain smooth velocity.',
                    badge: "Little's Law Protection",
                    impact: 'Zero Stranded Carryover'
                  },
                  {
                    key: 'upgradeBottleneck',
                    title: `Elevate Bottleneck Station (${summary.bottleneckLaneName?.split('·')[0] || 'Lane #1'})`,
                    desc: 'Invest upgrade funds into automation and staff training for the lowest capacity station.',
                    badge: 'Theory of Constraints',
                    impact: '+25% Peak Throughput'
                  }
                ].map((item) => {
                  const isChecked = committedActions[item.key] ?? false;
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setCommittedActions((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key]
                        }))
                      }
                      className={`p-4 rounded-2xl border-2 border-[#1E222A] transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-[#FFD200]/25 shadow-[0_3px_0_#1E222A]'
                          : 'bg-white shadow-[0_2px_0_#1E222A] hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          setCommittedActions((prev) => ({
                            ...prev,
                            [item.key]: !prev[item.key]
                          }));
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-5 h-5 rounded-lg text-[#FFD200] border-2 border-[#1E222A] cursor-pointer accent-[#E85D04]"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono text-[#10b981] font-black bg-emerald-100 px-2 py-0.5 rounded-lg border border-[#10b981]">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="px-6 py-4 border-t-2 border-[#1E222A] bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-mono font-bold">
            <Flag className="w-3.5 h-3.5 text-[#48A2D8]" />
            <span>Next Cycle: Day #{summary.dayNumber + 1} Daily Sprint</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={handleOpenShare}
              className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-slate-100 text-[#1E222A] font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
              title="Auto-populate picture of the report with #HuntingtonBankHackathon2026"
            >
              <Camera className="w-4 h-4 text-[#10B981]" />
              <span>Share Report (#HuntingtonBankHackathon2026)</span>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAcceptAndStartNextDay) {
                  onAcceptAndStartNextDay();
                } else {
                  onClose();
                }
              }}
              className="w-full sm:w-auto py-2.5 px-6 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-[#1E222A] shadow-[0_4px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
              title={`Accept retrospective and begin Day #${summary.dayNumber + 1}`}
            >
              <span>Accept &amp; Start Day #{summary.dayNumber + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Picture Preview & Social Share Dialog Modal */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-[#1E222A] border-[3px] border-[#384050] rounded-3xl shadow-[0_12px_0_#0F1216] text-white overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b-2 border-[#384050] bg-[#242933] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#005A36] text-[#A7F3D0] border border-[#10B981]">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-[#FFD200] uppercase tracking-wider">
                      #HuntingtonBankHackathon2026
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    Share Performance Report Picture
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Picture of Report Preview */}
              <div className="rounded-2xl overflow-hidden border-2 border-[#384050] bg-black/70 shadow-lg">
                {shareData ? (
                  <img
                    src={shareData.dataUrl}
                    alt="Huntington Bank Hackathon 2026 Sprint Performance Report Card"
                    className="w-full h-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-56 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
                    <Sparkles className="w-6 h-6 text-[#FFD200] animate-spin" />
                    <span>Auto-populating high-resolution report picture...</span>
                  </div>
                )}
              </div>

              {/* Pre-populated post text with hashtag */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 font-bold">
                  <span>Pre-Populated Post Text</span>
                  <button
                    onClick={handleCopyText}
                    className="text-[#FFD200] hover:text-[#FFE043] flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-[#141820] border-2 border-[#384050] font-mono text-xs text-slate-200 select-all leading-relaxed">
                  {shareText}
                </div>
              </div>

              {/* Share Destination Buttons Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {/* X / Twitter */}
                <button
                  onClick={handleShareTwitter}
                  className="py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono text-xs font-bold border-2 border-[#384050] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Share on 𝕏</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={handleShareLinkedIn}
                  className="py-2.5 px-3 rounded-xl bg-[#0A66C2] hover:bg-[#084e96] text-white font-mono text-xs font-bold border-2 border-[#0A66C2] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <span>LinkedIn</span>
                </button>

                {/* Copy Picture */}
                <button
                  onClick={handleCopyImage}
                  className="py-2.5 px-3 rounded-xl bg-[#2B303C] hover:bg-[#343B4A] text-slate-200 font-mono text-xs font-bold border-2 border-[#384050] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Copy className="w-5 h-5 text-[#38BDF8]" />
                  <span>Copy Image</span>
                </button>

                {/* Download PNG */}
                <button
                  onClick={handleDownloadImage}
                  className="py-2.5 px-3 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs font-black border-2 border-[#10B981] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PNG</span>
                </button>
              </div>

              {/* Feedback toast banner */}
              {copiedStatus && (
                <div className="p-3 rounded-xl bg-[#10B981]/20 border border-[#10B981] text-[#10B981] font-mono text-xs font-bold text-center animate-fadeIn flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{copiedStatus}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t-2 border-[#384050] bg-[#242933] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Includes official hashtag #HuntingtonBankHackathon2026</span>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

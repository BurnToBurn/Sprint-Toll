import React from 'react';
import { VehicleStory } from '../types/game';
import { Scissors, X, Clock, DollarSign, Layers, AlertCircle } from 'lucide-react';

interface StoryInspectorModalProps {
  vehicle: VehicleStory | null;
  onClose: () => void;
  onSliceStory: (id: string) => void;
}

export const StoryInspectorModal: React.FC<StoryInspectorModalProps> = ({
  vehicle,
  onClose,
  onSliceStory
}) => {
  if (!vehicle) return null;

  const canSlice = vehicle.points >= 3 && vehicle.state !== 'on_ferry' && vehicle.state !== 'departed';

  const getSliceBreakdown = (points: number) => {
    if (points === 3) return '1 pt bug + 2 pt task';
    if (points === 5) return '2 pt task + 3 pt story';
    if (points === 8) return '3 pt story + 5 pt feature';
    if (points === 13) return '5 pt feature + 5 pt feature + 3 pt story';
    if (points === 21) return '8 pt epic + 8 pt epic + 5 pt feature';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E222A]/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 shadow-[0_10px_0_#1E222A] text-[#1E222A] space-y-5">
        <div className="rivet top-3 left-3" />
        <div className="rivet top-3 right-3" />
        <div className="rivet bottom-3 left-3" />
        <div className="rivet bottom-3 right-3" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-[#1E222A] rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white font-mono text-xl shrink-0 border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A]"
            style={{ backgroundColor: vehicle.color }}
          >
            {vehicle.points}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-wider">
              <span>{vehicle.type} Story</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{vehicle.points} Points</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#1E222A] mt-0.5 leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
              {vehicle.title}
            </h3>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 bg-white p-3.5 rounded-2xl border-2 border-[#1E222A] font-mono text-center shadow-[0_2px_0_#1E222A]">
          <div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#48A2D8]" />
              Duration
            </div>
            <div className="text-sm font-black text-[#1E222A] mt-1">
              {vehicle.baseProcessingTime}s
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#E85D04]" />
              Base Toll
            </div>
            <div className="text-sm font-black text-[#10b981] mt-1">
              ${vehicle.tollValue}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#FFD200]" />
              Batch Size
            </div>
            <div className="text-sm font-black text-[#E85D04] mt-1">
              {vehicle.length}px
            </div>
          </div>
        </div>

        {/* Educational Callout on Batch Size */}
        <div className="bg-[#FFD200]/20 border-2 border-[#FFD200] rounded-2xl p-4 space-y-1.5 text-xs text-[#1E222A]">
          <div className="flex items-center gap-1.5 font-black text-[#E85D04]" style={{ fontFamily: 'var(--font-heading)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            Agile Principle: Batch Size &amp; Little's Law
          </div>
          <p className="text-slate-700 font-semibold leading-relaxed">
            {vehicle.points >= 8
              ? 'This is an oversized batch! Large 8, 13, and 21 point stories block toll lanes, inflating queue wait times for all downstream vehicles. Slicing it into smaller vertical stories keeps flow velocity high.'
              : 'Compact user stories (1-3 pts) pass through toll booths with minimal cycle latency, keeping queues lean and continuous.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 pt-2">
          {canSlice ? (
            <button
              onClick={() => {
                onSliceStory(vehicle.id);
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-[#FFD200] hover:bg-[#FFE043] text-[#1E222A] font-black text-xs rounded-xl border-2 border-[#1E222A] transition-all flex items-center justify-center gap-2 shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none cursor-pointer"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <Scissors className="w-4 h-4 text-[#E85D04]" />
              Slice Story: {getSliceBreakdown(vehicle.points)}
            </button>
          ) : (
            <div className="flex-1 py-2.5 px-3 bg-white border-2 border-[#1E222A] text-slate-500 text-xs rounded-xl text-center font-bold">
              {vehicle.points <= 2 ? 'Small story already lean (cannot slice further)' : 'Vehicle already boarded'}
            </div>
          )}

          <button
            onClick={onClose}
            className="py-3 px-5 bg-white hover:bg-slate-100 text-[#1E222A] font-black text-xs rounded-xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

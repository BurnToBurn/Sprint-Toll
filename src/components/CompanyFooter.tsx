import React, { useState } from 'react';
import { Hexagon, Info, Award, X } from 'lucide-react';

export const CompanyFooter: React.FC = () => {
  const [showCompanyModal, setShowCompanyModal] = useState(false);

  return (
    <>
      <footer className="w-full mt-12 bg-[#004831] border-t-[3px] border-[#1E222A] text-white select-none relative shadow-[0_-4px_12px_rgba(0,0,0,0.25)]">
        {/* Decorative Industrial Rivets */}
        <div className="rivet top-3 left-4" />
        <div className="rivet top-3 right-4" />
        <div className="rivet bottom-3 left-4" />
        <div className="rivet bottom-3 right-4" />

        {/* Huntington Bank Brand Color Top Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#004831] via-[#66BD29] to-[#776F67]" />

        <div className="max-w-[1580px] mx-auto px-6 sm:px-10 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {/* Geometric Hexagon Logo Emblem in Huntington Green */}
            <button
              onClick={() => setShowCompanyModal(true)}
              className="relative group p-1 cursor-pointer focus:outline-none"
              title="Click to view HEXperience company profile"
              aria-label="HEXperience Company Profile"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#003624] border-2 border-[#66BD29] flex items-center justify-center text-[#66BD29] shadow-[0_4px_0_#1E222A] group-hover:scale-105 group-hover:bg-[#002b1c] transition-all">
                <div className="relative flex items-center justify-center">
                  <Hexagon className="w-9 h-9 fill-[#66BD29]/20 stroke-[#66BD29] stroke-[2.2]" />
                  <span className="absolute font-mono font-black text-sm text-white tracking-tighter">HEX</span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#66BD29] opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#66BD29] border border-[#1E222A]" />
              </span>
            </button>

            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight font-mono text-white">
                  HEX<span className="text-[#66BD29]">perience</span>
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 font-medium max-w-2xl">
                Engineered &amp; Developed by <strong className="text-white font-bold">HEXperience</strong>. Precision enterprise workflow simulations, queuing systems, and lean agile mechanics.
              </p>
            </div>
          </div>

          {/* Sub-footer bottom bar */}
          <div className="mt-6 pt-5 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-200/80 font-mono">
            <div>
              &copy; {new Date().getFullYear()} HEXperience. All rights reserved. &bull; Release v1.0.0
            </div>
            <div className="flex items-center gap-3">
              <span>Privacy &bull; Terms</span>
              <span>&bull;</span>
              <button
                onClick={() => setShowCompanyModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#003624] hover:bg-[#00271a] text-white hover:text-[#66BD29] border-2 border-[#66BD29] font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-[0_2px_0_#1E222A] active:translate-y-0.5 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-[#66BD29]" />
                <span>About HEXperience</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* About HEXperience Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E222A]/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 sm:p-7 shadow-[0_12px_0_#1E222A] text-[#1E222A] space-y-6">
            {/* Corner Rivets */}
            <div className="rivet top-3 left-3" />
            <div className="rivet top-3 right-3" />
            <div className="rivet bottom-3 left-3" />
            <div className="rivet bottom-3 right-3" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1E222A] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#004831] border-2 border-[#1E222A] flex items-center justify-center text-[#66BD29] shadow-[0_3px_0_#1E222A]">
                  <Hexagon className="w-7 h-7 fill-[#66BD29]/20 stroke-[#66BD29] stroke-2" />
                </div>
                <div>
                  <h3
                    className="text-xl font-black text-[#1E222A] tracking-tight leading-none"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    HEX<span className="text-[#66BD29]">perience</span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                    Development Company Profile
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCompanyModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
              <div className="p-4 rounded-2xl bg-white border-2 border-[#1E222A] shadow-[0_2px_0_#1E222A] space-y-2">
                <div className="flex items-center gap-2 font-black text-[#004831]" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Award className="w-4 h-4 text-[#66BD29]" />
                  <span>About The Development Company</span>
                </div>
                <p>
                  <strong>HEXperience</strong> designs and builds modern interactive simulations, agile learning sandboxes, and enterprise engineering tools. Specializing in Little's Law, queueing theory, Theory of Constraints, and flow optimization.
                </p>
              </div>

              {/* Copyright Statement */}
              <div className="p-3.5 rounded-xl bg-slate-100 border-2 border-[#1E222A] text-center font-mono text-xs text-slate-700 font-bold">
                &copy; {new Date().getFullYear()} HEXperience. All rights reserved.
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  Proprietary development by HEXperience.
                </div>
              </div>
            </div>

            {/* Modal Action */}
            <button
              onClick={() => setShowCompanyModal(false)}
              className="w-full py-3 bg-[#66BD29] hover:bg-[#58a623] text-[#003624] font-black rounded-xl border-2 border-[#1E222A] shadow-[0_3px_0_#1E222A] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Close Information
            </button>
          </div>
        </div>
      )}
    </>
  );
};

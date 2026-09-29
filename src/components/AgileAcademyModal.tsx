import React, { useState } from 'react';
import { AGILE_LESSONS } from '../utils/agileLessons';
import {
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Lightbulb,
  Zap,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AgileAcademyModalProps {
  onAwardBonus: (amount: number) => void;
}

export const AgileAcademyModal: React.FC<AgileAcademyModalProps> = ({ onAwardBonus }) => {
  const [selectedLessonId, setSelectedLessonId] = useState<string>(AGILE_LESSONS[0].id);

  // Little's Law Sandbox State
  const [simWip, setSimWip] = useState<number>(12);
  const [simThroughput, setSimThroughput] = useState<number>(3); // stories per min

  // Interactive Quiz State
  const [quizAnswered, setQuizAnswered] = useState<Record<number, boolean>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  const selectedLesson = AGILE_LESSONS.find((l) => l.id === selectedLessonId) || AGILE_LESSONS[0];

  // Little's Law Calculation: Lead Time (minutes) = WIP / Throughput
  const calculatedLeadTimeMin = Math.round((simWip / simThroughput) * 10) / 10;
  const calculatedLeadTimeDays = Math.round(calculatedLeadTimeMin * 2.5 * 10) / 10;

  // Quiz Questions
  const QUIZ_QUESTIONS = [
    {
      id: 1,
      question: 'According to Little’s Law, if your team is overwhelmed and lead times are too high, what is the fastest way to reduce queue delays?',
      options: [
        { text: 'Push more stories into the backlog simultaneously', isCorrect: false },
        { text: 'Lower WIP limits and slice stories into smaller batches', isCorrect: true },
        { text: 'Force developers to multitask across 5 projects', isCorrect: false }
      ],
      explanation: 'Lowering WIP reduces queue congestion immediately without needing to hire more people.'
    },
    {
      id: 2,
      question: 'Why does a 21-point monolithic vehicle cause severe traffic in toll lanes?',
      options: [
        { text: 'It blocks the booth for too long, delaying every smaller story queued behind it', isCorrect: true },
        { text: 'Toll booths refuse to accept large stories', isCorrect: false },
        { text: 'Larger stories have higher failure rates and cannot be driven', isCorrect: false }
      ],
      explanation: 'Large batch sizes monopolize work stations, causing downstream starvation and upstream gridlock.'
    },
    {
      id: 3,
      question: 'What is the purpose of setting up a dedicated "Expedite / Fast Lane"?',
      options: [
        { text: 'To charge triple fees for wealthy vehicles', isCorrect: false },
        { text: 'To allow critical 1-point hotfixes to bypass the standard queue without delay', isCorrect: true },
        { text: 'To eliminate the need for QA testing', isCorrect: false }
      ],
      explanation: 'Classes of service allow high-urgency production bugs to be addressed immediately without disrupting planned sprint flow.'
    }
  ];

  const handleAnswer = (qIndex: number, isCorrect: boolean) => {
    if (quizAnswered[qIndex] !== undefined) return;

    setQuizAnswered((prev) => ({ ...prev, [qIndex]: isCorrect }));

    if (isCorrect) {
      sound.playTollChime(1.5);
      setQuizScore((s) => s + 1);
      onAwardBonus(100);
    } else {
      sound.playClick();
    }
  };

  return (
    <div className="bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-3xl p-6 text-[#1E222A] space-y-8 shadow-[0_8px_0_#1E222A] relative">
      <div className="rivet top-3 left-3" />
      <div className="rivet top-3 right-3" />
      <div className="rivet bottom-3 left-3" />
      <div className="rivet bottom-3 right-3" />

      {/* Academy Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1E222A]/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#E85D04] uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
            <GraduationCap className="w-4 h-4" />
            Project Management Curriculum
          </div>
          <h2
            className="text-xl sm:text-2xl font-black text-[#1E222A] tracking-tight mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Agile Flow &amp; Queuing Theory Academy
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
            Learn the proven mathematical principles of Kanban, Little's Law, Batch Sizing, and Continuous Flow.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-4 py-2 rounded-xl border-2 border-[#1E222A] font-mono shadow-[0_2px_0_#1E222A]">
          <span className="text-slate-600 font-bold">Academy Bonus Earned:</span>
          <span className="text-[#10b981] font-black">+${quizScore * 100}</span>
        </div>
      </div>

      {/* INTERACTIVE LITTLE'S LAW LAB CALCULATOR */}
      <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-6 space-y-5 shadow-[0_4px_0_#1E222A]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
            <Sliders className="w-4 h-4 text-[#48A2D8]" />
            Interactive Little's Law Sandbox: Experiment with Flow Math
          </div>
          <span className="text-xs font-mono font-black text-[#1E222A] bg-[#FFD200] px-2.5 py-0.5 rounded-lg border-2 border-[#1E222A] shadow-[0_1px_0_#1E222A]">
            Formula: L = &lambda; &times; W
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slider 1: WIP */}
          <div className="space-y-2 bg-[#F4F6F9] p-4 rounded-xl border-2 border-[#1E222A]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1E222A] font-black" style={{ fontFamily: 'var(--font-heading)' }}>Work In Progress (WIP Queue)</span>
              <span className="font-mono font-black text-[#E85D04] text-sm">{simWip} stories</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={simWip}
              onChange={(e) => setSimWip(Number(e.target.value))}
              className="w-full accent-[#E85D04] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
              <span>1 (Single piece)</span>
              <span>15 (Heavy queue)</span>
              <span>30 (Overloaded)</span>
            </div>
          </div>

          {/* Slider 2: Throughput */}
          <div className="space-y-2 bg-[#F4F6F9] p-4 rounded-xl border-2 border-[#1E222A]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#1E222A] font-black" style={{ fontFamily: 'var(--font-heading)' }}>Delivery Throughput (&lambda;)</span>
              <span className="font-mono font-black text-[#48A2D8] text-sm">{simThroughput} stories/min</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={simThroughput}
              onChange={(e) => setSimThroughput(Number(e.target.value))}
              className="w-full accent-[#48A2D8] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
              <span>1 (1 squad)</span>
              <span>8 (Multi-lane)</span>
              <span>15 (High velocity)</span>
            </div>
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className="bg-[#FFD200] border-2 border-[#1E222A] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_3px_0_#1E222A] text-[#1E222A]">
          <div>
            <div className="text-xs font-black uppercase text-slate-700" style={{ fontFamily: 'var(--font-heading)' }}>Resulting Lead Time (Wait Duration)</div>
            <div className="text-2xl font-black font-mono text-[#1E222A] mt-0.5">
              {calculatedLeadTimeMin} minutes{' '}
              <span className="text-xs text-slate-700 font-bold">
                (~{calculatedLeadTimeDays} business days in software terms)
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-800 max-w-sm leading-relaxed">
            {simWip > 20 ? (
              <span className="text-[#D92525] flex items-center gap-1 font-black">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D92525]" />
                Queue is choked! Multi-tasking overhead sky-rockets. Lower WIP to recover!
              </span>
            ) : simWip <= 6 ? (
              <span className="text-[#10b981] flex items-center gap-1 font-black">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10b981]" />
                Lean flow achieved! Feedback loops are fast and stories release rapidly.
              </span>
            ) : (
              <span>Balanced flow. Notice how halving WIP cuts wait times directly in half!</span>
            )}
          </div>
        </div>
      </div>

      {/* CORE LESSONS EXPLORER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson List Sidebar */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-wider block mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Curriculum Modules
          </label>
          <div className="space-y-2">
            {AGILE_LESSONS.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border-2 border-[#1E222A] transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFD200] text-[#1E222A] shadow-[0_3px_0_#1E222A]'
                      : 'bg-white text-slate-700 hover:bg-slate-50 shadow-[0_2px_0_#1E222A]'
                  }`}
                >
                  <div className="text-xs font-black leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>{lesson.title}</div>
                  <div className="text-[11px] font-bold text-slate-600 mt-1 truncate">{lesson.concept}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Lesson Deep Dive */}
        <div className="lg:col-span-2 bg-white border-2 border-[#1E222A] p-6 rounded-2xl space-y-5 shadow-[0_3px_0_#1E222A]">
          <div>
            <div className="text-xs font-mono font-black text-[#E85D04] uppercase">
              {selectedLesson.concept}
            </div>
            <h3
              className="text-lg sm:text-xl font-black text-[#1E222A] mt-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {selectedLesson.title}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
            {selectedLesson.summary}
          </p>

          <div className="bg-emerald-50 border-2 border-[#10b981] p-4 rounded-xl space-y-1 text-[#1E222A]">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#10b981]" style={{ fontFamily: 'var(--font-heading)' }}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Key Project Management Takeaway
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-bold">
              {selectedLesson.keyTakeaway}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F4F6F9] border-2 border-[#1E222A] p-3.5 rounded-xl space-y-1">
              <div className="font-black text-[#1E222A] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                <Lightbulb className="w-3.5 h-3.5 text-[#E85D04]" />
                Real-World Tech Scenario
              </div>
              <p className="text-[11px] text-slate-600 font-semibold leading-snug">
                {selectedLesson.realWorldScenario}
              </p>
            </div>

            <div className="bg-[#F4F6F9] border-2 border-[#1E222A] p-3.5 rounded-xl space-y-1">
              <div className="font-black text-[#1E222A] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-heading)' }}>
                <Zap className="w-3.5 h-3.5 text-[#48A2D8]" />
                In-Game Actionable Tip
              </div>
              <p className="text-[11px] text-slate-600 font-semibold leading-snug">
                {selectedLesson.interactiveTip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AGILE FLOW KNOWLEDGE CHECK (QUIZ) */}
      <div className="bg-white border-2 border-[#1E222A] rounded-2xl p-6 space-y-5 shadow-[0_4px_0_#1E222A]">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm sm:text-base font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
            <HelpCircle className="w-4 h-4 text-[#E85D04]" />
            Knowledge Check: Earn In-Game Capital ($100 per correct answer)
          </div>
          <span className="text-xs font-black text-[#1E222A] bg-[#FFD200] px-2.5 py-0.5 rounded-lg border-2 border-[#1E222A] font-mono">
            Score: {quizScore} / {QUIZ_QUESTIONS.length}
          </span>
        </div>

        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const isAnswered = quizAnswered[qIdx] !== undefined;
            const wasCorrect = quizAnswered[qIdx] === true;

            return (
              <div
                key={q.id}
                className="bg-[#F4F6F9] border-2 border-[#1E222A] p-4 rounded-2xl space-y-3 shadow-[0_2px_0_#1E222A]"
              >
                <div className="text-xs sm:text-sm font-black text-[#1E222A]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {qIdx + 1}. {q.question}
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswer(qIdx, opt.isCorrect)}
                        disabled={isAnswered}
                        className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all border-2 border-[#1E222A] ${
                          isAnswered
                            ? opt.isCorrect
                              ? 'bg-[#10b981] text-white shadow-[0_2px_0_#1E222A]'
                              : 'bg-white text-slate-400 opacity-60'
                            : 'bg-white hover:bg-slate-50 text-[#1E222A] shadow-[0_2px_0_#1E222A] cursor-pointer active:translate-y-0.5 active:shadow-none'
                        }`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div
                    className={`text-xs font-bold p-3 rounded-xl border-2 border-[#1E222A] ${
                      wasCorrect
                        ? 'bg-emerald-100 text-[#1E222A]'
                        : 'bg-rose-100 text-[#D92525]'
                    }`}
                  >
                    {wasCorrect ? '✓ Correct! +$100 bonus awarded. ' : '✗ Not quite. '}
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

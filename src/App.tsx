import { useState } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { HeaderBar } from './components/HeaderBar';
import { TollSimulationCanvas } from './components/TollSimulationCanvas';
import { UpgradePanel } from './components/UpgradePanel';
import { FlowMetricsPanel } from './components/FlowMetricsPanel';
import { AgileAcademyModal } from './components/AgileAcademyModal';
import { StoryInspectorModal } from './components/StoryInspectorModal';
import { SprintRetrospectiveModal } from './components/SprintRetrospectiveModal';
import { DailyForecastModal } from './components/DailyForecastModal';
import { KanbanBoardTab } from './components/KanbanBoardTab';
import { CompanyFooter } from './components/CompanyFooter';
import { ScenarioSelectModal } from './components/ScenarioSelectModal';
import { ScenarioOutcomeModal } from './components/ScenarioOutcomeModal';
import { ScenarioObjectiveHUD } from './components/ScenarioObjectiveHUD';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'kanban' | 'academy' | 'metrics'>('simulation');
  const [isForecastOpen, setIsForecastOpen] = useState(false);

  const {
    funds,
    pendingDailyRevenue,
    dailyDues,
    totalDeliveredPoints,
    booths,
    ferry,
    vehicles,
    metrics,
    settings,
    sprintSummary,
    lastSprintSummary,
    dailyForecast,
    selectedVehicle,
    selectedBoothId,
    // Scenario engine
    activeScenario,
    activeScenarioDef,
    isScenarioSelectOpen,
    isScenarioOutcomeOpen,
    startScenario,
    restartScenario,
    resetToFreePlay,
    dismissScenarioNotification,
    openScenarioSelect,
    closeScenarioSelect,
    closeScenarioOutcome,
    // Actions
    addFunds,
    setDailyDuration,
    toggleContinuousFlowMode,
    spawnVehicle,
    sliceStory,
    launchFerry,
    unlockBooth,
    upgradeBoothEfficiency,
    upgradeBoothAutomation,
    upgradeBoothTraining,
    upgradeFerryCapacity,
    upgradeFerrySpeed,
    upgradeFerryAmenities,
    setLaneWipLimit,
    applyRecommendedWipLimit,
    setLaneSpecialization,
    toggleAutoDepart,
    toggleSound,
    setGameSpeed,
    setSelectedVehicle,
    setSelectedBoothId,
    setSprintSummary,
    openLastRetrospective
  } = useGameEngine();

  return (
    <div className="min-h-screen bg-[#2B2F38] text-[#F4F6F9] flex flex-col font-sans selection:bg-[#FFD200] selection:text-[#1E222A]">
      {/* Universal Top Bar with Daily Sprint Cadence & Countdown */}
      <HeaderBar
        funds={funds}
        pendingDailyRevenue={pendingDailyRevenue}
        dailyDuesAmount={dailyDues.totalDailyDues}
        totalPoints={totalDeliveredPoints}
        ferryPoints={ferry.currentPoints}
        ferryCapacity={ferry.capacity}
        dayNumber={ferry.dayNumber}
        dayTimeFormatted={ferry.dayTimeFormatted}
        sprintTimer={ferry.sprintTimer}
        ferryState={ferry.state}
        settings={settings}
        activeTab={activeTab}
        forecast={dailyForecast}
        onOpenForecast={() => setIsForecastOpen(true)}
        onOpenScenarios={openScenarioSelect}
        activeScenarioTitle={activeScenarioDef?.title}
        activeScenarioDay={activeScenario?.currentDay}
        activeScenarioTotalDays={activeScenarioDef?.durationDays}
        onTabChange={setActiveTab}
        onToggleSound={toggleSound}
        onSetSpeed={setGameSpeed}
        onQuickSpawn={() => spawnVehicle()}
        onLaunchFerry={launchFerry}
        onToggleContinuousFlow={toggleContinuousFlowMode}
        onOpenRetrospective={openLastRetrospective}
        hasLastRetrospective={!!lastSprintSummary}
        ferryReady={ferry.currentPoints > 0 && ferry.state === 'boarding'}
      />

      {/* Main Content Area with generous 24px-32px padding */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 sm:p-8 space-y-8">
        {activeTab === 'simulation' && (
          <div className="space-y-8">
            {/* Active Predetermined Scenario Objective HUD */}
            <ScenarioObjectiveHUD
              scenarioState={activeScenario}
              scenarioDef={activeScenarioDef}
              onOpenDetails={openScenarioSelect}
              onDismissNotification={dismissScenarioNotification}
              onAbandonScenario={resetToFreePlay}
              currentQueueLength={
                vehicles.filter(
                  (v) => v.state === 'approaching' || v.state === 'queued' || v.state === 'processing'
                ).length
              }
              currentFunds={funds}
              currentEfficiency={metrics.flowEfficiency}
              unlockedLanesCount={booths.filter((b) => b.unlocked).length}
              ezpassTier2Count={booths.filter((b) => b.unlocked && b.automationLevel >= 2).length}
            />

            {/* Visual Simulation Canvas */}
            <TollSimulationCanvas
              booths={booths}
              ferry={ferry}
              vehicles={vehicles}
              metrics={metrics}
              onSelectVehicle={setSelectedVehicle}
              onSelectBooth={(id) => {
                setSelectedBoothId(id);
              }}
              onSliceStory={sliceStory}
              onUnlockBooth={unlockBooth}
              onSpawnStory={spawnVehicle}
              onLaunchFerry={launchFerry}
              onUpgradeEfficiency={upgradeBoothEfficiency}
              onUpgradeAutomation={upgradeBoothAutomation}
              onSetLaneWipLimit={setLaneWipLimit}
              continuousFlowMode={settings.continuousFlowMode}
              onToggleContinuousFlow={toggleContinuousFlowMode}
              funds={funds}
            />

            {/* Quick Metrics Bar: 4 Tactile Toy Telemetry Cards with 3px borders, rounded-2xl, and 3D shadows */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="relative p-5 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-2xl shadow-[0_6px_0_#1E222A] text-[#1E222A] flex flex-col justify-between">
                <div className="rivet top-2 left-2" />
                <div className="rivet top-2 right-2" />
                <div className="rivet bottom-2 left-2" />
                <div className="rivet bottom-2 right-2" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
                  Port WIP Load
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#1E222A] font-mono tabular-nums">
                    {metrics.currentWIP}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#FFD200] border-2 border-[#1E222A] text-[#1E222A]">
                    {metrics.wipPoints} pts
                  </span>
                </div>
              </div>

              <div className="relative p-5 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-2xl shadow-[0_6px_0_#1E222A] text-[#1E222A] flex flex-col justify-between">
                <div className="rivet top-2 left-2" />
                <div className="rivet top-2 right-2" />
                <div className="rivet bottom-2 left-2" />
                <div className="rivet bottom-2 right-2" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
                  Throughput Rate
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#48A2D8] font-mono tabular-nums">
                    {metrics.throughputPointsPerMinute}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#48A2D8]/20 border-2 border-[#1E222A] text-[#1E222A]">
                    pts / min
                  </span>
                </div>
              </div>

              <div className="relative p-5 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-2xl shadow-[0_6px_0_#1E222A] text-[#1E222A] flex flex-col justify-between">
                <div className="rivet top-2 left-2" />
                <div className="rivet top-2 right-2" />
                <div className="rivet bottom-2 left-2" />
                <div className="rivet bottom-2 right-2" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
                  Mean Cycle Time
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#E85D04] font-mono tabular-nums">
                    {metrics.averageCycleTime}s
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#E85D04]/20 border-2 border-[#1E222A] text-[#1E222A]">
                    Lead: {metrics.averageLeadTime}s
                  </span>
                </div>
              </div>

              <div className="relative p-5 bg-[#F4F6F9] border-[3px] border-[#1E222A] rounded-2xl shadow-[0_6px_0_#1E222A] text-[#1E222A] flex flex-col justify-between">
                <div className="rivet top-2 left-2" />
                <div className="rivet top-2 right-2" />
                <div className="rivet bottom-2 left-2" />
                <div className="rivet bottom-2 right-2" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500" style={{ fontFamily: 'var(--font-heading)' }}>
                  Flow Efficiency
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-[#D92525] font-mono tabular-nums">
                    {metrics.flowEfficiency}%
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-[#FFD200] border-2 border-[#1E222A] text-[#1E222A]">
                    Target: &gt;40%
                  </span>
                </div>
              </div>
            </div>

            {/* Upgrades & Station Configuration Panel */}
            <UpgradePanel
              booths={booths}
              ferry={ferry}
              funds={funds}
              pendingDailyRevenue={pendingDailyRevenue}
              dailyDues={dailyDues}
              selectedBoothId={selectedBoothId}
              onSelectBooth={setSelectedBoothId}
              onUnlockBooth={unlockBooth}
              onUpgradeEfficiency={upgradeBoothEfficiency}
              onUpgradeAutomation={upgradeBoothAutomation}
              onUpgradeTraining={upgradeBoothTraining}
              onUpgradeFerryCapacity={upgradeFerryCapacity}
              onUpgradeFerrySpeed={upgradeFerrySpeed}
              onUpgradeFerryAmenities={upgradeFerryAmenities}
              onSetWipLimit={setLaneWipLimit}
              onSetSpecialization={setLaneSpecialization}
              onToggleAutoDepart={toggleAutoDepart}
              onSetDailyDuration={setDailyDuration}
              continuousFlowMode={settings.continuousFlowMode}
              onToggleContinuousFlow={toggleContinuousFlowMode}
            />
          </div>
        )}

        {activeTab === 'kanban' && (
          <KanbanBoardTab
            vehicles={vehicles}
            booths={booths}
            ferry={ferry}
            metrics={metrics}
            funds={funds}
            onSelectVehicle={setSelectedVehicle}
            onSliceStory={sliceStory}
            onSetLaneWipLimit={setLaneWipLimit}
            onLaunchFerry={launchFerry}
            onSpawnStory={(pts) => spawnVehicle(pts)}
            onSelectBooth={(id) => {
              setSelectedBoothId(id);
              setActiveTab('simulation');
            }}
            onUpgradeEfficiency={upgradeBoothEfficiency}
            onUpgradeAutomation={upgradeBoothAutomation}
          />
        )}

        {activeTab === 'metrics' && (
          <FlowMetricsPanel
            metrics={metrics}
            booths={booths}
            onSelectBooth={(id) => {
              setSelectedBoothId(id);
              setActiveTab('simulation');
            }}
            onOpenRetrospective={openLastRetrospective}
            hasLastRetrospective={!!lastSprintSummary}
            forecast={dailyForecast}
            onOpenForecast={() => setIsForecastOpen(true)}
            onSwitchToKanban={() => setActiveTab('kanban')}
          />
        )}

        {activeTab === 'academy' && (
          <AgileAcademyModal
            onAwardBonus={(amount) => {
              addFunds(amount);
            }}
          />
        )}
      </main>

      {/* Development Company & Copyright Branding (HEXperience in Huntington Bank colors) */}
      <CompanyFooter />

      {/* Modals & Overlays */}
      <StoryInspectorModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        onSliceStory={sliceStory}
      />

      <SprintRetrospectiveModal
        summary={sprintSummary}
        onClose={() => setSprintSummary(null)}
      />

      <DailyForecastModal
        isOpen={isForecastOpen}
        onClose={() => setIsForecastOpen(false)}
        forecast={dailyForecast}
        booths={booths}
        onApplyRecommendedWip={applyRecommendedWipLimit}
        onSetLaneWip={setLaneWipLimit}
      />

      {/* Predetermined Tech Scenarios Select Modal */}
      <ScenarioSelectModal
        isOpen={isScenarioSelectOpen}
        onClose={closeScenarioSelect}
        activeScenarioId={activeScenario?.scenarioId || null}
        onSelectScenario={startScenario}
        onResetToFreePlay={resetToFreePlay}
      />

      {/* Scenario Outcome & Post-Mortem Modal */}
      {isScenarioOutcomeOpen && activeScenario && activeScenarioDef && (
        <ScenarioOutcomeModal
          scenarioState={activeScenario}
          scenarioDef={activeScenarioDef}
          onRestartScenario={restartScenario}
          onChooseAnotherScenario={openScenarioSelect}
          onReturnToFreePlay={resetToFreePlay}
        />
      )}
    </div>
  );
}

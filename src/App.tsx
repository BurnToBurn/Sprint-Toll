import { useState, useMemo } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { HeaderBar } from './components/HeaderBar';
import { TollSimulationCanvas } from './components/TollSimulationCanvas';
import { UpgradePanel } from './components/UpgradePanel';
import { AgileAcademyModal } from './components/AgileAcademyModal';
import { StoryInspectorModal } from './components/StoryInspectorModal';
import { SprintRetrospectiveModal } from './components/SprintRetrospectiveModal';
import { DailyForecastModal } from './components/DailyForecastModal';
import { CompanyFooter } from './components/CompanyFooter';
import { ScenarioSelectModal } from './components/ScenarioSelectModal';
import { ScenarioOutcomeModal } from './components/ScenarioOutcomeModal';
import { ScenarioObjectiveHUD } from './components/ScenarioObjectiveHUD';
import { SprintPlanningModal } from './components/SprintPlanningModal';
import { MainMenu } from './components/MainMenu';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulation' | 'academy'>('simulation');
  const [isForecastOpen, setIsForecastOpen] = useState(false);
  const [isUpgradesOpen, setIsUpgradesOpen] = useState(false);

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
    // Sprint Planning & Backlog
    backlogItems,
    isSprintPlanningOpen,
    openSprintPlanning,
    closeSprintPlanning,
    toggleBacklogItem,
    autoSelectOptimalBatch,
    selectAllBacklog,
    clearAllBacklog,
    sliceBacklogItem,
    addBacklogStory,
    removeBacklogItem,
    stageStoryInParkingLot,
    commitSprintPlanning,
    dispatchNextFromParkingLot,
    resolveBoothIncident,
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
    // Main Menu
    isMainMenuOpen,
    setIsMainMenuOpen,
    hasStartedGame,
    openMainMenu,
    closeMainMenu,
    resumeGame,
    startNewFreePlayGame,
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

  // Check if player has enough settled bank funds to afford any upgrade
  const hasAffordableUpgrades = useMemo(() => {
    return booths.some((b) => {
      if (!b.unlocked && funds >= b.unlockCost) return true;
      if (b.unlocked) {
        const effCost = Math.round(75 * Math.pow(1.5, b.efficiencyLevel));
        const autoCost = Math.round(150 * Math.pow(1.7, b.automationLevel));
        const trainCost = Math.round(100 * Math.pow(1.6, b.trainingLevel));
        if (funds >= effCost || funds >= autoCost || funds >= trainCost) return true;
      }
      return false;
    }) || (
      funds >= Math.round(120 * Math.pow(1.6, ferry.capacityLevel)) ||
      funds >= Math.round(150 * Math.pow(1.7, ferry.speedLevel)) ||
      funds >= Math.round(200 * Math.pow(1.8, ferry.amenitiesLevel))
    );
  }, [booths, ferry, funds]);

  return (
    <div className="min-h-screen bg-[#2B2F38] text-[#F4F6F9] flex flex-col font-sans selection:bg-[#FFD200] selection:text-[#1E222A]">
      {/* Universal Top Bar with Daily Sprint Cadence & Countdown */}
      <HeaderBar
        onOpenMainMenu={openMainMenu}
        funds={funds}
        pendingDailyRevenue={pendingDailyRevenue}
        dailyDuesAmount={dailyDues?.totalDailyDues ?? 0}
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
        onOpenSprintPlanning={openSprintPlanning}
        onOpenUpgrades={() => setIsUpgradesOpen(true)}
        hasAffordableUpgrades={hasAffordableUpgrades}
        activeScenarioTitle={activeScenarioDef?.title}
        activeScenarioDay={activeScenario?.currentDay}
        activeScenarioTotalDays={activeScenarioDef?.durationDays}
        onTabChange={setActiveTab}
        onToggleSound={toggleSound}
        onSetSpeed={setGameSpeed}
        onLaunchFerry={launchFerry}
        onToggleContinuousFlow={toggleContinuousFlowMode}
        onOpenRetrospective={openLastRetrospective}
        hasLastRetrospective={!!lastSprintSummary}
        ferryReady={ferry.currentPoints > 0 && ferry.state === 'boarding'}
        isRetroOpen={!!sprintSummary}
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
                setIsUpgradesOpen(true);
              }}
              onSliceStory={sliceStory}
              onUnlockBooth={unlockBooth}
              onLaunchFerry={launchFerry}
              onUpgradeEfficiency={upgradeBoothEfficiency}
              onUpgradeAutomation={upgradeBoothAutomation}
              onSetLaneWipLimit={setLaneWipLimit}
              continuousFlowMode={settings.continuousFlowMode}
              onToggleContinuousFlow={toggleContinuousFlowMode}
              funds={funds}
              onResolveIncident={resolveBoothIncident}
              onDispatchFromParkingLot={dispatchNextFromParkingLot}
              onOpenSprintPlanning={openSprintPlanning}
            />
          </div>
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
      {/* Harbor Works & Upgrades Modal */}
      <UpgradePanel
        isOpen={isUpgradesOpen}
        onClose={() => setIsUpgradesOpen(false)}
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
        onResolveIncident={resolveBoothIncident}
      />
      <SprintPlanningModal
        isOpen={isSprintPlanningOpen}
        onClose={closeSprintPlanning}
        dayNumber={ferry.dayNumber}
        ferry={ferry}
        booths={booths}
        backlogItems={backlogItems}
        onToggleItem={toggleBacklogItem}
        onAutoSelect={autoSelectOptimalBatch}
        onSliceItem={sliceBacklogItem}
        onCommitSprint={commitSprintPlanning}
        onSelectAll={selectAllBacklog}
        onClearAll={clearAllBacklog}
        onAddStory={addBacklogStory}
        onRemoveItem={removeBacklogItem}
      />

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
          onReturnToMainMenu={openMainMenu}
        />
      )}

      {/* Main Menu & Initial Start Screen */}
      <MainMenu
        isOpen={isMainMenuOpen}
        hasActiveGame={hasStartedGame}
        dayNumber={ferry.dayNumber}
        dayTimeFormatted={ferry.dayTimeFormatted}
        funds={funds}
        totalPoints={totalDeliveredPoints}
        ferryPoints={ferry.currentPoints}
        ferryCapacity={ferry.capacity}
        activeScenarioTitle={activeScenarioDef?.title}
        soundEnabled={settings.soundEnabled}
        continuousFlowMode={settings.continuousFlowMode}
        gameSpeed={settings.gameSpeed}
        onResumeGame={resumeGame}
        onStartNewGame={startNewFreePlayGame}
        onOpenScenarios={openScenarioSelect}
        onSelectScenario={(scenario) => {
          startScenario(scenario);
        }}
        onOpenAcademy={() => {
          setActiveTab('academy');
          closeMainMenu();
        }}
        onOpenSprintPlanning={() => {
          openSprintPlanning();
          closeMainMenu();
        }}
        onToggleSound={toggleSound}
        onToggleContinuousFlow={toggleContinuousFlowMode}
        onSetGameSpeed={setGameSpeed}
      />
    </div>
  );
}

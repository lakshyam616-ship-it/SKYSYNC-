/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Compass, LineChart, ListTodo } from 'lucide-react';
import { Navbar, NavSectionId } from './components/Navbar';
import { WeatherInputPanel } from './components/WeatherInputPanel';
import { MetricsOverview } from './components/MetricsOverview';
import { RecommendationCard } from './components/RecommendationCard';
import { Planner, PlannerItem } from './components/Planner';
import { DynamicCharts } from './components/DynamicCharts';
import { ModelExplanation } from './components/ModelExplanation';
import {
  classifyWeatherAtmosphere,
  getAtmosphereLabel,
  WeatherBackdrop,
} from './components/WeatherBackdrop';
import {
  computeSuitabilityMetrics,
  EXAMPLE_SCENARIOS,
  getActivityRecommendation,
  solveEquilibriumRK4,
  validateWeatherInputs,
  WeatherScenario,
} from './utils/weatherModel';

const DEFAULT_TEMPERATURE = 22;
const DEFAULT_RAINFALL = 0.5;
const PLANNER_STORAGE_KEY = 'skysync_activity_planner_v1';

const VALID_SECTIONS: ReadonlySet<NavSectionId> = new Set([
  'dashboard',
  'recommendations',
  'planner',
  'analytics',
  'mathematical-model',
]);

const SECTION_HEADERS: Record<
  NavSectionId,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: 'Understand Your Weather. Discover Your Next Activity.',
    subtitle:
      'SkySync transforms temperature and rainfall into meaningful activity recommendations using a mathematical suitability model.',
  },
  recommendations: {
    title: 'Activity Recommendations',
    subtitle:
      'Provisional activity classification, suitability threshold evaluation, and suggested activities for your current conditions.',
  },
  planner: {
    title: 'Activity Planner',
    subtitle:
      'Build and manage a personalized checklist of activities aligned with your current weather suitability.',
  },
  analytics: {
    title: 'Suitability & Equilibrium Analytics',
    subtitle:
      'Dynamic sensitivity curves and steady-state differential equilibrium visualizations updated in real time.',
  },
  'mathematical-model': {
    title: 'Mathematical Model & Equations',
    subtitle:
      'Suitability functions, three-state differential equations, parameters, initial conditions, and 4th-order Runge-Kutta solver.',
  },
};

function getInitialSection(): NavSectionId {
  const hash = window.location.hash.replace(/^#/, '') as NavSectionId;
  return VALID_SECTIONS.has(hash) ? hash : 'dashboard';
}

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function loadPlannerItems(): PlannerItem[] {
  try {
    const raw = window.localStorage.getItem(PLANNER_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PlannerItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as PlannerItem).id === 'string' &&
        typeof (item as PlannerItem).text === 'string' &&
        typeof (item as PlannerItem).completed === 'boolean' &&
        typeof (item as PlannerItem).category === 'string' &&
        typeof (item as PlannerItem).suitabilityScore === 'number'
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [activeSection, setActiveSection] =
    useState<NavSectionId>(getInitialSection);

  const [tempInput, setTempInput] = useState<string>(
    String(DEFAULT_TEMPERATURE)
  );
  const [rainInput, setRainInput] = useState<string>(String(DEFAULT_RAINFALL));

  const [activeTemp, setActiveTemp] = useState<number>(DEFAULT_TEMPERATURE);
  const [activeRain, setActiveRain] = useState<number>(DEFAULT_RAINFALL);

  const [tempError, setTempError] = useState<string | null>(null);
  const [rainError, setRainError] = useState<string | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string>('Ready');

  const [plannerItems, setPlannerItems] =
    useState<PlannerItem[]>(loadPlannerItems);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PLANNER_STORAGE_KEY,
        JSON.stringify(plannerItems)
      );
    } catch {
      // Ignore storage quota or private browsing errors gracefully
    }
  }, [plannerItems]);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '') as NavSectionId;
      if (VALID_SECTIONS.has(hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (sectionId: NavSectionId) => {
    setActiveSection(sectionId);
    if (window.location.hash !== `#${sectionId}`) {
      window.history.pushState(null, '', `#${sectionId}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyValidatedInputs = (nextTempStr: string, nextRainStr: string) => {
    const validation = validateWeatherInputs(nextTempStr, nextRainStr);
    setTempError(validation.temperatureError);
    setRainError(validation.rainfallError);

    if (
      validation.isValid &&
      validation.temperature !== null &&
      validation.rainfall !== null
    ) {
      setActiveTemp(validation.temperature);
      setActiveRain(validation.rainfall);
      setLastUpdatedLabel(`Updated ${formatCurrentTime()}`);
    }
  };

  const handleTempChange = (value: string) => {
    setTempInput(value);
    applyValidatedInputs(value, rainInput);
  };

  const handleRainChange = (value: string) => {
    setRainInput(value);
    applyValidatedInputs(tempInput, value);
  };

  const handleCalculateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWeatherInputs(tempInput, rainInput);
    setTempError(validation.temperatureError);
    setRainError(validation.rainfallError);

    if (
      validation.isValid &&
      validation.temperature !== null &&
      validation.rainfall !== null
    ) {
      setActiveTemp(validation.temperature);
      setActiveRain(validation.rainfall);
      setLastUpdatedLabel(`Calculated ${formatCurrentTime()}`);
    }
  };

  const handleSelectScenario = (scenario: WeatherScenario) => {
    const nextT = String(scenario.temperature);
    const nextR = String(scenario.rainfall);
    setTempInput(nextT);
    setRainInput(nextR);
    setTempError(null);
    setRainError(null);
    setActiveTemp(scenario.temperature);
    setActiveRain(scenario.rainfall);
    setLastUpdatedLabel(`Preset · ${formatCurrentTime()}`);
  };

  const handleResetDefaults = () => {
    setTempInput(String(DEFAULT_TEMPERATURE));
    setRainInput(String(DEFAULT_RAINFALL));
    setTempError(null);
    setRainError(null);
    setActiveTemp(DEFAULT_TEMPERATURE);
    setActiveRain(DEFAULT_RAINFALL);
    setLastUpdatedLabel(`Reset ${formatCurrentTime()}`);
  };

  const metrics = useMemo(
    () => computeSuitabilityMetrics(activeTemp, activeRain),
    [activeTemp, activeRain]
  );

  const equilibriumResult = useMemo(
    () => solveEquilibriumRK4(metrics.combinedSuitability),
    [metrics.combinedSuitability]
  );

  const recommendation = useMemo(
    () => getActivityRecommendation(metrics, equilibriumResult.equilibrium),
    [metrics, equilibriumResult.equilibrium]
  );

  const handleAddPlannerItem = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newItem: PlannerItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      completed: false,
      category: recommendation.category,
      suitabilityScore: recommendation.suitabilityScore,
    };
    setPlannerItems((prev) => [newItem, ...prev]);
  };

  const handleTogglePlannerItem = (id: string) => {
    setPlannerItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemovePlannerItem = (id: string) => {
    setPlannerItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadSuggestedPlanner = () => {
    const existingLower = new Set(
      plannerItems.map((item) => item.text.trim().toLowerCase())
    );
    const additions: PlannerItem[] = recommendation.examples
      .filter((example) => !existingLower.has(example.toLowerCase()))
      .map((example, idx) => ({
        id: `${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        text: example,
        completed: false,
        category: recommendation.category,
        suitabilityScore: recommendation.suitabilityScore,
      }));
    if (additions.length > 0) {
      setPlannerItems((prev) => [...additions, ...prev]);
    }
  };

  const handleClearCompletedPlanner = () => {
    setPlannerItems((prev) => prev.filter((item) => !item.completed));
  };

  const currentHeader = SECTION_HEADERS[activeSection];
  const atmosphere = classifyWeatherAtmosphere(activeTemp, activeRain);
  const atmosphereLabel = getAtmosphereLabel(atmosphere, activeTemp);

  return (
    <div id="top" className="relative min-h-screen text-slate-100">
      <WeatherBackdrop atmosphere={atmosphere} temperature={activeTemp} />
      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col lg:flex-row lg:gap-6 lg:p-4">
        {/* Left Sidebar Navigation (Desktop) + Top Header (Mobile) */}
        <Navbar
          activeSection={activeSection}
          activeTemp={activeTemp}
          activeRain={activeRain}
          combinedSuitability={metrics.combinedSuitability}
          atmosphereLabel={atmosphereLabel}
          plannerCount={plannerItems.length}
          onNavigate={handleNavigate}
          onResetDefaults={handleResetDefaults}
        />

        {/* Active Room / Workspace */}
        <div className="flex-1 min-w-0 px-4 py-6 sm:px-6 lg:px-2 lg:py-2 space-y-6">
          {/* Top Workspace Header Bar */}
          <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 rounded-2xl border border-white/[0.09] bg-[#11142B]/78 backdrop-blur-md px-6 py-5 shadow-[0_20px_45px_-24px_rgba(3,5,18,0.85)]">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white text-balance">
                {currentHeader.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {currentHeader.subtitle}
              </p>
            </div>

            {/* Quick-Switch Presets available across every room */}
            <div className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-[#0B0D20] p-1 self-start xl:self-auto overflow-x-auto max-w-full">
              {EXAMPLE_SCENARIOS.map((scenario) => {
                const isSelected =
                  Math.abs(activeTemp - scenario.temperature) < 1e-6 &&
                  Math.abs(activeRain - scenario.rainfall) < 1e-6;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => handleSelectScenario(scenario)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-500/30 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {scenario.temperature}°C · {scenario.rainfall}mm
                  </button>
                );
              })}
            </div>
          </header>

          {/* Dedicated Room Content based on activeSection */}
          <main className="space-y-6">
            {activeSection === 'dashboard' && (
              <section
                id="dashboard"
                aria-label="Weather dashboard"
                className="space-y-6"
              >
                <WeatherInputPanel
                  tempInput={tempInput}
                  rainInput={rainInput}
                  tempError={tempError}
                  rainError={rainError}
                  activeTemp={activeTemp}
                  activeRain={activeRain}
                  combinedSuitability={metrics.combinedSuitability}
                  lastUpdatedLabel={lastUpdatedLabel}
                  onTempChange={handleTempChange}
                  onRainChange={handleRainChange}
                  onCalculate={handleCalculateSubmit}
                  onSelectScenario={handleSelectScenario}
                />

                <MetricsOverview
                  metrics={metrics}
                  equilibriumResult={equilibriumResult}
                />

                {/* Concise Room Routing Summary Card on Dashboard */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-[#1A1C3D]/95 to-[#13162D]/95 p-5 shadow-[0_20px_45px_-24px_rgba(3,5,18,0.85)]">
                  <div className="space-y-1">
                    <div className="font-mono text-xs text-cyan-300">
                      Current Classification · {recommendation.thresholdRule}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {recommendation.title} (S ={' '}
                      <span className="font-mono tabular-nums">
                        {recommendation.suitabilityScore.toFixed(3)}
                      </span>
                      )
                    </div>
                    <p className="text-xs text-slate-400">
                      Suggested: {recommendation.examples.join(' · ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleNavigate('recommendations')}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-white whitespace-nowrap transition-all hover:brightness-110 cursor-pointer"
                    >
                      <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Open Recommendations</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate('analytics')}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-200 whitespace-nowrap transition-colors hover:border-cyan-400/40 hover:text-white cursor-pointer"
                    >
                      <LineChart className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                      <span>Open Analytics</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'recommendations' && (
              <div className="space-y-5">
                <RecommendationCard
                  recommendation={recommendation}
                  onAddActivityToPlanner={handleAddPlannerItem}
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#13162D]/90 px-5 py-4">
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">
                      {plannerItems.length}
                    </span>{' '}
                    {plannerItems.length === 1 ? 'activity' : 'activities'} currently
                    in your Activity Planner for {activeTemp.toFixed(1)}°C and{' '}
                    {activeRain.toFixed(1)} mm.
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNavigate('planner')}
                    className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-semibold text-indigo-200 whitespace-nowrap transition-colors hover:bg-indigo-500/25 hover:text-white cursor-pointer self-start sm:self-auto"
                  >
                    <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Go to Activity Planner</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'planner' && (
              <Planner
                recommendation={recommendation}
                items={plannerItems}
                onAddActivity={handleAddPlannerItem}
                onToggleItem={handleTogglePlannerItem}
                onRemoveItem={handleRemovePlannerItem}
                onLoadSuggested={handleLoadSuggestedPlanner}
                onClearCompleted={handleClearCompletedPlanner}
              />
            )}

            {activeSection === 'analytics' && (
              <DynamicCharts
                metrics={metrics}
                equilibriumResult={equilibriumResult}
              />
            )}

            {activeSection === 'mathematical-model' && <ModelExplanation />}
          </main>

          <footer className="rounded-2xl border border-white/[0.06] bg-[#0E1024]/90 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                <span className="font-semibold text-slate-200">SkySync</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Intelligent Weather-Based Activity Recommendation System</span>
              </div>
              <div className="font-mono text-slate-500">
                Temperature (°C) &amp; Rainfall (mm) Suitability Model
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

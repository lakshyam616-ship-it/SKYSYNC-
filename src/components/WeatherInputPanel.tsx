import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  CloudRain,
  Thermometer,
} from 'lucide-react';
import {
  EXAMPLE_SCENARIOS,
  INPUT_BOUNDS,
  WeatherScenario,
} from '../utils/weatherModel';

interface WeatherInputPanelProps {
  tempInput: string;
  rainInput: string;
  tempError: string | null;
  rainError: string | null;
  activeTemp: number;
  activeRain: number;
  combinedSuitability: number;
  lastUpdatedLabel: string;
  onTempChange: (value: string) => void;
  onRainChange: (value: string) => void;
  onCalculate: (e: React.FormEvent) => void;
  onSelectScenario: (scenario: WeatherScenario) => void;
}

const WeatherEmblem: React.FC<{ temp: number; rain: number }> = ({
  temp,
  rain,
}) => {
  const isWinter = temp < 15 && rain < 4;
  const isRainy = !isWinter && rain >= 1.5;
  const isLightRain = !isWinter && rain > 0.1 && rain < 1.5;
  const isWarmClear = !isWinter && rain <= 0.1 && temp >= 18;
  const isClearSnow = isWinter && temp <= 8;

  return (
    <div
      aria-hidden="true"
      className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/15 via-[#181B38] to-cyan-500/10 shadow-inner"
    >
      <svg viewBox="0 0 64 64" className="h-14 w-14">
        <defs>
          <linearGradient id="sunGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="cloudBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
        </defs>

        {/* Sun sphere */}
        {!isRainy && !isWinter && (
          <circle
            cx={isWarmClear ? 32 : 38}
            cy={isWarmClear ? 32 : 24}
            r={isWarmClear ? 13 : 10}
            fill="url(#sunGlow)"
          />
        )}

        {/* Cloud layer when not purely warm & clear */}
        {!isWarmClear && (
          <path
            d="M21 43h23a9 9 0 0 0 1.4-17.9A12.5 12.5 0 0 0 21.2 28 8 8 0 0 0 21 43Z"
            fill="url(#cloudBody)"
            opacity={0.95}
          />
        )}

        {/* Raindrops when raining */}
        {(isRainy || isLightRain) && (
          <g stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round">
            <line x1="25" y1="47" x2="23" y2="53" />
            <line x1="33" y1="47" x2="31" y2="54" />
            {isRainy && <line x1="41" y1="47" x2="39" y2="53" />}
          </g>
        )}

        {/* Snowflakes when cold (< 15°C) */}
        {isWinter && (
          <g fill="#E0F2FE">
            <circle cx="24" cy="50" r="2.1" />
            <circle cx="33" cy="53" r={isClearSnow ? '2.4' : '1.9'} />
            {isClearSnow && <circle cx="42" cy="49" r="2.1" />}
            {isClearSnow && <circle cx="28" cy="57" r="1.7" />}
          </g>
        )}
      </svg>
    </div>
  );
};

export const WeatherInputPanel: React.FC<WeatherInputPanelProps> = ({
  tempInput,
  rainInput,
  tempError,
  rainError,
  activeTemp,
  activeRain,
  combinedSuitability,
  lastUpdatedLabel,
  onTempChange,
  onRainChange,
  onCalculate,
  onSelectScenario,
}) => {
  const sliderTemp = Math.max(-15, Math.min(45, activeTemp));
  const sliderRain = Math.max(0, Math.min(25, activeRain));

  return (
    <section
      aria-labelledby="weather-inputs-heading"
      className="rounded-2xl border border-white/[0.08] bg-[#11142B]/78 backdrop-blur-md p-6 shadow-[0_24px_60px_-24px_rgba(3,5,18,0.9)] space-y-6"
    >
      {/* Hero Weather Condition Display styled after Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.07] pb-5">
        <div className="flex items-center gap-4">
          <WeatherEmblem temp={activeTemp} rain={activeRain} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold tracking-tight text-white tabular-nums">
                {activeTemp.toFixed(1)}°
              </span>
              <span className="font-mono text-base font-medium text-slate-400">
                C
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-xs text-slate-300 tabular-nums">
              <CloudRain className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
              <span>Rainfall: {activeRain.toFixed(1)} mm</span>
            </div>
          </div>
        </div>

        <div className="sm:text-right">
          <h2
            id="weather-inputs-heading"
            className="text-sm font-semibold text-white"
          >
            Current Conditions
          </h2>
          <div className="mt-1 font-mono text-xs text-cyan-300 tabular-nums">
            Combined S = {combinedSuitability.toFixed(3)}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
            {lastUpdatedLabel}
          </div>
        </div>
      </div>

      {/* Interactive Inputs Form */}
      <form onSubmit={onCalculate} noValidate className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Temperature Field */}
          <div className="rounded-xl border border-white/[0.07] bg-[#0D0F22]/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="temperature-input"
                className="flex items-center gap-2 text-sm font-medium text-slate-200"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
                  <Thermometer className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>Temperature (°C)</span>
              </label>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {INPUT_BOUNDS.TEMP_MIN}..{INPUT_BOUNDS.TEMP_MAX}°C
              </span>
            </div>

            <div className="relative">
              <input
                id="temperature-input"
                name="temperature"
                type="number"
                step="0.1"
                inputMode="decimal"
                value={tempInput}
                onChange={(e) => onTempChange(e.target.value)}
                aria-invalid={tempError !== null}
                aria-describedby={tempError ? 'temperature-error' : undefined}
                placeholder="e.g. 22.0"
                className={`w-full min-h-11 rounded-xl border bg-[#080A18] px-3.5 py-2 pr-10 font-mono text-lg font-semibold text-white tabular-nums placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 ${
                  tempError
                    ? 'border-rose-500/80 focus:ring-rose-500/30'
                    : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
                }`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-xs text-slate-400">
                °C
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                aria-label="Adjust temperature slider"
                min={-15}
                max={45}
                step={0.5}
                value={sliderTemp}
                onChange={(e) => onTempChange(e.target.value)}
                className="skysync-slider w-full"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500 tabular-nums">
                <span>-15°C</span>
                <span>25°C opt</span>
                <span>45°C</span>
              </div>
            </div>

            {tempError && (
              <p
                id="temperature-error"
                role="alert"
                className="flex items-start gap-1.5 text-xs text-rose-400"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{tempError}</span>
              </p>
            )}
          </div>

          {/* Rainfall Field */}
          <div className="rounded-xl border border-white/[0.07] bg-[#0D0F22]/85 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="rainfall-input"
                className="flex items-center gap-2 text-sm font-medium text-slate-200"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
                  <CloudRain className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>Rainfall (mm)</span>
              </label>
              <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                {INPUT_BOUNDS.RAIN_MIN}..{INPUT_BOUNDS.RAIN_MAX} mm
              </span>
            </div>

            <div className="relative">
              <input
                id="rainfall-input"
                name="rainfall"
                type="number"
                step="0.1"
                min="0"
                inputMode="decimal"
                value={rainInput}
                onChange={(e) => onRainChange(e.target.value)}
                aria-invalid={rainError !== null}
                aria-describedby={rainError ? 'rainfall-error' : undefined}
                placeholder="e.g. 0.5"
                className={`w-full min-h-11 rounded-xl border bg-[#080A18] px-3.5 py-2 pr-12 font-mono text-lg font-semibold text-white tabular-nums placeholder:text-slate-600 transition-colors focus:outline-none focus:ring-2 ${
                  rainError
                    ? 'border-rose-500/80 focus:ring-rose-500/30'
                    : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
                }`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-xs text-slate-400">
                mm
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                aria-label="Adjust rainfall slider"
                min={0}
                max={25}
                step={0.5}
                value={sliderRain}
                onChange={(e) => onRainChange(e.target.value)}
                className="skysync-slider w-full"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500 tabular-nums">
                <span>0 mm</span>
                <span>5 mm</span>
                <span>25 mm</span>
              </div>
            </div>

            {rainError && (
              <p
                id="rainfall-error"
                role="alert"
                className="flex items-start gap-1.5 text-xs text-rose-400"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{rainError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Prominent Calculate CTA + Quick Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-10px_rgba(56,189,248,0.55)] transition-all duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 cursor-pointer shrink-0"
          >
            <span>Calculate Suitability</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>

          <div className="flex flex-1 flex-wrap items-center gap-2">
            {EXAMPLE_SCENARIOS.map((scenario) => {
              const isSelected =
                Math.abs(activeTemp - scenario.temperature) < 1e-6 &&
                Math.abs(activeRain - scenario.rainfall) < 1e-6;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onSelectScenario(scenario)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    isSelected
                      ? 'border-cyan-400/50 bg-indigo-500/25 text-white'
                      : 'border-white/[0.07] bg-[#0D0F22] text-slate-300 hover:border-white/15 hover:text-white'
                  }`}
                >
                  {scenario.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </section>
  );
};

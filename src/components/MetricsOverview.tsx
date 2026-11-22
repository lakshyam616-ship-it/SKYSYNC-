import React, { useMemo } from 'react';
import {
  SuitabilityMetrics,
  EquilibriumResult,
  computeTemperatureSuitability,
  computeRainfallSuitability,
} from '../utils/weatherModel';

interface MetricsOverviewProps {
  metrics: SuitabilityMetrics;
  equilibriumResult: EquilibriumResult;
}

interface CircularRingProps {
  valuePct: number;
  labelText: string;
  strokeStart: string;
  strokeEnd: string;
  id: string;
}

const CircularRing: React.FC<CircularRingProps> = ({
  valuePct,
  labelText,
  strokeStart,
  strokeEnd,
  id,
}) => {
  const clamped = Math.max(0, Math.min(100, valuePct));
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 76 76" className="h-20 w-20 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeStart} />
            <stop offset="100%" stopColor={strokeEnd} />
          </linearGradient>
        </defs>
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6.5"
        />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute font-mono text-sm font-semibold text-white tabular-nums">
        {labelText}
      </span>
    </div>
  );
};

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  equilibriumResult,
}) => {
  const { equilibrium, conservationSum, conservationError, iterations } =
    equilibriumResult;

  const stPct = metrics.temperatureSuitability * 100;
  const srPct = metrics.rainfallSuitability * 100;
  const sPct = metrics.combinedSuitability * 100;

  const outdoorPct = equilibrium.O * 100;
  const indoorPct = equilibrium.I * 100;
  const neutralPct = equilibrium.N * 100;

  // Real mathematical mini-curve paths derived directly from suitability equations
  const tempSparkline = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = -10 + (i / 24) * 55; // -10 to 45 C
      const st = computeTemperatureSuitability(t);
      const x = (i / 24) * 140;
      const y = 34 - st * 28;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const clampedT = Math.max(-10, Math.min(45, metrics.temperature));
    const activeX = ((clampedT + 10) / 55) * 140;
    const activeY = 34 - computeTemperatureSuitability(clampedT) * 28;
    return {
      line: `M ${pts.join(' L ')}`,
      area: `M 0,36 L ${pts.join(' L ')} L 140,36 Z`,
      activeX,
      activeY,
    };
  }, [metrics.temperature]);

  const rainSparkline = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const r = (i / 24) * 20; // 0 to 20 mm
      const sr = computeRainfallSuitability(r);
      const x = (i / 24) * 140;
      const y = 34 - sr * 28;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const clampedR = Math.max(0, Math.min(20, metrics.rainfall));
    const activeX = (clampedR / 20) * 140;
    const activeY = 34 - computeRainfallSuitability(clampedR) * 28;
    return {
      line: `M ${pts.join(' L ')}`,
      area: `M 0,36 L ${pts.join(' L ')} L 140,36 Z`,
      activeX,
      activeY,
    };
  }, [metrics.rainfall]);

  return (
    <div className="space-y-5">
      {/* Row 1: 3 Suitability Bento Cards with Gradient Washes & Mathematical Sparklines/Ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature Suitability */}
        <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#231E54]/80 via-[#141733] to-[#11132A] p-5 shadow-[0_20px_45px_-24px_rgba(3,5,18,0.9)]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-medium text-slate-300">
              Temperature Suitability
            </h3>
            <span className="font-mono text-xs text-violet-300 tabular-nums">
              {stPct.toFixed(1)}%
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
              {metrics.temperatureSuitability.toFixed(3)}
            </span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              S_T({metrics.temperature.toFixed(1)}°C)
            </span>
          </div>

          <svg
            viewBox="0 0 140 38"
            className="mt-3 h-10 w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="stMiniGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <path d={tempSparkline.area} fill="url(#stMiniGrad)" />
            <path
              d={tempSparkline.line}
              fill="none"
              stroke="#A78BFA"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={tempSparkline.activeX}
              cy={tempSparkline.activeY}
              r="3.5"
              fill="#F8FAFC"
              stroke="#A78BFA"
              strokeWidth="2"
            />
          </svg>
        </article>

        {/* Rainfall Suitability */}
        <article className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#172C4C]/80 via-[#131733] to-[#11132A] p-5 shadow-[0_20px_45px_-24px_rgba(3,5,18,0.9)]">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-medium text-slate-300">
              Rainfall Suitability
            </h3>
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {srPct.toFixed(1)}%
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tracking-tight text-white tabular-nums">
              {metrics.rainfallSuitability.toFixed(3)}
            </span>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              S_R({metrics.rainfall.toFixed(1)} mm)
            </span>
          </div>

          <svg
            viewBox="0 0 140 38"
            className="mt-3 h-10 w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="srMiniGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <path d={rainSparkline.area} fill="url(#srMiniGrad)" />
            <path
              d={rainSparkline.line}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx={rainSparkline.activeX}
              cy={rainSparkline.activeY}
              r="3.5"
              fill="#F8FAFC"
              stroke="#38BDF8"
              strokeWidth="2"
            />
          </svg>
        </article>

        {/* Combined Suitability Ring Card */}
        <article className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-b from-[#162D4A]/85 via-[#131835] to-[#11132A] p-5 shadow-[0_20px_45px_-24px_rgba(34,211,238,0.25)]">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-xs font-medium text-cyan-200">
                Combined Suitability
              </h3>
              <div className="font-mono text-3xl font-bold tracking-tight text-cyan-300 tabular-nums">
                {metrics.combinedSuitability.toFixed(3)}
              </div>
              <div className="font-mono text-xs text-slate-400 tabular-nums">
                Unsuitability q = {metrics.unsuitability.toFixed(3)}
              </div>
            </div>

            <CircularRing
              id="ringCombined"
              valuePct={sPct}
              labelText={`${sPct.toFixed(0)}%`}
              strokeStart="#22D3EE"
              strokeEnd="#818CF8"
            />
          </div>
        </article>
      </div>

      {/* Row 2: 3 Equilibrium Ring Cards (Outdoor, Indoor, Neutral) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#11142B]/78 backdrop-blur-md p-5 shadow-[0_18px_40px_-24px_rgba(3,5,18,0.85)]">
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-slate-400">
              Outdoor Equilibrium
            </h3>
            <div className="font-mono text-2xl font-bold text-white tabular-nums">
              {outdoorPct.toFixed(1)}%
            </div>
            <div className="font-mono text-xs text-slate-400 tabular-nums">
              O* = {equilibrium.O.toFixed(4)}
            </div>
          </div>
          <CircularRing
            id="ringOutdoor"
            valuePct={outdoorPct}
            labelText={`${outdoorPct.toFixed(0)}%`}
            strokeStart="#2DD4BF"
            strokeEnd="#22D3EE"
          />
        </article>

        <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#11142B]/78 backdrop-blur-md p-5 shadow-[0_18px_40px_-24px_rgba(3,5,18,0.85)]">
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-slate-400">
              Indoor Equilibrium
            </h3>
            <div className="font-mono text-2xl font-bold text-white tabular-nums">
              {indoorPct.toFixed(1)}%
            </div>
            <div className="font-mono text-xs text-slate-400 tabular-nums">
              I* = {equilibrium.I.toFixed(4)}
            </div>
          </div>
          <CircularRing
            id="ringIndoor"
            valuePct={indoorPct}
            labelText={`${indoorPct.toFixed(0)}%`}
            strokeStart="#818CF8"
            strokeEnd="#A855F7"
          />
        </article>

        <article className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#11142B]/78 backdrop-blur-md p-5 shadow-[0_18px_40px_-24px_rgba(3,5,18,0.85)]">
          <div className="space-y-1">
            <h3 className="text-xs font-medium text-slate-400">
              Neutral Equilibrium
            </h3>
            <div className="font-mono text-2xl font-bold text-white tabular-nums">
              {neutralPct.toFixed(1)}%
            </div>
            <div className="font-mono text-xs text-slate-400 tabular-nums">
              N* = {equilibrium.N.toFixed(4)}
            </div>
          </div>
          <CircularRing
            id="ringNeutral"
            valuePct={neutralPct}
            labelText={`${neutralPct.toFixed(0)}%`}
            strokeStart="#60A5FA"
            strokeEnd="#94A3B8"
          />
        </article>
      </div>

      {/* Compact Conservation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#101227]/90 px-4 py-2.5 text-xs font-mono text-slate-400 tabular-nums">
        <span>
          Equilibrium Balance: O* {outdoorPct.toFixed(1)}% · I* {indoorPct.toFixed(1)}% · N* {neutralPct.toFixed(1)}%
        </span>
        <span>
          O + I + N = {conservationSum.toFixed(6)} · Δ {conservationError.toExponential(1)} · {iterations} RK4 steps
        </span>
      </div>
    </div>
  );
};

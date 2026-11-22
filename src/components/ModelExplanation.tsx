import React from 'react';
import { BookOpen, Info } from 'lucide-react';
import { MODEL_PARAMS, INITIAL_STATE } from '../utils/weatherModel';

export const ModelExplanation: React.FC = () => {
  return (
    <section
      id="mathematical-model"
      aria-labelledby="mathematical-model-heading"
      className="scroll-mt-8 space-y-6"
    >
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Mathematical Formulation</span>
        </div>
        <h2
          id="mathematical-model-heading"
          className="text-xl font-bold tracking-tight text-white"
        >
          Suitability &amp; Differential Equilibrium Model
        </h2>
        <p className="max-w-3xl text-sm text-slate-400">
          Complete mathematical specification translating temperature (°C) and
          rainfall (mm) into normalized suitability indices and conserved
          three-state activity equilibria.
        </p>
      </div>

      <div
        role="note"
        aria-label="Illustrative assumptions disclaimer"
        className="rounded-2xl border border-indigo-400/25 bg-indigo-500/[0.08] p-5"
      >
        <div className="flex items-start gap-3.5">
          <Info
            className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Illustrative Model Assumptions
            </h3>
            <p className="text-sm leading-relaxed text-slate-300">
              All transition parameters (<span className="font-mono text-cyan-200">a, b, c, d, e, f</span>),
              suitability functions (<span className="font-mono text-cyan-200">S_T(T)</span>,{' '}
              <span className="font-mono text-cyan-200">S_R(R)</span>), and provisional
              recommendation thresholds (<span className="font-mono text-cyan-200">0.70</span> and{' '}
              <span className="font-mono text-cyan-200">0.30</span>) are illustrative
              assumptions and{' '}
              <strong className="font-semibold text-white">
                have not yet been empirically calibrated or validated
              </strong>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white">
              01. Weather Suitability Equations
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Normalized indices in [0, 1] quantifying thermal and precipitation comfort
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-1.5">
              <div className="text-xs font-medium text-slate-400">
                Temperature Suitability — Gaussian thermal bell centered at 25°C
              </div>
              <div className="font-mono text-sm sm:text-base text-purple-200 overflow-x-auto">
                S_T(T) = exp( −((T − 25) / 10)² )
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-1.5">
              <div className="text-xs font-medium text-slate-400">
                Rainfall Suitability — Exponential attenuation with 5 mm scale
              </div>
              <div className="font-mono text-sm sm:text-base text-cyan-200 overflow-x-auto">
                S_R(R) = exp( −R / 5 )
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-1.5">
              <div className="text-xs font-medium text-slate-400">
                Combined Suitability &amp; Adverse Weather Complement
              </div>
              <div className="font-mono text-sm sm:text-base text-white overflow-x-auto">
                S = S_T(T) × S_R(R) &nbsp;&nbsp;·&nbsp;&nbsp; q = 1 − S
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white">
              02. Three-State Differential Equations
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Coupled dynamical transitions across Outdoor (O), Indoor (I), and Neutral (N)
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-2.5 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto">
            <div>
              <span className="text-cyan-300">dO/dt</span> = a·S·N + e·S·I − c·q·O − d·O
            </div>
            <div>
              <span className="text-purple-300">dI/dt</span> = b·q·N + c·q·O − e·S·I − f·I
            </div>
            <div>
              <span className="text-indigo-300">dN/dt</span> = d·O + f·I − (a·S + b·q)·N
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-400 mb-2.5">
              Model Rate Parameters
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 font-mono text-xs tabular-nums">
              {[
                ['a', MODEL_PARAMS.a],
                ['b', MODEL_PARAMS.b],
                ['c', MODEL_PARAMS.c],
                ['d', MODEL_PARAMS.d],
                ['e', MODEL_PARAMS.e],
                ['f', MODEL_PARAMS.f],
              ].map(([name, val]) => (
                <div
                  key={String(name)}
                  className="rounded-xl border border-white/[0.07] bg-[#0B0D20] px-3 py-2.5 text-center"
                >
                  <div className="text-slate-400">{name}</div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    {Number(val).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-4">
          <h3 className="text-base font-semibold text-white">
            03. Initial Conditions &amp; Conservation
          </h3>

          <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-2">
            <div className="text-xs text-slate-400">Initial State Vector (t = 0)</div>
            <div className="grid grid-cols-3 gap-2 font-mono text-sm tabular-nums text-white">
              <div>
                <span className="text-cyan-300">O₀</span> = {INITIAL_STATE.O.toFixed(2)}
              </div>
              <div>
                <span className="text-purple-300">I₀</span> = {INITIAL_STATE.I.toFixed(2)}
              </div>
              <div>
                <span className="text-indigo-300">N₀</span> = {INITIAL_STATE.N.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 space-y-1.5">
            <div className="text-xs text-slate-400">Conservation Invariant</div>
            <div className="font-mono text-sm text-white">
              O(t) + I(t) + N(t) = 1
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Because dO/dt + dI/dt + dN/dt = 0 identically, total probability
              mass remains conserved at 1 throughout integration.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-4">
          <h3 className="text-base font-semibold text-white">
            04. Runge-Kutta Numerical Method
          </h3>
          <p className="text-sm leading-relaxed text-slate-300">
            Equilibrium values <span className="font-mono text-white">(O*, I*, N*)</span>{' '}
            are computed via 4th-Order Runge-Kutta (RK4) numerical integration
            with step size <span className="font-mono text-cyan-300">Δt = 0.05</span>.
          </p>
          <div className="rounded-xl border border-white/[0.07] bg-[#0B0D20] p-4 font-mono text-xs text-slate-200 space-y-1.5">
            <div>yₙ₊₁ = yₙ + (Δt / 6)·(k₁ + 2k₂ + 2k₃ + k₄)</div>
            <div className="text-slate-400">
              Stopping criterion: max(|dO/dt|, |dI/dt|, |dN/dt|) &lt; 10⁻¹⁰
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            States represent Outdoor activity (O), Indoor activity (I), and
            Neutral / no-activity (N).
          </p>
        </article>

        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-4">
          <h3 className="text-base font-semibold text-white">
            05. Provisional Thresholds
          </h3>
          <div className="divide-y divide-white/[0.06] text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="font-semibold text-cyan-300">Outdoor</span>
              <span className="font-mono text-slate-300 tabular-nums">S ≥ 0.70</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="font-semibold text-indigo-300">Mixed</span>
              <span className="font-mono text-slate-300 tabular-nums">0.30 ≤ S &lt; 0.70</span>
            </div>
            <div className="py-2.5 flex items-center justify-between gap-2">
              <span className="font-semibold text-purple-300">Indoor</span>
              <span className="font-mono text-slate-300 tabular-nums">S &lt; 0.30</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Thresholds classify combined weather suitability into actionable
            outdoor, transitional mixed, or sheltered indoor activity sets.
          </p>
        </article>
      </div>
    </section>
  );
};

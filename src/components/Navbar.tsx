import React from 'react';
import {
  BookOpen,
  Compass,
  LayoutGrid,
  LineChart,
  ListTodo,
  RotateCcw,
} from 'lucide-react';

export type NavSectionId =
  | 'dashboard'
  | 'recommendations'
  | 'planner'
  | 'analytics'
  | 'mathematical-model';

interface NavbarProps {
  activeSection: NavSectionId;
  activeTemp: number;
  activeRain: number;
  combinedSuitability: number;
  atmosphereLabel: string;
  plannerCount: number;
  onNavigate: (sectionId: NavSectionId) => void;
  onResetDefaults: () => void;
}

const NAV_ITEMS: ReadonlyArray<{
  id: NavSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'recommendations', label: 'Recommendations', icon: Compass },
  { id: 'planner', label: 'Activity Planner', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'mathematical-model', label: 'Mathematical Model', icon: BookOpen },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  activeTemp,
  activeRain,
  combinedSuitability,
  atmosphereLabel,
  plannerCount,
  onNavigate,
  onResetDefaults,
}) => {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        aria-label="Primary sidebar navigation"
        className="hidden lg:flex lg:w-60 lg:flex-col lg:justify-between lg:shrink-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] rounded-2xl border border-white/[0.08] bg-[#111329]/78 backdrop-blur-md p-4 shadow-[0_24px_60px_-20px_rgba(3,5,18,0.9)]"
      >
        <div className="space-y-7">
          {/* Brand Logo */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex w-full items-center gap-3 px-2 pt-1 text-left rounded-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-[0_8px_22px_-6px_rgba(99,102,241,0.7)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4.5 w-4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="9" r="3.1" />
                <path d="M5 14.5a4.2 4.2 0 0 1 7.6-2.4A3.5 3.5 0 1 1 16 18H7.5a3.5 3.5 0 0 1-2.5-3.5Z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              SkySync
            </span>
          </button>

          {/* Navigation View Buttons */}
          <nav className="space-y-1.5" aria-label="Dashboard sections">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
                    isActive
                      ? 'border border-indigo-400/25 bg-gradient-to-r from-[#3A357A]/80 to-[#25295C]/65 text-white shadow-[0_8px_20px_-10px_rgba(99,102,241,0.65)]'
                      : 'border border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-cyan-300' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.id === 'planner' && plannerCount > 0 && (
                    <span className="font-mono text-xs text-cyan-300 tabular-nums shrink-0">
                      {plannerCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Summary & Reset Action */}
        <div className="space-y-3 border-t border-white/[0.07] pt-4">
          <div className="rounded-xl border border-white/[0.06] bg-[#0B0D20]/90 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Active Model State</span>
              <span className="font-mono text-cyan-300">{atmosphereLabel}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs text-slate-200 tabular-nums">
              <span>{activeTemp.toFixed(1)}°C</span>
              <span className="text-slate-500">·</span>
              <span>{activeRain.toFixed(1)} mm</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-1.5 font-mono text-xs tabular-nums">
              <span className="text-slate-400">Suitability</span>
              <span className="font-semibold text-cyan-300">
                S = {combinedSuitability.toFixed(3)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onResetDefaults}
            className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </aside>

      {/* Mobile / Tablet Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0B0D20]/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-4 w-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="9" r="3.1" />
                <path d="M5 14.5a4.2 4.2 0 0 1 7.6-2.4A3.5 3.5 0 1 1 16 18H7.5a3.5 3.5 0 0 1-2.5-3.5Z" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              SkySync
            </span>
          </button>

          <button
            type="button"
            onClick={onResetDefaults}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>

        <nav
          aria-label="Mobile section navigation"
          className="flex items-center gap-4 overflow-x-auto border-t border-white/[0.06] px-4 py-2 text-xs font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>
    </>
  );
};

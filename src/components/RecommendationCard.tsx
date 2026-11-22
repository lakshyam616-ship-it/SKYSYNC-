import React from 'react';
import {
  Bike,
  BookOpen,
  Compass,
  Footprints,
  Gamepad2,
  Home,
  Palette,
  Plus,
  Sun,
  Trophy,
  Trees,
} from 'lucide-react';
import { ActivityRecommendation } from '../utils/weatherModel';

interface RecommendationCardProps {
  recommendation: ActivityRecommendation;
  onAddActivityToPlanner: (activityName: string) => void;
}

interface ActivityMeta {
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
}

const ACTIVITY_DETAILS: Record<string, ActivityMeta> = {
  Walking: {
    icon: Footprints,
    subtitle: 'Steady open-air pace suited for comfortable thermal conditions.',
  },
  Cycling: {
    icon: Bike,
    subtitle: 'Sustained outdoor ride with minimal precipitation interference.',
  },
  'Outdoor sports': {
    icon: Trophy,
    subtitle: 'High-energy field or court activities in favorable weather.',
  },
  'Indoor games': {
    icon: Gamepad2,
    subtitle: 'Sheltered recreational sessions unaffected by rain or chill.',
  },
  'Light outdoor activities': {
    icon: Trees,
    subtitle: 'Flexible brief outings paired with weather-safe backup plans.',
  },
  Reading: {
    icon: BookOpen,
    subtitle: 'Focused quiet reading indoors while adverse weather passes.',
  },
  'Creative activities': {
    icon: Palette,
    subtitle: 'Hands-on studio, design, or hobby work in a comfortable room.',
  },
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAddActivityToPlanner,
}) => {
  const { category, title, thresholdRule, suitabilityScore, examples } =
    recommendation;

  const theme =
    category === 'Outdoor'
      ? {
          icon: Sun,
          accentText: 'text-cyan-300',
          borderClass: 'border-cyan-400/25',
          glowBg:
            'bg-[radial-gradient(ellipse_70%_70%_at_90%_10%,rgba(34,211,238,0.14),transparent_65%)]',
          barColor: 'bg-gradient-to-r from-indigo-400 to-cyan-400',
          iconWrap: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
        }
      : category === 'Mixed'
        ? {
            icon: Compass,
            accentText: 'text-indigo-300',
            borderClass: 'border-indigo-400/25',
            glowBg:
              'bg-[radial-gradient(ellipse_70%_70%_at_90%_10%,rgba(129,140,248,0.16),transparent_65%)]',
            barColor: 'bg-gradient-to-r from-violet-400 to-indigo-400',
            iconWrap: 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300',
          }
        : {
            icon: Home,
            accentText: 'text-purple-300',
            borderClass: 'border-purple-400/25',
            glowBg:
              'bg-[radial-gradient(ellipse_70%_70%_at_90%_10%,rgba(168,85,247,0.16),transparent_65%)]',
            barColor: 'bg-gradient-to-r from-purple-500 to-indigo-400',
            iconWrap: 'border-purple-400/30 bg-purple-400/10 text-purple-300',
          };

  const CategoryIcon = theme.icon;
  const scorePct = Math.max(0, Math.min(100, suitabilityScore * 100));

  return (
    <section
      id="recommendations"
      aria-labelledby="recommendation-heading"
      className={`scroll-mt-8 rounded-2xl border ${theme.borderClass} bg-[#11142B]/80 backdrop-blur-md ${theme.glowBg} p-6 sm:p-7 shadow-[0_28px_60px_-28px_rgba(3,5,18,0.92)]`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <span>Activity Recommendation</span>
            <span aria-hidden="true">·</span>
            <span className={theme.accentText}>Rule: {thresholdRule}</span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border ${theme.iconWrap}`}
            >
              <CategoryIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="recommendation-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              >
                {title}
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Selected from combined suitability score S
              </p>
            </div>
          </div>
        </div>

        {/* Suitability Score & Threshold Scale */}
        <div className="w-full lg:w-80 shrink-0 rounded-xl border border-white/[0.08] bg-[#0B0D20]/90 p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-slate-400">
              Suitability Score (S)
            </span>
            <span className="font-mono text-4xl font-bold tracking-tight text-white tabular-nums">
              {suitabilityScore.toFixed(3)}
            </span>
          </div>

          <div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={`h-full transition-all duration-300 ${theme.barColor}`}
                style={{ width: `${scorePct}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-[#0B0D20]"
                style={{ left: '30%' }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-[#0B0D20]"
                style={{ left: '70%' }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-slate-400 tabular-nums">
              <span>0.00</span>
              <span>0.30</span>
              <span>0.70</span>
              <span>1.00</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/[0.07] pt-3 text-xs">
            <div
              className={`flex items-center justify-between ${
                category === 'Outdoor' ? 'text-cyan-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Outdoor activities</span>
              <span className="font-mono tabular-nums">S ≥ 0.70</span>
            </div>
            <div
              className={`flex items-center justify-between ${
                category === 'Mixed' ? 'text-indigo-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Mixed activities</span>
              <span className="font-mono tabular-nums">0.30 ≤ S &lt; 0.70</span>
            </div>
            <div
              className={`flex items-center justify-between ${
                category === 'Indoor' ? 'text-purple-300 font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Indoor activities</span>
              <span className="font-mono tabular-nums">S &lt; 0.30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Suggested Activity Cards */}
      <div className="mt-7 border-t border-white/[0.07] pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white">
            Suggested Activities
          </h3>
          <span className="text-xs text-slate-400">
            Click any card action to add directly to your planner
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {examples.map((activity) => {
            const meta = ACTIVITY_DETAILS[activity] ?? {
              icon: Compass,
              subtitle: 'Recommended activity aligned with current suitability.',
            };
            const ActivityIcon = meta.icon;

            return (
              <div
                key={activity}
                className="flex flex-col justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#0D0F22]/90 p-4 transition-colors duration-150 hover:border-indigo-400/40"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.iconWrap}`}
                  >
                    <ActivityIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white">
                      {activity}
                    </h4>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {meta.subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAddActivityToPlanner(activity)}
                  className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-150 hover:border-cyan-400/40 hover:bg-indigo-500/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                  <span>Add to Planner</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

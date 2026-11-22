import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  ListTodo,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  ActivityRecommendation,
  RecommendationCategory,
} from '../utils/weatherModel';

export interface PlannerItem {
  id: string;
  text: string;
  completed: boolean;
  category: RecommendationCategory;
  suitabilityScore: number;
}

interface PlannerProps {
  recommendation: ActivityRecommendation;
  items: PlannerItem[];
  onAddActivity: (text: string) => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onLoadSuggested: () => void;
  onClearCompleted: () => void;
}

export const Planner: React.FC<PlannerProps> = ({
  recommendation,
  items,
  onAddActivity,
  onToggleItem,
  onRemoveItem,
  onLoadSuggested,
  onClearCompleted,
}) => {
  const [newActivity, setNewActivity] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const completedCount = items.filter((item) => item.completed).length;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newActivity.trim();
    if (!trimmed) {
      setInputError('Please enter an activity name before adding.');
      return;
    }
    if (trimmed.length > 100) {
      setInputError('Activity name must be 100 characters or fewer.');
      return;
    }
    onAddActivity(trimmed);
    setNewActivity('');
    setInputError(null);
  };

  const categoryTextColor = (category: RecommendationCategory): string => {
    if (category === 'Outdoor') return 'text-cyan-300';
    if (category === 'Mixed') return 'text-indigo-300';
    return 'text-purple-300';
  };

  return (
    <section
      id="planner"
      aria-labelledby="planner-heading"
      className="scroll-mt-8 rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 sm:p-7 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)] space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.07] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300">
              <ListTodo className="h-4 w-4" aria-hidden="true" />
            </span>
            <h2
              id="planner-heading"
              className="text-lg font-semibold tracking-tight text-white"
            >
              Activity Planner
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Organize activities based on the current{' '}
            <span className="font-medium text-slate-200">
              {recommendation.title}
            </span>{' '}
            recommendation (
            <span className="font-mono text-cyan-300 tabular-nums">
              S = {recommendation.suitabilityScore.toFixed(3)}
            </span>
            ).
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400 tabular-nums">
          <span>
            {completedCount}/{items.length} completed
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 rounded"
            >
              Clear Completed
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <form
          onSubmit={handleFormSubmit}
          noValidate
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <label htmlFor="planner-activity-input" className="sr-only">
              Activity name
            </label>
            <input
              id="planner-activity-input"
              type="text"
              value={newActivity}
              onChange={(e) => {
                setNewActivity(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={`Add a custom activity (e.g. ${recommendation.examples[0] ?? 'Evening walk'})`}
              aria-invalid={inputError !== null}
              aria-describedby={inputError ? 'planner-input-error' : undefined}
              className={`w-full min-h-11 rounded-xl border bg-[#0B0D20] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-2 ${
                inputError
                  ? 'border-rose-500/80 focus:ring-rose-500/30'
                  : 'border-white/10 focus:border-cyan-400 focus:ring-cyan-400/20'
              }`}
            />
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 shadow-[0_10px_24px_-10px_rgba(56,189,248,0.5)] transition-all duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Activity</span>
          </button>
        </form>

        {inputError && (
          <p
            id="planner-input-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs text-rose-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{inputError}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 mr-1">
            Quick add ({recommendation.category}):
          </span>
          {recommendation.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                onAddActivity(example);
                setInputError(null);
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0D20] px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-indigo-400/40 hover:bg-indigo-500/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
            >
              <Plus className="h-3 w-3 text-cyan-300" aria-hidden="true" />
              <span>{example}</span>
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-[#0B0D20]/70 px-5 py-8 text-center space-y-3">
          <p className="text-sm font-medium text-slate-200">
            No activities planned yet
          </p>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-400">
            Add a custom activity above, click any suggested activity card, or
            load all recommendations for the current weather conditions.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onLoadSuggested}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-indigo-400/35 bg-indigo-500/15 px-4 py-2 text-xs font-semibold text-indigo-200 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-indigo-500/25 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Load {recommendation.category} Suggestions</span>
            </button>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-4 last:pb-1"
            >
              <button
                type="button"
                onClick={() => onToggleItem(item.id)}
                aria-pressed={item.completed}
                aria-label={`Mark "${item.text}" as ${
                  item.completed ? 'incomplete' : 'completed'
                }`}
                className="group flex min-h-10 flex-1 items-center gap-3.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 rounded"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    item.completed
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                      : 'border-white/20 bg-[#0B0D20] text-transparent group-hover:border-indigo-400'
                  }`}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-sm font-medium transition-colors truncate ${
                      item.completed
                        ? 'text-slate-500 line-through'
                        : 'text-slate-100 group-hover:text-white'
                    }`}
                  >
                    {item.text}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums">
                    <span className={categoryTextColor(item.category)}>
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>S = {item.suitabilityScore.toFixed(3)}</span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.text}`}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors duration-150 hover:bg-rose-500/15 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

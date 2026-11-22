import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Legend,
} from 'recharts';
import {
  SuitabilityMetrics,
  EquilibriumResult,
  generateTemperatureSweep,
  generateRainfallSweep,
  generateSuitabilityEquilibriumSweep,
} from '../utils/weatherModel';

interface DynamicChartsProps {
  metrics: SuitabilityMetrics;
  equilibriumResult: EquilibriumResult;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  xLabelFormatter?: (label: string | number) => string;
  valueFormatter?: (val: number, name: string) => string;
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  xLabelFormatter,
  valueFormatter,
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/15 bg-[#0D0F24]/95 px-3.5 py-2.5 shadow-2xl backdrop-blur-md">
      {label !== undefined && (
        <div className="mb-1.5 border-b border-white/[0.08] pb-1 font-mono text-xs font-medium text-slate-300 tabular-nums">
          {xLabelFormatter ? xLabelFormatter(label) : String(label)}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((entry, idx) => {
          const numericVal =
            typeof entry.value === 'number' ? entry.value : Number(entry.value);
          const name = entry.name ?? String(entry.dataKey ?? '');
          return (
            <div
              key={`${name}-${idx}`}
              className="flex items-center justify-between gap-5 font-mono text-xs tabular-nums"
            >
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color || '#22D3EE' }}
                />
                <span>{name}</span>
              </span>
              <span className="font-semibold text-white">
                {Number.isFinite(numericVal)
                  ? valueFormatter
                    ? valueFormatter(numericVal, name)
                    : numericVal.toFixed(3)
                  : String(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DynamicCharts: React.FC<DynamicChartsProps> = ({
  metrics,
  equilibriumResult,
}) => {
  const [eqAxisMode, setEqAxisMode] = useState<'temperature' | 'suitability'>(
    'temperature'
  );
  const [stateChartMode, setStateChartMode] = useState<
    'bars' | 'donut' | 'trajectory'
  >('bars');

  const tempSweep = useMemo(
    () => generateTemperatureSweep(metrics.rainfall),
    [metrics.rainfall]
  );

  const rainSweep = useMemo(
    () => generateRainfallSweep(metrics.temperature),
    [metrics.temperature]
  );

  const suitabilityEqSweep = useMemo(
    () => generateSuitabilityEquilibriumSweep(),
    []
  );

  const stateBarData = useMemo(
    () => [
      {
        state: 'Outdoor (O*)',
        percentage: Number((equilibriumResult.equilibrium.O * 100).toFixed(2)),
        color: '#22D3EE',
        gradientId: 'barGradOutdoor',
      },
      {
        state: 'Indoor (I*)',
        percentage: Number((equilibriumResult.equilibrium.I * 100).toFixed(2)),
        color: '#A855F7',
        gradientId: 'barGradIndoor',
      },
      {
        state: 'Neutral (N*)',
        percentage: Number((equilibriumResult.equilibrium.N * 100).toFixed(2)),
        color: '#6366F1',
        gradientId: 'barGradNeutral',
      },
    ],
    [equilibriumResult.equilibrium]
  );

  const isTempInChartBounds =
    metrics.temperature >= -10 && metrics.temperature <= 45;
  const isRainInChartBounds = metrics.rainfall >= 0 && metrics.rainfall <= 25;

  const axisTickStyle = {
    fill: '#94A3B8',
    fontSize: 11,
    fontFamily: 'IBM Plex Mono',
  };

  return (
    <section
      id="analytics"
      aria-labelledby="analytics-heading"
      className="scroll-mt-8 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2
            id="analytics-heading"
            className="text-xl font-bold tracking-tight text-white"
          >
            Suitability &amp; Equilibrium Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Curves dynamically anchored at{' '}
            <span className="font-mono text-slate-200 tabular-nums">
              {metrics.temperature.toFixed(1)}°C
            </span>{' '}
            and{' '}
            <span className="font-mono text-slate-200 tabular-nums">
              {metrics.rainfall.toFixed(1)} mm
            </span>
            .
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Temperature vs Combined Suitability */}
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)]">
          <div className="mb-4 flex flex-col gap-1">
            <h3 className="text-base font-semibold text-white">
              Temperature vs Combined Suitability
            </h3>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              Fixed R = {metrics.rainfall.toFixed(1)} mm · Active S ={' '}
              {metrics.combinedSuitability.toFixed(3)} at{' '}
              {metrics.temperature.toFixed(1)}°C
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={tempSweep}
                margin={{ top: 14, right: 20, left: 6, bottom: 26 }}
              >
                <defs>
                  <linearGradient id="tempSuitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="tempStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="50%" stopColor="#22D3EE" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="temperature"
                  type="number"
                  domain={[-10, 45]}
                  tickCount={7}
                  tick={axisTickStyle}
                  stroke="rgba(255,255,255,0.14)"
                  tickFormatter={(v) => `${v}°`}
                  label={{
                    value: 'Temperature (°C)',
                    position: 'insideBottom',
                    offset: -14,
                    fill: '#94A3B8',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  domain={[0, 1]}
                  tickCount={6}
                  tick={axisTickStyle}
                  stroke="rgba(255,255,255,0.14)"
                  tickFormatter={(v) => Number(v).toFixed(1)}
                  label={{
                    value: 'Suitability S',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 4,
                    fill: '#94A3B8',
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      xLabelFormatter={(lbl) => `Temperature: ${lbl}°C`}
                      valueFormatter={(val) => val.toFixed(3)}
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                />
                <ReferenceLine
                  y={0.7}
                  stroke="#22D3EE"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <ReferenceLine
                  y={0.3}
                  stroke="#A855F7"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <Line
                  type="monotone"
                  dataKey="temperatureSuitability"
                  name="Thermal Baseline S_T(T)"
                  stroke="#64748B"
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="combinedSuitability"
                  name={`Combined S (R=${metrics.rainfall.toFixed(1)} mm)`}
                  stroke="url(#tempStrokeGrad)"
                  strokeWidth={2.75}
                  fill="url(#tempSuitGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22D3EE', stroke: '#090A1A', strokeWidth: 2 }}
                />
                {isTempInChartBounds && (
                  <ReferenceLine
                    x={metrics.temperature}
                    stroke="#22D3EE"
                    strokeOpacity={0.55}
                    strokeDasharray="3 3"
                  />
                )}
                {isTempInChartBounds && (
                  <ReferenceDot
                    x={metrics.temperature}
                    y={metrics.combinedSuitability}
                    r={6}
                    fill="#22D3EE"
                    stroke="#090A1A"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 2. Rainfall vs Combined Suitability */}
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)]">
          <div className="mb-4 flex flex-col gap-1">
            <h3 className="text-base font-semibold text-white">
              Rainfall vs Combined Suitability
            </h3>
            <p className="text-xs text-slate-400 font-mono tabular-nums">
              Fixed T = {metrics.temperature.toFixed(1)}°C · Active S ={' '}
              {metrics.combinedSuitability.toFixed(3)} at{' '}
              {metrics.rainfall.toFixed(1)} mm
            </p>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={rainSweep}
                margin={{ top: 14, right: 20, left: 6, bottom: 26 }}
              >
                <defs>
                  <linearGradient id="rainSuitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="rainfall"
                  type="number"
                  domain={[0, 25]}
                  tickCount={6}
                  tick={axisTickStyle}
                  stroke="rgba(255,255,255,0.14)"
                  tickFormatter={(v) => `${v}`}
                  label={{
                    value: 'Rainfall (mm)',
                    position: 'insideBottom',
                    offset: -14,
                    fill: '#94A3B8',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  domain={[0, 1]}
                  tickCount={6}
                  tick={axisTickStyle}
                  stroke="rgba(255,255,255,0.14)"
                  tickFormatter={(v) => Number(v).toFixed(1)}
                  label={{
                    value: 'Suitability S',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 4,
                    fill: '#94A3B8',
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  content={
                    <ChartTooltip
                      xLabelFormatter={(lbl) => `Rainfall: ${lbl} mm`}
                      valueFormatter={(val) => val.toFixed(3)}
                    />
                  }
                />
                <Legend
                  verticalAlign="top"
                  height={32}
                  wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                />
                <ReferenceLine
                  y={0.7}
                  stroke="#22D3EE"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <ReferenceLine
                  y={0.3}
                  stroke="#A855F7"
                  strokeDasharray="4 4"
                  strokeOpacity={0.35}
                />
                <Line
                  type="monotone"
                  dataKey="rainfallSuitability"
                  name="Rainfall Baseline S_R(R)"
                  stroke="#64748B"
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="combinedSuitability"
                  name={`Combined S (T=${metrics.temperature.toFixed(1)}°C)`}
                  stroke="#22D3EE"
                  strokeWidth={2.75}
                  fill="url(#rainSuitGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#22D3EE', stroke: '#090A1A', strokeWidth: 2 }}
                />
                {isRainInChartBounds && (
                  <ReferenceLine
                    x={metrics.rainfall}
                    stroke="#22D3EE"
                    strokeOpacity={0.55}
                    strokeDasharray="3 3"
                  />
                )}
                {isRainInChartBounds && (
                  <ReferenceDot
                    x={metrics.rainfall}
                    y={metrics.combinedSuitability}
                    r={6}
                    fill="#22D3EE"
                    stroke="#090A1A"
                    strokeWidth={2}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* 3. Outdoor vs Indoor Equilibrium Distribution */}
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                Outdoor vs Indoor Equilibrium
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 font-mono tabular-nums">
                {eqAxisMode === 'temperature'
                  ? `Sweeping Temperature at R = ${metrics.rainfall.toFixed(1)} mm`
                  : `Sweeping Combined Suitability S ∈ [0, 1]`}
              </p>
            </div>

            <div
              role="group"
              aria-label="Equilibrium sweep axis"
              className="inline-flex rounded-xl border border-white/10 bg-[#0B0D20] p-1 self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => setEqAxisMode('temperature')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  eqAxisMode === 'temperature'
                    ? 'bg-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Temp (°C)
              </button>
              <button
                type="button"
                onClick={() => setEqAxisMode('suitability')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  eqAxisMode === 'suitability'
                    ? 'bg-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                By Suitability (S)
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {eqAxisMode === 'temperature' ? (
                <LineChart
                  data={tempSweep}
                  margin={{ top: 14, right: 20, left: 6, bottom: 26 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="temperature"
                    type="number"
                    domain={[-10, 45]}
                    tickCount={7}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}°`}
                    label={{
                      value: 'Temperature (°C)',
                      position: 'insideBottom',
                      offset: -14,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickCount={6}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: 'Equilibrium Share (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 4,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        xLabelFormatter={(lbl) => `Temperature: ${lbl}°C`}
                        valueFormatter={(val) => `${val.toFixed(2)}%`}
                      />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outdoorPct"
                    name="Outdoor (O*)"
                    stroke="#22D3EE"
                    strokeWidth={2.75}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="indoorPct"
                    name="Indoor (I*)"
                    stroke="#A855F7"
                    strokeWidth={2.75}
                    dot={false}
                  />
                  {isTempInChartBounds && (
                    <ReferenceLine
                      x={metrics.temperature}
                      stroke="#94A3B8"
                      strokeDasharray="3 3"
                    />
                  )}
                  {isTempInChartBounds && (
                    <ReferenceDot
                      x={metrics.temperature}
                      y={Number((equilibriumResult.equilibrium.O * 100).toFixed(2))}
                      r={5}
                      fill="#22D3EE"
                      stroke="#090A1A"
                      strokeWidth={2}
                    />
                  )}
                  {isTempInChartBounds && (
                    <ReferenceDot
                      x={metrics.temperature}
                      y={Number((equilibriumResult.equilibrium.I * 100).toFixed(2))}
                      r={5}
                      fill="#A855F7"
                      stroke="#090A1A"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              ) : (
                <LineChart
                  data={suitabilityEqSweep}
                  margin={{ top: 14, right: 20, left: 6, bottom: 26 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="suitability"
                    type="number"
                    domain={[0, 1]}
                    tickCount={6}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => Number(v).toFixed(1)}
                    label={{
                      value: 'Combined Suitability (S)',
                      position: 'insideBottom',
                      offset: -14,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickCount={6}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: 'Equilibrium Share (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 4,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        xLabelFormatter={(lbl) =>
                          `Suitability S: ${Number(lbl).toFixed(3)}`
                        }
                        valueFormatter={(val) => `${val.toFixed(2)}%`}
                      />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outdoorPct"
                    name="Outdoor (O*)"
                    stroke="#22D3EE"
                    strokeWidth={2.75}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="indoorPct"
                    name="Indoor (I*)"
                    stroke="#A855F7"
                    strokeWidth={2.75}
                    dot={false}
                  />
                  <ReferenceLine
                    x={metrics.combinedSuitability}
                    stroke="#94A3B8"
                    strokeDasharray="3 3"
                  />
                  <ReferenceDot
                    x={metrics.combinedSuitability}
                    y={Number((equilibriumResult.equilibrium.O * 100).toFixed(2))}
                    r={5}
                    fill="#22D3EE"
                    stroke="#090A1A"
                    strokeWidth={2}
                  />
                  <ReferenceDot
                    x={metrics.combinedSuitability}
                    y={Number((equilibriumResult.equilibrium.I * 100).toFixed(2))}
                    r={5}
                    fill="#A855F7"
                    stroke="#090A1A"
                    strokeWidth={2}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </article>

        {/* 4. State Distribution Chart (O, I, N) with Rounded Bars, Donut Ring, and ODE Trajectory */}
        <article className="rounded-2xl border border-white/[0.08] bg-[#11142B]/80 backdrop-blur-md p-6 shadow-[0_24px_55px_-26px_rgba(3,5,18,0.9)]">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                State Distribution (O, I, N)
              </h3>
              <p className="mt-0.5 text-xs text-slate-400 font-mono tabular-nums">
                {stateChartMode === 'trajectory'
                  ? `RK4 trajectory from (0.30, 0.40, 0.30) over t ∈ [0, 30]`
                  : `Steady-state distribution at S = ${metrics.combinedSuitability.toFixed(3)}`}
              </p>
            </div>

            <div
              role="group"
              aria-label="State chart view mode"
              className="inline-flex rounded-xl border border-white/10 bg-[#0B0D20] p-1 self-start sm:self-auto"
            >
              <button
                type="button"
                onClick={() => setStateChartMode('bars')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  stateChartMode === 'bars'
                    ? 'bg-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bars
              </button>
              <button
                type="button"
                onClick={() => setStateChartMode('donut')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  stateChartMode === 'donut'
                    ? 'bg-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Ring
              </button>
              <button
                type="button"
                onClick={() => setStateChartMode('trajectory')}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  stateChartMode === 'trajectory'
                    ? 'bg-indigo-500/30 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trajectory
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {stateChartMode === 'bars' ? (
                <BarChart
                  data={stateBarData}
                  margin={{ top: 20, right: 20, left: 6, bottom: 26 }}
                >
                  <defs>
                    <linearGradient id="barGradOutdoor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                    <linearGradient id="barGradIndoor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C084FC" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                    <linearGradient id="barGradNeutral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818CF8" />
                      <stop offset="100%" stopColor="#312E81" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="state"
                    tick={{ fill: '#CBD5E1', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
                    stroke="rgba(255,255,255,0.14)"
                    label={{
                      value: 'Equilibrium State',
                      position: 'insideBottom',
                      offset: -14,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickCount={6}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: 'State Share (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 4,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    content={
                      <ChartTooltip
                        valueFormatter={(val) => `${val.toFixed(2)}%`}
                      />
                    }
                  />
                  <Bar
                    dataKey="percentage"
                    name="Equilibrium Share"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={72}
                  >
                    {stateBarData.map((entry) => (
                      <Cell
                        key={entry.state}
                        fill={`url(#${entry.gradientId})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : stateChartMode === 'donut' ? (
                <PieChart>
                  <Tooltip
                    content={
                      <ChartTooltip
                        valueFormatter={(val) => `${val.toFixed(2)}%`}
                      />
                    }
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                  />
                  <Pie
                    data={stateBarData}
                    dataKey="percentage"
                    nameKey="state"
                    cx="50%"
                    cy="46%"
                    innerRadius={64}
                    outerRadius={98}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {stateBarData.map((entry) => (
                      <Cell key={entry.state} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <LineChart
                  data={equilibriumResult.trajectory}
                  margin={{ top: 14, right: 20, left: 6, bottom: 26 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    type="number"
                    domain={[0, 30]}
                    tickCount={7}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}`}
                    label={{
                      value: 'Integration Time (t)',
                      position: 'insideBottom',
                      offset: -14,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickCount={6}
                    tick={axisTickStyle}
                    stroke="rgba(255,255,255,0.14)"
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: 'State Share (%)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 4,
                      fill: '#94A3B8',
                      fontSize: 11,
                    }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        xLabelFormatter={(lbl) => `Time t = ${lbl}`}
                        valueFormatter={(val) => `${val.toFixed(2)}%`}
                      />
                    }
                  />
                  <Legend
                    verticalAlign="top"
                    height={32}
                    wrapperStyle={{ fontSize: '12px', color: '#CBD5E1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="outdoorPct"
                    name="Outdoor O(t)"
                    stroke="#22D3EE"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="indoorPct"
                    name="Indoor I(t)"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutralPct"
                    name="Neutral N(t)"
                    stroke="#6366F1"
                    strokeWidth={2.2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
};

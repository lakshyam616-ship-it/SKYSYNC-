/**
 * SkySync Mathematical Weather-Activity Model
 * -------------------------------------------
 * Isolated, reusable calculation module implementing:
 *  1. Gaussian thermal suitability S_T(T) and exponential rainfall suitability S_R(R)
 *  2. Combined suitability S = S_T(T) * S_R(R) and complement q = 1 - S
 *  3. Three-state differential equations for Outdoor (O), Indoor (I), and Neutral (N)
 *  4. 4th-Order Runge-Kutta (RK4) numerical solver to equilibrium
 *  5. Provisional activity recommendation thresholds
 *  6. Dynamic sweep series generators for Recharts visualizations
 *
 * NOTE: Parameters, suitability functions, and recommendation thresholds are
 * illustrative assumptions and have not yet been empirically calibrated or validated.
 */

export interface ModelParameters {
  /** Transition rate N -> O scaled by suitability S */
  a: number;
  /** Transition rate N -> I scaled by unsuitability q */
  b: number;
  /** Transition rate O -> I scaled by unsuitability q */
  c: number;
  /** Baseline relaxation rate O -> N */
  d: number;
  /** Transition rate I -> O scaled by suitability S */
  e: number;
  /** Baseline relaxation rate I -> N */
  f: number;
}

export interface StateVector {
  /** Outdoor activity state fraction [0, 1] */
  O: number;
  /** Indoor activity state fraction [0, 1] */
  I: number;
  /** Neutral / no-activity state fraction [0, 1] */
  N: number;
}

export interface SuitabilityMetrics {
  temperature: number;
  rainfall: number;
  /** Temperature suitability: exp(-((T - 25) / 10)^2) */
  temperatureSuitability: number;
  /** Rainfall suitability: exp(-R / 5) */
  rainfallSuitability: number;
  /** Combined suitability: S = S_T(T) * S_R(R) */
  combinedSuitability: number;
  /** Unsuitability / adverse weather factor: q = 1 - S */
  unsuitability: number;
}

export interface TrajectoryPoint {
  time: number;
  O: number;
  I: number;
  N: number;
  outdoorPct: number;
  indoorPct: number;
  neutralPct: number;
}

export interface EquilibriumResult {
  equilibrium: StateVector;
  conservationSum: number;
  conservationError: number;
  iterations: number;
  converged: boolean;
  maxResidual: number;
  trajectory: TrajectoryPoint[];
}

export type RecommendationCategory = 'Outdoor' | 'Mixed' | 'Indoor';

export interface ActivityRecommendation {
  category: RecommendationCategory;
  title: string;
  thresholdRule: string;
  suitabilityScore: number;
  examples: string[];
  explanation: string;
}

export interface ValidationResult {
  isValid: boolean;
  temperature: number | null;
  rainfall: number | null;
  temperatureError: string | null;
  rainfallError: string | null;
}

export interface WeatherScenario {
  id: string;
  label: string;
  temperature: number;
  rainfall: number;
  description: string;
}

/**
 * Fixed illustrative ODE transition parameters specified by the model.
 */
export const MODEL_PARAMS: Readonly<ModelParameters> = {
  a: 0.40,
  b: 0.30,
  c: 0.25,
  d: 0.10,
  e: 0.20,
  f: 0.15,
};

/**
 * Initial state distribution at t = 0: O = 0.30, I = 0.40, N = 0.30.
 * Sum strictly equals 1.00.
 */
export const INITIAL_STATE: Readonly<StateVector> = {
  O: 0.30,
  I: 0.40,
  N: 0.30,
};

/**
 * Provisional suitability thresholds for the recommendation engine.
 */
export const RECOMMENDATION_THRESHOLDS = {
  OUTDOOR_MIN: 0.70,
  MIXED_MIN: 0.30,
} as const;

/**
 * Physical validation bounds for user inputs.
 * Rainfall cannot be negative; temperature is bounded to realistic Earth surface extremes.
 */
export const INPUT_BOUNDS = {
  TEMP_MIN: -50,
  TEMP_MAX: 60,
  RAIN_MIN: 0,
  RAIN_MAX: 300,
} as const;

/**
 * Sensible example scenarios spanning Outdoor, Mixed, and Indoor regimes.
 */
export const EXAMPLE_SCENARIOS: readonly WeatherScenario[] = [
  {
    id: 'optimal-clear',
    label: 'Optimal Clear Day',
    temperature: 25,
    rainfall: 0,
    description: 'Peak thermal comfort with zero precipitation (S = 1.000)',
  },
  {
    id: 'mild-breeze',
    label: 'Mild Dry Weather',
    temperature: 21,
    rainfall: 0.5,
    description: 'Pleasant warmth with trace moisture (Outdoor regime)',
  },
  {
    id: 'light-drizzle',
    label: 'Cool & Light Drizzle',
    temperature: 17,
    rainfall: 2.2,
    description: 'Moderate thermal dip and light rain (Mixed regime)',
  },
  {
    id: 'heavy-rain',
    label: 'Cold & Heavy Rain',
    temperature: 11,
    rainfall: 9.0,
    description: 'Low thermal comfort and sustained rainfall (Indoor regime)',
  },
];

/**
 * Validates raw string inputs for temperature (°C) and rainfall (mm).
 * Rejects empty strings, NaN, Infinity, non-numeric entries, negative rainfall,
 * and physically unrealistic extremes.
 */
export function validateWeatherInputs(
  tempRaw: string,
  rainRaw: string
): ValidationResult {
  const trimmedTemp = tempRaw.trim();
  const trimmedRain = rainRaw.trim();

  let temperatureError: string | null = null;
  let rainfallError: string | null = null;
  let temperature: number | null = null;
  let rainfall: number | null = null;

  if (trimmedTemp === '') {
    temperatureError = 'Please enter a temperature in °C.';
  } else {
    const parsedTemp = Number(trimmedTemp);
    if (!Number.isFinite(parsedTemp)) {
      temperatureError = 'Temperature must be a valid number.';
    } else if (
      parsedTemp < INPUT_BOUNDS.TEMP_MIN ||
      parsedTemp > INPUT_BOUNDS.TEMP_MAX
    ) {
      temperatureError = `Temperature must be between ${INPUT_BOUNDS.TEMP_MIN}°C and ${INPUT_BOUNDS.TEMP_MAX}°C.`;
    } else {
      temperature = parsedTemp;
    }
  }

  if (trimmedRain === '') {
    rainfallError = 'Please enter a rainfall amount in mm.';
  } else {
    const parsedRain = Number(trimmedRain);
    if (!Number.isFinite(parsedRain)) {
      rainfallError = 'Rainfall must be a valid number.';
    } else if (parsedRain < INPUT_BOUNDS.RAIN_MIN) {
      rainfallError = 'Rainfall cannot be negative (must be 0 mm or greater).';
    } else if (parsedRain > INPUT_BOUNDS.RAIN_MAX) {
      rainfallError = `Rainfall cannot exceed ${INPUT_BOUNDS.RAIN_MAX} mm for this model.`;
    } else {
      rainfall = parsedRain;
    }
  }

  return {
    isValid: temperatureError === null && rainfallError === null,
    temperature,
    rainfall,
    temperatureError,
    rainfallError,
  };
}

/**
 * Computes temperature suitability using a Gaussian bell curve centered at 25°C
 * with characteristic width 10°C:
 *   S_T(T) = exp(-((T - 25) / 10)^2)
 */
export function computeTemperatureSuitability(temperatureC: number): number {
  const normalizedDelta = (temperatureC - 25) / 10;
  return Math.exp(-(normalizedDelta * normalizedDelta));
}

/**
 * Computes rainfall suitability using exponential decay with scale parameter 5 mm:
 *   S_R(R) = exp(-R / 5)
 * Clamped to R >= 0 for safety.
 */
export function computeRainfallSuitability(rainfallMm: number): number {
  const safeRain = Math.max(0, rainfallMm);
  return Math.exp(-safeRain / 5);
}

/**
 * Computes all suitability metrics from validated temperature (°C) and rainfall (mm).
 *   S = S_T(T) * S_R(R)
 *   q = 1 - S
 */
export function computeSuitabilityMetrics(
  temperatureC: number,
  rainfallMm: number
): SuitabilityMetrics {
  const temperatureSuitability = computeTemperatureSuitability(temperatureC);
  const rainfallSuitability = computeRainfallSuitability(rainfallMm);
  const combinedSuitability = temperatureSuitability * rainfallSuitability;
  const unsuitability = 1 - combinedSuitability;

  return {
    temperature: temperatureC,
    rainfall: rainfallMm,
    temperatureSuitability,
    rainfallSuitability,
    combinedSuitability,
    unsuitability,
  };
}

/**
 * Evaluates the right-hand side of the three-state compartmental ODE system:
 *   dO/dt = a*S*N + e*S*I - c*q*O - d*O
 *   dI/dt = b*q*N + c*q*O - e*S*I - f*I
 *   dN/dt = d*O + f*I - (a*S + b*q)*N
 *
 * Notice that dO/dt + dI/dt + dN/dt = 0 identically, preserving O + I + N = 1.
 */
export function computeOdeDerivatives(
  state: StateVector,
  suitabilityS: number,
  params: ModelParameters = MODEL_PARAMS
): StateVector {
  const S = suitabilityS;
  const q = 1 - S;
  const { a, b, c, d, e, f } = params;
  const { O, I, N } = state;

  const dO = a * S * N + e * S * I - c * q * O - d * O;
  const dI = b * q * N + c * q * O - e * S * I - f * I;
  const dN = d * O + f * I - (a * S + b * q) * N;

  return { O: dO, I: dI, N: dN };
}

/**
 * Numerically integrates the three-state ODE system from INITIAL_STATE
 * (O=0.30, I=0.40, N=0.30) to steady-state equilibrium using the 4th-Order
 * Runge-Kutta (RK4) method.
 *
 * Step size dt = 0.05 provides high accuracy and unconditional numerical stability
 * for transition rates bounded below 1.0.
 */
export function solveEquilibriumRK4(
  suitabilityS: number,
  options?: {
    initialState?: StateVector;
    params?: ModelParameters;
    dt?: number;
    maxSteps?: number;
    tolerance?: number;
    recordHorizonTime?: number;
  }
): EquilibriumResult {
  const initial = options?.initialState ?? INITIAL_STATE;
  const params = options?.params ?? MODEL_PARAMS;
  const dt = options?.dt ?? 0.05;
  const maxSteps = options?.maxSteps ?? 4000;
  const tolerance = options?.tolerance ?? 1e-10;
  const recordHorizonTime = options?.recordHorizonTime ?? 30;

  let state: StateVector = { ...initial };
  let time = 0;
  let iterations = 0;
  let converged = false;
  let maxResidual = Infinity;

  const trajectory: TrajectoryPoint[] = [
    {
      time: 0,
      O: state.O,
      I: state.I,
      N: state.N,
      outdoorPct: Number((state.O * 100).toFixed(2)),
      indoorPct: Number((state.I * 100).toFixed(2)),
      neutralPct: Number((state.N * 100).toFixed(2)),
    },
  ];

  // Sample trajectory at regular intervals up to recordHorizonTime for clean plotting
  const recordStepInterval = Math.max(1, Math.round(0.5 / dt));

  for (let step = 1; step <= maxSteps; step++) {
    const k1 = computeOdeDerivatives(state, suitabilityS, params);

    const k2 = computeOdeDerivatives(
      {
        O: state.O + 0.5 * dt * k1.O,
        I: state.I + 0.5 * dt * k1.I,
        N: state.N + 0.5 * dt * k1.N,
      },
      suitabilityS,
      params
    );

    const k3 = computeOdeDerivatives(
      {
        O: state.O + 0.5 * dt * k2.O,
        I: state.I + 0.5 * dt * k2.I,
        N: state.N + 0.5 * dt * k2.N,
      },
      suitabilityS,
      params
    );

    const k4 = computeOdeDerivatives(
      {
        O: state.O + dt * k3.O,
        I: state.I + dt * k3.I,
        N: state.N + dt * k3.N,
      },
      suitabilityS,
      params
    );

    state = {
      O: state.O + (dt / 6) * (k1.O + 2 * k2.O + 2 * k3.O + k4.O),
      I: state.I + (dt / 6) * (k1.I + 2 * k2.I + 2 * k3.I + k4.I),
      N: state.N + (dt / 6) * (k1.N + 2 * k2.N + 2 * k3.N + k4.N),
    };

    time = Number((step * dt).toFixed(4));
    iterations = step;

    if (time <= recordHorizonTime && step % recordStepInterval === 0) {
      trajectory.push({
        time: Number(time.toFixed(1)),
        O: state.O,
        I: state.I,
        N: state.N,
        outdoorPct: Number((state.O * 100).toFixed(2)),
        indoorPct: Number((state.I * 100).toFixed(2)),
        neutralPct: Number((state.N * 100).toFixed(2)),
      });
    }

    const derivatives = computeOdeDerivatives(state, suitabilityS, params);
    maxResidual = Math.max(
      Math.abs(derivatives.O),
      Math.abs(derivatives.I),
      Math.abs(derivatives.N)
    );

    if (maxResidual < tolerance && time >= recordHorizonTime) {
      converged = true;
      break;
    }

    if (maxResidual < tolerance) {
      converged = true;
    }
  }

  const conservationSum = state.O + state.I + state.N;
  const conservationError = Math.abs(conservationSum - 1);

  return {
    equilibrium: state,
    conservationSum,
    conservationError,
    iterations,
    converged,
    maxResidual,
    trajectory,
  };
}

/**
 * Classifies weather conditions into Outdoor, Mixed, or Indoor recommendations
 * using the exact provisional thresholds:
 *   S >= 0.70        -> Outdoor activities
 *   0.30 <= S < 0.70 -> Mixed activities
 *   S < 0.30         -> Indoor activities
 */
export function getActivityRecommendation(
  metrics: SuitabilityMetrics,
  equilibrium: StateVector
): ActivityRecommendation {
  const {
    temperature,
    rainfall,
    temperatureSuitability,
    rainfallSuitability,
    combinedSuitability,
  } = metrics;

  const tempDelta = Math.abs(temperature - 25);
  const tempNote =
    tempDelta <= 3
      ? `near the 25°C thermal optimum (S_T = ${temperatureSuitability.toFixed(3)})`
      : temperature < 25
        ? `${tempDelta.toFixed(1)}°C cooler than the 25°C thermal optimum (S_T = ${temperatureSuitability.toFixed(3)})`
        : `${tempDelta.toFixed(1)}°C warmer than the 25°C thermal optimum (S_T = ${temperatureSuitability.toFixed(3)})`;

  const rainNote =
    rainfall === 0
      ? `no rainfall attenuation (S_R = 1.000)`
      : `${rainfall.toFixed(1)} mm rainfall attenuates suitability to S_R = ${rainfallSuitability.toFixed(3)}`;

  const oPct = (equilibrium.O * 100).toFixed(1);
  const iPct = (equilibrium.I * 100).toFixed(1);

  if (combinedSuitability >= RECOMMENDATION_THRESHOLDS.OUTDOOR_MIN) {
    return {
      category: 'Outdoor',
      title: 'Outdoor activities',
      thresholdRule: 'S ≥ 0.70',
      suitabilityScore: combinedSuitability,
      examples: ['Walking', 'Cycling', 'Outdoor sports'],
      explanation: `Combined suitability S = ${combinedSuitability.toFixed(3)} meets the S ≥ 0.70 threshold because temperature (${temperature}°C) is ${tempNote} and ${rainNote}. In steady state, Outdoor participation reaches ${oPct}% versus ${iPct}% Indoor.`,
    };
  }

  if (combinedSuitability >= RECOMMENDATION_THRESHOLDS.MIXED_MIN) {
    return {
      category: 'Mixed',
      title: 'Mixed activities',
      thresholdRule: '0.30 ≤ S < 0.70',
      suitabilityScore: combinedSuitability,
      examples: ['Indoor games', 'Light outdoor activities'],
      explanation: `Combined suitability S = ${combinedSuitability.toFixed(3)} falls within the transitional 0.30 ≤ S < 0.70 band: ${temperature}°C is ${tempNote}, while ${rainNote}. Equilibrium activity splits between Outdoor (${oPct}%) and Indoor (${iPct}%).`,
    };
  }

  return {
    category: 'Indoor',
    title: 'Indoor activities',
    thresholdRule: 'S < 0.30',
    suitabilityScore: combinedSuitability,
    examples: ['Reading', 'Indoor games', 'Creative activities'],
    explanation: `Combined suitability S = ${combinedSuitability.toFixed(3)} is below the 0.30 threshold because ${temperature}°C is ${tempNote} and ${rainNote}. Under high unsuitability (q = ${(1 - combinedSuitability).toFixed(3)}), equilibrium shifts strongly toward Indoor (${iPct}%) over Outdoor (${oPct}%).`,
  };
}

export interface TemperatureSweepPoint {
  temperature: number;
  combinedSuitability: number;
  temperatureSuitability: number;
  outdoorPct: number;
  indoorPct: number;
  neutralPct: number;
}

/**
 * Generates dynamic curve data across T in [-10, 45] °C holding current rainfall R constant.
 * Used for both Temperature vs Combined Suitability and Equilibrium vs Temperature charts.
 */
export function generateTemperatureSweep(
  fixedRainfallMm: number
): TemperatureSweepPoint[] {
  const points: TemperatureSweepPoint[] = [];
  const sr = computeRainfallSuitability(fixedRainfallMm);

  for (let t = -10; t <= 45; t += 1) {
    const st = computeTemperatureSuitability(t);
    const s = st * sr;
    const eq = solveEquilibriumRK4(s, {
      dt: 0.1,
      maxSteps: 1000,
      tolerance: 1e-7,
      recordHorizonTime: 0,
    }).equilibrium;

    points.push({
      temperature: t,
      combinedSuitability: Number(s.toFixed(4)),
      temperatureSuitability: Number(st.toFixed(4)),
      outdoorPct: Number((eq.O * 100).toFixed(2)),
      indoorPct: Number((eq.I * 100).toFixed(2)),
      neutralPct: Number((eq.N * 100).toFixed(2)),
    });
  }

  return points;
}

export interface RainfallSweepPoint {
  rainfall: number;
  combinedSuitability: number;
  rainfallSuitability: number;
}

/**
 * Generates dynamic curve data across R in [0, 25] mm holding current temperature T constant.
 */
export function generateRainfallSweep(
  fixedTemperatureC: number
): RainfallSweepPoint[] {
  const points: RainfallSweepPoint[] = [];
  const st = computeTemperatureSuitability(fixedTemperatureC);

  for (let r = 0; r <= 25; r += 0.5) {
    const sr = computeRainfallSuitability(r);
    const s = st * sr;
    points.push({
      rainfall: Number(r.toFixed(1)),
      combinedSuitability: Number(s.toFixed(4)),
      rainfallSuitability: Number(sr.toFixed(4)),
    });
  }

  return points;
}

export interface SuitabilityEquilibriumPoint {
  suitability: number;
  outdoorPct: number;
  indoorPct: number;
  neutralPct: number;
}

/**
 * Generates the fundamental equilibrium phase curves O*(S), I*(S), N*(S)
 * across combined suitability S in [0, 1].
 */
export function generateSuitabilityEquilibriumSweep(): SuitabilityEquilibriumPoint[] {
  const points: SuitabilityEquilibriumPoint[] = [];

  for (let idx = 0; idx <= 40; idx++) {
    const s = Number((idx * 0.025).toFixed(3));
    const eq = solveEquilibriumRK4(s, {
      dt: 0.1,
      maxSteps: 1000,
      tolerance: 1e-7,
      recordHorizonTime: 0,
    }).equilibrium;

    points.push({
      suitability: s,
      outdoorPct: Number((eq.O * 100).toFixed(2)),
      indoorPct: Number((eq.I * 100).toFixed(2)),
      neutralPct: Number((eq.N * 100).toFixed(2)),
    });
  }

  return points;
}

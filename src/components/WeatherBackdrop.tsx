import React from 'react';

export type WeatherAtmosphere = 'sunny' | 'rainy' | 'winter' | 'normal';
export type SnowIntensity = 'none' | 'mild' | 'moderate' | 'clear';

/**
 * Classifies the ambient sky mood strictly from the two model inputs:
 *  - Winter: Temperature < 15 °C (with Rainfall < 4 mm; heavier rain shows wintry rain)
 *  - Rainy:  Rainfall >= 1.5 mm (when >= 15 °C) or Rainfall >= 4 mm
 *  - Sunny:  Rainfall < 0.5 mm and Temperature >= 20 °C
 *  - Normal: Transitional / mild conditions otherwise
 */
export function classifyWeatherAtmosphere(
  temperatureC: number,
  rainfallMm: number
): WeatherAtmosphere {
  if (temperatureC < 15 && rainfallMm < 4) {
    return 'winter';
  }
  if (rainfallMm >= 1.5) {
    return 'rainy';
  }
  if (rainfallMm < 0.5 && temperatureC >= 20) {
    return 'sunny';
  }
  return 'normal';
}

/**
 * Progressive snow intensity when Temperature < 15 °C:
 *  - 11 <= T < 15 °C : 'mild'     (light flurries)
 *  -  8 <= T < 11 °C : 'moderate' (steady winter snow)
 *  -       T <  8 °C : 'clear'    (clearly snowing at 6–7 °C and below)
 */
export function getSnowIntensity(temperatureC: number): SnowIntensity {
  if (temperatureC >= 15) return 'none';
  if (temperatureC >= 11) return 'mild';
  if (temperatureC >= 8) return 'moderate';
  return 'clear';
}

export function getAtmosphereLabel(
  atmosphere: WeatherAtmosphere,
  temperatureC: number
): string {
  const snow = getSnowIntensity(temperatureC);
  if (atmosphere === 'winter') {
    if (snow === 'mild') return 'Winter · Mild Snow';
    if (snow === 'moderate') return 'Winter · Snowing';
    return 'Winter · Clear Snow';
  }
  if (atmosphere === 'rainy') {
    return snow !== 'none' ? 'Wintry Rain' : 'Rainy Sky';
  }
  if (atmosphere === 'sunny') return 'Sunny Sky';
  return 'Normal Sky';
}

interface WeatherBackdropProps {
  atmosphere: WeatherAtmosphere;
  temperature: number;
}

const RAIN_STREAKS: ReadonlyArray<{
  left: string;
  delay: string;
  duration: string;
  opacity: number;
  height: string;
}> = [
  { left: '3%', delay: '0s', duration: '1.4s', opacity: 0.36, height: '96px' },
  { left: '8%', delay: '0.5s', duration: '1.7s', opacity: 0.25, height: '80px' },
  { left: '12%', delay: '1.1s', duration: '1.3s', opacity: 0.42, height: '110px' },
  { left: '17%', delay: '0.2s', duration: '1.6s', opacity: 0.30, height: '88px' },
  { left: '22%', delay: '0.8s', duration: '1.45s', opacity: 0.38, height: '104px' },
  { left: '27%', delay: '1.3s', duration: '1.8s', opacity: 0.24, height: '76px' },
  { left: '32%', delay: '0.4s', duration: '1.35s', opacity: 0.40, height: '108px' },
  { left: '37%', delay: '0.9s', duration: '1.65s', opacity: 0.28, height: '84px' },
  { left: '43%', delay: '0.1s', duration: '1.5s', opacity: 0.35, height: '96px' },
  { left: '48%', delay: '0.7s', duration: '1.75s', opacity: 0.26, height: '80px' },
  { left: '53%', delay: '1.2s', duration: '1.35s', opacity: 0.42, height: '112px' },
  { left: '58%', delay: '0.3s', duration: '1.6s', opacity: 0.30, height: '92px' },
  { left: '63%', delay: '1.0s', duration: '1.4s', opacity: 0.38, height: '100px' },
  { left: '68%', delay: '0.6s', duration: '1.85s', opacity: 0.24, height: '78px' },
  { left: '73%', delay: '0.15s', duration: '1.45s', opacity: 0.40, height: '106px' },
  { left: '78%', delay: '0.85s', duration: '1.7s', opacity: 0.28, height: '86px' },
  { left: '83%', delay: '1.35s', duration: '1.35s', opacity: 0.36, height: '98px' },
  { left: '88%', delay: '0.45s', duration: '1.6s', opacity: 0.32, height: '90px' },
  { left: '93%', delay: '0.95s', duration: '1.5s', opacity: 0.38, height: '102px' },
  { left: '97%', delay: '0.25s', duration: '1.75s', opacity: 0.26, height: '82px' },
];

interface SnowFlakeSpec {
  left: string;
  size: number;
  delay: string;
  duration: string;
  baseOpacity: number;
}

const SNOW_FLAKES: ReadonlyArray<SnowFlakeSpec> = [
  { left: '4%', size: 4, delay: '0s', duration: '9.5s', baseOpacity: 0.65 },
  { left: '11%', size: 6, delay: '-2.1s', duration: '7.8s', baseOpacity: 0.85 },
  { left: '19%', size: 3, delay: '-4.2s', duration: '11.0s', baseOpacity: 0.55 },
  { left: '27%', size: 5, delay: '-1.3s', duration: '8.4s', baseOpacity: 0.80 },
  { left: '35%', size: 4, delay: '-5.5s', duration: '10.2s', baseOpacity: 0.65 },
  { left: '44%', size: 6, delay: '-0.8s', duration: '7.4s', baseOpacity: 0.88 },
  { left: '52%', size: 3, delay: '-3.6s', duration: '10.8s', baseOpacity: 0.58 },
  { left: '61%', size: 5, delay: '-6.0s', duration: '8.8s', baseOpacity: 0.78 },
  { left: '69%', size: 4, delay: '-2.7s', duration: '9.6s', baseOpacity: 0.68 },
  { left: '77%', size: 6, delay: '-4.9s', duration: '7.6s', baseOpacity: 0.85 },
  { left: '85%', size: 4, delay: '-1.8s', duration: '9.9s', baseOpacity: 0.65 },
  { left: '93%', size: 5, delay: '-3.1s', duration: '8.2s', baseOpacity: 0.80 },
  // Moderate tier additions (indices 12..23)
  { left: '7%', size: 5, delay: '-5.1s', duration: '8.6s', baseOpacity: 0.75 },
  { left: '15%', size: 3, delay: '-1.5s', duration: '10.5s', baseOpacity: 0.60 },
  { left: '23%', size: 6, delay: '-6.4s', duration: '7.9s', baseOpacity: 0.88 },
  { left: '31%', size: 4, delay: '-2.4s', duration: '9.4s', baseOpacity: 0.70 },
  { left: '39%', size: 5, delay: '-0.4s', duration: '8.5s', baseOpacity: 0.78 },
  { left: '48%', size: 4, delay: '-4.5s', duration: '9.8s', baseOpacity: 0.66 },
  { left: '56%', size: 6, delay: '-2.9s', duration: '7.3s', baseOpacity: 0.90 },
  { left: '65%', size: 3, delay: '-6.8s', duration: '11.2s', baseOpacity: 0.56 },
  { left: '73%', size: 5, delay: '-1.1s', duration: '8.1s', baseOpacity: 0.80 },
  { left: '81%', size: 4, delay: '-3.9s', duration: '9.3s', baseOpacity: 0.68 },
  { left: '89%', size: 6, delay: '-5.8s', duration: '7.7s', baseOpacity: 0.86 },
  { left: '96%', size: 4, delay: '-2.2s', duration: '9.7s', baseOpacity: 0.64 },
  // Clear / heavy winter tier additions (indices 24..37 — prominent at 6–7°C and below)
  { left: '2%', size: 6, delay: '-3.4s', duration: '7.2s', baseOpacity: 0.92 },
  { left: '9%', size: 5, delay: '-6.1s', duration: '8.0s', baseOpacity: 0.84 },
  { left: '17%', size: 7, delay: '-0.9s', duration: '6.8s', baseOpacity: 0.94 },
  { left: '25%', size: 4, delay: '-4.7s', duration: '9.1s', baseOpacity: 0.76 },
  { left: '33%', size: 6, delay: '-2.0s', duration: '7.5s', baseOpacity: 0.90 },
  { left: '41%', size: 5, delay: '-5.3s', duration: '8.3s', baseOpacity: 0.82 },
  { left: '50%', size: 7, delay: '-1.6s', duration: '6.9s', baseOpacity: 0.95 },
  { left: '58%', size: 4, delay: '-3.8s', duration: '9.0s', baseOpacity: 0.74 },
  { left: '66%', size: 6, delay: '-0.5s', duration: '7.1s', baseOpacity: 0.92 },
  { left: '75%', size: 5, delay: '-4.1s', duration: '8.4s', baseOpacity: 0.84 },
  { left: '83%', size: 7, delay: '-2.6s', duration: '6.7s', baseOpacity: 0.94 },
  { left: '91%', size: 5, delay: '-5.9s', duration: '8.2s', baseOpacity: 0.82 },
  { left: '98%', size: 6, delay: '-1.4s', duration: '7.4s', baseOpacity: 0.90 },
  { left: '46%', size: 5, delay: '-6.5s', duration: '7.9s', baseOpacity: 0.85 },
];

export const WeatherBackdrop: React.FC<WeatherBackdropProps> = ({
  atmosphere,
  temperature,
}) => {
  const snowIntensity = getSnowIntensity(temperature);

  const visibleFlakeCount =
    snowIntensity === 'mild'
      ? 12
      : snowIntensity === 'moderate'
        ? 24
        : snowIntensity === 'clear'
          ? SNOW_FLAKES.length
          : 0;

  const snowOpacityScale =
    snowIntensity === 'mild'
      ? 0.55
      : snowIntensity === 'moderate'
        ? 0.78
        : 1.0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* 1. Normal Weather Wallpaper */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          atmosphere === 'normal' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(155deg, #090B1E 0%, #13163A 46%, #101B3F 82%, #090A1A 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 75% 50% at 18% 8%, rgba(124, 58, 237, 0.26), transparent 65%), radial-gradient(ellipse 65% 45% at 86% 14%, rgba(34, 211, 238, 0.20), transparent 65%), radial-gradient(ellipse 65% 50% at 50% 96%, rgba(79, 70, 229, 0.18), transparent 70%)',
          }}
        />
        <svg
          viewBox="0 0 1440 420"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-64 w-full opacity-35"
        >
          <path
            d="M0,290 C220,210 380,330 600,260 C820,190 1020,310 1240,240 C1340,210 1400,235 1440,250 L1440,420 L0,420 Z"
            fill="rgba(99, 102, 241, 0.18)"
          />
          <path
            d="M0,340 C260,280 480,360 760,300 C1000,250 1220,340 1440,290 L1440,420 L0,420 Z"
            fill="rgba(56, 189, 248, 0.14)"
          />
        </svg>
      </div>

      {/* 2. Sunny Day Wallpaper */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          atmosphere === 'sunny' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(155deg, #071430 0%, #0D2754 45%, #12376E 78%, #091632 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle 680px at 84% 12%, rgba(251, 191, 36, 0.36), rgba(245, 158, 11, 0.16) 32%, rgba(56, 189, 248, 0.18) 58%, transparent 82%), radial-gradient(ellipse 75% 50% at 15% 88%, rgba(14, 165, 233, 0.22), transparent 70%)',
          }}
        />
        <svg
          viewBox="0 0 600 600"
          className="absolute -top-28 -right-24 h-[540px] w-[540px]"
        >
          <defs>
            <radialGradient id="solarDiscGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#FBBF24" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="300" cy="300" r="150" fill="url(#solarDiscGrad)" />
          <circle
            cx="300"
            cy="300"
            r="115"
            fill="none"
            stroke="rgba(253, 224, 71, 0.30)"
            strokeWidth="1.5"
          />
          <circle
            cx="300"
            cy="300"
            r="185"
            fill="none"
            stroke="rgba(251, 191, 36, 0.22)"
            strokeWidth="1.2"
            strokeDasharray="6 10"
          />
          <circle
            cx="300"
            cy="300"
            r="255"
            fill="none"
            stroke="rgba(56, 189, 248, 0.18)"
            strokeWidth="1"
          />
        </svg>
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-52 w-full opacity-40"
        >
          <path
            d="M0,220 C320,140 620,260 980,175 C1180,128 1340,165 1440,195 L1440,320 L0,320 Z"
            fill="rgba(56, 189, 248, 0.18)"
          />
        </svg>
      </div>

      {/* 3. Rainy Day Wallpaper */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          atmosphere === 'rainy' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(180deg, #060D1E 0%, #0C1B36 48%, #09162B 82%, #050B18 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 90% 50% at 50% 0%, rgba(56, 189, 248, 0.22), rgba(30, 64, 175, 0.28) 46%, transparent 78%), radial-gradient(ellipse 75% 45% at 22% 92%, rgba(14, 116, 144, 0.22), transparent 72%)',
          }}
        />
        <svg
          viewBox="0 0 1440 280"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-56 w-full opacity-55"
        >
          <path
            d="M0,0 L1440,0 L1440,130 C1300,175 1120,105 940,150 C760,195 560,115 360,165 C180,210 70,150 0,180 Z"
            fill="rgba(15, 32, 66, 0.72)"
          />
          <path
            d="M0,0 L1440,0 L1440,95 C1260,130 1080,80 880,118 C680,155 470,85 260,125 C120,152 45,115 0,130 Z"
            fill="rgba(30, 58, 110, 0.45)"
          />
        </svg>

        <div className="absolute inset-0">
          {RAIN_STREAKS.map((streak, idx) => (
            <span
              key={idx}
              className="skysync-rain-streak absolute -top-28 w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-sky-300/80 to-cyan-200/20"
              style={{
                left: streak.left,
                height: streak.height,
                opacity: streak.opacity,
                animationDelay: streak.delay,
                animationDuration: streak.duration,
              }}
            />
          ))}
        </div>
      </div>

      {/* 4. Winter Frost Wallpaper (Temperature < 15 °C) */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-out ${
          atmosphere === 'winter' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'linear-gradient(170deg, #071226 0%, #0E2245 48%, #15315B 82%, #08152A 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 85% 50% at 50% 0%, rgba(186, 230, 253, 0.24), rgba(56, 189, 248, 0.14) 48%, transparent 78%), radial-gradient(ellipse 80% 42% at 50% 100%, rgba(224, 242, 254, 0.18), transparent 72%)',
          }}
        />
        {/* Frosted snow-draped alpine horizon */}
        <svg
          viewBox="0 0 1440 360"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-56 w-full opacity-45"
        >
          <path
            d="M0,260 L190,175 L370,235 L580,145 L790,225 L1010,135 L1220,210 L1440,160 L1440,360 L0,360 Z"
            fill="rgba(186, 230, 253, 0.14)"
          />
          <path
            d="M0,310 C280,265 540,320 820,280 C1060,245 1260,305 1440,275 L1440,360 L0,360 Z"
            fill="rgba(224, 242, 254, 0.18)"
          />
        </svg>
      </div>

      {/* Progressive Snowfall Overlay (Mild at 11–14.9 °C, Clear & Dense at <= 7 °C) */}
      {visibleFlakeCount > 0 && (
        <div className="absolute inset-0">
          {SNOW_FLAKES.slice(0, visibleFlakeCount).map((flake, idx) => (
            <span
              key={idx}
              className="skysync-snowflake absolute -top-10 rounded-full bg-sky-100"
              style={{
                left: flake.left,
                width: `${flake.size}px`,
                height: `${flake.size}px`,
                opacity: Number((flake.baseOpacity * snowOpacityScale).toFixed(2)),
                animationDelay: flake.delay,
                animationDuration: flake.duration,
                boxShadow:
                  flake.size >= 5
                    ? '0 0 8px rgba(224, 242, 254, 0.75)'
                    : '0 0 4px rgba(186, 230, 253, 0.55)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

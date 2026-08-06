'use client';

export type AvatarExpression =
  | 'idle'
  | 'welcome'
  | 'waving'
  | 'happy'
  | 'thinking'
  | 'speaking'
  | 'explaining'
  | 'warning'
  | 'bounce';

interface AvatarProps {
  expression?: AvatarExpression;
  state?: AvatarExpression; // alias
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
  showGlow?: boolean;
}

export default function LegalSathiAvatar({
  expression,
  state = 'idle',
  size = 'md',
  className = '',
  showBadge = true,
  showGlow = true,
}: AvatarProps) {
  const currentExpr = expression || state;

  const dimensions = {
    sm: 'w-14 h-14',
    md: 'w-18 h-18 sm:w-20 sm:h-20',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
    xl: 'w-32 h-32',
  }[size];

  const isThinking = currentExpr === 'thinking';
  const isWaving = currentExpr === 'waving' || currentExpr === 'welcome';
  const isHappy = currentExpr === 'happy' || currentExpr === 'explaining';
  const isSpeaking = currentExpr === 'speaking';
  const isWarning = currentExpr === 'warning';
  const isBounce = currentExpr === 'bounce';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-1.5 shadow-2xl shadow-blue-600/40 transition-all duration-300 ${dimensions} ${className} ${
        isBounce ? 'animate-bounce' : ''
      }`}
    >
      {/* Ambient Blue Glow Ring */}
      {showGlow && (
        <span
          className={`absolute -inset-2 rounded-full bg-blue-500/20 blur-md transition-opacity ${
            isThinking ? 'animate-pulse bg-cyan-400/40 opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
        />
      )}

      {/* Online Status Green Indicator Badge */}
      {showBadge && (
        <span className="absolute bottom-0 right-0 z-20 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white p-0.5 shadow-md">
          <span className="h-full w-full rounded-full bg-emerald-500 animate-pulse" />
        </span>
      )}

      {/* Pixar-style 3D Flat SVG Graphic */}
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full rounded-full overflow-hidden select-none transform transition-transform duration-300 hover:scale-[1.02]"
      >
        <defs>
          {/* Background Radial Gradient */}
          <radialGradient id="bg-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(80 50) scale(90)">
            <stop stopColor="#60a5fa" />
            <stop offset="0.6" stopColor="#2563eb" />
            <stop offset="1" stopColor="#1e3a8a" />
          </radialGradient>

          {/* Skin Gradient (Warm Indian Natural Tone) */}
          <linearGradient id="skin" x1="80" y1="30" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f3c698" />
            <stop offset="1" stopColor="#e5aa70" />
          </linearGradient>

          {/* Hair Gradient */}
          <linearGradient id="hair" x1="40" y1="20" x2="120" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>

          {/* Navy Blazer Gradient */}
          <linearGradient id="blazer" x1="30" y1="100" x2="130" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e40af" />
            <stop offset="0.7" stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>

          {/* Glass Lens Reflection */}
          <linearGradient id="glass-reflection" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="0.6" stopColor="#60a5fa" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Tablet Screen Hologram */}
          <linearGradient id="holo-screen" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#e0f2fe" />
            <stop offset="1" stopColor="#bae6fd" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Background Circle */}
        <circle cx="80" cy="80" r="76" fill="url(#bg-glow)" />

        {/* Breathing Inner Aura */}
        <circle cx="80" cy="80" r="70" fill="white" fillOpacity="0.08" className="animate-pulse" />

        {/* Neck */}
        <path d="M70 82V96H90V82H70Z" fill="url(#skin)" />
        <path d="M70 88C75 92 85 92 90 88V96H70V88Z" fill="#d99b5d" fillOpacity="0.4" />

        {/* Face Base */}
        <path
          d="M50 56C50 38 63 30 80 30C97 30 110 38 110 56C110 76 96 90 80 90C64 90 50 76 50 56Z"
          fill="url(#skin)"
          filter="url(#soft-shadow)"
        />

        {/* Neatly Styled Professional Black Hair */}
        <path
          d="M48 52C46 36 56 22 80 22C104 22 114 36 112 52C108 38 98 28 80 28C62 28 52 38 48 52Z"
          fill="url(#hair)"
        />
        <path
          d="M46 54C48 42 56 34 68 32C60 36 54 44 52 56C50 55 48 54 46 54Z"
          fill="#334155"
        />

        {/* Soft Eyebrows */}
        <path
          d={isThinking ? "M58 41C63 39 68 42 72 43" : "M58 42C63 40 68 40 72 42"}
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={isThinking ? "M88 43C92 42 97 39 102 41" : "M88 42C92 40 97 40 102 42"}
          stroke="#1e293b"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Expressive Eyes with Natural Blink Animation */}
        <g className="animate-[blink_4s_infinite] origin-center">
          {/* Left Eye */}
          <ellipse cx="65" cy="49" rx="5" ry="6" fill="#0f172a" />
          <circle cx="66.5" cy="47.5" r="2" fill="white" />
          <circle cx="63.5" cy="50.5" r="1" fill="#38bdf8" />

          {/* Right Eye */}
          <ellipse cx="95" cy="49" rx="5" ry="6" fill="#0f172a" />
          <circle cx="96.5" cy="47.5" r="2" fill="white" />
          <circle cx="93.5" cy="50.5" r="1" fill="#38bdf8" />
        </g>

        {/* Modern Round Glasses with Subtle Blue Reflection */}
        <circle cx="65" cy="49" r="12" stroke="#1e293b" strokeWidth="2.5" fill="url(#glass-reflection)" />
        <circle cx="95" cy="49" r="12" stroke="#1e293b" strokeWidth="2.5" fill="url(#glass-reflection)" />
        <path d="M77 49H83" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Nose */}
        <path d="M79 56C80 58 81 58 82 56" stroke="#c07d3e" strokeWidth="2" strokeLinecap="round" />

        {/* Facial Expression Mouth */}
        {isHappy && (
          <path d="M66 66C72 73 88 73 94 66" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="#dc2626" />
        )}
        {isSpeaking && (
          <ellipse cx="80" cy="68" rx="7" ry="5" fill="#0f172a" />
        )}
        {isThinking && (
          <path d="M70 68C75 66 85 66 90 68" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {isWarning && (
          <path d="M70 70C76 66 84 66 90 70" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {!isHappy && !isSpeaking && !isThinking && !isWarning && (
          <path d="M67 66C73 71 87 71 93 66" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
        )}

        {/* Professional Business Attire - Navy Blue Blazer & White Shirt */}
        <path
          d="M24 145C24 115 44 100 80 100C116 100 136 115 136 145V160H24V145Z"
          fill="url(#blazer)"
          filter="url(#soft-shadow)"
        />

        {/* White Shirt Collar & V-Neck */}
        <path d="M66 100L80 124L94 100H66Z" fill="#ffffff" />
        <path d="M72 100L80 114L88 100" stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Gold Scales of Justice Lapel Pin */}
        <circle cx="52" cy="116" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        <path d="M49 116H55M52 113V119" stroke="#78350f" strokeWidth="0.8" />

        {/* Blue AI Badge */}
        <rect x="102" y="112" width="14" height="9" rx="2" fill="#38bdf8" />
        <circle cx="106" cy="116.5" r="1.5" fill="#0f172a" />
        <line x1="109" y1="115" x2="113" y2="115" stroke="#ffffff" strokeWidth="1" />
        <line x1="109" y1="118" x2="112" y2="118" stroke="#ffffff" strokeWidth="1" />

        {/* Digital Legal Tablet in Hand */}
        <g transform="rotate(-6 120 120)">
          <rect
            x="96"
            y="94"
            width="34"
            height="46"
            rx="4"
            fill="#ffffff"
            stroke="#60a5fa"
            strokeWidth="2"
            filter="url(#soft-shadow)"
          />
          <rect x="99" y="97" width="28" height="40" rx="2" fill="url(#holo-screen)" />
          {/* Holographic Scales Icon on Screen */}
          <circle cx="113" cy="107" r="4" fill="#2563eb" />
          <path d="M109 107H117M113 104V110" stroke="#ffffff" strokeWidth="1" />
          <line x1="104" y1="116" x2="122" y2="116" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="104" y1="122" x2="118" y2="122" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="104" y1="128" x2="115" y2="128" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Waving Arm / Hand Gesture Animation */}
        {isWaving && (
          <g className="origin-[30px_110px] animate-[wave_1.5s_ease-in-out_infinite]">
            <path
              d="M32 110C24 95 20 80 28 72C34 66 42 72 38 86L34 106"
              stroke="url(#skin)"
              strokeWidth="7"
              strokeLinecap="round"
              filter="url(#soft-shadow)"
            />
          </g>
        )}
      </svg>

      <style jsx>{`
        @keyframes blink {
          0%, 93%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(22deg); }
        }
      `}</style>
    </div>
  );
}

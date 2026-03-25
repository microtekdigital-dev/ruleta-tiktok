'use client'

// Pre-calculated positions forming a perfect circle around the wheel
// Using trigonometry: x = 50 + 47*cos(angle), y = 50 + 47*sin(angle)
// 24 lights, each 15 degrees apart (360/24 = 15)
const LIGHT_DATA = [
  // Starting from right (0°) going clockwise
  { top: '50%', left: '97%', color: '#fbbf24', delay: '0s', dur: '1s' },       // 0°
  { top: '62%', left: '95%', color: '#a855f7', delay: '0.08s', dur: '1.5s' },  // 15°
  { top: '73%', left: '91%', color: '#fbbf24', delay: '0.16s', dur: '2s' },    // 30°
  { top: '83%', left: '83%', color: '#a855f7', delay: '0.24s', dur: '1s' },    // 45°
  { top: '91%', left: '73%', color: '#fbbf24', delay: '0.32s', dur: '1.5s' },  // 60°
  { top: '95%', left: '62%', color: '#a855f7', delay: '0.4s', dur: '2s' },     // 75°
  { top: '97%', left: '50%', color: '#fbbf24', delay: '0.48s', dur: '1s' },    // 90°
  { top: '95%', left: '38%', color: '#a855f7', delay: '0.56s', dur: '1.5s' },  // 105°
  { top: '91%', left: '27%', color: '#fbbf24', delay: '0.64s', dur: '2s' },    // 120°
  { top: '83%', left: '17%', color: '#a855f7', delay: '0.72s', dur: '1s' },    // 135°
  { top: '73%', left: '9%', color: '#fbbf24', delay: '0.8s', dur: '1.5s' },    // 150°
  { top: '62%', left: '5%', color: '#a855f7', delay: '0.88s', dur: '2s' },     // 165°
  { top: '50%', left: '3%', color: '#fbbf24', delay: '0.96s', dur: '1s' },     // 180°
  { top: '38%', left: '5%', color: '#a855f7', delay: '1.04s', dur: '1.5s' },   // 195°
  { top: '27%', left: '9%', color: '#fbbf24', delay: '1.12s', dur: '2s' },     // 210°
  { top: '17%', left: '17%', color: '#a855f7', delay: '1.2s', dur: '1s' },     // 225°
  { top: '9%', left: '27%', color: '#fbbf24', delay: '1.28s', dur: '1.5s' },   // 240°
  { top: '5%', left: '38%', color: '#a855f7', delay: '1.36s', dur: '2s' },     // 255°
  { top: '3%', left: '50%', color: '#fbbf24', delay: '1.44s', dur: '1s' },     // 270°
  { top: '5%', left: '62%', color: '#a855f7', delay: '1.52s', dur: '1.5s' },   // 285°
  { top: '9%', left: '73%', color: '#fbbf24', delay: '1.6s', dur: '2s' },      // 300°
  { top: '17%', left: '83%', color: '#a855f7', delay: '1.68s', dur: '1s' },    // 315°
  { top: '27%', left: '91%', color: '#fbbf24', delay: '1.76s', dur: '1.5s' },  // 330°
  { top: '38%', left: '95%', color: '#a855f7', delay: '1.84s', dur: '2s' },    // 345°
]

export function DecorativeLights() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {LIGHT_DATA.map((light, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: light.color,
            boxShadow: `0 0 10px ${light.color}`,
            top: light.top,
            left: light.left,
            transform: 'translate(-50%, -50%)',
            animation: `neon-pulse ${light.dur} ease-in-out infinite`,
            animationDelay: light.delay
          }}
        />
      ))}
    </div>
  )
}

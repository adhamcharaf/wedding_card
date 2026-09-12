import { TRAIT } from './style'

/*
 * Décors placeholder, dessinés au trait dans l'esprit des doodles, en attendant
 * les vrais plans d'Adham. Trois profondeurs : lointain, milieu, proche.
 * Chaque plan est un SVG plein cadre ; la scène le déplace par transform.
 */

const trait = { stroke: TRAIT, strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
const plein = { ...trait, fill: 'none' }

export function PlanLointain() {
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      {/* soleil au trait, écho du soleil doré du site */}
      <circle cx="860" cy="430" r="90" {...plein} />
      {[...Array(12)].map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        const r1 = 118, r2 = 160 + (i % 2) * 22
        return <line key={i} x1={860 + Math.cos(a) * r1} y1={430 + Math.sin(a) * r1} x2={860 + Math.cos(a) * r2} y2={430 + Math.sin(a) * r2} {...trait} />
      })}
      {/* collines */}
      <path d="M-40 1330 C 200 1180, 420 1200, 620 1300 S 980 1250, 1120 1340 L 1120 1400 L -40 1400 Z" {...plein} />
    </svg>
  )
}

export function PlanMilieu() {
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      {/* deux arbres ronds, un de chaque côté, le centre reste libre */}
      <g>
        <line x1="150" y1="1420" x2="150" y2="1150" {...trait} />
        <path d="M150 1160 c -120 0 -150 -110 -110 -170 c -30 -90 60 -150 120 -120 c 60 -40 150 20 120 110 c 60 60 20 180 -130 180 Z" {...plein} />
      </g>
      <g>
        <line x1="930" y1="1420" x2="930" y2="1200" {...trait} />
        <path d="M930 1205 c -100 0 -130 -90 -95 -140 c -25 -75 50 -125 100 -100 c 50 -35 125 15 100 90 c 50 50 15 150 -105 150 Z" {...plein} />
      </g>
      {/* sol */}
      <line x1="-40" y1="1420" x2="1120" y2="1420" {...trait} />
    </svg>
  )
}

export function PlanProche() {
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      {/* herbes et touffes dans les coins bas, hors du centre */}
      <path d="M-20 1640 c 60 -80 90 -60 110 -160 c 20 100 60 80 120 160" {...plein} />
      <path d="M980 1660 c 40 -90 80 -70 100 -180 c 20 110 60 90 90 180" {...plein} />
      <path d="M60 1700 q 40 -60 80 0" {...trait} />
      <path d="M900 1720 q 40 -60 80 0" {...trait} />
    </svg>
  )
}

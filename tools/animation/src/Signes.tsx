import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { TRAIT } from './style'

/*
 * Signes d'émotion, placeholders au trait en attendant les dessins d'Adham :
 * cœur, cœur en pointillé, point d'interrogation, notes, étincelle, étoiles.
 * Apparition avec un rebond, puis flottement lent. Même mécanique pour tous.
 */

export type Signe = 'coeur' | 'coeurPointille' | 'question' | 'notes' | 'etincelle' | 'etoiles'

const trait = { stroke: TRAIT, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }

const COEUR = 'M60 105 C 20 75, 5 45, 25 25 C 40 10, 58 18, 60 32 C 62 18, 80 10, 95 25 C 115 45, 100 75, 60 105 Z'

function Dessin({ signe }: { signe: Signe }) {
  switch (signe) {
    case 'coeur':
      return <path d={COEUR} {...trait} />
    case 'coeurPointille':
      return <path d={COEUR} {...trait} strokeDasharray="14 14" />
    case 'question':
      return (
        <>
          <path d="M35 40 C 35 15, 85 15, 85 40 C 85 60, 60 58, 60 80" {...trait} />
          <circle cx="60" cy="104" r="5" fill={TRAIT} stroke="none" />
        </>
      )
    case 'notes':
      return (
        <>
          <path d="M40 90 L 40 25 L 90 15 L 90 80" {...trait} />
          <circle cx="28" cy="92" r="12" fill={TRAIT} stroke="none" />
          <circle cx="78" cy="82" r="12" fill={TRAIT} stroke="none" />
        </>
      )
    case 'etincelle':
      return (
        <>
          <path d="M60 10 L 60 110 M10 60 L 110 60 M28 28 L 92 92 M92 28 L 28 92" {...trait} />
        </>
      )
    case 'etoiles':
      return (
        <>
          <path d="M30 40 l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2 z" {...trait} strokeWidth={6} />
          <path d="M85 20 l5 11 12 1 -9 8 2 12 -10 -6 -10 6 2 -12 -9 -8 12 -1 z" {...trait} strokeWidth={6} />
          <path d="M80 80 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 z" {...trait} strokeWidth={6} />
        </>
      )
  }
}

interface Props {
  signe: Signe
  x: number
  y: number
  taille: number
  /** Image d'apparition. */
  depuis: number
  /** Image de disparition, optionnelle. */
  jusqua?: number
}

export function SigneAnime({ signe, x, y, taille, depuis, jusqua }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  if (frame < depuis) return null

  // Rebond d'apparition : dépasse à 1,18 puis se pose.
  const pop = interpolate(frame, [depuis, depuis + fps * 0.45], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(2.2)),
  })
  const fin = jusqua
    ? interpolate(frame, [jusqua - fps * 0.3, jusqua], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1
  const flotte = Math.sin(((frame - depuis) / fps) * 2.1) * taille * 0.05
  const penche = Math.sin(((frame - depuis) / fps) * 1.4) * 5

  return (
    <div
      style={{
        position: 'absolute',
        left: x - taille / 2,
        top: y - taille / 2 + flotte,
        width: taille,
        height: taille,
        opacity: Math.min(pop, 1) * fin,
        transform: `scale(${pop * fin}) rotate(${penche}deg)`,
        transformOrigin: '50% 80%',
      }}
    >
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <Dessin signe={signe} />
      </svg>
    </div>
  )
}

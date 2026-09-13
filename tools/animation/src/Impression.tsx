import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FONTS_CSS, PECHE_BAS, PECHE_HAUT, PECHE_MILIEU, SCRIPT, SERIF } from './style'

/*
 * L'impression de la carte : ce que le hero joue quand le film se termine sur
 * le papier vierge. Le ruban se pose, le cœur descend, le petit soleil arrive
 * en tournant, le grand monte du bas, le texte s'écrit. Les mêmes courbes sont
 * portées en GSAP dans src/components/sections/Hero.tsx.
 *
 * Géométrie du hero du site (src/styles/sections.css) transposée en
 * 1080 x 1920, soit 3 fois la colonne mobile de 360 px.
 */
const CARTE = { x: 72, y: 303, l: 936, h: 1214 }
const ENCRE_CARTE = '#2b1b17'

const sortie = Easing.out(Easing.cubic)

export const DUREE_IMPRESSION = 4

export function Impression() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = frame / fps

  const ruban = interpolate(s, [0, 1.2], [0, 1], { extrapolateRight: 'clamp', easing: sortie })
  const coeur = interpolate(s, [0.5, 1.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4)) })
  const petitSoleil = interpolate(s, [0.7, 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const grandSoleil = interpolate(s, [0.6, 1.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const ligne = (i: number) => interpolate(s, [1.1 + i * 0.12, 1.8 + i * 0.12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })

  const grandSoleilL = 842
  const grandSoleilY = CARTE.y + CARTE.h + 36 + (1 - grandSoleil) * 330

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PECHE_HAUT} 0%, ${PECHE_MILIEU} 55%, ${PECHE_BAS} 100%)` }}>
      <style>{FONTS_CSS}</style>

      <Img src={staticFile('images/sun-gold.png')} style={{ position: 'absolute', left: (1080 - grandSoleilL) / 2, top: grandSoleilY, width: grandSoleilL, opacity: grandSoleil }} />

      <Img
        src={staticFile('images/ribbon.png')}
        style={{
          position: 'absolute',
          left: CARTE.x,
          top: CARTE.y,
          width: CARTE.l,
          height: CARTE.h,
          opacity: ruban,
          transform: `scale(${1.4 - 0.4 * ruban})`,
          transformOrigin: '50% 50%',
        }}
      />

      <Img
        src={staticFile('images/heart.png')}
        style={{
          position: 'absolute',
          left: CARTE.x + CARTE.l * 0.2,
          top: CARTE.y - CARTE.h * 0.2 - (1 - coeur) * 330,
          width: CARTE.l * 0.6,
          opacity: Math.min(1, coeur * 2),
        }}
      />

      <Img
        src={staticFile('images/sun-gold.png')}
        style={{
          position: 'absolute',
          left: CARTE.x - CARTE.l * 0.14,
          top: CARTE.y - CARTE.h * 0.06,
          width: CARTE.l * 0.4,
          opacity: petitSoleil,
          transform: `rotate(${(1 - petitSoleil) * -120}deg) scale(${0.4 + 0.6 * petitSoleil})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: CARTE.x + CARTE.l * 0.14,
          top: CARTE.y + CARTE.h * 0.32,
          width: CARTE.l * 0.7,
          height: CARTE.h * 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 18,
          color: ENCRE_CARTE,
          textAlign: 'center',
        }}
      >
        {[
          { t: 'Save the Date', st: { fontFamily: SCRIPT, fontSize: 150, lineHeight: 1, marginBottom: 26 } },
          { t: 'ADHAM', st: { fontFamily: SERIF, fontSize: 74, letterSpacing: '0.32em' } },
          { t: '&', st: { fontFamily: SERIF, fontStyle: 'italic', fontSize: 72 } },
          { t: 'LARA', st: { fontFamily: SERIF, fontSize: 74, letterSpacing: '0.32em' } },
          { t: '08.01.27', st: { fontFamily: SERIF, fontSize: 58, letterSpacing: '0.25em', marginTop: 34 } },
        ].map((l, i) => (
          <div key={l.t} style={{ ...l.st, opacity: ligne(i), transform: `translateY(${(1 - ligne(i)) * 12}px)` }}>
            {l.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

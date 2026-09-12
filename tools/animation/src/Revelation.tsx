import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { MOUVEMENT_CALME, Personnage } from './Personnage'
import { FONTS_CSS, PECHE_BAS, PECHE_HAUT, PECHE_MILIEU, SCRIPT, SERIF } from './style'

/*
 * La chute : la caméra recule et révèle que les personnages sont dessinés sur
 * la carte. Géométrie du hero du site (src/styles/sections.css) transposée
 * en 1080 x 1920, soit 3 fois la colonne mobile de 360 px :
 * carte 936 x 1214 posée à y = 303, cœur 60 % en haut, petit soleil 40 % en
 * haut à gauche, grand soleil 842 px sous la carte, texte dans l'encart.
 */
const CARTE = { x: 72, y: 303, l: 936, h: 1214 }
const ENCRE_CARTE = '#2b1b17'

const sortie = Easing.out(Easing.cubic)
const douce = Easing.inOut(Easing.sin)

export const DUREE_REVELATION = 6

export function Revelation() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = frame / fps

  // 0 à 2,6 s : le couple recule vers le papier, le ruban se referme autour.
  const recul = interpolate(s, [0, 2.6], [0, 1], { extrapolateRight: 'clamp', easing: douce })
  const coupleH = 1000 - recul * 560
  const coupleY = 1500 - recul * (1500 - (CARTE.y + CARTE.h * 0.78))
  const ruban = interpolate(s, [0.8, 2.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })

  // 1,6 à 3 s : le cœur descend, le petit soleil tourne, le grand soleil monte.
  const coeur = interpolate(s, [1.6, 2.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.4)) })
  const petitSoleil = interpolate(s, [1.9, 3.0], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const grandSoleil = interpolate(s, [2.0, 3.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })

  // 3 à 4,4 s : le couple s'efface sur le papier, le texte s'écrit.
  const coupleFin = interpolate(s, [3.0, 4.0], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })
  const ligne = (i: number) => interpolate(s, [3.3 + i * 0.25, 4.1 + i * 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })

  const grandSoleilL = 842
  const grandSoleilY = CARTE.y + CARTE.h + 36 + (1 - grandSoleil) * 500

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PECHE_HAUT} 0%, ${PECHE_MILIEU} 55%, ${PECHE_BAS} 100%)` }}>
      <style>{FONTS_CSS}</style>

      {/* grand soleil, derrière tout, monte du bas */}
      <Img src={staticFile('images/sun-gold.png')} style={{ position: 'absolute', left: (1080 - grandSoleilL) / 2, top: grandSoleilY, width: grandSoleilL, opacity: grandSoleil }} />

      {/* ruban : se referme autour du couple */}
      <Img
        src={staticFile('images/ribbon.png')}
        style={{
          position: 'absolute',
          left: CARTE.x,
          top: CARTE.y,
          width: CARTE.l,
          height: CARTE.h,
          opacity: ruban,
          transform: `scale(${1.5 - 0.5 * ruban})`,
          transformOrigin: '50% 60%',
        }}
      />

      {/* le couple, dessiné sur le papier, puis effacé */}
      <div style={{ opacity: coupleFin }}>
        <Personnage nom="adham-marie" hauteur={coupleH} x={540 - coupleH * 0.22} y={coupleY} mouvement={{ ...MOUVEMENT_CALME, periode: 3.2 }} />
        <Personnage nom="lara-mariee" hauteur={coupleH * 0.98} x={540 + coupleH * 0.2} y={coupleY} mouvement={{ ...MOUVEMENT_CALME, periode: 3.6, phase: 2.1 }} />
      </div>

      {/* cœur : tombe du haut avec un léger rebond */}
      <Img
        src={staticFile('images/heart.png')}
        style={{
          position: 'absolute',
          left: CARTE.x + CARTE.l * 0.2,
          top: CARTE.y - CARTE.h * 0.2 - (1 - coeur) * 600,
          width: CARTE.l * 0.6,
          opacity: Math.min(1, coeur * 2),
        }}
      />

      {/* petit soleil : arrive en tournant */}
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

      {/* texte de la carte, dans l'encart (inset 32% 16% 18% 14%) */}
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
          <div key={l.t} style={{ ...l.st, opacity: ligne(i), transform: `translateY(${(1 - ligne(i)) * 18}px)` }}>
            {l.t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  )
}

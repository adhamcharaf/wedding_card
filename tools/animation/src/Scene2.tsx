import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { PlanLointain, PlanMilieu, PlanProche } from './Decor'
import { MOUVEMENT_CALME, Personnage } from './Personnage'
import { ENCRE, FONTS_CSS, PECHE_BAS, PECHE_HAUT, PECHE_MILIEU, SERIF } from './style'

/** Texte placeholder du temps 2, à remplacer par la vraie phrase d'Adham et Lara (wedding.ts). */
const PHRASE = 'Une phrase sur vous, à cet âge-là.'

const sortie = Easing.out(Easing.cubic)
const douce = Easing.inOut(Easing.sin)

/**
 * Temps 2 de l'histoire : Adham à 18 ans, Lara à 14 ans.
 * 0 à 1,2 s : la caméra finit de reculer, les plans se posent, le couple entre.
 * 1,2 à 4,5 s : temps calme, ils respirent, la phrase s'écrit.
 * 4,5 à 6 s : la caméra reprend son recul, amorce du temps suivant.
 */
export function Scene2() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = frame / fps

  // Recul de caméra : un premier temps qui se pose, puis un second qui repart.
  const pose = interpolate(s, [0, 1.2], [0, 1], { extrapolateRight: 'clamp', easing: sortie })
  const reprise = interpolate(s, [4.5, 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })

  // Chaque plan part plus grand et se pose ; le proche bouge plus que le lointain.
  const zoom = (proche: number) => (1 + proche * 0.22) * (1 - pose) + pose * (1 - reprise * proche * 0.08)
  const derive = (proche: number) => proche * 40 * (1 - pose) + reprise * proche * 26

  const entree = interpolate(s, [0.15, 1.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const persoScale = 0.88 + 0.12 * entree - reprise * 0.06
  const persoY = 1440 + 60 * (1 - entree) + reprise * 30

  const texte = interpolate(s, [1.6, 2.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const texteSortie = interpolate(s, [4.6, 5.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PECHE_HAUT} 0%, ${PECHE_MILIEU} 55%, ${PECHE_BAS} 100%)` }}>
      <style>{FONTS_CSS}</style>

      <AbsoluteFill style={{ transform: `scale(${zoom(0.25)}) translateY(${derive(0.25)}px)`, transformOrigin: '50% 70%' }}>
        <PlanLointain />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom(0.6)}) translateY(${derive(0.6)}px)`, transformOrigin: '50% 72%' }}>
        <PlanMilieu />
      </AbsoluteFill>

      <Personnage
        nom="adham-18"
        hauteur={860}
        x={400}
        y={persoY}
        scale={persoScale}
        opacity={entree}
        mouvement={{ ...MOUVEMENT_CALME, periode: 2.6, phase: 0 }}
      />
      <Personnage
        nom="lara-14"
        hauteur={780}
        x={690}
        y={persoY}
        scale={persoScale}
        opacity={entree}
        mouvement={{ ...MOUVEMENT_CALME, periode: 3.1, phase: 1.9, tete: 2.2 }}
      />

      <AbsoluteFill style={{ transform: `scale(${zoom(1)}) translateY(${derive(1)}px)`, transformOrigin: '50% 85%' }}>
        <PlanProche />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 300,
          textAlign: 'center',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 62,
          lineHeight: 1.3,
          letterSpacing: '0.04em',
          color: ENCRE,
          opacity: texte * texteSortie,
          transform: `translateY(${(1 - texte) * 24}px)`,
        }}
      >
        {PHRASE}
      </div>
    </AbsoluteFill>
  )
}

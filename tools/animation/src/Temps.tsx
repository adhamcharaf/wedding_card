import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import { PlanLointain, PlanMilieu, PlanProche } from './Decor'
import { MOUVEMENT_CALME, Mouvement, Personnage } from './Personnage'
import { Signe, SigneAnime } from './Signes'
import { ENCRE, FONTS_CSS, PECHE_BAS, PECHE_HAUT, PECHE_MILIEU, SERIF } from './style'
import manifest from '../public/persos/manifest.json'

type Nom = keyof typeof manifest

/** Un personnage dans un temps : son dessin d'arrivée (A), son dessin du pic d'émotion (B). */
export interface Role {
  a: Nom
  /** Dessin B ; tant qu'Adham ne l'a pas généré, on remet A (placeholder). */
  b: Nom
  hauteur: number
  x: number
  mouvement: Mouvement
}

export interface ConfigTemps {
  phrase: string
  roles: Role[]
  /** Point que la caméra vise au moment de l'émotion : les visages. */
  visages: { x: number; y: number }
  signes: { signe: Signe; x: number; y: number; taille: number }[]
}

const sortie = Easing.out(Easing.cubic)
const douce = Easing.inOut(Easing.sin)
const SOL = 1440

/**
 * Un temps de l'histoire, 8 secondes. Mise en scène en trois mouvements :
 * la caméra se pose et le couple entre (A) ; elle s'approche des visages et le
 * dessin A laisse place au dessin B, les signes d'émotion apparaissent ;
 * elle recule, tout s'efface, amorce du temps suivant.
 */
export function Temps({ phrase, roles, visages, signes }: ConfigTemps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const s = frame / fps

  const pose = interpolate(s, [0, 1.2], [0, 1], { extrapolateRight: 'clamp', easing: sortie })
  const approche = interpolate(s, [2.4, 3.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })
  const recul = interpolate(s, [5.6, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic) })
  const bascule = interpolate(s, [3.0, 3.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })

  // Caméra : zoom sur les visages à l'approche, puis recul franc.
  const cam = 1 + approche * 0.32 - recul * 0.55
  const camY = approche * -40 + recul * 120

  const zoomPlan = (proche: number) => (1 + proche * 0.22) * (1 - pose) + pose
  const derivePlan = (proche: number) => proche * 40 * (1 - pose)

  const entree = interpolate(s, [0.15, 1.1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const persoScale = 0.88 + 0.12 * entree
  const persoY = SOL + 60 * (1 - entree)

  const texte = interpolate(s, [1.4, 2.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: sortie })
  const texteSortie = interpolate(s, [5.4, 6.0], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })
  const fondu = 1 - interpolate(s, [7.0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: douce })

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${PECHE_HAUT} 0%, ${PECHE_MILIEU} 55%, ${PECHE_BAS} 100%)` }}>
      <style>{FONTS_CSS}</style>

      <AbsoluteFill style={{ transform: `scale(${cam}) translateY(${camY}px)`, transformOrigin: `${visages.x}px ${visages.y}px`, opacity: fondu }}>
        <AbsoluteFill style={{ transform: `scale(${zoomPlan(0.25)}) translateY(${derivePlan(0.25)}px)`, transformOrigin: '50% 70%' }}>
          <PlanLointain />
        </AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${zoomPlan(0.6)}) translateY(${derivePlan(0.6)}px)`, transformOrigin: '50% 72%' }}>
          <PlanMilieu />
        </AbsoluteFill>

        {roles.map((r) => (
          <div key={r.a}>
            <Personnage nom={r.a} hauteur={r.hauteur} x={r.x} y={persoY} scale={persoScale} opacity={entree * (1 - bascule)} mouvement={r.mouvement} />
            <Personnage nom={r.b} hauteur={r.hauteur} x={r.x} y={persoY} scale={persoScale} opacity={entree * bascule} mouvement={r.mouvement} />
          </div>
        ))}

        {signes.map((sg, i) => (
          <SigneAnime key={i} {...sg} depuis={Math.round(fps * (3.5 + i * 0.25))} jusqua={Math.round(fps * 6.2)} />
        ))}

        <AbsoluteFill style={{ transform: `scale(${zoomPlan(1)}) translateY(${derivePlan(1)}px)`, transformOrigin: '50% 85%' }}>
          <PlanProche />
        </AbsoluteFill>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 190,
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
        {phrase}
      </div>
    </AbsoluteFill>
  )
}

export const DUREE_TEMPS = 8

/** Temps 2 : Adham 18 ans, Lara 14 ans. Les dessins B sont encore A, en attendant. */
export function Temps2() {
  return (
    <Temps
      phrase="Une phrase sur vous, à cet âge-là."
      roles={[
        { a: 'adham-18', b: 'adham-18', hauteur: 860, x: 400, mouvement: { ...MOUVEMENT_CALME, periode: 2.6, phase: 0 } },
        { a: 'lara-14', b: 'lara-14', hauteur: 780, x: 690, mouvement: { ...MOUVEMENT_CALME, periode: 3.1, phase: 1.9, tete: 2.2 } },
      ]}
      visages={{ x: 545, y: 720 }}
      signes={[
        { signe: 'coeurPointille', x: 545, y: 590, taille: 150 },
        { signe: 'etincelle', x: 790, y: 640, taille: 80 },
      ]}
    />
  )
}

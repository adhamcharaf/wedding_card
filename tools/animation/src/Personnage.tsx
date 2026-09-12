import { Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import manifest from '../public/persos/manifest.json'

type Nom = keyof typeof manifest

export interface Mouvement {
  /** Période de la respiration, en secondes. */
  periode: number
  /** Décalage de phase, en radians, pour que deux personnages ne bougent pas en miroir. */
  phase: number
  /** Amplitude du balancement vertical, en fraction de la hauteur. */
  bob: number
  /** Rotation du buste autour de la taille, en degrés. */
  buste: number
  /** Rotation de la tête autour du cou, en degrés. */
  tete: number
  /** Retard de la tête sur le buste, en radians : le haut suit le bas. */
  retardTete: number
}

export const MOUVEMENT_CALME: Mouvement = {
  periode: 2.8,
  phase: 0,
  bob: 0.006,
  buste: 0.9,
  tete: 1.6,
  retardTete: 0.45,
}

interface Props {
  nom: Nom
  /** Hauteur affichée du personnage, en px de la composition. */
  hauteur: number
  /** Position des pieds : x du centre, y du bas. */
  x: number
  y: number
  mouvement?: Mouvement
  /** Transformation posée par la scène (entrée, zoom), appliquée sur tout le corps. */
  scale?: number
  opacity?: number
}

/**
 * Personnage en cut-out, trois morceaux. Hiérarchie : corps (balancement) >
 * buste (pivot taille) > tête (pivot cou). La tête est enfant du buste, donc le
 * cou reste attaché quand le buste tourne. Les jambes ne tournent pas.
 * Les mêmes courbes seront portées en GSAP dans le site.
 */
export function Personnage({ nom, hauteur, x, y, mouvement = MOUVEMENT_CALME, scale = 1, opacity = 1 }: Props) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const m = manifest[nom]
  const k = hauteur / m.hauteur
  const largeur = m.largeur * k

  const t = frame / fps
  const w = (2 * Math.PI) / mouvement.periode
  const onde = (retard = 0) => Math.sin(w * t + mouvement.phase - retard)

  // Respiration : montée un peu plus rapide que la descente, comme un souffle.
  const bob = -mouvement.bob * hauteur * (0.5 + 0.5 * onde()) * 1.0
  const rotBuste = mouvement.buste * onde(0.2)
  const rotTete = mouvement.tete * onde(0.2 + mouvement.retardTete)

  const part = (p: { y: number; hauteur: number }) => ({
    position: 'absolute' as const,
    left: 0,
    top: p.y * k,
    width: largeur,
    height: p.hauteur * k,
  })

  return (
    <div
      style={{
        position: 'absolute',
        left: x - largeur / 2,
        top: y - hauteur,
        width: largeur,
        height: hauteur,
        transformOrigin: '50% 100%',
        transform: `scale(${scale}) translateY(${bob}px)`,
        opacity,
      }}
    >
      <Img src={staticFile(`persos/${nom}-jambes.png`)} style={part(m.jambes)} />
      <div
        style={{
          ...part(m.buste),
          transformOrigin: `${m.buste.pivotX * k}px ${(m.buste.pivotY - m.buste.y) * k}px`,
          transform: `rotate(${rotBuste}deg)`,
        }}
      >
        <Img src={staticFile(`persos/${nom}-buste.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: (m.tete.y - m.buste.y) * k,
            width: largeur,
            height: m.tete.hauteur * k,
            transformOrigin: `${m.tete.pivotX * k}px ${(m.tete.pivotY - m.tete.y) * k}px`,
            transform: `rotate(${rotTete}deg)`,
          }}
        >
          <Img src={staticFile(`persos/${nom}-tete.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        </div>
      </div>
    </div>
  )
}

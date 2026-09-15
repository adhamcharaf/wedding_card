import { wedding } from '../content/wedding'
import { useT } from '../i18n/useT'
import { couperMusique } from '../lib/musique'
import { useAppStore } from '../store/useAppStore'

/** Haut-parleur en haut à gauche, dès que la musique joue. Reste visible tout le long. */
export function SoundToggle() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const tour = useAppStore((s) => s.tour)
  const coupe = useAppStore((s) => s.sonCoupe)
  const setCoupe = useAppStore((s) => s.setSonCoupe)
  // Absent tant que la musique n'a jamais démarré ; sur « revoir le film », elle continue, le bouton reste.
  if (phase === 'gate' && tour === 0) return null

  function basculer() {
    couperMusique(!coupe)
    setCoupe(!coupe)
  }

  return (
    <button
      type="button"
      className="sound"
      aria-label={t(coupe ? wedding.sound.unmute : wedding.sound.mute)}
      aria-pressed={coupe}
      onClick={basculer}
    >
      <svg className="sound__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        {coupe ? (
          <path d="M16 9l5 6M21 9l-5 6" />
        ) : (
          <>
            <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
            <path d="M18 7a7 7 0 0 1 0 10" />
          </>
        )}
      </svg>
    </button>
  )
}

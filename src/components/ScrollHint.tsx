import { wedding } from '../content/wedding'
import { useDefile } from '../hooks/useDefile'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Dès ce défilement, l'invité a compris : l'indication disparaît. */
const SEUIL_PX = 80

/**
 * « Faites défiler » avec un chevron, en bas de l'écran, après le film et
 * jusqu'au premier défilement. Apparaît une fois la carte imprimée.
 */
export function ScrollHint() {
  const t = useT()
  const phase = useAppStore((s) => s.phase)
  const passe = useDefile(SEUIL_PX)
  if (phase !== 'scroll' || passe) return null

  return (
    <div className="scroll-hint" aria-hidden="true">
      <span className="scroll-hint__text">{t(wedding.text.hero.scroll)}</span>
      <svg className="scroll-hint__chevron" viewBox="0 0 24 24">
        <path d="M5 9l7 7 7-7" />
      </svg>
    </div>
  )
}

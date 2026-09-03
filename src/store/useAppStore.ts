import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../content/wedding'

/**
 * Machine à phases (docs/CONCEPTION.md §4).
 * Démarre en `scroll` tant que l'écran d'accueil n'existe pas (étape 4).
 */
export type Phase = 'gate' | 'intro' | 'bridge' | 'envelope' | 'scroll'

interface AppState {
  phase: Phase
  lang: Lang
  setPhase: (phase: Phase) => void
  setLang: (lang: Lang) => void
}

const STORAGE_KEY = 'al-wedding'

/** Français si le navigateur est en français, anglais sinon. */
function detectLang(): Lang {
  const tag = typeof navigator === 'undefined' ? '' : navigator.language
  return tag.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      phase: 'scroll',
      lang: detectLang(),
      setPhase: (phase) => set({ phase }),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: STORAGE_KEY,
      // Seule la langue est mémorisée : la phase repart de zéro à chaque visite.
      partialize: (state) => ({ lang: state.lang }),
    },
  ),
)

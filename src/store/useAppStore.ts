import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../content/wedding'

/**
 * Machine à phases (docs/CONCEPTION.md §4) : gate → intro → scroll.
 * L'enveloppe et la carte qui en sort sont dans la vidéo, il n'y a plus de
 * phases DOM entre l'intro et le scroll.
 */
export type Phase = 'gate' | 'intro' | 'scroll'

interface AppState {
  phase: Phase
  /**
   * Vrai quand on arrive sur le hero depuis la fin de la vidéo : la carte
   * s'imprime sur le papier. Faux en arrivée directe (reduced-motion, erreur).
   */
  impression: boolean
  /** Compteur de visionnages : remonte l'intro à neuf quand on rejoue le film. */
  tour: number
  lang: Lang
  setPhase: (phase: Phase) => void
  /** Bouton « revoir le film » : retour à la gate, intro remontée à neuf. */
  rejouer: () => void
  /** Sortie de l'intro, avec ou sans impression de la carte. */
  finirIntro: (impression: boolean) => void
  setLang: (lang: Lang) => void
}

const STORAGE_KEY = 'al-wedding'

/** Anglais pour tout le monde au premier chargement (décision du 2026-09-13), le bouton FR/EN fait le reste. */
const LANG_PAR_DEFAUT: Lang = 'en'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      phase: 'gate',
      impression: false,
      tour: 0,
      lang: LANG_PAR_DEFAUT,
      setPhase: (phase) => set({ phase, impression: false }),
      rejouer: () => set((s) => ({ phase: 'gate', impression: false, tour: s.tour + 1 })),
      finirIntro: (impression) => set({ phase: 'scroll', impression }),
      setLang: (lang) => set({ lang }),
    }),
    {
      name: STORAGE_KEY,
      // Seule la langue est mémorisée : la phase repart de zéro à chaque visite.
      partialize: (state) => ({ lang: state.lang }),
    },
  ),
)

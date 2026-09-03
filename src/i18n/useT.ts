import { useCallback, useEffect } from 'react'
import type { Localized } from '../content/wedding'
import { useAppStore } from '../store/useAppStore'

/** Renvoie `t`, qui choisit dans une clé { fr, en } la version de la langue courante. */
export function useT() {
  const lang = useAppStore((state) => state.lang)
  return useCallback((key: Localized) => key[lang], [lang])
}

/**
 * Reflète la langue courante sur <html lang>, pour l'accessibilité et la césure.
 * À appeler une seule fois, dans App.
 */
export function useDocumentLang() {
  const lang = useAppStore((state) => state.lang)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])
}

import { useSyncExternalStore } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

// Horloge externe qui « tique » chaque seconde. Pas de setState dans un effet,
// pas de Date.now() pendant le rendu : le composant reste pur.
function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000)
  return () => window.clearInterval(id)
}

function getNowSeconds() {
  return Math.floor(Date.now() / 1000)
}

/** Temps restant jusqu'à `iso`, mis à jour chaque seconde. Sans animation (étape 6). */
export function useCountdown(iso: string): Countdown {
  const now = useSyncExternalStore(subscribe, getNowSeconds, getNowSeconds)
  const target = Math.floor(Date.parse(iso) / 1000)
  const remaining = Math.max(0, target - now)
  return {
    days: Math.floor(remaining / 86_400),
    hours: Math.floor((remaining % 86_400) / 3_600),
    minutes: Math.floor((remaining % 3_600) / 60),
    seconds: remaining % 60,
    done: remaining === 0,
  }
}

/** Icônes ligne (docs/CONCEPTION.md §2), décoratives : le texte voisin porte le sens. */

export function ClockIcon() {
  return (
    <svg className="icon" viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="12.5" />
      <path d="M16 9v7.5l4.5 3" />
    </svg>
  )
}

export function PinIcon() {
  return (
    <svg className="icon" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 29c6-7.5 9-12.5 9-16.5A9 9 0 0 0 7 12.5C7 16.5 10 21.5 16 29Z" />
      <circle cx="16" cy="12.5" r="3.2" />
    </svg>
  )
}

/** Ornement « ligne, étoile, ligne » entre deux blocs. */
export function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <svg className="ornament__star" viewBox="0 0 16 16">
        <path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4 Z" />
      </svg>
    </div>
  )
}

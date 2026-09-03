/** Fond pêche dégradé et grain animé (docs/CONCEPTION.md §5). Purement décoratif. */
export function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__grain" />
    </div>
  )
}

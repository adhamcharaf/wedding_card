import { Background } from './components/Background'
import { LangToggle } from './components/LangToggle'
import { wedding } from './content/wedding'
import { useDocumentLang, useT } from './i18n/useT'

/**
 * Étape 1 : aperçu minimal pour valider le fond, le grain et le toggle de langue.
 * Les vraies sections arrivent à l'étape 2 et remplaceront ce contenu.
 */
export default function App() {
  useDocumentLang()
  const t = useT()

  return (
    <>
      <Background />
      <LangToggle />
      <main className="column">
        <section className="screen">
          <p className="monogram">{wedding.couple.monogram}</p>
          <p className="gate-hint">{t(wedding.text.gate)}</p>
        </section>

        <section className="screen">
          <h1 className="hero__title">{t(wedding.text.hero.saveTheDate)}</h1>
          <p className="hero__name">{wedding.couple.a}</p>
          <p className="hero__amp">{wedding.couple.ampersand}</p>
          <p className="hero__name">{wedding.couple.b}</p>
          <p className="hero__date">{wedding.dateLabel}</p>
        </section>

        <section className="screen">
          <p className="invitation">{t(wedding.text.invitation)}</p>
          <p className="celebration">{t(wedding.text.celebration)}</p>
          <p className="detail">{t(wedding.text.time)}</p>
          <p className="detail detail--venue">{wedding.venue.name}</p>
          <p className="detail">{t(wedding.venue.city)}</p>
        </section>
      </main>
    </>
  )
}

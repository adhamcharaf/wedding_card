import { wedding } from '../../content/wedding'
import { useT } from '../../i18n/useT'
import { ClockIcon, PinIcon } from '../icons'
import { Reveal } from '../Reveal'

/** Date, heure, lieu et lien Google Maps (docs/mockups/2.png). */
export function Venue() {
  const t = useT()
  return (
    <section className="section" id="venue">
      <Reveal className="stack">
        <span className="vline" aria-hidden="true" />
        <ClockIcon />
        <p className="detail detail--big">{t(wedding.text.time)}</p>
        <p className="detail">{t(wedding.text.dateLong)}</p>
        <span className="stack__gap" aria-hidden="true" />
        <PinIcon />
        <p className="detail detail--big">{wedding.venue.name}</p>
        <p className="detail">{t(wedding.venue.city)}</p>
        {wedding.venue.mapsUrl && (
          <a className="btn" href={wedding.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            {t(wedding.text.maps)}
          </a>
        )}
      </Reveal>
    </section>
  )
}

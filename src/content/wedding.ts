/**
 * Contenu du faire-part. Tout texte visible vit ici, avec des clés { fr, en }.
 * Les valeurs identiques dans les deux langues (noms, monogramme, dates, URLs)
 * restent des chaînes simples.
 *
 * Les textes français absents des maquettes sont des propositions à relire
 * par Adham.
 */

export type Lang = 'fr' | 'en'
export type Localized = Readonly<Record<Lang, string>>

export const LANGS: readonly Lang[] = ['fr', 'en']

export const wedding = {
  couple: { a: 'Adham', b: 'Lara', ampersand: '&', monogram: 'A&L' },

  /** Date et heure de la célébration. Abidjan est en UTC+0 toute l'année. */
  date: '2027-01-08T20:30:00+00:00',
  dateLabel: '08.01.27',

  venue: {
    name: 'Indian by nature',
    city: { fr: "Abidjan, Côte d'Ivoire", en: 'Abidjan, Ivory Coast' },
    mapsUrl:
      'https://www.google.com/maps/place/indian+by+nature/data=!4m2!3m1!1s0xfc1ef4a0b169bdd:0xfaf63ce27ef23d38?sa=X&ved=1t:242&ictx=111',
  },

  lang: {
    label: { fr: 'Langue', en: 'Language' },
    /** Libellé du bouton de chaque langue, dans sa propre langue. */
    names: { fr: 'FR', en: 'EN' },
  },

  text: {
    gate: { fr: 'Toucher pour ouvrir', en: 'Tap to open' },
    skip: { fr: 'Passer', en: 'Skip' },

    hero: {
      saveTheDate: { fr: 'Save the Date', en: 'Save the Date' },
    },

    invitation: {
      fr: 'Le cœur plein de joie, nous vous invitons à célébrer notre mariage',
      en: 'With full hearts, we joyfully invite you to our wedding',
    },
    celebration: { fr: 'Célébration du mariage', en: 'Wedding celebration' },

    /** Section photos d'enfance, ajoutée par Adham le 2026-09-03 (DECISIONS.md). */
    babies: {
      title: { fr: 'Ces deux-là se marient', en: 'These two are getting married' },
      altA: { fr: 'Adham enfant', en: 'Adham as a child' },
      altB: { fr: 'Lara enfant', en: 'Lara as a child' },
    },
    dateLong: { fr: 'Vendredi 8 janvier 2027', en: 'Friday, January 8, 2027' },
    time: { fr: '20 h 30', en: '8:30 PM' },
    maps: { fr: 'Google Maps', en: 'Google Maps' },

    countdown: {
      title: { fr: 'Compte à rebours', en: 'Countdown' },
      days: { fr: 'jours', en: 'days' },
      hours: { fr: 'heures', en: 'hours' },
      minutes: { fr: 'minutes', en: 'minutes' },
      seconds: { fr: 'secondes', en: 'seconds' },
      today: { fr: "C'est aujourd'hui", en: "It's today" },
    },

    program: {
      title: { fr: 'Programme', en: 'Program' },
    },

    practical: {
      title: { fr: 'Infos pratiques', en: 'Practical information' },
    },

    registry: {
      title: { fr: 'Liste de mariage', en: 'Gift registry' },
    },

    rsvp: {
      title: { fr: 'RSVP', en: 'RSVP' },
      intro: {
        fr: 'Merci de nous confirmer votre présence.',
        en: 'Please let us know if you can join us.',
      },
      name: { fr: 'Votre nom', en: 'Your name' },
      attending: { fr: 'Serez-vous des nôtres ?', en: 'Will you join us?' },
      yes: { fr: 'Avec joie', en: 'Joyfully yes' },
      no: { fr: 'Avec regret', en: 'Regretfully no' },
      guests: { fr: 'Nombre de personnes, vous compris', en: 'Number of guests, including you' },
      message: { fr: 'Un mot pour nous', en: 'A word for us' },
      send: { fr: 'Envoyer', en: 'Send' },
      sending: { fr: 'Envoi en cours', en: 'Sending' },
      /** Affiché sous le bouton tant que le formulaire n'est pas branché (étape 3). */
      comingSoon: { fr: 'Ouverture prochaine', en: 'Opening soon' },
      success: {
        fr: 'Merci, votre réponse est bien enregistrée.',
        en: 'Thank you, your reply has been saved.',
      },
      errorName: { fr: "Merci d'indiquer votre nom.", en: 'Please enter your name.' },
      errorGeneric: {
        fr: 'Une erreur est survenue. Réessayez dans un instant.',
        en: 'Something went wrong. Please try again in a moment.',
      },
    },

    end: {
      closing: {
        fr: 'Nous avons hâte de vous retrouver',
        en: "We can't wait to celebrate with you",
      },
      replay: { fr: 'Revoir le film', en: 'Watch the film again' },
    },
  },

  registry: [{ label: { fr: "Cilya's home", en: "Cilya's home" }, url: '' }],

  /** Contenu à compléter (docs/points-ouverts.md, point 5). */
  program: [{ time: '20:30', label: { fr: 'Début de la célébration', en: 'Celebration begins' } }],

  /** Contenu à compléter (docs/points-ouverts.md, point 6). */
  practical: [
    { label: { fr: 'Dress code', en: 'Dress code' }, value: { fr: 'À venir', en: 'To be announced' } },
    { label: { fr: 'Hébergement', en: 'Accommodation' }, value: { fr: 'À venir', en: 'To be announced' } },
  ],
} as const

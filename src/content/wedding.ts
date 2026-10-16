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
    city: { fr: "Abidjan, Côte d'Ivoire", en: "Abidjan, Côte d'Ivoire" },
    /** Lien Google Maps sans les paramètres de suivi de la recherche d'origine. */
    mapsUrl: 'https://www.google.com/maps/place/indian+by+nature/data=!4m2!3m1!1s0xfc1ef4a0b169bdd:0xfaf63ce27ef23d38',
  },

  /** Clôture des réponses RSVP : fin du 15 décembre 2026, heure d'Abidjan (UTC+0). Même valeur dans `api/rsvp.ts` (CLOTURE), à changer ensemble. */
  rsvpClosesAt: '2026-12-16T00:00:00+00:00',

  /** Numéro WhatsApp des mariés, chiffres seuls avec l'indicatif (ex. 2250700000000). Vide = pas de lien, le mot reste en texte. */
  contact: { whatsapp: '2250747666667' },

  sound: {
    mute: { fr: 'Couper la musique', en: 'Mute the music' },
    unmute: { fr: 'Remettre la musique', en: 'Unmute the music' },
  },

  lang: {
    label: { fr: 'Langue', en: 'Language' },
    /** Libellé du bouton de chaque langue, dans sa propre langue. */
    names: { fr: 'FR', en: 'EN' },
    /** Même chose en toutes lettres, pour le choix à l'accueil. */
    longNames: { fr: 'Français', en: 'English' },
  },

  text: {
    /** Écran d'accueil : langue, code d'invitation et prénom facultatif, puis « Ouvrir » quand musique et film sont en mémoire. */
    gate: {
      firstName: { fr: 'Votre prénom', en: 'Your first name' },
      optional: { fr: 'facultatif', en: 'optional' },
      /** Code à 4 chiffres du groupe (ADR-0004), demandé seulement s'il n'est pas dans le lien. */
      code: { fr: 'Code de votre invitation', en: 'Your invitation code' },
      /** Sous le champ code. Le mot « WhatsApp » devient un lien si `contact.whatsapp` est renseigné. */
      noCode: { fr: 'Pas de code ? Écrivez-nous sur WhatsApp.', en: 'No code? Message us on WhatsApp.' },
      codeUnknown: {
        fr: 'Ce code ne correspond à aucune invitation. Vérifiez-le, ou écrivez-nous sur WhatsApp.',
        en: "This code doesn't match any invitation. Please check it, or message us on WhatsApp.",
      },
      open: { fr: 'Ouvrir', en: 'Open' },
      /** Sous le bouton, tant que tout n'est pas en mémoire. */
      loading: { fr: "L'enveloppe est en route", en: 'The envelope is on its way' },
      /** Revisite ou « revoir le film », quand un prénom est connu. `{name}` est remplacé. */
      hello: { fr: 'Bonjour {name}', en: 'Hello {name}' },
    },

    hero: {
      saveTheDate: { fr: 'Save the Date', en: 'Save the Date' },
      /** Indication de défilement sous le premier écran, jusqu'au premier scroll. */
      scroll: { fr: 'Faites défiler', en: 'Scroll down' },
    },

    /** Textes de Lara, 2026-09-13. */
    invitation: {
      fr: "C'est avec joie et bonheur que nous vous invitons à célébrer notre mariage",
      en: 'With full hearts, we joyfully invite you to our wedding',
    },
    /** Même phrase quand l'invité a donné son prénom à l'accueil. `{name}` est remplacé. */
    invitationNamed: {
      fr: "{name}, c'est avec joie et bonheur que nous vous invitons à célébrer notre mariage",
      en: '{name}, with full hearts, we joyfully invite you to our wedding',
    },
    celebration: { fr: 'Célébration du mariage', en: 'Wedding celebration' },

    /** Section photos d'enfance, ajoutée par Adham le 2026-09-03 (DECISIONS.md). Titre de Lara. */
    babies: {
      title: { fr: 'Ces deux-là vont se dire oui !', en: 'These two are getting married!' },
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

    registry: {
      title: { fr: 'Liste de mariage', en: 'Gift registry' },
      /** Sous les boutiques : les listes n'existent qu'en magasin. */
      inStore: {
        fr: 'Nos listes vous attendent directement en boutique.',
        en: 'Our registries are waiting for you in store.',
      },
      /** Sous la note des boutiques, le lien discret vers la page `/adham` (2026-10-16). */
      groom: {
        fr: 'Et pour ceux qui voudraient gâter le marié, il a ses propres priorités.',
        en: 'And for those who would like to spoil the groom, he has his own priorities.',
      },
    },

    /**
     * Page `/adham`, ouverte depuis la liste de mariage : les envies du marié (2026-10-13, revue le 2026-10-16).
     * Un seul trait d'humour, l'intro d'Adham ; le reste aussi sobre que la page du compte.
     */
    adham: {
      title: { fr: 'Pour le marié', en: 'For the groom' },
      intro: {
        fr: '« Lara s’est occupée de la déco. Je me suis occupé de l’essentiel. »',
        en: '“Lara took care of the decor. I took care of the essentials.”',
      },
      /** Système « Je l'offre » : un cadeau offert disparaît de la liste pour tous, sans nom. Le nom du cadeau s'affiche au-dessus de la question. */
      offer: { fr: 'Je l’offre', en: 'I’ll give it' },
      confirm: {
        fr: 'Vous offrez ce cadeau ? Il disparaîtra de la liste pour tous les invités. Votre nom restera anonyme.',
        en: 'Giving this gift? It will disappear from the list for every guest. Your name will stay anonymous.',
      },
      yes: { fr: 'Oui, je l’offre', en: 'Yes, I’ll give it' },
      cancel: { fr: 'Annuler', en: 'Cancel' },
      thanks: {
        fr: 'Merci infiniment. Adham vous remerciera de vive voix le 8 janvier.',
        en: 'Thank you so much. Adham will thank you in person on January 8.',
      },
      already: { fr: 'Quelqu’un l’a offert juste avant vous. Il est retiré de la liste.', en: 'Someone gave it just before you. It has been taken off the list.' },
      close: { fr: 'Fermer', en: 'Close' },
      allGiven: { fr: 'Tout a été offert. Merci infiniment.', en: 'Everything has been given. Thank you so much.' },
      closing: { fr: 'Merci, du fond du cœur.', en: 'Thank you, from the bottom of my heart.' },
    },

    /** Page `/compte`, ouverte depuis la liste de mariage : les coordonnées bancaires hors de la page principale. */
    bank: {
      title: { fr: 'Compte en banque', en: 'Bank account' },
      holder: { fr: 'Titulaire', en: 'Account holder' },
      bankName: { fr: 'Banque', en: 'Bank' },
      copy: { fr: "Copier l'IBAN", en: 'Copy the IBAN' },
      copied: { fr: 'IBAN copié', en: 'IBAN copied' },
      back: { fr: 'Retour au faire-part', en: 'Back to the invitation' },
    },

    rsvp: {
      title: { fr: 'RSVP', en: 'RSVP' },
      intro: {
        fr: "Merci de nous confirmer la présence de chacun : c'est cette réponse qui réserve vos places.",
        en: "Please let us know who will be with us: this reply is what reserves your seats.",
      },
      /** Le temps de retrouver le groupe. */
      loading: { fr: 'Un instant, nous retrouvons votre invitation.', en: 'One moment, we are finding your invitation.' },
      /** Formulaire sans code connu : l'écran d'accueil a été passé sans vérification. */
      code: { fr: 'Code de votre invitation', en: 'Your invitation code' },
      find: { fr: 'Retrouver mon invitation', en: 'Find my invitation' },
      codeUnknown: {
        fr: 'Ce code ne correspond à aucune invitation. Vérifiez-le, ou écrivez-nous sur WhatsApp.',
        en: "This code doesn't match any invitation. Please check it, or message us on WhatsApp.",
      },
      yes: { fr: 'Avec joie', en: 'Joyfully yes' },
      no: { fr: 'Avec regret', en: 'Regretfully no' },
      /** Sous chaque nom : déplie le champ du mot de cette personne. */
      addWord: { fr: 'Laisser un mot', en: 'Leave a word' },
      /** Libellé du champ déplié. `{name}` est remplacé. */
      wordFrom: { fr: 'Un mot de {name}', en: 'A word from {name}' },
      /** Les places sont comptées par groupe (ADR-0004). Le mot « WhatsApp » devient un lien si `contact.whatsapp` est renseigné. */
      extraGuest: {
        fr: 'Pour une personne supplémentaire, écrivez-nous sur WhatsApp : nous ferons au mieux selon les places disponibles.',
        en: "For an extra guest, message us on WhatsApp and we'll do our best depending on the seats available.",
      },
      children: {
        fr: 'Ce soir-là, les enfants restent au chaud à la maison : nous avons choisi une célébration entre adultes, merci de votre compréhension.',
        en: "That night, the little ones stay snug at home: we've chosen an adults-only celebration, thank you for understanding.",
      },
      deadline: { fr: 'Réponse souhaitée avant le 15 décembre 2026.', en: 'Kindly reply by December 15, 2026.' },
      send: { fr: 'Envoyer', en: 'Send' },
      sending: { fr: 'Envoi en cours', en: 'Sending' },
      success: {
        fr: 'Merci, votre réponse est bien enregistrée.',
        en: 'Thank you, your reply has been saved.',
      },
      /** Réponse déjà donnée : le récapitulatif du groupe. `{date}` reçoit la date du dernier envoi. */
      answered: { fr: 'Votre réponse du {date}', en: 'Your reply from {date}' },
      /** Membre ajouté après coup, sans réponse encore. */
      pending: { fr: 'pas encore de réponse', en: 'no reply yet' },
      edit: { fr: 'Modifier', en: 'Edit' },
      cancel: { fr: 'Annuler', en: 'Cancel' },
      /** Fenêtre qui s'ouvre à l'envoi quand il manque quelque chose. `{fields}` reçoit la liste. */
      missing: { fr: 'Il manque encore : {fields}.', en: 'Still missing: {fields}.' },
      missingPresence: { fr: 'la réponse de {name}', en: "{name}'s reply" },
      missingWord: { fr: "un mot de l'un d'entre vous", en: 'a word from one of you' },
      ok: { fr: 'Compris', en: 'Got it' },
      errorGeneric: {
        fr: 'Une erreur est survenue. Réessayez dans un instant.',
        en: 'Something went wrong. Please try again in a moment.',
      },
      retry: { fr: 'Réessayer', en: 'Try again' },
      /** Affiché à la place du formulaire après `rsvpClosesAt`. */
      closed: {
        fr: 'Les réponses sont closes depuis le 15 décembre. Pour toute question, écrivez-nous sur WhatsApp.',
        en: 'Replies closed on December 15. For any question, message us on WhatsApp.',
      },
    },

    end: {
      closing: {
        fr: 'Nous avons hâte de vous retrouver',
        en: "We can't wait to celebrate with you",
      },
      /** Avec le prénom donné à l'accueil. `{name}` est remplacé. */
      closingNamed: {
        fr: 'Nous avons hâte de vous retrouver, {name}',
        en: "We can't wait to celebrate with you, {name}",
      },
      replay: { fr: 'Revoir le film', en: 'Watch the film again' },
    },
  },

  /**
   * Liste de Lara, 2026-09-13, boutiques revues par Adham le 2026-10-13. Les boutiques n'ont pas de lien : les listes
   * n'existent qu'en magasin (2026-09-15). Le compte ouvre la page `/compte`. La page `/adham` s'ouvre par la
   * phrase `text.registry.groom`, sous la note des boutiques, pour rester un aparté (2026-10-16).
   */
  registry: [
    { label: { fr: 'Cilya’s concept', en: 'Cilya’s concept' }, url: '' },
    { label: { fr: 'Orca deco', en: 'Orca deco' }, url: '' },
    { label: { fr: 'Compte en banque', en: 'Bank account' }, url: '/compte' },
  ],

  /**
   * Les envies du marié, sur la page `/adham` (2026-10-13, revue le 2026-10-16). L'`id` sert au système
   * « Je l'offre » : il doit figurer aussi dans `api/cadeaux.ts`. Un nom simple, sans commentaire ni prix ;
   * le nom mène à la page produit exacte (l'enceinte Denon est la version avec Alexa, pas la NV).
   */
  adhamList: [
    {
      id: 'box-hue',
      name: { fr: 'Hue Sync Box', en: 'Hue Sync Box' },
      url: 'https://www.philips-hue.com/fr-fr/p/hue-philips-hue-play-hdmi-sync-box-8k/8719514458666',
    },
    {
      id: 'barres-hue',
      name: { fr: 'Barres Hue Play', en: 'Hue Play light bars' },
      url: 'https://www.philips-hue.com/fr-fr/p/hue-white-and-color-ambiance-hue-play-pack-x2/7820231P7',
    },
    {
      id: 'enceinte-denon',
      name: { fr: 'Enceinte Denon Home 150', en: 'Denon Home 150 speaker' },
      url: 'https://www.son-video.com/article/haute-fidelite-systemes-multiroom-enceintes-multiroom/denon/home-150-blanc',
    },
    {
      id: 'platine',
      name: { fr: 'Platine vinyle', en: 'Turntable' },
      url: 'https://www.ldlc.com/fiche/PB00437725.html',
    },
    {
      id: 'echo-show',
      name: { fr: 'Echo Show 8', en: 'Echo Show 8' },
      url: 'https://www.amazon.fr/dp/B0DTQF1MQT',
    },
    {
      id: 'apple-tv',
      name: { fr: 'Apple TV 4K', en: 'Apple TV 4K' },
      url: 'https://www.apple.com/fr/apple-tv-4k/',
    },
  ],

  /** Coordonnées du RIB AFG Bank fourni par Adham le 2026-09-15 (compte en XOF, agence de Biétry). */
  bank: {
    holder: 'CHARAFEDDINE Adham Samir',
    name: "AFG Bank Côte d'Ivoire",
    iban: 'CI93 CI26 0010 0180 1792 9410 0262',
    swift: 'AFGICIAB',
  },
} as const

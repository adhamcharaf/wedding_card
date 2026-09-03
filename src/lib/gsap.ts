import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Enregistré une seule fois, ici. Les composants importent gsap depuis ce module.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

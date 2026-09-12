/* Palette et typos du site, reprises telles quelles pour juger sur les vraies couleurs. */
import { staticFile } from 'remotion'

export const PECHE_HAUT = '#fbca8c'
export const PECHE_MILIEU = '#f7b274'
export const PECHE_BAS = '#f5975f'
export const ENCRE = '#7f2f26'
export const TRAIT = '#1c1512'
export const CREME = '#fff4ec'

export const FONTS_CSS = `
@font-face { font-family: 'Cormorant Garamond'; font-style: normal; font-weight: 500;
  src: url('${staticFile('fonts/cormorant-garamond-500.woff2')}') format('woff2'); }
@font-face { font-family: 'Cormorant Garamond'; font-style: italic; font-weight: 500;
  src: url('${staticFile('fonts/cormorant-garamond-500-italic.woff2')}') format('woff2'); }
@font-face { font-family: 'Herr Von Muellerhoff'; font-style: normal; font-weight: 400;
  src: url('${staticFile('fonts/herr-von-muellerhoff-400.woff2')}') format('woff2'); }
`

export const SERIF = "'Cormorant Garamond', Georgia, serif"
export const SCRIPT = "'Herr Von Muellerhoff', cursive"

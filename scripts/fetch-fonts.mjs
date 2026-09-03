/**
 * Télécharge les WOFF2 auto-hébergés dans public/fonts/ depuis Google Fonts,
 * réduits aux caractères utiles (ASCII, Latin-1, œ Œ, ponctuation typographique).
 * Un fichier par fonte. À relancer si un caractère hors de ce jeu apparaît
 * dans src/content/wedding.ts : `npm run fonts`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'fonts')

const FAMILIES = 'family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Pinyon+Script'

// Jeu de caractères : ASCII imprimable, Latin-1 supplément, ligatures et ponctuation.
let chars = ''
for (let c = 0x20; c <= 0x7e; c++) chars += String.fromCharCode(c)
for (let c = 0xa0; c <= 0xff; c++) chars += String.fromCharCode(c)
chars += 'ŒœŸ’‘“”«»…–—•✦'

const url = `https://fonts.googleapis.com/css2?${FAMILIES}&text=${encodeURIComponent(chars)}&display=swap`
// Un navigateur récent pour obtenir du woff2.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text()
const blocks = [...css.matchAll(/@font-face \{([^}]*)\}/g)].map((m) => m[1])
if (blocks.length === 0) throw new Error(`Aucun @font-face reçu :\n${css}`)

mkdirSync(outDir, { recursive: true })
for (const block of blocks) {
  const family = /font-family: '([^']+)'/.exec(block)?.[1] ?? 'inconnu'
  const style = /font-style: (\w+)/.exec(block)?.[1] ?? 'normal'
  const weight = /font-weight: (\d+)/.exec(block)?.[1] ?? '400'
  // Avec `text=`, l'URL est de la forme /l/font?kit=..., sans extension.
  const src = /url\((https:[^)]+)\)\s*format\('woff2'\)/.exec(block)?.[1]
  if (!src) throw new Error(`Pas de woff2 pour ${family} ${style} ${weight} :\n${block}`)
  const slug = family.toLowerCase().replace(/\s+/g, '-')
  const name = `${slug}-${weight}${style === 'italic' ? '-italic' : ''}.woff2`
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer())
  writeFileSync(join(outDir, name), buf)
  console.log(`${name.padEnd(40)} ${(buf.length / 1024).toFixed(1)} Ko`)
}

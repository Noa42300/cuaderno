// Génère les icônes PNG (PWA, iOS) à partir du logo SVG. Lancer : npm run icons
// (utilise Playwright/Chromium localement ; les PNG produits sont versionnés).
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import { readFileSync, writeFileSync } from 'node:fs'

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const tuile = svg.replace(/<rect width="64" height="64" rx="14"/, '<rect width="64" height="64" rx="0"')
const sorties = [
  ['icon-192.png', 192, svg, 0],
  ['icon-512.png', 512, svg, 0],
  ['apple-touch-icon.png', 180, tuile, 0], // iOS arrondit lui-même : carré plein
  ['icon-maskable-512.png', 512, tuile, 0.1], // zone de sécurité Android
]
const browser = await chromium.launch()
const page = await browser.newPage()
for (const [nom, taille, src, marge] of sorties) {
  const pad = Math.round(taille * marge)
  await page.setViewportSize({ width: taille, height: taille })
  await page.setContent(`<html><body style="margin:0;background:${marge ? '#1F3A5F' : 'transparent'}">
    <div style="padding:${pad}px;width:${taille - 2 * pad}px;height:${taille - 2 * pad}px">${src.replace('<svg', '<svg width="100%" height="100%"')}</div></body></html>`)
  writeFileSync(new URL(`../public/${nom}`, import.meta.url), await page.screenshot({ omitBackground: !marge }))
}
await browser.close()
console.log('Icônes générées.')

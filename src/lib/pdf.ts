import { telecharger } from '../db/backup'

// Chargées à la demande : n'alourdissent pas l'ouverture de l'appli.
const libs = () => Promise.all([import('html2canvas-pro'), import('jspdf')])

const capturer = async (el: HTMLElement) => {
  const [{ default: html2canvas }] = await libs()
  return html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
}

/**
 * Feuille A4 portrait → PDF. Le contenu est découpé en pages sans couper un bloc
 * (éléments marqués `data-bloc`) quand c'est possible.
 */
export async function pdfFeuille(el: HTMLElement, nom: string) {
  const [, { jsPDF }] = await libs()
  const canvas = await capturer(el)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  const echelle = canvas.width / el.offsetWidth
  const hautPage = Math.floor((canvas.width * ph) / pw)

  // Coupures possibles : bas de chaque bloc.
  const top0 = el.getBoundingClientRect().top
  const coupures = [...el.querySelectorAll<HTMLElement>('[data-bloc]')]
    .map((b) => Math.round((b.getBoundingClientRect().bottom - top0) * echelle))
    .sort((a, b) => a - b)

  let y = 0
  let premiere = true
  while (y < canvas.height - 4) {
    let fin = Math.min(y + hautPage, canvas.height)
    if (fin < canvas.height) {
      const c = coupures.filter((x) => x > y + hautPage * 0.4 && x <= fin).pop()
      if (c) fin = c
    }
    const page = document.createElement('canvas')
    page.width = canvas.width
    page.height = fin - y
    page.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, fin - y, 0, 0, canvas.width, fin - y)
    if (!premiere) pdf.addPage()
    pdf.addImage(page.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ((fin - y) * pw) / canvas.width)
    premiere = false
    y = fin
  }
  telecharger(nom, pdf.output('blob'))
}

/** Une diapositive = une page A4 paysage. */
export async function pdfDiapos(els: HTMLElement[], nom: string) {
  const [, { jsPDF }] = await libs()
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  for (const [i, el] of els.entries()) {
    const c = await capturer(el)
    if (i) pdf.addPage()
    const h = Math.min(ph, (c.height * pw) / c.width)
    pdf.addImage(c.toDataURL('image/jpeg', 0.92), 'JPEG', 0, (ph - h) / 2, pw, h)
  }
  telecharger(nom, pdf.output('blob'))
}

/** Impression navigateur (secours : « Enregistrer en PDF »). Imprime uniquement `el`. */
export function imprimer(el: HTMLElement, paysage = false) {
  el.classList.add('zone-impression')
  const style = document.createElement('style')
  style.textContent = `@page { size: A4 ${paysage ? 'landscape' : 'portrait'}; margin: 0 }`
  document.head.appendChild(style)
  const fin = () => {
    el.classList.remove('zone-impression')
    style.remove()
    removeEventListener('afterprint', fin)
  }
  addEventListener('afterprint', fin)
  print()
}

export const nomFichier = (s: string) =>
  (s || 'document').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 60)

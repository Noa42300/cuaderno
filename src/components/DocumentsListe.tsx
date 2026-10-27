import { useEffect, useRef, useState } from 'react'
import type { Seance } from '../db/types'
import { useQuery } from '../lib/hooks'
import { imprimer, nomFichier, pdfDiapos, pdfFeuille } from '../lib/pdf'
import { chargerDocs, Diapo, FicheExercices, FichePrep, TraceEcrite } from '../views/Documents'

type Doc = 'prep' | 'diaporama' | 'trace' | 'exercices' | 'corrige'

/** Liste « Documents à imprimer » d'une fiche : Aperçu · PDF · Imprimer, sans quitter la page. */
export default function DocumentsListe({ s }: { s: Seance }) {
  const [rendu, setRendu] = useState<{ doc: Doc; action: 'pdf' | 'print' } | null>(null)
  const nb = useQuery(async () => (await chargerDocs(s.id))?.pjs.length ?? 0, [s.id, s.modifieLe])
  const t = s.titre || 'seance'
  const lignes: [Doc, string, boolean][] = [
    ['prep', 'Fiche de préparation (A4)', true],
    ['diaporama', `${t} — Diaporama à projeter`, s.diapos.length > 0],
    ['trace', `${t} — Leçon à coller`, !!s.traceEcrite.trim()],
    ['exercices', `${t} — Fiche d’exercices`, s.exercices.length > 0],
    ['corrige', `${t} — Corrigé des exercices`, s.exercices.length > 0],
  ]
  return (
    <section className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-surface p-4">
      <h3 className="mb-2 flex items-center gap-2 font-semibold">🖨️ Documents à imprimer</h3>
      <ul className="divide-y divide-line">
        {lignes.filter(([, , ok]) => ok).map(([doc, libelle]) => (
          <li key={doc} className="flex flex-wrap items-center gap-2 py-2">
            <span className="min-w-0 flex-1">{libelle}</span>
            <a className="btn-ghost px-3 py-1 text-sm" href={`#/seance/${s.id}/documents/${doc}`}>🔍 Aperçu</a>
            <button className="btn-primary px-3 py-1 text-sm" disabled={!!rendu} onClick={() => setRendu({ doc, action: 'pdf' })}>
              {rendu?.doc === doc && rendu.action === 'pdf' ? '…' : '⬇ PDF'}
            </button>
            <button className="btn-ghost px-3 py-1 text-sm" disabled={!!rendu} onClick={() => setRendu({ doc, action: 'print' })}>🖨 Imprimer</button>
          </li>
        ))}
        <li className="flex items-center gap-2 py-2">
          <span className="min-w-0 flex-1">📎 Mes pièces jointes {nb ? `(${nb})` : ''}</span>
          <a className="btn-ghost px-3 py-1 text-sm" href={`#/seance/${s.id}/documents/pj`}>{nb ? 'Voir' : '+ Ajouter'}</a>
        </li>
      </ul>
      {rendu && <RenduHorsEcran id={s.id} doc={rendu.doc} action={rendu.action} nom={`${rendu.doc}-${nomFichier(t)}`} onFini={() => setRendu(null)} />}
    </section>
  )
}

/** Rend le document hors de l'écran, le capture (PDF) ou l'imprime, puis disparaît. */
function RenduHorsEcran({ id, doc, action, nom, onFini }: { id: string; doc: Doc; action: 'pdf' | 'print'; nom: string; onFini: () => void }) {
  const data = useQuery(() => chargerDocs(id), [id])
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!data || !ref.current) return
    let fini = false
    const go = async () => {
      await document.fonts.ready
      await new Promise((r) => setTimeout(r, 300))
      const el = ref.current!
      try {
        if (doc === 'diaporama') {
          if (action === 'pdf') await pdfDiapos([...el.querySelectorAll<HTMLElement>('.diapo')], `${nom}.pdf`)
          else imprimer(el, true)
        } else if (action === 'pdf') await pdfFeuille(el.querySelector<HTMLElement>('.feuille')!, `${nom}.pdf`)
        else imprimer(el.querySelector<HTMLElement>('.feuille')!)
      } catch (e) {
        alert(`Le PDF n’a pas pu être créé (${(e as Error).message}). Utilise « Imprimer » puis « Enregistrer en PDF ».`)
      } finally {
        if (!fini) onFini()
      }
    }
    go()
    return () => { fini = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  if (!data) return null
  return (
    <div className="hors-ecran" aria-hidden style={{ position: 'fixed', left: -10000, top: 0, width: doc === 'diaporama' ? 1123 : 'auto' }}>
      <div ref={ref}>
        {doc === 'prep' && <div className="feuille"><FichePrep {...data} /></div>}
        {doc === 'trace' && <div className="feuille"><TraceEcrite s={data.s} /></div>}
        {doc === 'exercices' && <div className="feuille"><FicheExercices s={data.s} /></div>}
        {doc === 'corrige' && <div className="feuille"><FicheExercices s={data.s} corrige /></div>}
        {doc === 'diaporama' && data.s.diapos.map((d, i) => <Diapo key={d.id} d={d} revele={99} numero={`${i + 1} / ${data.s.diapos.length}`} />)}
      </div>
    </div>
  )
}

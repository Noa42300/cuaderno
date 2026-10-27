import { useEffect, useRef, useState } from 'react'
import { get, put } from '../db/db'
import { aujourdhui, fechaEs, formatLong } from '../lib/dates'
import { useDonnees, coursDuJour } from './Journee'

type Police = 'cursive' | 'script' | 'capitales'
type Fond = 'seyes' | 'lignes' | 'blanc' | 'verte'
interface Etat { id: 'pizarra'; html: string; police: Police; taille: number; fond: Fond }

const POLICES: Record<Police, string> = {
  cursive: '"Playwrite FR Trad Variable", cursive',
  script: 'var(--font-sans)',
  capitales: 'var(--font-sans)',
}

/** Tableau numérique : j'écris au clavier, ça s'affiche en cursive sur des lignes de cahier, puis je projette. */
export default function Pizarra() {
  const d = useDonnees()
  const ref = useRef<HTMLDivElement>(null)
  const cadre = useRef<HTMLDivElement>(null)
  const [etat, setEtat] = useState<Etat | null>(null)
  const [trace, setTrace] = useState(true)
  const sauvegarde = useRef<number>(0)

  useEffect(() => {
    get<Etat>('meta', 'pizarra').then((e) => {
      const init: Etat = { id: 'pizarra', html: '', police: 'cursive', taille: 44, fond: 'seyes', ...(e ?? {}) }
      setEtat(init)
      requestAnimationFrame(() => { if (ref.current) ref.current.innerHTML = init.html })
    })
  }, [])

  if (!etat) return null
  const ligne = Math.round(etat.taille * 1.75)

  const sauver = (patch: Partial<Etat> = {}) => {
    const e = { ...etat, ...patch, html: ref.current?.innerHTML ?? etat.html }
    setEtat(e)
    clearTimeout(sauvegarde.current)
    sauvegarde.current = window.setTimeout(() => put('meta', e), 400)
  }
  const cmd = (c: string, v?: string) => {
    ref.current?.focus()
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(c, false, v)
    sauver()
  }

  /** Écrit un texte, lettre après lettre si le tracé est activé. */
  async function ecrire(texte: string, html?: string) {
    const el = ref.current!
    el.focus()
    const sel = getSelection()!
    sel.selectAllChildren(el)
    sel.collapseToEnd()
    if (html) {
      // Bloc mis en forme (ex. la date soulignée), puis une ligne neuve sans mise en forme.
      const bloc = document.createElement('div')
      bloc.innerHTML = html
      const suite = document.createElement('div')
      suite.appendChild(document.createElement('br'))
      el.append(bloc, suite)
      sel.selectAllChildren(suite)
      sel.collapseToStart()
      return sauver()
    }
    if (el.innerText.trim()) document.execCommand('insertParagraph')
    if (!trace) document.execCommand('insertText', false, texte)
    else for (const ch of texte) {
      if (ch === '\n') document.execCommand('insertParagraph')
      else document.execCommand('insertText', false, ch)
      await new Promise((r) => setTimeout(r, ch === ' ' ? 20 : 45))
    }
    sauver()
  }

  const fonds: Record<Fond, React.CSSProperties> = {
    seyes: {
      backgroundColor: '#fff',
      backgroundImage: `linear-gradient(90deg, transparent 72px, #e05a5a 72px, #e05a5a 74px, transparent 74px), repeating-linear-gradient(180deg, transparent 0, transparent ${ligne - 2}px, #8f7fc0 ${ligne - 2}px, #8f7fc0 ${ligne}px), repeating-linear-gradient(180deg, transparent 0, transparent ${ligne / 4 - 1}px, #b8cbe8 ${ligne / 4 - 1}px, #b8cbe8 ${ligne / 4}px)`,
      color: '#1a1a1a',
    },
    lignes: { backgroundColor: '#fff', backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent ${ligne - 1}px, #9fb6d9 ${ligne - 1}px, #9fb6d9 ${ligne}px)`, color: '#1a1a1a' },
    blanc: { backgroundColor: '#fff', color: '#1a1a1a' },
    verte: { backgroundColor: '#22402f', color: '#f4f1e8' },
  }
  const lecons = d ? coursDuJour(d, aujourdhui()).filter((c) => c.seance?.traceEcrite.trim()) : []

  return (
    <div>
      <h1 className="text-3xl font-semibold">Pizarra <span className="text-xl font-normal text-muted">· le tableau</span></h1>
      <div className="no-print mt-3 flex flex-wrap items-center gap-2">
        <button className={trace ? 'btn-primary py-1.5 text-sm' : 'btn-ghost py-1.5 text-sm'} onClick={() => setTrace(!trace)} aria-pressed={trace}>✍️ Tracé {trace ? 'activé' : 'désactivé'}</button>
        <select className="champ w-auto py-1.5 text-sm" value={etat.police} onChange={(e) => sauver({ police: e.target.value as Police })} aria-label="Écriture">
          <option value="cursive">Cursive française (liée)</option>
          <option value="script">Script</option>
          <option value="capitales">Capitales</option>
        </select>
        <select className="champ w-auto py-1.5 text-sm" value={etat.fond} onChange={(e) => sauver({ fond: e.target.value as Fond })} aria-label="Fond">
          <option value="seyes">Cahier (Seyès)</option>
          <option value="lignes">Lignes simples</option>
          <option value="blanc">Tableau blanc</option>
          <option value="verte">Tableau vert</option>
        </select>
        <span className="flex items-center gap-1">
          <button className="btn-ghost px-2 py-1" onClick={() => sauver({ taille: Math.max(20, etat.taille - 4) })} aria-label="Plus petit">A−</button>
          <span className="w-8 text-center text-sm tabular-nums">{etat.taille}</span>
          <button className="btn-ghost px-2 py-1" onClick={() => sauver({ taille: Math.min(96, etat.taille + 4) })} aria-label="Plus grand">A+</button>
        </span>
        <select className="champ w-auto py-1.5 text-sm" value="" aria-label="Insérer"
          onChange={(e) => {
            const v = e.target.value
            if (v === 'fecha') ecrire('', `<span style="text-decoration: underline; text-decoration-color: #d33; text-underline-offset: 6px">${capitaliser(fechaEs(aujourdhui()))}</span>`)
            else if (v === 'date') ecrire('', `<span style="text-decoration: underline; text-decoration-color: #d33; text-underline-offset: 6px">${capitaliser(formatLong(aujourdhui()))}</span>`)
            else { const c = lecons.find((x) => x.cle === v); if (c?.seance) ecrire(c.seance.traceEcrite) }
          }}>
          <option value="">📋 Insérer…</option>
          <option value="fecha">La fecha (en espagnol)</option>
          <option value="date">La date (en français)</option>
          {lecons.map((c) => <option key={c.cle} value={c.cle}>Leçon à copier — {c.classe?.nom} : {c.seance?.titre}</option>)}
        </select>
        <button className="btn-ghost py-1.5 text-sm" onClick={() => cadre.current?.requestFullscreen?.()}>⛶ Plein écran</button>
        <button className="ml-auto text-sm font-bold text-grenat hover:underline" onClick={() => { if (confirm('Effacer tout le tableau ?')) { ref.current!.innerHTML = ''; sauver() } }}>Effacer tout</button>
      </div>
      <div className="no-print mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Surligner</span>
        {['#fff176', '#b9f6ca', '#ffcdd2', '#bbdefb'].map((c) => <button key={c} className="h-6 w-6 rounded border border-line" style={{ background: c }} onMouseDown={(e) => { e.preventDefault(); cmd('hiliteColor', c) }} aria-label={`Surligner ${c}`} />)}
        <span className="ml-3 text-muted">Couleur</span>
        {['#1a1a1a', '#d32f2f', '#1565c0', '#2e7d32'].map((c) => <button key={c} className="grid h-6 w-6 place-items-center rounded border border-line font-bold" style={{ color: c }} onMouseDown={(e) => { e.preventDefault(); cmd('foreColor', c) }} aria-label={`Couleur ${c}`}>A</button>)}
        <button className="h-6 rounded border border-line px-1.5 font-bold underline decoration-[#d32f2f]" onMouseDown={(e) => { e.preventDefault(); cmd('underline') }} aria-label="Souligner">S</button>
        <button className="h-6 rounded border border-line px-1.5" onMouseDown={(e) => { e.preventDefault(); cmd('removeFormat') }}>Gomme</button>
        <span className="ml-auto text-xs text-muted">Sélectionne un mot pour le surligner, le colorer ou le souligner. Enregistré sur cet appareil.</span>
      </div>

      <div ref={cadre} className="mt-3 overflow-auto rounded-xl border border-line shadow-inner" style={fonds[etat.fond]}>
        <div ref={ref} contentEditable suppressContentEditableWarning spellCheck={false} onInput={() => sauver()}
          className="min-h-[70vh] px-6 py-2 outline-none md:pl-24 md:pr-10"
          style={{
            fontFamily: POLICES[etat.police], fontSize: etat.taille, lineHeight: `${ligne}px`,
            textTransform: etat.police === 'capitales' ? 'uppercase' : undefined, paddingTop: ligne * 0.18,
          }} />
      </div>
    </div>
  )
}

const capitaliser = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

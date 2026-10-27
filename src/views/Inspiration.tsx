import { useState } from 'react'
import { get, put } from '../db/db'
import type { Classe } from '../db/types'
import { POINTS_LANGUE } from '../data/grammaire'
import { aujourdhui, formatCourt } from '../lib/dates'
import { aller } from '../lib/hooks'
import { TYPES_SEANCE } from '../lib/generateur'
import { analyser, genererUneSeance, planifier, proposer, seancesDe, type Analyse, type Proposition } from '../lib/inspiration'
import { useDonnees } from './Journee'

const EXEMPLES = [
  'Je viens de finir l’axe Territoire et mémoire avec mes Tle A. Qu’est-ce que je peux faire derrière ?',
  'Une idée de séquence sur Frida Kahlo pour ma 5e D',
  'Je veux travailler le subjonctif avec les 1re B',
  'Mes 3e C ont fini Clandestino, que faire ensuite ?',
]

/** « Je décris, l'appli propose » : l'assistant d'inspiration du générateur. */
export default function Inspiration() {
  const d = useDonnees()
  const [texte, setTexte] = useState('')
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [classeId, setClasseId] = useState<string>('')
  const [message, setMessage] = useState('')
  if (!d) return null
  const ctx = { classes: d.classes, creneaux: d.creneaux, reglages: d.reglages, seances: d.seances }

  function lancer(t = texte) {
    if (!t.trim()) return
    setTexte(t)
    const a = analyser(t, d!.classes)
    setAnalyse(a)
    setClasseId(a.classes[0]?.id ?? '')
    setMessage('')
  }

  const classe = d.classes.find((c) => c.id === classeId)
  const a = analyse && classe ? { ...analyse, classes: [classe], niveau: null } : analyse
  const res = a && (a.classes.length || a.niveau) ? proposer(a, ctx) : null

  return (
    <div>
      <section className="carte overflow-hidden">
        <div className="navy px-5 py-4">
          <h2 className="titre text-2xl font-semibold text-white">✨ Inspiración</h2>
          <p className="text-sm text-white/75">Écris comme tu me parlerais. L’appli lit ta demande, regarde ce que la classe a déjà fait et le programme, puis te propose la suite. Tu choisis, elle prépare tout.</p>
        </div>
        <div className="p-4">
          <textarea rows={3} className="champ text-lg" value={texte} onChange={(e) => setTexte(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) lancer() }}
            placeholder="Ex. Je viens de finir l’axe Territoire et mémoire avec mes Tle A. Qu’est-ce que je peux faire derrière ?" aria-label="Ta demande" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => lancer()} disabled={!texte.trim()}>✨ Proposer</button>
            <span className="text-xs text-muted">Exemples :</span>
            {EXEMPLES.map((x) => <button key={x} className="rounded-full border border-line bg-surface px-3 py-1 text-xs hover:bg-surface-2" onClick={() => lancer(x)}>{x.length > 48 ? x.slice(0, 46) + '…' : x}</button>)}
          </div>
        </div>
      </section>

      {analyse && (
        <section className="mt-4 rounded-2xl border border-dashed border-primary/40 bg-surface p-4">
          <h3 className="font-semibold">🧐 Ce que j’ai compris <span className="text-sm font-normal text-muted">— corrige si besoin</span></h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-bold">Classe :</span>
            {d.classes.map((c) => (
              <button key={c.id} onClick={() => setClasseId(c.id)} className={`rounded-full border-2 px-2.5 py-0.5 font-bold ${c.id === classeId ? 'text-white' : 'bg-surface'}`} style={{ borderColor: c.couleur, background: c.id === classeId ? c.couleur : undefined }}>{c.nom}</button>
            ))}
          </div>
          <ul className="mt-2 flex flex-col gap-0.5 text-sm">
            {!classeId && <li className="font-bold text-grenat">Je n’ai pas trouvé de classe dans ta demande : choisis-en une ci-dessus.</li>}
            {analyse.axesTermines.length > 0 && <li>✅ Axe terminé : <b>{analyse.axesTermines.join(', ')}</b></li>}
            {analyse.axesVoulus.length > 0 && <li>🎯 Axe souhaité : <b>{analyse.axesVoulus.join(', ')}</b></li>}
            {analyse.motsTheme.length > 0 && <li>🔎 Thème : <b>{analyse.motsTheme.join(', ')}</b></li>}
            {analyse.points.length > 0 && <li>📐 Grammaire : <b>{analyse.points.map((k) => POINTS_LANGUE[k]?.label).join(', ')}</b></li>}
            {res && res.faits.length > 0 && <li>📚 Déjà traité cette année (d’après l’agenda) : {res.faits.join(' · ')}</li>}
            {res && <li>🗺️ Axes restants au programme : {res.axesRestants.length ? res.axesRestants.join(' · ') : 'tous traités'}</li>}
          </ul>
        </section>
      )}

      {message && <p className="mt-3 rounded-lg bg-azulejo/15 px-3 py-2 font-bold text-azulejo" role="status">{message}</p>}

      {res?.recommandation && classe && (
        <>
          <h3 className="mt-6 text-xl font-semibold">🏆 Ma recommandation pour {classe.nom}</h3>
          <CarteProposition p={res.recommandation} classe={classe} principal ctx={ctx} onFait={setMessage} />
          {res.autres.length > 0 && <h3 className="mt-6 text-xl font-semibold">Autres pistes</h3>}
          <div className="mt-2 grid gap-4 xl:grid-cols-2">
            {res.autres.map((p) => <CarteProposition key={p.seq.id} p={p} classe={classe} ctx={ctx} onFait={setMessage} />)}
          </div>
        </>
      )}
      {analyse && classe && !res?.recommandation && <p className="mt-4 text-muted">Pas de proposition pour ce niveau.</p>}
    </div>
  )
}

function CarteProposition({ p, classe, principal, ctx, onFait }: { p: Proposition; classe: Classe; principal?: boolean; ctx: Parameters<typeof planifier>[3]; onFait: (m: string) => void }) {
  const [voir, setVoir] = useState(!!principal)
  const [depuis, setDepuis] = useState(aujourdhui())
  const [occupe, setOccupe] = useState(false)
  const seances = seancesDe(p)
  const aEdt = ctx.creneaux.some((c) => c.classeId === classe.id)

  async function planif() {
    setOccupe(true)
    const r = await planifier(p, (await get<Classe>('classes', classe.id)) ?? classe, depuis, ctx)
    setOccupe(false)
    onFait(r.mode === 'recale'
      ? `✓ « ${p.seq.titre} » démarre le ${formatCourt(depuis)} pour ${classe.nom} : les séances apparaissent dans Hoy et Semana, fiches prêtes à l’ouverture.`
      : r.mode === 'fiches' ? `✓ ${r.nb} fiches complètes créées pour ${classe.nom} (jusqu’au ${formatCourt(r.fin!)}), visibles dans Hoy, Semana et Secuencias.`
        : 'Aucun cours trouvé : vérifie l’emploi du temps de la classe.')
    scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <article className={`carte overflow-hidden ${principal ? 'ring-2 ring-primary' : ''}`}>
      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-azulejo">{p.seq.axe}{p.source === 'banque' ? ' · séquence complémentaire' : ` · programmation P${p.seq.periode}`}</p>
        <h4 className="titre mt-1 text-2xl font-semibold">{p.seq.titre}</h4>
        <p className="italic text-muted" lang="es">{p.seq.problematique}</p>
        <ul className="mt-3 flex flex-col gap-1 rounded-lg bg-surface-2/60 p-3 text-sm">
          <li className="font-bold">Pourquoi je te la propose :</li>
          {p.raisons.map((r) => <li key={r}>• {r}</li>)}
        </ul>
        <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="font-bold">Documents</p>
            <ul>{(p.seq.dossier ?? p.seq.docs).map((x) => <li key={x.titre}><span className="rounded bg-surface-2 px-1 text-[11px] font-bold">{x.al}</span> {x.titre} <span className="text-muted">— {x.source}</span>{x.video && ' 🎬'}{x.aChoisir && <span className="text-muted"> (à choisir)</span>}</li>)}</ul>
          </div>
          <div>
            <p className="font-bold">Langue</p>
            <p>{p.seq.points.map((k) => POINTS_LANGUE[k]?.label).join(' · ')}</p>
            <p className="mt-1 font-bold">Tâche finale ({p.seq.tache.al})</p>
            <p>{p.seq.tache.texte}</p>
          </div>
        </div>
        <button className="mt-3 text-sm font-bold text-azulejo hover:underline" onClick={() => setVoir(!voir)}>{voir ? '▾' : '▸'} Les {seances.length} séances</button>
        {voir && (
          <ol className="mt-1 flex flex-col gap-1 text-sm">
            {seances.map((s, i) => (
              <li key={s.cle} className="flex items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1">{s.titre.split(' — ').slice(1).join(' — ')} <span className="text-xs text-muted">· {TYPES_SEANCE[s.type]}</span></span>
                <button className="shrink-0 text-xs font-bold text-azulejo hover:underline" onClick={async () => { const f = await genererUneSeance(p, i, classe, ctx); aller(f.date ? 'jour' : 'seance', ...(f.date ? [f.date, f.creneauId ?? ''] : [f.id])) }}>Générer la fiche →</button>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-2 border-t border-line bg-surface-2/40 p-4">
        {aEdt ? (
          <>
            <label><span className="label">À partir du</span><input type="date" className="champ" value={depuis} onChange={(e) => e.target.value && setDepuis(e.target.value)} /></label>
            <button className={principal ? 'btn-primary' : 'btn-ghost'} disabled={occupe} onClick={planif}>
              {occupe ? 'Préparation…' : `📅 Planifier sur les prochains cours de ${classe.nom}`}
            </button>
          </>
        ) : <p className="text-sm text-muted">Ajoute l’emploi du temps de {classe.nom} (Ajustes) pour planifier automatiquement.</p>}
        <button className="btn-ghost" onClick={async () => { const f = await genererUneSeance(p, 0, classe, ctx); aller(f.date ? 'jour' : 'seance', ...(f.date ? [f.date, f.creneauId ?? ''] : [f.id])) }}>✨ Générer la 1re séance</button>
        <button className="btn-ghost" onClick={async () => {
          await put('sequences', { id: crypto.randomUUID(), titre: p.seq.titre, niveau: classe.niveau, classeIds: [classe.id], programme: p.seq.axe, projetFinal: '', tacheFinale: p.seq.tache.texte, evaluation: '', cecrlVise: classe.cecrlVise, dateDebut: '', dateFin: '', couleur: '#6A4C93', notes: `Problématique : ${p.seq.problematique}\nDocuments : ${p.seq.docs.map((x) => x.titre).join(' · ')}` })
          onFait(`✓ « ${p.seq.titre} » enregistrée dans Secuencias (sans date).`)
        }}>☆ Garder l’idée</button>
      </div>
    </article>
  )
}

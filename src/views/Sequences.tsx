import { useEffect, useRef, useState, type ReactNode } from 'react'
import { all, del, delSeance, get, getReglages, put } from '../db/db'
import { creneauxDuJour, horaire, nouvelleSeance, nouvelleSequence, normaliserSequence, poserSeance, toutesSeances } from '../db/modeles'
import { CECRL, NIVEAUX, type Classe, type Creneau, type Seance, type Sequence } from '../db/types'
import { ajouterJours, aujourdhui, formatCourt } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { PROGRAMMES } from '../lib/programmes'
import { BadgeAL, PastilleClasse, Vide } from '../components/ui'

const COULEURS = ['#1C6E8C', '#C84B31', '#A11C3A', '#D98A2B', '#3E8E5E', '#7A4FA0']

async function chargerTout() {
  const [classes, creneaux, seances, sequences, reglages] = await Promise.all([
    all<Classe>('classes'), all<Creneau>('creneaux'), toutesSeances(), all<Sequence>('sequences'), getReglages(),
  ])
  return { classes, creneaux, seances, sequences: sequences.map(normaliserSequence), reglages }
}

// ——— Liste des séquences + bibliothèque
export default function Sequences() {
  const data = useQuery(chargerTout, [])
  if (!data) return null
  const { classes, seances, sequences } = data
  const classe = (id: string) => classes.find((c) => c.id === id)
  const bibliotheque = seances.filter((s) => !s.sequenceId && !s.date)

  async function creer() {
    const q = { ...nouvelleSequence(), couleur: COULEURS[sequences.length % COULEURS.length] }
    await put('sequences', q)
    aller('sequence', q.id)
  }

  return (
    <div>
      <header className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Séquences</h1>
        <div className="flex gap-2">
          <a className="btn-ghost" href="#/generateur">✨ Générer une séance</a>
          <button className="btn-primary" onClick={creer}>+ Nouvelle séquence</button>
        </div>
      </header>
      <div className="frise mt-3 rounded" aria-hidden />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sequences.map((q) => {
          const ss = seances.filter((s) => s.sequenceId === q.id)
          return (
            <a key={q.id} href={`#/sequence/${q.id}`} className="carte block overflow-hidden transition hover:shadow-md">
              <div className="h-2" style={{ background: q.couleur }} />
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-azulejo">{q.niveau} · {q.cecrlVise}{q.programme && ` · ${q.programme}`}</p>
                <h2 className="mt-1 text-xl font-semibold">{q.titre || 'Séquence sans titre'}</h2>
                {q.projetFinal && <p className="mt-1 line-clamp-2 text-sm text-muted">🎯 {q.projetFinal}</p>}
                <div className="mt-2 flex flex-wrap gap-2 text-sm">{q.classeIds.map((id) => <PastilleClasse key={id} classe={classe(id)} />)}</div>
                <p className="mt-2 text-sm text-muted">
                  {ss.length} séance{ss.length > 1 ? 's' : ''} · {ss.filter((s) => s.date).length} posée{ss.filter((s) => s.date).length > 1 ? 's' : ''} dans l’agenda
                  {q.dateDebut && ` · du ${formatCourt(q.dateDebut)}${q.dateFin ? ` au ${formatCourt(q.dateFin)}` : ''}`}
                </p>
              </div>
            </a>
          )
        })}
        {!sequences.length && <div className="md:col-span-2 xl:col-span-3"><Vide>Aucune séquence. Crée la première avec « + Nouvelle séquence ».</Vide></div>}
      </div>

      <h2 className="mt-8 text-xl font-semibold">📚 Bibliothèque</h2>
      <p className="text-sm text-muted">Séances sans séquence et sans date. Pose-les sur un jour pour qu’elles apparaissent dans l’agenda.</p>
      <ListeSeances seances={bibliotheque} data={data} />
    </div>
  )
}

// ——— Une séquence
export function EditeurSequence({ id }: { id?: string }) {
  const data = useQuery(chargerTout, [])
  const [q, setQ] = useState<Sequence | null>()
  const [etat, setEtat] = useState('')
  const premier = useRef(true)

  useEffect(() => {
    premier.current = true
    if (id) get<Sequence>('sequences', id).then((x) => setQ(x ? normaliserSequence(x) : null))
  }, [id])
  useEffect(() => {
    if (!q) return
    if (premier.current) {
      premier.current = false
      return
    }
    setEtat('Enregistrement…')
    const t = setTimeout(() => put('sequences', q).then(() => setEtat('✓ Enregistré')), 600)
    return () => clearTimeout(t)
  }, [q])

  if (q === undefined || !data) return null
  if (q === null) return <p className="mt-6">Séquence introuvable. <a className="text-primary underline" href="#/sequences">Retour</a></p>
  const maj = (patch: Partial<Sequence>) => setQ({ ...q, ...patch })
  const champ = (k: keyof Sequence) => ({ value: q[k] as string, onChange: (e: { target: { value: string } }) => maj({ [k]: e.target.value }) })
  const seances = data.seances.filter((s) => s.sequenceId === q.id).sort((a, b) => a.ordre - b.ordre || (a.date ?? '9').localeCompare(b.date ?? '9'))

  async function nouvelle() {
    const c = data!.classes.find((x) => x.id === q!.classeIds[0])
    const s = { ...nouvelleSeance(c, null), sequenceId: q!.id, ordre: seances.length, cecrlDe: q!.cecrlVise, cecrlVers: q!.cecrlVise, programme: q!.programme }
    await put('seances', s)
    aller('seance', s.id)
  }
  async function supprimer() {
    if (!confirm('Supprimer la séquence ? Ses séances sont conservées (elles retournent dans la bibliothèque ou restent dans l’agenda).')) return
    for (const s of seances) await put('seances', { ...s, sequenceId: null })
    await del('sequences', q!.id)
    aller('sequences')
  }

  return (
    <div>
      <div className="no-print sticky top-0 z-10 -mx-4 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <a href="#/sequences" className="font-bold text-azulejo hover:underline">‹ Séquences</a>
        <span className="text-sm text-muted" aria-live="polite">{etat}</span>
      </div>

      <input className="titre mt-4 w-full border-b-2 border-dashed border-line bg-transparent text-3xl font-semibold outline-none focus:border-primary"
        placeholder="Titre de la séquence (ex. Frida, un icono mexicano)" aria-label="Titre de la séquence" {...champ('titre')} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Bloc titre="Cadre">
          <div className="grid grid-cols-2 gap-3">
            <L label="Niveau"><select className="champ" value={q.niveau} onChange={(e) => maj({ niveau: e.target.value as Sequence['niveau'] })}>{NIVEAUX.map((n) => <option key={n}>{n}</option>)}</select></L>
            <L label="CECRL visé"><select className="champ" value={q.cecrlVise} onChange={(e) => maj({ cecrlVise: e.target.value as Sequence['cecrlVise'] })}>{CECRL.map((n) => <option key={n}>{n}</option>)}</select></L>
            <L label="Début"><input type="date" className="champ" {...champ('dateDebut')} /></L>
            <L label="Fin"><input type="date" className="champ" {...champ('dateFin')} /></L>
          </div>
          <L label="Référence programme">
            <input className="champ" list="prog-seq" {...champ('programme')} />
            <datalist id="prog-seq">{PROGRAMMES.flatMap((g) => g.items.map((i) => <option key={g.groupe + i} value={i}>{g.groupe}</option>))}</datalist>
          </L>
          <span className="label">Classes concernées</span>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.classes.map((c) => {
              const on = q.classeIds.includes(c.id)
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => maj({ classeIds: on ? q.classeIds.filter((x) => x !== c.id) : [...q.classeIds, c.id] })}
                  className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${on ? 'text-white' : 'bg-surface'}`} style={{ borderColor: c.couleur, background: on ? c.couleur : undefined }}>
                  {c.nom}
                </button>
              )
            })}
            {!data.classes.length && <span className="text-sm text-muted">Crée d’abord tes classes dans Réglages.</span>}
          </div>
          <span className="label">Couleur dans l’agenda</span>
          <div className="flex gap-1.5">
            {COULEURS.map((c) => (
              <button key={c} type="button" onClick={() => maj({ couleur: c })} aria-label={`Couleur ${c}`} aria-pressed={q.couleur === c}
                className={`h-7 w-7 rounded-full ${q.couleur === c ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </Bloc>
        <Bloc titre="Projet & évaluation">
          <L label="Projet final"><textarea rows={2} className="champ" placeholder="Ex. Exposition virtuelle « Nuestras Fridas »" {...champ('projetFinal')} /></L>
          <L label="Tâche finale (évaluée)"><textarea rows={3} className="champ" placeholder="Ex. EOC : je présente mon autoportrait à la manière de Frida (1 min 30)." {...champ('tacheFinale')} /></L>
          <L label="Évaluation (critères, grille)"><textarea rows={3} className="champ" {...champ('evaluation')} /></L>
          <L label="Notes"><textarea rows={2} className="champ" {...champ('notes')} /></L>
        </Bloc>
      </div>

      <section className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Séances de la séquence</h2>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={nouvelle}>+ Séance vierge</button>
            <a className="btn-primary" href={`#/generateur/${q.id}`}>✨ Générer une séance</a>
          </div>
        </div>
        <PoserTout sequence={q} seances={seances} data={data} />
        <ListeSeances seances={seances} data={data} ordonnable />
        <AjoutBibliotheque sequence={q} data={data} total={seances.length} />
      </section>

      <div className="mt-8 flex justify-end">
        <button className="btn-ghost text-grenat" onClick={supprimer}>Supprimer la séquence</button>
      </div>
    </div>
  )
}

type Data = Awaited<ReturnType<typeof chargerTout>>

/** Liste de séances avec action « Poser dans l'agenda ». */
function ListeSeances({ seances, data, ordonnable }: { seances: Seance[]; data: Data; ordonnable?: boolean }) {
  const [pose, setPose] = useState<string | null>(null)
  if (!seances.length) return <Vide>Aucune séance pour l’instant.</Vide>
  const classe = (id: string) => data.classes.find((c) => c.id === id)

  async function deplacer(i: number, d: -1 | 1) {
    const t = [...seances]
    ;[t[i], t[i + d]] = [t[i + d], t[i]]
    for (const [k, s] of t.entries()) if (s.ordre !== k) await put('seances', { ...s, ordre: k })
  }

  return (
    <ol className="flex flex-col gap-2">
      {seances.map((s, i) => {
        const h = horaire(s, data.creneaux)
        return (
          <li key={s.id} className="carte overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-3">
              {ordonnable && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-azulejo font-bold text-white dark:text-bg">{i + 1}</span>}
              <div className="min-w-0 flex-1">
                <a href={`#/seance/${s.id}`} className="font-bold hover:underline">{s.titre || 'Séance sans titre'}</a>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
                  <PastilleClasse classe={classe(s.classeId)} />
                  {s.activites.map((a) => <BadgeAL key={a} a={a} />)}
                  {s.date ? (
                    <a href={`#/agenda/jour/${s.date}`} className="rounded bg-surface-2 px-2 py-0.5 font-bold text-azulejo hover:underline">
                      📅 {formatCourt(s.date)}{h.debut && ` · ${h.debut}`}
                    </a>
                  ) : <span className="rounded border border-dashed border-line px-2 py-0.5 text-muted">non posée</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {ordonnable && <>
                  <button className="btn-ghost px-2 py-1" disabled={i === 0} onClick={() => deplacer(i, -1)} aria-label="Monter">↑</button>
                  <button className="btn-ghost px-2 py-1" disabled={i === seances.length - 1} onClick={() => deplacer(i, 1)} aria-label="Descendre">↓</button>
                </>}
                <button className="btn-ghost px-3 py-1 text-sm" onClick={() => setPose(pose === s.id ? null : s.id)}>📅 {s.date ? 'Déplacer' : 'Poser'}</button>
                {s.date && <button className="btn-ghost px-3 py-1 text-sm" onClick={() => put('seances', { ...s, date: null, creneauId: null })}>Retirer de l’agenda</button>}
                <a className="btn-ghost px-3 py-1 text-sm" href={`#/seance/${s.id}/documents`}>📄 Documents</a>
                <button className="btn-ghost px-2 py-1 text-grenat" onClick={() => confirm('Supprimer cette séance ?') && delSeance(s.id)} aria-label="Supprimer la séance">✕</button>
              </div>
            </div>
            {pose === s.id && <FormPose s={s} data={data} onFini={() => setPose(null)} />}
          </li>
        )
      })}
    </ol>
  )
}

function FormPose({ s, data, onFini }: { s: Seance; data: Data; onFini: () => void }) {
  const [classeId, setClasseId] = useState(s.classeId || data.classes[0]?.id || '')
  const [date, setDate] = useState(s.date ?? aujourdhui())
  const creneaux = creneauxDuJour(date, data.creneaux, data.reglages).filter((c) => c.classeId === classeId)
  async function poser(e: React.FormEvent) {
    e.preventDefault()
    await poserSeance(s, classeId, date, data.creneaux, data.reglages, data.seances)
    onFini()
  }
  return (
    <form onSubmit={poser} className="flex flex-wrap items-end gap-2 border-t border-line bg-surface-2/60 p-3">
      <L label="Classe"><select className="champ" value={classeId} onChange={(e) => setClasseId(e.target.value)}>{data.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></L>
      <L label="Date"><input type="date" className="champ" value={date} onChange={(e) => setDate(e.target.value)} required /></L>
      <p className="mb-3 text-sm text-muted">
        {creneaux.length ? `→ créneau ${creneaux[0].debut}–${creneaux[0].fin}${creneaux[0].salle ? `, salle ${creneaux[0].salle}` : ''}` : '→ pas de cours de cette classe ce jour-là : séance hors emploi du temps'}
      </p>
      <button className="btn-primary mb-3">Poser dans l’agenda</button>
    </form>
  )
}

/** Pose automatiquement toutes les séances non posées sur les cours successifs d'une classe. */
function PoserTout({ sequence, seances, data }: { sequence: Sequence; seances: Seance[]; data: Data }) {
  const [ouvert, setOuvert] = useState(false)
  const [classeId, setClasseId] = useState(sequence.classeIds[0] ?? data.classes[0]?.id ?? '')
  const [depart, setDepart] = useState(sequence.dateDebut || aujourdhui())
  const aPoser = seances.filter((s) => !s.date)
  if (!aPoser.length || !data.classes.length) return null

  async function poser(e: React.FormEvent) {
    e.preventDefault()
    let d = depart
    let toutes = [...data.seances]
    const pris = (date: string, crId: string) => toutes.some((x) => x.date === date && x.creneauId === crId)
    for (const s of aPoser) {
      let place = false
      for (let i = 0; i < 120 && !place; i++, d = ajouterJours(d, 1)) {
        const cr = creneauxDuJour(d, data.creneaux, data.reglages).find((c) => c.classeId === classeId && !pris(d, c.id))
        if (!cr) continue
        const posee = await poserSeance(s, classeId, d, data.creneaux, data.reglages, toutes)
        toutes = toutes.map((x) => (x.id === s.id ? posee : x))
        place = true
      }
      if (!place) return alert('Pas de créneau trouvé pour cette classe dans les 4 prochains mois : vérifie l’emploi du temps.')
    }
    if (!sequence.dateDebut) await put('sequences', { ...sequence, dateDebut: depart })
    setOuvert(false)
  }

  return (
    <div className="mb-3">
      {ouvert ? (
        <form onSubmit={poser} className="carte flex flex-wrap items-end gap-2 p-3">
          <L label="Classe"><select className="champ" value={classeId} onChange={(e) => setClasseId(e.target.value)}>{data.classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></L>
          <L label="À partir du"><input type="date" className="champ" value={depart} onChange={(e) => setDepart(e.target.value)} /></L>
          <button className="btn-primary mb-3">Poser les {aPoser.length} séances</button>
          <button type="button" className="btn-ghost mb-3" onClick={() => setOuvert(false)}>Annuler</button>
        </form>
      ) : (
        <button className="btn-ghost w-full border-dashed" onClick={() => setOuvert(true)}>
          📅 Poser automatiquement les {aPoser.length} séance{aPoser.length > 1 ? 's' : ''} non posée{aPoser.length > 1 ? 's' : ''} sur les prochains cours d’une classe
        </button>
      )}
    </div>
  )
}

function AjoutBibliotheque({ sequence, data, total }: { sequence: Sequence; data: Data; total: number }) {
  const biblio = data.seances.filter((s) => !s.sequenceId)
  if (!biblio.length) return null
  return (
    <select className="champ mt-3 w-auto" value="" aria-label="Ajouter une séance existante"
      onChange={(e) => { const s = biblio.find((x) => x.id === e.target.value); if (s) put('seances', { ...s, sequenceId: sequence.id, ordre: total }) }}>
      <option value="">+ Ajouter une séance existante…</option>
      {biblio.map((s) => <option key={s.id} value={s.id}>{s.titre || 'Séance sans titre'}{s.date ? ` (${formatCourt(s.date)})` : ''}</option>)}
    </select>
  )
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return <section className="carte p-4"><h2 className="mb-3 text-lg font-semibold">{titre}</h2>{children}</section>
}
function L({ label, children }: { label: string; children: ReactNode }) {
  return <label className="mb-3 block"><span className="label">{label}</span>{children}</label>
}

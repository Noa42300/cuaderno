import { useEffect, useRef, useState, type ReactNode } from 'react'
import { all, byIndex, delSeance, get, getReglages, put, uid } from '../db/db'
import { normaliserSeance, normaliserSequence } from '../db/modeles'
import { ACTIVITES, CECRL, type Activite, type Classe, type Creneau, type Diapo, type Etape, type Exercice, type PieceJointe, type Seance, type Sequence } from '../db/types'
import { aujourdhui, formatLong } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { NATURES_SUPPORT, PROGRAMMES, problemeVideo } from '../lib/programmes'
import { genererSeance } from '../lib/generateur'
import { paramsDepuisProgression, seanceParCle } from '../lib/progression'
import { BadgeAL } from '../components/ui'
import DocumentsListe from '../components/DocumentsListe'

type Etat = 'charge' | 'enregistre' | 'modifie'

/** Page autonome d'une fiche (#/seance/:id). */
export default function PageSeance({ id }: { id?: string }) {
  const s = useQuery(async () => (id ? (await get<Seance>('seances', id)) ?? null : null), [id])
  if (s === undefined) return null
  if (s === null) return <p className="mt-6">Séance introuvable. <a className="text-primary underline" href="#/hoy">Retour</a></p>
  return (
    <div>
      <div className="no-print sticky top-0 z-10 -mx-4 flex items-center gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <button onClick={() => history.back()} className="font-bold text-azulejo hover:underline">‹ Retour</button>
        {s.date && <a href={`#/jour/${s.date}`} className="ml-auto text-sm font-bold text-azulejo hover:underline">Voir la journée</a>}
      </div>
      <FicheSeance id={s.id} />
    </div>
  )
}

/** La fiche de séance complète, éditable, enregistrée automatiquement. Utilisée en page ou dépliée dans Hoy / Semana. */
export function FicheSeance({ id, compacte }: { id: string; compacte?: boolean }) {
  const classes = useQuery(() => all<Classe>('classes'), [])
  const sequences = useQuery(async () => (await all<Sequence>('sequences')).map(normaliserSequence), [])
  const images = useQuery(async () => (await byIndex<PieceJointe>('piecesJointes', 'seanceId', id)).filter((p) => p.type.startsWith('image/')), [id])
  const [s, setS] = useState<Seance | null | undefined>()
  const [etat, setEtat] = useState<Etat>('charge')
  const premier = useRef(true)

  useEffect(() => {
    premier.current = true
    get<Seance>('seances', id).then((x) => setS(x ? normaliserSeance(x) : null))
  }, [id])

  // Enregistrement automatique (0,6 s après la dernière frappe).
  useEffect(() => {
    if (!s) return
    if (premier.current) {
      premier.current = false
      return
    }
    setEtat('modifie')
    const t = setTimeout(() => put('seances', { ...s, modifieLe: new Date().toISOString() }).then(() => setEtat('enregistre')), 600)
    return () => clearTimeout(t)
  }, [s])

  if (s === undefined || !classes || !sequences) return null
  if (s === null) return null

  const maj = (patch: Partial<Seance>) => setS({ ...s, ...patch })
  const champ = <K extends keyof Seance>(k: K) => ({ value: s[k] as string, onChange: (e: { target: { value: string } }) => maj({ [k]: e.target.value } as Partial<Seance>) })
  const classe = classes.find((c) => c.id === s.classeId)
  const dureeEtapes = s.deroulement.reduce((t, e) => t + (e.duree || 0), 0)
  const pbVideo = problemeVideo(s.videoUrl)

  const majEtape = (i: number, patch: Partial<Etape>) => maj({ deroulement: s.deroulement.map((e, j) => (j === i ? { ...e, ...patch } : e)) })
  const deplacer = (i: number, d: -1 | 1) => {
    const t = [...s.deroulement]
    ;[t[i], t[i + d]] = [t[i + d], t[i]]
    maj({ deroulement: t })
  }

  async function supprimer() {
    if (!confirm('Supprimer définitivement cette fiche (et ses devoirs) ? Le créneau reproposera la séance de la progression.')) return
    await delSeance(s!.id)
    if (!compacte) aller('jour', s!.date ?? aujourdhui())
  }

  async function regenerer() {
    if (!classe) return
    const sp = seanceParCle(s!.cleProgression)
    if (!sp) return
    if (!confirm('Remplacer le contenu de la fiche par une version régénérée depuis la progression ? Tes modifications seront perdues.')) return
    const [creneaux] = await Promise.all([all<Creneau>('creneaux'), getReglages()])
    const cr = creneaux.find((c) => c.id === s!.creneauId)
    const duree = s!.dureeMin || 55
    setS({ ...s!, ...genererSeance(paramsDepuisProgression(sp, classe, s!.date ?? aujourdhui(), duree)), creneauId: cr?.id ?? s!.creneauId })
  }

  return (
    <div className="fiche">
      {/* ——— En-tête */}
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-azulejo">
            {s.debut && `${s.debut}–${s.fin} · `}{classe?.nom ?? 'Classe ?'} · {s.date ? formatLong(s.date) : 'bibliothèque'}
          </p>
          <textarea rows={1} className="titre mt-1 w-full resize-none border-b-2 border-dashed border-line bg-transparent text-2xl font-semibold outline-none [field-sizing:content] focus:border-primary"
            placeholder="Titre de la séance" {...champ('titre')} aria-label="Titre de la séance" />
        </div>
        <div className="no-print flex items-center gap-2">
          <span className="text-sm text-muted" aria-live="polite">{etat === 'modifie' ? 'Enregistrement…' : etat === 'enregistre' ? '✓ Enregistré' : ''}</span>
          <select className="champ w-auto py-1 text-sm" value={s.statut} onChange={(e) => maj({ statut: e.target.value as Seance['statut'] })} aria-label="Statut">
            <option value="prevue">Prévue</option>
            <option value="faite">✓ Faite</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {s.activites.map((a) => <BadgeAL key={a} a={a} />)}
        <span className="text-xs text-muted">{s.cecrlDe === s.cecrlVers ? s.cecrlDe : `${s.cecrlDe} → ${s.cecrlVers}`} · {s.dureeMin} min</span>
        {s.programme && <span className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-bold">{s.programme}</span>}
      </div>

      <Rubrique icone="🎯" titre="Objectifs & compétences" ouvert={!compacte}>
        <Zone label="Compétences (BO, CECRL, socle)" rows={6} {...champ('competences')} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {([
            ['culturel', 'Objectif culturel'], ['lexical', 'Lexique'], ['grammatical', 'Grammaire'], ['phonologique', 'Phonologie'], ['pragmatique', 'Pragmatique'],
          ] as const).map(([k, l]) => (
            <Zone key={k} label={l} rows={2} value={s.objectifs[k]} onChange={(e) => maj({ objectifs: { ...s.objectifs, [k]: e.target.value } })} />
          ))}
        </div>
        <fieldset className="mt-3">
          <legend className="label">Activités langagières</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACTIVITES) as Activite[]).map((a) => {
              const on = s.activites.includes(a)
              return (
                <button key={a} type="button" aria-pressed={on} onClick={() => maj({ activites: on ? s.activites.filter((x) => x !== a) : [...s.activites, a] })}
                  className={`rounded-full border px-3 py-1 text-sm font-bold ${on ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink'}`} title={ACTIVITES[a]}>
                  {a}
                </button>
              )
            })}
          </div>
        </fieldset>
        <div className="mt-3 grid gap-3 sm:grid-cols-[auto_auto_1fr]">
          <Champ label="CECRL de"><select className="champ" value={s.cecrlDe} onChange={(e) => maj({ cecrlDe: e.target.value as Seance['cecrlDe'] })}>{CECRL.map((c) => <option key={c}>{c}</option>)}</select></Champ>
          <Champ label="vers"><select className="champ" value={s.cecrlVers} onChange={(e) => maj({ cecrlVers: e.target.value as Seance['cecrlVers'] })}>{CECRL.map((c) => <option key={c}>{c}</option>)}</select></Champ>
          <Champ label="Axe / thématique du programme">
            <input className="champ" list="programmes" {...champ('programme')} />
            <datalist id="programmes">{PROGRAMMES.flatMap((g) => g.items.map((i) => <option key={g.groupe + i} value={i}>{g.groupe}</option>))}</datalist>
          </Champ>
        </div>
      </Rubrique>

      <Rubrique icone="🗺️" titre="Programmation / progression">
        <Zone label="Place dans la progression" rows={5} {...champ('progressionRef')} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Champ label="Séquence (personnelle)">
            <select className="champ" value={s.sequenceId ?? ''} onChange={(e) => maj({ sequenceId: e.target.value || null })}>
              <option value="">— Aucune —</option>
              {sequences.map((q) => <option key={q.id} value={q.id}>{q.titre || 'Séquence sans titre'}</option>)}
            </select>
          </Champ>
          <Champ label="Classe"><select className="champ" value={s.classeId} onChange={(e) => maj({ classeId: e.target.value })}>{classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></Champ>
          <Champ label="Date"><input type="date" className="champ" value={s.date ?? ''} onChange={(e) => maj({ date: e.target.value || null })} /></Champ>
          <Champ label="Durée (min)"><input type="number" min={5} step={5} className="champ" value={s.dureeMin} onChange={(e) => maj({ dureeMin: Number(e.target.value) })} /></Champ>
        </div>
        {s.cleProgression && <button className="btn-ghost mt-3 text-sm" onClick={regenerer}>↻ Régénérer la fiche depuis la progression</button>}
      </Rubrique>

      <Rubrique icone="👩‍🏫" titre="Organisation & rôle de l’enseignant">
        <Zone label="Disposition, modalités de travail, mon rôle à chaque étape" rows={6} {...champ('organisation')} />
      </Rubrique>

      <Rubrique icone="🧭" titre="Déroulement" ouvert note={<span className={dureeEtapes > s.dureeMin ? 'font-bold text-grenat' : 'text-muted'}>{dureeEtapes} / {s.dureeMin} min</span>}>
        <ol className="flex flex-col gap-3">
          {s.deroulement.map((e, i) => (
            <li key={e.id} className="rounded-xl border border-line bg-surface-2/40 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-on-primary">{i + 1}</span>
                <input className="champ min-w-40 flex-1 font-bold" value={e.titre} onChange={(x) => majEtape(i, { titre: x.target.value })} aria-label="Titre de l’étape" />
                <input type="number" min={0} className="champ w-20" value={e.duree} onChange={(x) => majEtape(i, { duree: Number(x.target.value) })} aria-label="Durée en minutes" />
                <span className="text-sm text-muted">min</span>
                <div className="flex gap-1">
                  {(Object.keys(ACTIVITES) as Activite[]).map((a) => (
                    <button key={a} type="button" aria-pressed={e.activites.includes(a)} title={ACTIVITES[a]}
                      onClick={() => majEtape(i, { activites: e.activites.includes(a) ? e.activites.filter((x) => x !== a) : [...e.activites, a] })}
                      className={e.activites.includes(a) ? '' : 'opacity-30'}><BadgeAL a={a} /></button>
                  ))}
                </div>
                <div className="no-print ml-auto flex gap-1">
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === 0} onClick={() => deplacer(i, -1)} aria-label="Monter">↑</button>
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === s.deroulement.length - 1} onClick={() => deplacer(i, 1)} aria-label="Descendre">↓</button>
                  <button type="button" className="btn-ghost px-2 py-1 text-grenat" onClick={() => maj({ deroulement: s.deroulement.filter((_, j) => j !== i) })} aria-label="Supprimer l’étape">✕</button>
                </div>
              </div>
              <textarea rows={4} className="champ mt-2 [field-sizing:content]" value={e.contenu} onChange={(x) => majEtape(i, { contenu: x.target.value })} aria-label="Contenu de l’étape" />
            </li>
          ))}
        </ol>
        <button type="button" className="btn-ghost mt-3" onClick={() => maj({ deroulement: [...s.deroulement, { id: uid(), titre: '', duree: 10, activites: [], contenu: '' }] })}>+ Ajouter une étape</button>
      </Rubrique>

      <Rubrique icone="🧰" titre="Matériel / support">
        <Zone label="Matériel" rows={4} {...champ('materiel')} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Champ label="Titre du document"><input className="champ" value={s.support.titre} onChange={(e) => maj({ support: { ...s.support, titre: e.target.value } })} /></Champ>
          <Champ label="Nature">
            <input className="champ" list="natures" value={s.support.nature} onChange={(e) => maj({ support: { ...s.support, nature: e.target.value } })} />
            <datalist id="natures">{NATURES_SUPPORT.map((n) => <option key={n} value={n} />)}</datalist>
          </Champ>
          <Champ label="Auteur / source"><input className="champ" value={s.support.source} onChange={(e) => maj({ support: { ...s.support, source: e.target.value } })} /></Champ>
          <Champ label="Lien du document"><input type="url" className="champ" placeholder="https://…" value={s.support.url} onChange={(e) => maj({ support: { ...s.support, url: e.target.value } })} /></Champ>
        </div>
      </Rubrique>

      <Rubrique icone="🎬" titre="Vidéo explicative (lien)" ouvert={!!s.videoUrl}>
        <div className="flex gap-2">
          <input type="url" className="champ" placeholder="https://www.youtube.com/watch?v=…" {...champ('videoUrl')} />
          {s.videoUrl && !pbVideo && <a className="btn-ghost shrink-0" href={s.videoUrl} target="_blank" rel="noreferrer">▶ Ouvrir</a>}
        </div>
        {pbVideo ? <p className="mt-1 text-sm font-bold text-grenat">{pbVideo}</p>
          : <p className="mt-1 text-xs text-muted">Lien trouvé par recherche : vérifie-le avant la projection. Une seule vidéo précise, jamais une page de résultats.</p>}
      </Rubrique>

      <Rubrique icone="🪜" titre="Différenciation">
        <p className="mb-2 text-xs text-muted">Jamais de prénom associé à un trouble ou un besoin particulier ici.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Zone label="Élèves fragiles" rows={3} value={s.differenciation.fragiles} onChange={(e) => maj({ differenciation: { ...s.differenciation, fragiles: e.target.value } })} />
          <Zone label="Élèves à l’aise" rows={3} value={s.differenciation.aLaise} onChange={(e) => maj({ differenciation: { ...s.differenciation, aLaise: e.target.value } })} />
        </div>
      </Rubrique>

      <Rubrique icone="✅" titre="Correction / attendus">
        <Zone label="Réponses attendues, production visée" rows={5} {...champ('correction')} />
      </Rubrique>

      <Rubrique icone="⚠️" titre="Erreurs fréquentes & remédiation">
        <Zone label="Ce qui bloque souvent + comment débloquer sur le moment" rows={5} {...champ('obstacles')} />
      </Rubrique>

      <Rubrique icone="📝" titre="Tâche & trace écrite">
        <div className="grid gap-3 md:grid-cols-2">
          <Zone label="Tâche" rows={3} {...champ('tache')} />
          <Zone label="Trace écrite (leçon à coller)" rows={5} {...champ('traceEcrite')} />
        </div>
      </Rubrique>

      <Rubrique icone="✏️" titre={`Fiche d’exercices (${s.exercices.length})`}>
        <ol className="flex flex-col gap-3">
          {s.exercices.map((ex, i) => {
            const majEx = (patch: Partial<Exercice>) => maj({ exercices: s.exercices.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            return (
              <li key={ex.id} className="rounded-xl border border-line bg-surface-2/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-azulejo text-sm font-bold text-white dark:text-bg">{i + 1}</span>
                  <input className="champ" placeholder="Consigne" value={ex.consigne} onChange={(e) => majEx({ consigne: e.target.value })} aria-label="Consigne" />
                  <button type="button" className="btn-ghost px-2 py-1 text-grenat" onClick={() => maj({ exercices: s.exercices.filter((_, j) => j !== i) })} aria-label="Supprimer l’exercice">✕</button>
                </div>
                <label className="mt-2 block"><span className="label">Exemple résolu</span>
                  <input className={`champ ${ex.exemple.trim() ? '' : 'border-grenat'}`} value={ex.exemple} onChange={(e) => majEx({ exemple: e.target.value })} />
                </label>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <Zone label="Items (un par ligne)" rows={5} value={ex.items} onChange={(e) => majEx({ items: e.target.value })} />
                  <Zone label="Corrigé (une réponse par ligne)" rows={5} value={ex.corrige} onChange={(e) => majEx({ corrige: e.target.value })} />
                </div>
              </li>
            )
          })}
        </ol>
        <button type="button" className="btn-ghost mt-3" onClick={() => maj({ exercices: [...s.exercices, { id: uid(), consigne: '', exemple: '', items: '', corrige: '' }] })}>+ Ajouter un exercice</button>
      </Rubrique>

      <Rubrique icone="🖥️" titre={`Diaporama (${s.diapos.length} diapos)`}>
        <ol className="flex flex-col gap-3">
          {s.diapos.map((d, i) => {
            const majD = (patch: Partial<Diapo>) => maj({ diapos: s.diapos.map((x, j) => (j === i ? { ...x, ...patch } : x)) })
            const dep = (k: -1 | 1) => { const t = [...s.diapos]; [t[i], t[i + k]] = [t[i + k], t[i]]; maj({ diapos: t }) }
            return (
              <li key={d.id} className="rounded-xl border border-line bg-surface-2/40 p-3">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm font-bold text-muted">{i + 1}</span>
                  <input className="champ font-bold" value={d.titre} onChange={(e) => majD({ titre: e.target.value })} aria-label="Titre de la diapo" />
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === 0} onClick={() => dep(-1)} aria-label="Monter">↑</button>
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === s.diapos.length - 1} onClick={() => dep(1)} aria-label="Descendre">↓</button>
                  <button type="button" className="btn-ghost px-2 py-1 text-grenat" onClick={() => maj({ diapos: s.diapos.filter((_, j) => j !== i) })} aria-label="Supprimer la diapo">✕</button>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <Zone label="Texte affiché" rows={3} value={d.texte} onChange={(e) => majD({ texte: e.target.value })} />
                  <Zone label="À révéler au clic (un élément par ligne)" rows={3} value={d.aReveler} onChange={(e) => majD({ aReveler: e.target.value })} />
                </div>
                <label className="mt-2 block"><span className="label">Image (adresse https://… ou pièce jointe)</span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input className="champ" placeholder="https://upload.wikimedia.org/…" value={d.image.startsWith('pj:') ? '' : d.image} onChange={(e) => majD({ image: e.target.value })} />
                    {images && images.length > 0 && (
                      <select className="champ sm:w-64" value={d.image.startsWith('pj:') ? d.image : ''} onChange={(e) => majD({ image: e.target.value })} aria-label="Image en pièce jointe">
                        <option value="">— Pièce jointe —</option>
                        {images.map((p) => <option key={p.id} value={`pj:${p.id}`}>{p.nom}</option>)}
                      </select>
                    )}
                  </div>
                </label>
              </li>
            )
          })}
        </ol>
        <button type="button" className="btn-ghost mt-3" onClick={() => maj({ diapos: [...s.diapos, { id: uid(), titre: '', texte: '', image: '', aReveler: '' }] })}>+ Ajouter une diapo</button>
      </Rubrique>

      <Rubrique icone="💬" titre="Bilan (après la séance)">
        <Zone label="Ce qui a marché, ce que je reprends la prochaine fois" rows={3} {...champ('bilan')} />
      </Rubrique>

      <DocumentsListe s={s} />

      <div className="no-print mt-4 flex justify-end">
        <button className="text-sm font-bold text-grenat hover:underline" onClick={supprimer}>Supprimer cette fiche</button>
      </div>
    </div>
  )
}

function Rubrique({ icone, titre, ouvert, note, children }: { icone: string; titre: string; ouvert?: boolean; note?: ReactNode; children: ReactNode }) {
  return (
    <details open={ouvert} className="group mt-3 rounded-xl border border-line bg-surface open:pb-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span className="text-muted transition group-open:rotate-90" aria-hidden>›</span>
        <span aria-hidden>{icone}</span>
        <span className="flex-1">{titre}</span>
        {note}
      </summary>
      <div className="px-4">{children}</div>
    </details>
  )
}

function Zone({ label, rows, value, onChange }: { label: string; rows: number; value: string; onChange: (e: { target: { value: string } }) => void }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea rows={rows} className="champ [field-sizing:content]" value={value} onChange={onChange} />
    </label>
  )
}

function Champ({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="label">{label}</span>{children}</label>
}


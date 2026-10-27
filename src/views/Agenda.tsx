import { useMemo, useState } from 'react'
import { all, del, getReglages, put, uid } from '../db/db'
import { creneauxDuJour, horaire, nouvelleSeance, normaliserSequence, prochainCours, toutesSeances } from '../db/modeles'
import { TYPES_RAPPEL, type Classe, type Creneau, type Devoir, type Rappel, type Reglages, type Seance, type Sequence, type TypeRappel } from '../db/types'
import {
  ajouterJours, aujourdhui, enHeure, enMinutes, fechaEs, formatCourt, formatLong, fromISO, jourDe, lundiDe, moisAnnee, numeroSemaine, semaineAB,
} from '../lib/dates'
import { aller, useEstMobile, useQuery } from '../lib/hooks'
import { BadgeAL, PastilleClasse, Section } from '../components/ui'
import { enVacances } from '../data/officiel'
import { indexPlanning, proposition, type SeanceProg } from '../lib/progression'

const PX_MIN = 1.15 // hauteur d'une minute dans la grille

interface Evenement {
  cle: string
  debut: number
  fin: number
  classe?: Classe
  creneau?: Creneau
  seance?: Seance
  prop?: SeanceProg | null
}

export default function Agenda({ mode: modeDemande, date }: { mode: 'semaine' | 'jour'; date: string }) {
  const mobile = useEstMobile()
  const mode = mobile ? 'jour' : modeDemande
  const [creation, setCreation] = useState<{ date: string; debut: string } | null>(null)

  const data = useQuery(async () => {
    const [reglages, classes, creneaux, seances, rappels, devoirs, sequences] = await Promise.all([
      getReglages(), all<Classe>('classes'), all<Creneau>('creneaux'), toutesSeances(),
      all<Rappel>('rappels'), all<Devoir>('devoirs'), all<Sequence>('sequences'),
    ])
    return { reglages, classes, creneaux, seances, rappels, devoirs, sequences: sequences.map(normaliserSequence) }
  }, [])
  const planning = useMemo(() => (data ? indexPlanning(data.classes, data.creneaux, data.reglages) : null), [data?.classes, data?.creneaux, data?.reglages])
  if (!data || !planning) return null
  const { reglages, classes, creneaux, seances, rappels, devoirs, sequences } = data
  const classe = (id: string) => classes.find((c) => c.id === id)

  const lundi = lundiDe(date)
  const jours =
    mode === 'jour'
      ? [date]
      : Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i)).filter((d) => reglages.joursTravailles.includes(jourDe(d) as Reglages['joursTravailles'][number]))
  const ab = semaineAB(date, reglages.lundiSemaineA)
  const pas = mode === 'jour' ? 1 : 7

  // ——— Événements positionnés
  const evenementsDu = (d: string): Evenement[] => {
    const duJour = seances.filter((s) => s.date === d)
    const ev: Evenement[] = (enVacances(d, reglages.zone) ? [] : creneauxDuJour(d, creneaux, reglages)).map((cr) => {
      const seance = duJour.find((s) => s.creneauId === cr.id)
      return {
        cle: cr.id, debut: enMinutes(cr.debut), fin: enMinutes(cr.fin), classe: classe(cr.classeId), creneau: cr, seance,
        prop: seance ? null : proposition(classe(cr.classeId), planning.get(`${d}|${cr.id}`)),
      }
    })
    for (const s of duJour) {
      if (ev.some((e) => e.seance?.id === s.id)) continue
      const h = horaire(s, creneaux)
      if (h.debut && h.fin) ev.push({ cle: s.id, debut: enMinutes(h.debut), fin: enMinutes(h.fin), classe: classe(s.classeId), seance: s })
    }
    return ev
  }
  const sansHoraire = (d: string) => seances.filter((s) => s.date === d && !evenementsDu(d).some((e) => e.seance?.id === s.id))

  const tous = jours.flatMap(evenementsDu)
  const hMin = Math.min(enMinutes(reglages.heureDebutAgenda), ...tous.map((e) => Math.floor(e.debut / 60) * 60))
  const hMax = Math.max(enMinutes(reglages.heureFinAgenda), ...tous.map((e) => Math.ceil(e.fin / 60) * 60))
  const heures = Array.from({ length: (hMax - hMin) / 60 }, (_, i) => hMin + i * 60)

  /** Ouvre le cours dans « Hoy », fiche dépliée (créée depuis la progression si besoin). */
  function ouvrir(e: Evenement, d: string) {
    if (e.seance && !e.creneau) return aller('seance', e.seance.id)
    aller('jour', d, e.cle)
  }

  return (
    <div>
      {/* ——— Barre d'outils */}
      <header className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold first-letter:uppercase">
            {mode === 'jour' ? formatLong(date) : moisAnnee(lundi)}
          </h1>
          <p className="text-sm text-muted">
            {mode === 'jour' ? <i lang="es" className="first-letter:uppercase">{fechaEs(date)}</i> : `Semaine ${numeroSemaine(date)}`}
            {ab && <span className="ml-2 rounded bg-azulejo px-1.5 py-0.5 text-xs font-bold text-white dark:text-bg">Semaine {ab}</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!mobile && (
            <div className="flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Affichage">
              {(['semaine', 'jour'] as const).map((m) => (
                <button key={m} onClick={() => aller('agenda', m, date)} aria-pressed={mode === m}
                  className={`rounded-md px-3 py-1.5 text-sm font-bold ${mode === m ? 'bg-primary text-on-primary' : 'text-ink'}`}>
                  {m === 'semaine' ? 'Semaine' : 'Jour'}
                </button>
              ))}
            </div>
          )}
          <button className="btn-ghost px-3" onClick={() => aller('agenda', mode, ajouterJours(date, -pas))} aria-label="Précédent">‹</button>
          <button className="btn-ghost" onClick={() => aller('agenda', mode, aujourdhui())}>Aujourd’hui</button>
          <button className="btn-ghost px-3" onClick={() => aller('agenda', mode, ajouterJours(date, pas))} aria-label="Suivant">›</button>
          <input type="date" className="champ w-auto" value={date} onChange={(e) => e.target.value && aller('agenda', mode, e.target.value)} aria-label="Aller à la date" />
        </div>
      </header>

      {/* Bandeau des jours de la semaine (iPhone) */}
      {mobile && (
        <div className="no-print mt-3 grid grid-cols-6 gap-1">
          {Array.from({ length: 6 }, (_, i) => ajouterJours(lundi, i)).map((d) => (
            <button key={d} onClick={() => aller('agenda', 'jour', d)}
              className={`rounded-lg py-1.5 text-center text-xs font-bold ${d === date ? 'bg-primary text-on-primary' : d === aujourdhui() ? 'bg-surface-2' : 'bg-surface'}`}>
              {fromISO(d).toLocaleDateString('fr-FR', { weekday: 'short' })}
              <span className="block text-base">{fromISO(d).getDate()}</span>
            </button>
          ))}
        </div>
      )}
      <div className="frise mt-3 rounded" aria-hidden />

      {!classes.length && (
        <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-muted">
          Pour remplir ton agenda, crée tes classes et ton emploi du temps dans <a className="font-bold text-primary underline" href="#/reglages/classes">Réglages</a>.
        </p>
      )}

      <div className={mode === 'jour' && !mobile ? 'mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]' : 'mt-4'}>
        {/* ——— La grille */}
        <div className="carte overflow-hidden">
          {/* En-têtes de jours + ligne « journée » (rappels, séquences, devoirs) */}
          <div className="grid border-b border-line" style={{ gridTemplateColumns: `3.5rem repeat(${jours.length}, minmax(0,1fr))` }}>
            <div />
            {jours.map((d) => {
              const rp = rappels.filter((r) => r.date === d).sort((a, b) => (a.heure || '99').localeCompare(b.heure || '99'))
              const sq = sequences.filter((q) => q.dateDebut && q.dateDebut <= d && (q.dateFin || q.dateDebut) >= d)
              const nbDevoirs = devoirs.filter((x) => x.pourLe === d).length
              const libres = sansHoraire(d)
              return (
                <div key={d} className={`min-w-0 border-l border-line p-1.5 ${d === aujourdhui() ? 'bg-teja/10' : ''}`}>
                  {mode === 'semaine' && (
                    <button onClick={() => aller('agenda', 'jour', d)} className="mb-1 flex w-full items-baseline gap-1.5 text-left hover:underline">
                      <span className="text-xs font-bold uppercase text-muted">{fromISO(d).toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                      <span className={`text-xl font-bold ${d === aujourdhui() ? 'grid h-8 w-8 place-items-center rounded-full bg-primary text-on-primary' : ''}`}>{fromISO(d).getDate()}</span>
                    </button>
                  )}
                  <div className="flex flex-col gap-0.5">
                    {enVacances(d, reglages.zone) && <span className="rounded bg-azulejo/15 px-1.5 py-0.5 text-[11px] font-bold text-azulejo">🏖️ {enVacances(d, reglages.zone)}</span>}
                    {sq.map((q) => (
                      <a key={q.id} href={`#/sequence/${q.id}`} className="truncate rounded px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: q.couleur }} title={`Séquence : ${q.titre}`}>
                        🧭 {q.titre || 'Séquence'}
                      </a>
                    ))}
                    {rp.map((r) => (
                      <span key={r.id} className="truncate rounded bg-safran/30 px-1.5 py-0.5 text-[11px] font-bold" title={`${TYPES_RAPPEL[r.type]} — ${r.titre}`}>
                        {r.heure && `${r.heure} `}{r.titre}
                      </span>
                    ))}
                    {libres.map((s) => (
                      <a key={s.id} href={`#/seance/${s.id}`} className="truncate rounded border-l-4 bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold" style={{ borderColor: classe(s.classeId)?.couleur }}>
                        {s.titre || 'Séance'}
                      </a>
                    ))}
                    {nbDevoirs > 0 && mode === 'semaine' && <span className="text-[11px] text-muted">✅ {nbDevoirs} devoir{nbDevoirs > 1 ? 's' : ''} à vérifier</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Corps horaire */}
          <div className="relative grid" style={{ gridTemplateColumns: `3.5rem repeat(${jours.length}, minmax(0,1fr))`, height: (hMax - hMin) * PX_MIN }}>
            <div className="relative">
              {heures.map((h) => (
                <span key={h} className="absolute right-1.5 -translate-y-1/2 text-xs text-muted tabular-nums" style={{ top: (h - hMin) * PX_MIN }}>
                  {h > hMin && enHeure(h)}
                </span>
              ))}
            </div>
            {jours.map((d) => (
              <Colonne key={d} date={d} hMin={hMin} heures={heures} evenements={evenementsDu(d)} onOuvrir={(e) => ouvrir(e, d)}
                onVide={(debut) => classes.length && setCreation({ date: d, debut })} />
            ))}
          </div>
        </div>

        {/* ——— Détails du jour */}
        {mode === 'jour' && (
          <div>
            <Rappels date={date} rappels={rappels.filter((r) => r.date === date)} />
            <Section titre="Devoirs">
              <div className="flex flex-col gap-3">
                <ListeDevoirs titre="À vérifier ce jour" devoirs={devoirs.filter((x) => x.pourLe === date)} classe={classe} />
                <ListeDevoirs titre="Donnés ce jour" devoirs={devoirs.filter((x) => x.donneLe === date)} classe={classe} montrerPour />
                <NouveauDevoir date={date} classes={classes.filter((c) => !c.archivee)} dateDefaut={(id) => prochainCours(id, date, creneaux, reglages)}
                  seanceDe={(id) => seances.find((s) => s.date === date && s.classeId === id)?.id ?? null} />
              </div>
            </Section>
          </div>
        )}
      </div>

      {creation && <DialogueCreation {...creation} classes={classes.filter((c) => !c.archivee)} onFermer={() => setCreation(null)} />}
    </div>
  )
}

function Colonne({ date, hMin, heures, evenements, onOuvrir, onVide }: {
  date: string; hMin: number; heures: number[]; evenements: Evenement[]; onOuvrir: (e: Evenement) => void; onVide: (debut: string) => void
}) {
  // Répartition en couloirs si deux événements se chevauchent.
  const tries = [...evenements].sort((a, b) => a.debut - b.debut)
  const finsCouloirs: number[] = []
  const couloir = new Map<string, number>()
  for (const e of tries) {
    let i = finsCouloirs.findIndex((f) => f <= e.debut)
    if (i < 0) i = finsCouloirs.push(0) - 1
    finsCouloirs[i] = e.fin
    couloir.set(e.cle, i)
  }
  const n = Math.max(1, finsCouloirs.length)
  const maintenant = new Date()
  const minNow = maintenant.getHours() * 60 + maintenant.getMinutes()

  return (
    <div className={`relative border-l border-line ${date === aujourdhui() ? 'bg-teja/5' : ''}`}
      onClick={(ev) => {
        if (ev.target !== ev.currentTarget) return
        const y = ev.nativeEvent.offsetY
        onVide(enHeure(Math.round((hMin + y / PX_MIN) / 5) * 5))
      }}>
      {heures.map((h) => (
        <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line" style={{ top: (h - hMin) * PX_MIN }}>
          <div className="border-t border-dashed border-line/60" style={{ marginTop: 30 * PX_MIN - 1 }} />
        </div>
      ))}
      {date === aujourdhui() && minNow > hMin && (
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-grenat" style={{ top: (minNow - hMin) * PX_MIN }}>
          <span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-grenat" />
        </div>
      )}
      {tries.map((e) => {
        const c = e.classe?.couleur ?? '#5E554C'
        const s = e.seance
        const hauteur = (e.fin - e.debut) * PX_MIN
        return (
          <button key={e.cle} onClick={() => onOuvrir(e)}
            className={`absolute overflow-hidden rounded-lg border-l-4 px-2 py-1 text-left text-xs shadow-sm transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-azulejo focus-visible:outline-none ${s ? '' : 'border-dashed'}`}
            style={{
              top: (e.debut - hMin) * PX_MIN + 1, height: hauteur - 2,
              left: `calc(${(couloir.get(e.cle)! / n) * 100}% + 2px)`, width: `calc(${100 / n}% - 4px)`,
              borderColor: c, background: `color-mix(in srgb, ${c} ${s ? 18 : 7}%, var(--surface))`,
            }}>
            <div className="flex items-center gap-1 font-bold">
              <span className="tabular-nums">{enHeure(e.debut)}</span>
              <span className="truncate">{e.classe?.nom ?? 'Classe ?'}</span>
              {s?.statut === 'faite' && <span title="Faite">✓</span>}
              {e.creneau?.salle && <span className="ml-auto shrink-0 font-normal text-muted">{e.creneau.salle}</span>}
            </div>
            {s ? (
              <>
                <div className={`truncate text-[13px] font-bold ${s.statut === 'annulee' ? 'line-through opacity-60' : ''}`}>{s.titre || 'Séance sans titre'}</div>
                {hauteur > 60 && <div className="mt-0.5 flex flex-wrap gap-0.5">{s.activites.map((a) => <BadgeAL key={a} a={a} />)}</div>}
              </>
            ) : (
              <div className="truncate text-[13px] italic text-muted">{e.prop ? e.prop.titre.split(' — ').slice(1).join(' — ') : '✏️ Préparer'}</div>
            )}
          </button>
        )
      })}
    </div>
  )
}

function DialogueCreation({ date, debut, classes, onFermer }: { date: string; debut: string; classes: Classe[]; onFermer: () => void }) {
  const [classeId, setClasseId] = useState(classes[0]?.id ?? '')
  const [h, setH] = useState({ debut, fin: enHeure(enMinutes(debut) + 55) })
  async function creer(e: React.FormEvent) {
    e.preventDefault()
    const s = { ...nouvelleSeance(classes.find((c) => c.id === classeId), date), ...h, dureeMin: Math.max(5, enMinutes(h.fin) - enMinutes(h.debut)) }
    await put('seances', s)
    aller('seance', s.id)
  }
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <form onSubmit={creer} className="carte w-full max-w-sm p-5" role="dialog" aria-label="Nouvelle séance">
        <h2 className="text-xl font-semibold">Nouvelle séance</h2>
        <p className="text-sm text-muted first-letter:uppercase">{formatLong(date)}</p>
        <label className="mt-3 block"><span className="label">Classe</span>
          <select className="champ" value={classeId} onChange={(e) => setClasseId(e.target.value)}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label><span className="label">Début</span><input type="time" className="champ" value={h.debut} onChange={(e) => setH({ ...h, debut: e.target.value })} /></label>
          <label><span className="label">Fin</span><input type="time" className="champ" value={h.fin} onChange={(e) => setH({ ...h, fin: e.target.value })} /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onFermer}>Annuler</button>
          <button className="btn-primary">Créer</button>
        </div>
      </form>
    </div>
  )
}

export function NouveauDevoir({ date, classes, dateDefaut, seanceDe }: { date: string; classes: Classe[]; dateDefaut: (classeId: string) => string; seanceDe: (classeId: string) => string | null }) {
  const [f, setF] = useState({ classeId: '', texte: '', pourLe: '' })
  if (!classes.length) return null
  const cid = f.classeId || classes[0].id
  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    if (!f.texte.trim()) return
    await put<Devoir>('devoirs', { id: uid(), classeId: cid, donneLe: date, pourLe: f.pourLe || dateDefaut(cid), seanceId: seanceDe(cid), texte: f.texte.trim() })
    setF({ ...f, texte: '', pourLe: '' })
  }
  return (
    <form onSubmit={ajouter} className="carte flex flex-col gap-2 p-4">
      <h3 className="font-semibold">Donner un devoir</h3>
      <select className="champ" value={cid} onChange={(e) => setF({ ...f, classeId: e.target.value, pourLe: '' })} aria-label="Classe">
        {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
      </select>
      <input className="champ" placeholder="Ex. Apprendre le lexique de la familia" value={f.texte} onChange={(e) => setF({ ...f, texte: e.target.value })} aria-label="Devoir" />
      <label className="flex items-center gap-2 text-sm"><span className="font-bold text-muted">Pour le</span>
        <input type="date" className="champ" value={f.pourLe || dateDefaut(cid)} onChange={(e) => setF({ ...f, pourLe: e.target.value })} />
      </label>
      <button className="btn-primary">Ajouter</button>
    </form>
  )
}

export function ListeDevoirs({ titre, devoirs, classe, montrerPour }: { titre: string; devoirs: Devoir[]; classe: (id: string) => Classe | undefined; montrerPour?: boolean }) {
  return (
    <div className="carte p-4">
      <h3 className="mb-2 font-semibold">{titre}</h3>
      {devoirs.length ? (
        <ul className="flex flex-col gap-2">
          {devoirs.map((d) => (
            <li key={d.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <PastilleClasse classe={classe(d.classeId)} />
                {montrerPour && <span className="ml-2 text-xs text-muted">pour le {formatCourt(d.pourLe)}</span>}
                <p>{d.texte}</p>
              </div>
              <button className="no-print text-muted hover:text-grenat" onClick={() => confirm('Supprimer ce devoir ?') && del('devoirs', d.id)} aria-label="Supprimer le devoir">✕</button>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted">Rien.</p>}
    </div>
  )
}

export function Rappels({ date, rappels }: { date: string; rappels: Rappel[] }) {
  const [f, setF] = useState({ titre: '', heure: '', type: 'reunion' as TypeRappel })
  const [ouvert, setOuvert] = useState(false)
  const tries = [...rappels].sort((a, b) => (a.heure || '99').localeCompare(b.heure || '99'))
  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    if (!f.titre.trim()) return
    await put<Rappel>('rappels', { id: uid(), date, note: '', ...f, titre: f.titre.trim() })
    setF({ titre: '', heure: '', type: 'reunion' })
    setOuvert(false)
  }
  return (
    <Section titre={tries.length ? 'Rappels & rendez-vous' : ''}>
      {tries.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {tries.map((r) => (
            <li key={r.id} className="flex items-center gap-2 rounded-xl border-l-4 border-safran bg-safran/15 px-3 py-2">
              <span className="font-bold tabular-nums">{r.heure || '—'}</span>
              <span className="rounded bg-safran px-1.5 py-0.5 text-xs font-bold text-[#2B2B2B]">{TYPES_RAPPEL[r.type]}</span>
              <span className="min-w-0 flex-1">{r.titre}</span>
              <button className="text-muted hover:text-grenat" onClick={() => del('rappels', r.id)} aria-label="Supprimer le rappel">✕</button>
            </li>
          ))}
        </ul>
      )}
      {!ouvert ? <button className="no-print text-sm font-bold text-azulejo hover:underline" onClick={() => setOuvert(true)}>+ Rappel / rendez-vous</button> : (
      <form onSubmit={ajouter} className="carte flex flex-col gap-2 p-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select className="champ" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as TypeRappel })} aria-label="Type">
            {Object.entries(TYPES_RAPPEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="time" className="champ" value={f.heure} onChange={(e) => setF({ ...f, heure: e.target.value })} aria-label="Heure" />
        </div>
        <input className="champ" placeholder="Ex. Conseil de classe 3e C" value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} aria-label="Intitulé" />
        <div className="flex gap-2">
          <button className="btn-primary flex-1">+ Ajouter le rappel</button>
          <button type="button" className="btn-ghost" onClick={() => setOuvert(false)}>Annuler</button>
        </div>
      </form>)}
    </Section>
  )
}

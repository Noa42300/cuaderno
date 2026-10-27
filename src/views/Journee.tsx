import { useEffect, useMemo, useState } from 'react'
import { all, getReglages } from '../db/db'
import { creneauxDuJour, prochainCours, toutesSeances } from '../db/modeles'
import type { Classe, Creneau, Devoir, Rappel, Reglages } from '../db/types'
import { enVacances } from '../data/officiel'
import { niveauProg } from '../data/programmations'
import { ajouterJours, aujourdhui, fechaEs, formatLong, fromISO, jourDe, lundiDe, numeroSemaine } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { creerDepuisProgression, indexPlanning, proposition, type Occurrence } from '../lib/progression'
import { BadgeAL, Section, Vide } from '../components/ui'
import { FicheSeance } from './FicheSeance'
import { ListeDevoirs, NouveauDevoir, Rappels } from './Agenda'

export function useDonnees() {
  const data = useQuery(async () => {
    const [reglages, classes, creneaux, seances, rappels, devoirs] = await Promise.all([
      getReglages(), all<Classe>('classes'), all<Creneau>('creneaux'), toutesSeances(), all<Rappel>('rappels'), all<Devoir>('devoirs'),
    ])
    return { reglages, classes: classes.filter((c) => !c.archivee).sort((a, b) => ordreNiveau(a) - ordreNiveau(b) || a.nom.localeCompare(b.nom)), creneaux, seances, rappels, devoirs }
  }, [])
  const planning = useMemo(() => (data ? indexPlanning(data.classes, data.creneaux, data.reglages) : new Map<string, Occurrence>()), [data?.classes, data?.creneaux, data?.reglages])
  return data && { ...data, planning }
}
type Donnees = NonNullable<ReturnType<typeof useDonnees>>

const ORDRE = ['6e', '5e', '4e', '3e', '2nde', '1re', 'Tle']
export const ordreNiveau = (c: Classe) => ORDRE.indexOf(c.niveau)

/** Les cours d'une journée : créneaux de l'EDT + séances hors EDT, avec la séance réelle ou proposée. */
export function coursDuJour(d: Donnees, date: string) {
  if (enVacances(date, d.reglages.zone)) return []
  const classe = (id: string) => d.classes.find((c) => c.id === id)
  const duJour = d.seances.filter((s) => s.date === date)
  const cours = creneauxDuJour(date, d.creneaux, d.reglages).map((cr) => {
    const c = classe(cr.classeId)
    const s = duJour.find((x) => x.creneauId === cr.id)
    return { cle: cr.id, debut: cr.debut, fin: cr.fin, salle: cr.salle, classe: c, creneau: cr as Creneau | undefined, seance: s, prop: s ? null : proposition(c, d.planning.get(`${date}|${cr.id}`)) }
  })
  for (const s of duJour)
    if (!cours.some((x) => x.seance?.id === s.id))
      cours.push({ cle: s.id, debut: s.debut, fin: s.fin, salle: '', classe: classe(s.classeId), creneau: undefined, seance: s, prop: null })
  return cours.filter((x) => x.classe).sort((a, b) => (a.debut || '99').localeCompare(b.debut || '99'))
}

// ——— HOY : la journée, chaque cours se déplie en fiche complète
export function Hoy({ date = aujourdhui(), ouvrir }: { date?: string; ouvrir?: string }) {
  const d = useDonnees()
  const [ouverts, setOuverts] = useState<Set<string>>(new Set(ouvrir ? [ouvrir] : []))
  useEffect(() => { if (ouvrir) setOuverts(new Set([ouvrir])) }, [ouvrir, date])
  useEffect(() => {
    if (ouvrir) setTimeout(() => document.getElementById(`cours-${ouvrir}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
  }, [ouvrir, d === undefined])
  // Arrivée depuis Semana / le calendrier : la fiche du cours demandé est créée et dépliée.
  useEffect(() => {
    if (!d || !ouvrir) return
    const c = coursDuJour(d, date).find((x) => x.cle === ouvrir)
    if (c && !c.seance && c.classe) creerDepuisProgression(c.classe, date, c.creneau, c.prop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvrir, date, d === undefined])
  if (!d) return null
  const vac = enVacances(date, d.reglages.zone)
  const cours = coursDuJour(d, date)

  async function basculer(c: ReturnType<typeof coursDuJour>[number]) {
    const s = new Set(ouverts)
    if (s.has(c.cle)) s.delete(c.cle)
    else {
      if (!c.seance && c.classe) await creerDepuisProgression(c.classe, date, c.creneau, c.prop)
      s.add(c.cle)
    }
    setOuverts(s)
  }

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-azulejo">{date === aujourdhui() ? 'Hoy · Aujourd’hui' : 'Cahier journal'}</p>
          <h1 className="text-3xl font-semibold first-letter:uppercase md:text-4xl">{formatLong(date)}</h1>
          <p className="italic text-muted first-letter:uppercase" lang="es">{fechaEs(date)}</p>
        </div>
        <div className="no-print flex items-center gap-2">
          <button className="btn-ghost px-3" onClick={() => aller('jour', ajouterJours(date, -1))} aria-label="Jour précédent">‹</button>
          <button className="btn-ghost" onClick={() => aller('jour', aujourdhui())}>Hoy</button>
          <button className="btn-ghost px-3" onClick={() => aller('jour', ajouterJours(date, 1))} aria-label="Jour suivant">›</button>
          <input type="date" className="champ w-auto" value={date} onChange={(e) => e.target.value && aller('jour', e.target.value)} aria-label="Aller à la date" />
        </div>
      </header>

      <Rappels date={date} rappels={d.rappels.filter((r) => r.date === date)} />

      <Section titre="Mis clases · Mes cours">
        {vac ? <Vide>🏖️ {vac} — pas de cours.</Vide>
          : !d.creneaux.length ? <Vide>Ton emploi du temps est vide : ajoute tes créneaux dans <a className="font-bold text-primary underline" href="#/reglages/edt">Ajustes › Emploi du temps</a>. Dès qu’il est rempli, chaque cours reçoit automatiquement sa séance.</Vide>
            : !cours.length ? <Vide>Pas de cours ce jour-là.</Vide>
              : (
                <ol className="flex flex-col gap-3">
                  {cours.map((c) => {
                    const ouvert = ouverts.has(c.cle) && !!c.seance
                    return (
                      <li key={c.cle} id={`cours-${c.cle}`} className="carte scroll-mt-4 overflow-hidden" style={{ borderLeft: `5px solid ${c.classe?.couleur}` }}>
                        <button className="flex w-full items-start gap-3 p-3 text-left hover:bg-surface-2/50" onClick={() => basculer(c)} aria-expanded={ouvert}>
                          <span className={`mt-1 text-muted transition ${ouvert ? 'rotate-90' : ''}`} aria-hidden>›</span>
                          <span className="w-24 shrink-0">
                            <span className="block font-bold tabular-nums">{c.debut}–{c.fin}</span>
                            {c.salle && <span className="text-xs font-bold text-azulejo">Salle {c.salle}</span>}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="rounded px-2 py-0.5 text-xs font-bold text-white" style={{ background: c.classe?.couleur }}>{c.classe?.nom}</span>
                              <span className="text-xs font-bold uppercase tracking-wide text-muted">Espagnol</span>
                              {c.seance?.statut === 'faite' && <span className="text-xs font-bold text-azulejo">✓ faite</span>}
                            </span>
                            <span className={`mt-1 block font-semibold ${c.seance ? '' : 'italic text-muted'}`}>
                              {c.seance?.titre || c.prop?.titre || (niveauProg(c.classe?.niveau ?? '') ? 'Progression terminée — séance libre' : 'Séance à préparer')}
                              {!c.seance && c.prop && <span className="ml-2 rounded bg-safran/30 px-1.5 py-0.5 text-[11px] font-bold not-italic text-ink">proposée</span>}
                            </span>
                            {c.seance && <span className="mt-1 flex flex-wrap gap-1">{c.seance.activites.map((a) => <BadgeAL key={a} a={a} />)}</span>}
                          </span>
                        </button>
                        {ouvert && c.seance && <div className="border-t border-line bg-bg/40 p-3 md:p-4"><FicheSeance id={c.seance.id} compacte /></div>}
                      </li>
                    )
                  })}
                </ol>
              )}
      </Section>

      <Section titre="Deberes · Devoirs">
        <div className="grid gap-3 md:grid-cols-3">
          <ListeDevoirs titre="À vérifier aujourd’hui" devoirs={d.devoirs.filter((x) => x.pourLe === date)} classe={(id) => d.classes.find((c) => c.id === id)} />
          <ListeDevoirs titre="Donnés aujourd’hui" devoirs={d.devoirs.filter((x) => x.donneLe === date)} classe={(id) => d.classes.find((c) => c.id === id)} montrerPour />
          <NouveauDevoir date={date} classes={d.classes} dateDefaut={(id) => prochainCours(id, date, d.creneaux, d.reglages)}
            seanceDe={(id) => d.seances.find((s) => s.date === date && s.classeId === id)?.id ?? null} />
        </div>
      </Section>
    </div>
  )
}

// ——— SEMANA : une carte par jour, chaque cours mène à sa fiche
export function Semana({ date = aujourdhui() }: { date?: string }) {
  const d = useDonnees()
  if (!d) return null
  const lundi = lundiDe(date)
  const jours = Array.from({ length: 7 }, (_, i) => ajouterJours(lundi, i)).filter((x) => d.reglages.joursTravailles.includes(jourDe(x) as Reglages['joursTravailles'][number]))

  return (
    <div>
      <header className="flex flex-wrap items-center gap-3">
        <button className="btn-ghost px-3" onClick={() => aller('semana', ajouterJours(lundi, -7))} aria-label="Semaine précédente">‹</button>
        <h1 className="text-3xl font-semibold">Semana {numeroSemaine(lundi)}</h1>
        <button className="btn-ghost px-3" onClick={() => aller('semana', ajouterJours(lundi, 7))} aria-label="Semaine suivante">›</button>
        <button className="text-sm font-bold text-azulejo hover:underline" onClick={() => aller('semana', aujourdhui())}>Cette semaine</button>
        <span className="text-sm text-muted">du {fromISO(lundi).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
        <button className="btn-ghost no-print ml-auto" onClick={() => print()} aria-label="Imprimer la semaine">🖨</button>
      </header>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jours.map((j) => {
          const vac = enVacances(j, d.reglages.zone)
          const cours = coursDuJour(d, j)
          const rappels = d.rappels.filter((r) => r.date === j)
          const aPreparer = cours.filter((c) => !c.seance).length
          return (
            <section key={j} className={`carte flex flex-col p-4 ${j === aujourdhui() ? 'ring-2 ring-primary' : ''}`}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <a href={`#/jour/${j}`} className="titre text-lg font-semibold first-letter:uppercase hover:underline">
                  {fromISO(j).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </a>
                <span className="text-xs italic text-muted">{vac ? 'vacances' : cours.length ? `${cours.length} cours${aPreparer ? ` · ${aPreparer} à ouvrir` : ''}` : 'journée libre'}</span>
              </div>
              {rappels.map((r) => <p key={r.id} className="mb-1 rounded bg-safran/25 px-2 py-1 text-xs font-bold">📌 {r.heure && `${r.heure} · `}{r.titre}</p>)}
              {vac ? <p className="text-sm italic text-muted">🏖️ {vac}</p>
                : !cours.length ? <p className="text-sm italic text-muted">Journée vide</p>
                  : (
                    <ul className="flex flex-col gap-2">
                      {cours.map((c) => (
                        <li key={c.cle}>
                          <a href={`#/jour/${j}/${c.cle}`} className="block rounded-lg p-1.5 hover:bg-surface-2">
                            <span className="flex items-center gap-2 text-sm">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.classe?.couleur }} aria-hidden />
                              <span className="font-mono tabular-nums text-muted">{c.debut}</span>
                              <span className="font-bold">{c.classe?.nom}</span>
                              {c.salle && <span className="text-xs text-muted">· {c.salle}</span>}
                              {c.seance?.statut === 'faite' && <span className="ml-auto text-azulejo" title="Faite">✓</span>}
                            </span>
                            <span className={`ml-[18px] block truncate text-sm ${c.seance ? '' : 'italic text-muted'}`}>
                              {c.seance?.titre || c.prop?.titre || 'Séance à préparer'}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
            </section>
          )
        })}
      </div>
      {!d.creneaux.length && <p className="mt-4 rounded-xl border border-dashed border-line p-4 text-center text-muted">Emploi du temps vide : ajoute tes créneaux dans <a className="font-bold text-primary underline" href="#/reglages/edt">Ajustes</a>.</p>}
    </div>
  )
}

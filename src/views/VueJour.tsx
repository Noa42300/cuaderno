import { useState } from 'react'
import { all, byIndex, del, getReglages, put, uid } from '../db/db'
import { creneauxDuJour, nouvelleSeance, prochainCours } from '../db/modeles'
import { TYPES_RAPPEL, type Classe, type Creneau, type Devoir, type Rappel, type Seance, type TypeRappel } from '../db/types'
import { ajouterJours, aujourdhui, fechaEs, formatCourt, formatLong, semaineAB } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { BadgeAL, PastilleClasse, Section, Vide } from '../components/ui'

export default function VueJour({ date }: { date: string }) {
  const data = useQuery(async () => {
    const [reglages, classes, creneaux, seances, rappels, devoirsPour, devoirsDonnes] = await Promise.all([
      getReglages(),
      all<Classe>('classes'),
      all<Creneau>('creneaux'),
      byIndex<Seance>('seances', 'date', date),
      byIndex<Rappel>('rappels', 'date', date),
      byIndex<Devoir>('devoirs', 'pourLe', date),
      byIndex<Devoir>('devoirs', 'donneLe', date),
    ])
    return { reglages, classes, creneaux, seances, rappels, devoirsPour, devoirsDonnes }
  }, [date])

  if (!data) return null
  const { reglages, classes, creneaux, seances, rappels, devoirsPour, devoirsDonnes } = data
  const classe = (id: string) => classes.find((c) => c.id === id)
  const duJour = creneauxDuJour(date, creneaux, reglages)
  const ab = semaineAB(date, reglages.lundiSemaineA)
  const horsEdt = seances.filter((s) => !s.creneauId || !duJour.some((c) => c.id === s.creneauId))

  async function preparer(cl: Classe, cr?: Creneau) {
    const s = nouvelleSeance(cl, date, cr)
    await put('seances', s)
    aller('seance', s.id)
  }

  return (
    <div>
      {/* En-tête de date */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-azulejo">
            {date === aujourdhui() ? 'Aujourd’hui' : 'Cahier journal'}
            {ab && <span className="ml-2 rounded bg-azulejo px-1.5 py-0.5 text-white dark:text-bg">Semaine {ab}</span>}
          </p>
          <h1 className="text-3xl font-semibold first-letter:uppercase md:text-4xl">{formatLong(date)}</h1>
          <p className="mt-1 italic text-muted first-letter:uppercase" lang="es">{fechaEs(date)}</p>
        </div>
        <div className="no-print flex w-full items-center gap-2 sm:w-auto">
          <button className="btn-ghost px-3" onClick={() => aller('jour', ajouterJours(date, -1))} aria-label="Jour précédent">‹</button>
          <button className="btn-ghost" onClick={() => aller('jour', aujourdhui())}>Aujourd’hui</button>
          <button className="btn-ghost px-3" onClick={() => aller('jour', ajouterJours(date, 1))} aria-label="Jour suivant">›</button>
          <input type="date" className="champ min-w-0 flex-1 sm:w-auto sm:flex-none" value={date} onChange={(e) => e.target.value && aller('jour', e.target.value)} aria-label="Aller à la date" />
        </div>
      </header>
      <div className="frise mt-4 rounded" aria-hidden />

      <Rappels date={date} rappels={rappels} />

      {/* Créneaux */}
      <Section titre="Mes cours">
        {!classes.length ? (
          <Vide>
            Pour commencer, crée tes classes et ton emploi du temps dans <a className="font-bold text-primary underline" href="#/reglages/classes">Réglages</a>.
          </Vide>
        ) : !duJour.length ? (
          <Vide>Pas de cours prévu à l’emploi du temps ce jour-là.</Vide>
        ) : (
          <ol className="flex flex-col gap-3">
            {duJour.map((cr) => {
              const cl = classe(cr.classeId)
              const s = seances.find((x) => x.creneauId === cr.id)
              return (
                <li key={cr.id} className="carte flex overflow-hidden">
                  <div className="w-1.5 shrink-0" style={{ background: cl?.couleur }} aria-hidden />
                  <div className="w-20 shrink-0 border-r border-line p-3 text-center">
                    <div className="text-lg font-bold">{cr.debut}</div>
                    <div className="text-sm text-muted">{cr.fin}</div>
                    {cr.salle && <div className="mt-1 text-xs font-bold text-azulejo">Salle {cr.salle}</div>}
                  </div>
                  <div className="min-w-0 flex-1 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <PastilleClasse classe={cl} />
                      {cl && <span className="text-xs text-muted">{cl.niveau} · {cl.option} · visé {cl.cecrlVise}</span>}
                    </div>
                    {s ? <ResumeSeance s={s} /> : cl && (
                      <button className="btn-ghost mt-2 text-sm" onClick={() => preparer(cl, cr)}>✏️ Préparer la séance</button>
                    )}
                    {cl && <DevoirsClasse classe={cl} date={date} devoirsPour={devoirsPour} devoirsDonnes={devoirsDonnes}
                      seanceId={s?.id ?? null} dateDefaut={() => prochainCours(cl.id, date, creneaux, reglages)} />}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </Section>

      {(horsEdt.length > 0 || classes.length > 0) && (
        <Section titre="Hors emploi du temps" actions={classes.length > 0 && <AjoutHorsEdt classes={classes} onChoix={(c) => preparer(c)} />}>
          {horsEdt.length ? (
            <ul className="flex flex-col gap-2">
              {horsEdt.map((s) => (
                <li key={s.id} className="carte p-3">
                  <PastilleClasse classe={classe(s.classeId)} />
                  <ResumeSeance s={s} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Remplacement, heure ajoutée, AP… ajoute une séance ponctuelle ici.</p>
          )}
        </Section>
      )}

      {/* Devoirs du jour */}
      <Section titre="Devoirs">
        <div className="grid gap-3 md:grid-cols-2">
          <ListeDevoirs titre="À vérifier aujourd’hui" devoirs={devoirsPour} classe={classe} />
          <ListeDevoirs titre="Donnés aujourd’hui" devoirs={devoirsDonnes} classe={classe} montrerPour />
        </div>
      </Section>
    </div>
  )
}

function ResumeSeance({ s }: { s: Seance }) {
  const basculer = () => put('seances', { ...s, statut: s.statut === 'faite' ? 'prevue' : 'faite', modifieLe: new Date().toISOString() })
  return (
    <div className="mt-2">
      <a href={`#/seance/${s.id}`} className={`block text-lg font-bold hover:underline ${s.statut === 'annulee' ? 'line-through opacity-60' : ''}`}>
        {s.titre || <span className="italic text-muted">Séance sans titre</span>}
      </a>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {s.activites.map((a) => <BadgeAL key={a} a={a} />)}
        <span className="text-xs text-muted">{s.cecrlDe === s.cecrlVers ? s.cecrlDe : `${s.cecrlDe} → ${s.cecrlVers}`}</span>
        <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-sm font-bold">
          <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={s.statut === 'faite'} onChange={basculer} disabled={s.statut === 'annulee'} />
          Faite
        </label>
      </div>
    </div>
  )
}

function DevoirsClasse(p: { classe: Classe; date: string; devoirsPour: Devoir[]; devoirsDonnes: Devoir[]; seanceId: string | null; dateDefaut: () => string }) {
  const [ouvert, setOuvert] = useState(false)
  const [texte, setTexte] = useState('')
  const [pourLe, setPourLe] = useState('')
  const aVerifier = p.devoirsPour.filter((d) => d.classeId === p.classe.id)
  const donnes = p.devoirsDonnes.filter((d) => d.classeId === p.classe.id)

  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    if (!texte.trim()) return
    await put<Devoir>('devoirs', { id: uid(), classeId: p.classe.id, donneLe: p.date, pourLe: pourLe || p.dateDefaut(), seanceId: p.seanceId, texte: texte.trim() })
    setTexte('')
    setOuvert(false)
  }

  return (
    <div className="mt-2 text-sm">
      {aVerifier.map((d) => <p key={d.id}>✅ <strong>À vérifier :</strong> {d.texte}</p>)}
      {donnes.map((d) => <p key={d.id}>📝 <strong>Pour le {formatCourt(d.pourLe)} :</strong> {d.texte}</p>)}
      {ouvert ? (
        <form onSubmit={ajouter} className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input className="champ" autoFocus placeholder="Ex. Apprendre le lexique de la familia p. 34" value={texte} onChange={(e) => setTexte(e.target.value)} />
          <input type="date" className="champ sm:w-44" value={pourLe || p.dateDefaut()} onChange={(e) => setPourLe(e.target.value)} aria-label="Pour le" />
          <button className="btn-primary">Ajouter</button>
          <button type="button" className="btn-ghost" onClick={() => setOuvert(false)}>Annuler</button>
        </form>
      ) : (
        <button className="no-print mt-1 font-bold text-azulejo hover:underline" onClick={() => setOuvert(true)}>+ Donner un devoir</button>
      )}
    </div>
  )
}

function ListeDevoirs({ titre, devoirs, classe, montrerPour }: { titre: string; devoirs: Devoir[]; classe: (id: string) => Classe | undefined; montrerPour?: boolean }) {
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
      ) : (
        <p className="text-sm text-muted">Rien.</p>
      )}
    </div>
  )
}

function Rappels({ date, rappels }: { date: string; rappels: Rappel[] }) {
  const [ouvert, setOuvert] = useState(false)
  const [f, setF] = useState({ titre: '', heure: '', type: 'reunion' as TypeRappel })
  const tries = [...rappels].sort((a, b) => (a.heure || '99').localeCompare(b.heure || '99'))

  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    if (!f.titre.trim()) return
    await put<Rappel>('rappels', { id: uid(), date, note: '', ...f, titre: f.titre.trim() })
    setF({ titre: '', heure: '', type: 'reunion' })
    setOuvert(false)
  }

  return (
    <div className="mt-4">
      {tries.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label="Rappels du jour">
          {tries.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border-l-4 border-safran bg-safran/15 px-4 py-2">
              <span className="font-bold">{r.heure || '—'}</span>
              <span className="rounded bg-safran px-1.5 py-0.5 text-xs font-bold text-[#2B2B2B]">{TYPES_RAPPEL[r.type]}</span>
              <span className="flex-1">{r.titre}</span>
              <button className="no-print text-muted hover:text-grenat" onClick={() => del('rappels', r.id)} aria-label="Supprimer le rappel">✕</button>
            </li>
          ))}
        </ul>
      )}
      {ouvert ? (
        <form onSubmit={ajouter} className="carte mt-2 flex flex-col gap-2 p-3 sm:flex-row">
          <select className="champ sm:w-48" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as TypeRappel })} aria-label="Type">
            {Object.entries(TYPES_RAPPEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input type="time" className="champ sm:w-32" value={f.heure} onChange={(e) => setF({ ...f, heure: e.target.value })} aria-label="Heure" />
          <input className="champ" autoFocus placeholder="Ex. Conseil de classe 3e C" value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} />
          <button className="btn-primary">Ajouter</button>
          <button type="button" className="btn-ghost" onClick={() => setOuvert(false)}>Annuler</button>
        </form>
      ) : (
        <button className="no-print mt-2 text-sm font-bold text-azulejo hover:underline" onClick={() => setOuvert(true)}>+ Rappel / rendez-vous</button>
      )}
    </div>
  )
}

function AjoutHorsEdt({ classes, onChoix }: { classes: Classe[]; onChoix: (c: Classe) => void }) {
  return (
    <select className="champ no-print w-auto text-sm" value="" aria-label="Ajouter une séance hors emploi du temps"
      onChange={(e) => { const c = classes.find((x) => x.id === e.target.value); if (c) onChoix(c) }}>
      <option value="">+ Séance pour…</option>
      {classes.filter((c) => !c.archivee).map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
    </select>
  )
}

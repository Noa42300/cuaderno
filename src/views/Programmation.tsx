import { useState } from 'react'
import { put } from '../db/db'
import type { Classe } from '../db/types'
import { periodes, programmeDe, PROGRAMMES_OFFICIELS, VACANCES, VOLUMES_OFFICIELS } from '../data/officiel'
import { niveauProg, PROGRAMMATIONS } from '../data/programmations'
import { POINTS_LANGUE } from '../data/grammaire'
import { aujourdhui, formatCourt } from '../lib/dates'
import { aller } from '../lib/hooks'
import { planningClasse, progressionDuNiveau } from '../lib/progression'
import { TYPES_SEANCE } from '../lib/generateur'
import { Vide } from '../components/ui'
import { useDonnees } from './Journee'

function ChoixClasse({ classes, choix, onChoix }: { classes: Classe[]; choix?: string; onChoix: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Classe">
      {classes.map((c) => (
        <button key={c.id} role="tab" aria-selected={choix === c.id} onClick={() => onChoix(c.id)}
          className={`rounded-full border-2 px-3 py-1 text-sm font-bold transition ${choix === c.id ? 'text-white' : 'bg-surface text-ink'}`}
          style={{ borderColor: c.couleur, background: choix === c.id ? c.couleur : undefined }}>
          {c.nom}
        </button>
      ))}
    </div>
  )
}

// ——— PROGRAMACIÓN
export function Programmation({ classeId }: { classeId?: string }) {
  const d = useDonnees()
  const [vue, setVue] = useState<'classe' | 'textes'>('classe')
  if (!d) return null
  const classe = d.classes.find((c) => c.id === classeId) ?? d.classes[0]
  const n = classe && niveauProg(classe.niveau)
  const prog = classe && programmeDe(classe.niveau)
  const per = periodes(d.reglages.zone, d.reglages.rentree)

  return (
    <div>
      <h1 className="text-3xl font-semibold">Programación <span className="text-xl font-normal text-muted">· programmations annuelles</span></h1>
      <div className="mt-3 flex gap-1 border-b border-line">
        {([['classe', 'Par classe'], ['textes', 'Textes officiels']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setVue(k)} className={`border-b-2 px-3 py-2 font-bold ${vue === k ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>{l}</button>
        ))}
      </div>

      {vue === 'textes' ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {PROGRAMMES_OFFICIELS.map((p) => (
            <section key={p.titre} className="carte p-4">
              <h2 className="text-lg font-semibold">{p.titre}</h2>
              <p className="mt-1 text-sm"><b>Texte :</b> {p.texte}</p>
              <p className="text-sm"><b>En vigueur :</b> {p.enVigueur}</p>
              <p className="text-sm"><b>Niveau visé :</b> {p.niveauVise}</p>
              <p className="mt-1 text-sm text-muted">{p.organisation}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">{p.axes.map((a) => <li key={a}>{a}</li>)}</ul>
            </section>
          ))}
          <section className="carte p-4">
            <h2 className="text-lg font-semibold">Volumes horaires officiels</h2>
            <ul className="mt-2 text-sm">{VOLUMES_OFFICIELS.map((v) => <li key={v.niveau} className="py-1"><b>{v.niveau} :</b> {v.volume} <span className="text-muted">— {v.note}</span></li>)}</ul>
          </section>
          <section className="carte p-4">
            <h2 className="text-lg font-semibold">Calendrier 2026-2027 — zone {d.reglages.zone}</h2>
            <ul className="mt-2 text-sm">{VACANCES[d.reglages.zone].map((v) => <li key={v.nom} className="py-0.5"><b>{v.nom} :</b> du {formatCourt(v.debut)} au {formatCourt(v.reprise)} (reprise)</li>)}</ul>
            <p className="mt-2 text-xs text-muted">Zone modifiable dans Ajustes › Général. Source : Onisep.</p>
          </section>
          <p className="text-xs text-muted lg:col-span-2">Références vérifiées le 27/10/2026 (BO n° 22 du 29 mai 2025). En cas de nouveau BO, dis-le-moi pour mettre à jour.</p>
        </div>
      ) : !classe ? <div className="mt-4"><Vide>Aucune classe.</Vide></div> : (
        <div className="mt-4">
          <ChoixClasse classes={d.classes} choix={classe.id} onChoix={(id) => aller('programacion', id)} />
          {prog && (
            <p className="mt-3 text-sm text-muted">
              <b className="text-ink">{prog.titre}</b> · niveau visé : {prog.niveauVise} · {prog.organisation}
            </p>
          )}
          {!n ? <div className="mt-4"><Vide>Pas encore de programmation pour ce niveau.</Vide></div> : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="p-2">Période</th><th className="p-2">Séquence</th><th className="p-2">Axe / thématique</th><th className="p-2">Documents</th><th className="p-2">Langue</th><th className="p-2">Tâche finale</th>
                  </tr>
                </thead>
                <tbody>
                  {PROGRAMMATIONS[n].map((s, i) => {
                    const p = per[s.periode - 1]
                    return (
                      <tr key={s.id} className="align-top">
                        <td className="border-t border-line p-2 font-bold">P{s.periode}<span className="block text-xs font-normal text-muted">{p && `${formatCourt(p.debut)} → ${formatCourt(p.fin)}`}</span></td>
                        <td className="border-t border-line p-2"><b className="titre text-base">{i + 1}. {s.titre}</b><span className="block italic text-muted">{s.problematique}</span></td>
                        <td className="border-t border-line p-2">{s.axe}</td>
                        <td className="border-t border-line p-2"><ul className="flex flex-col gap-1">{s.docs.map((x) => <li key={x.titre}><span className="rounded bg-surface-2 px-1 text-[11px] font-bold">{x.al}</span> {x.titre} <span className="text-muted">— {x.source}</span>{x.video && ' 🎬'}</li>)}</ul></td>
                        <td className="border-t border-line p-2">{s.points.map((k) => POINTS_LANGUE[k]?.label).join(' · ')}</td>
                        <td className="border-t border-line p-2"><span className="rounded bg-primary/10 px-1 text-[11px] font-bold">{s.tache.al}</span> {s.tache.texte}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ——— PROGRESIÓN
export function Progression({ classeId }: { classeId?: string }) {
  const d = useDonnees()
  const [depart, setDepart] = useState<{ date: string; index: number } | null>(null)
  if (!d) return null
  const classe = d.classes.find((c) => c.id === classeId) ?? d.classes[0]
  if (!classe) return <Vide>Aucune classe.</Vide>
  const n = niveauProg(classe.niveau)
  const seances = n ? progressionDuNiveau(n) : []
  const plan = planningClasse(classe, d.creneaux, d.reglages)
  const parIndex = new Map(plan.map((o) => [o.index, o]))
  const prochain = plan.find((o) => o.date >= aujourdhui())
  const fiches = new Map(d.seances.filter((s) => s.classeId === classe.id && s.cleProgression).map((s) => [s.cleProgression, s]))
  const dep = depart ?? classe.depart ?? { date: aujourdhui(), index: prochain?.index ?? 0 }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Progresión <span className="text-xl font-normal text-muted">· séance par séance</span></h1>
      <div className="mt-3"><ChoixClasse classes={d.classes} choix={classe.id} onChoix={(id) => aller('progresion', id)} /></div>

      {!n ? <div className="mt-4"><Vide>Pas encore de progression pour ce niveau.</Vide></div> : (
        <>
          <section className="carte mt-4 p-4">
            <h2 className="font-semibold">📍 Où en est la classe ?</h2>
            <p className="text-sm text-muted">L’appli propose les séances dans l’ordre, cours après cours (vacances et jours fériés exclus). Si tu as pris de l’avance ou du retard, recale ici.</p>
            {!d.creneaux.some((c) => c.classeId === classe.id) && <p className="mt-2 text-sm font-bold text-grenat">Aucun créneau pour cette classe dans l’emploi du temps : les dates ne peuvent pas être calculées.</p>}
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label><span className="label">À partir du</span><input type="date" className="champ" value={dep.date} onChange={(e) => setDepart({ ...dep, date: e.target.value })} /></label>
              <label className="min-w-0 flex-1"><span className="label">la classe fait la séance</span>
                <select className="champ" value={dep.index} onChange={(e) => setDepart({ ...dep, index: Number(e.target.value) })}>
                  {seances.map((s, i) => <option key={s.cle} value={i}>{i + 1}. {s.titre}</option>)}
                </select>
              </label>
              <button className="btn-primary" disabled={!depart} onClick={async () => { await put<Classe>('classes', { ...classe, depart: dep }); setDepart(null) }}>Recaler</button>
              {classe.depart && <button className="btn-ghost" onClick={() => { const { depart: _d, ...c } = classe; put('classes', c) }}>Repartir de la rentrée</button>}
            </div>
          </section>

          {PROGRAMMATIONS[n].map((seq, si) => (
            <section key={seq.id} className="mt-5">
              <h2 className="text-xl font-semibold">{si + 1}. {seq.titre} <span className="text-sm font-normal text-muted">· P{seq.periode} · {seq.axe}</span></h2>
              <ol className="mt-2 flex flex-col gap-1.5">
                {seances.map((s, i) => ({ s, i })).filter(({ s }) => s.seqIndex === si).map(({ s, i }) => {
                  const occ = parIndex.get(i)
                  const f = fiches.get(s.cle)
                  const passe = occ && occ.date < aujourdhui()
                  return (
                    <li key={s.cle}>
                      <button disabled={!occ} onClick={() => occ && aller('jour', occ.date, occ.creneau.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left text-sm hover:bg-surface-2 disabled:cursor-default ${prochain && occ?.index === prochain.index ? 'ring-2 ring-primary' : ''} ${passe ? 'opacity-70' : ''}`}>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold">{s.numero}</span>
                        <span className="w-28 shrink-0 text-xs text-muted">{occ ? `${formatCourt(occ.date)} · ${occ.creneau.debut}` : '—'}</span>
                        <span className="min-w-0 flex-1"><span className="font-semibold">{s.titre.split(' — ').slice(1).join(' — ')}</span> <span className="text-xs text-muted">· {TYPES_SEANCE[s.type]}</span></span>
                        {f ? <span className={`text-xs font-bold ${f.statut === 'faite' ? 'text-azulejo' : 'text-ink'}`}>{f.statut === 'faite' ? '✓ faite' : 'fiche prête'}</span> : <span className="text-xs text-muted">proposée</span>}
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
          {plan.length > seances.length && <p className="mt-4 text-sm text-muted">Il reste {plan.length - seances.length} cours après la fin de la progression : séances libres (projets, approfondissement, révisions).</p>}
        </>
      )}
    </div>
  )
}

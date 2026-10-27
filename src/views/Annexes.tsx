import { useState } from 'react'
import { minutesEntre, aujourdhui, fechaEs, formatCourt, formatLong } from '../lib/dates'
import { aller } from '../lib/hooks'
import { RESSOURCES } from '../data/ressources'
import { rituelDuJour } from '../data/rituels'
import { activitesDeClasse } from '../lib/activites'
import { niveauProg } from '../data/programmations'
import { VOLUMES_OFFICIELS } from '../data/officiel'
import { planningClasse } from '../lib/progression'
import { Vide } from '../components/ui'
import { useDonnees } from './Journee'

// ——— RECURSOS
export function Recursos() {
  const [q, setQ] = useState('')
  const f = q.trim().toLowerCase()
  return (
    <div>
      <h1 className="text-3xl font-semibold">Recursos <span className="text-xl font-normal text-muted">· ressources d’espagnol</span></h1>
      <input className="champ mt-3 max-w-md" placeholder="Chercher (ex. audio, Prado, conjugaison…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Chercher une ressource" />
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {RESSOURCES.map((cat) => {
          const items = cat.items.filter((r) => !f || `${r.nom} ${r.desc} ${cat.titre}`.toLowerCase().includes(f))
          if (!items.length) return null
          return (
            <section key={cat.titre} className="carte p-4">
              <h2 className="mb-2 text-lg font-semibold">{cat.icone} {cat.titre}</h2>
              <ul className="flex flex-col gap-2">
                {items.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noreferrer" className="group block rounded-lg p-2 hover:bg-surface-2">
                      <span className="font-bold text-primary group-hover:underline">{r.nom} ↗</span>
                      <span className="block text-sm text-muted">{r.desc}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

// ——— RITUALES : une activité d'entrée à projeter pour chaque cours, jusqu'aux vacances de Noël
export function Rituales({ classeId }: { classeId?: string }) {
  const d = useDonnees()
  const [choix, setChoix] = useState<number | null>(null)
  const [solution, setSolution] = useState(false)
  const [projection, setProjection] = useState(false)
  if (!d) return null
  const classe = d.classes.find((c) => c.id === classeId) ?? d.classes[0]
  if (!classe) return <Vide>Aucune classe.</Vide>
  const n = niveauProg(classe.niveau)
  if (!n) return <Vide>Pas d’activités pour ce niveau.</Vide>
  const liste = activitesDeClasse(classe, d.creneaux, d.reglages)
  const prochain = liste.findIndex((x) => x.date >= aujourdhui())
  const i = choix ?? Math.max(0, prochain)
  const cours = liste[i]
  const lyc = n === '1re' || n === 'Tle'
  const r = rituelDuJour(n, cours?.date ?? aujourdhui(), classe.id)

  const ecran = cours && (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold uppercase tracking-wide text-azulejo">{cours.activite.type} · {cours.activite.duree} min</p>
      <h2 className="titre text-4xl font-semibold" lang="es">{cours.activite.titre}</h2>
      <div className="flex flex-col gap-2 text-2xl leading-snug" lang="es">{cours.activite.e.map((l) => <p key={l}>{l}</p>)}</div>
      {solution && cours.activite.s && (
        <div className="rounded-xl border-l-8 border-[#E9A500] bg-[#FFF7DF] p-4 text-xl text-[#2B2B2B]" lang="es">{cours.activite.s.map((l) => <p key={l}>{l}</p>)}</div>
      )}
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-semibold">Rituales <span className="text-xl font-normal text-muted">· activités d’entrée à projeter</span></h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {d.classes.map((c) => (
          <button key={c.id} onClick={() => { setChoix(null); setSolution(false); aller('rituales', c.id) }} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${c.id === classe.id ? 'text-white' : 'bg-surface'}`} style={{ borderColor: c.couleur, background: c.id === classe.id ? c.couleur : undefined }}>{c.nom}</button>
        ))}
      </div>

      {!liste.length ? <div className="mt-4"><Vide>Pas de cours pour cette classe dans l’emploi du temps.</Vide></div> : (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <section className="carte p-5">
              <p className="mb-3 text-sm text-muted">
                Cours n° {cours.numero} · <b className="text-ink first-letter:uppercase">{formatLong(cours.date)}</b> à {cours.creneau.debut}
                {i === prochain && <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-on-primary">prochain cours</span>}
              </p>
              <p className="mb-4 rounded-lg bg-surface-2/60 px-3 py-2 text-sm"><b>Consigne (pour moi) :</b> {cours.activite.consigne}</p>
              {ecran}
              <div className="no-print mt-5 flex flex-wrap gap-2">
                <button className="btn-primary" onClick={() => setProjection(true)}>▶ Projeter</button>
                {cours.activite.s && <button className="btn-ghost" onClick={() => setSolution(!solution)}>{solution ? '🙈 Cacher' : '👀 Révéler'} la solution</button>}
                <button className="btn-ghost px-3" disabled={i === 0} onClick={() => { setChoix(i - 1); setSolution(false) }}>‹ Précédente</button>
                <button className="btn-ghost px-3" disabled={i === liste.length - 1} onClick={() => { setChoix(i + 1); setSolution(false) }}>Suivante ›</button>
              </div>
            </section>
            {!lyc && (
              <section className="carte mt-4 p-4 text-sm">
                <h3 className="font-semibold">En plus, si le temps le permet</h3>
                {(n === '5e' || n === '4e') && <p className="mt-1" lang="es"><b>La fecha :</b> <span className="first-letter:uppercase">{fechaEs(cours.date)}</span></p>}
                <p className="mt-1" lang="es"><b>Refrán :</b> « {r.refran[0]} » <span className="text-muted">— {r.refran[1]}</span></p>
                <p className="mt-1" lang="es"><b>Trabalenguas :</b> {r.trabalenguas}</p>
              </section>
            )}
          </div>
          <aside className="carte h-fit p-4">
            <h3 className="font-semibold">Jusqu’aux vacances de Noël ({liste.length} cours)</h3>
            <ol className="mt-2 flex max-h-[70vh] flex-col gap-1 overflow-y-auto text-sm">
              {liste.map((x, k) => (
                <li key={`${x.date}-${x.creneau.id}`}>
                  <button onClick={() => { setChoix(k); setSolution(false) }}
                    className={`flex w-full gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-2 ${k === i ? 'bg-primary text-on-primary hover:bg-primary' : ''} ${x.date < aujourdhui() ? 'opacity-60' : ''}`}>
                    <span className="w-16 shrink-0 tabular-nums">{formatCourt(x.date)}</span>
                    <span className="min-w-0 flex-1 truncate" lang="es">{x.activite.titre}</span>
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}

      {projection && cours && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#fbf4e6] p-8 text-[#2b2b2b] md:p-14" onClick={() => setSolution(true)}>
          <div className="fixed right-4 top-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {cours.activite.s && <button className="rounded-full bg-white px-4 py-2 font-bold shadow" onClick={() => setSolution(!solution)}>{solution ? 'Cacher' : 'Solution'}</button>}
            <button className="rounded-full bg-[#1F3A5F] px-4 py-2 font-bold text-white" onClick={() => setProjection(false)}>✕ Fermer</button>
          </div>
          <div className="mx-auto max-w-5xl">{ecran}</div>
          <p className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-[#5e554c]">Clic : révéler la solution</p>
        </div>
      )}
    </div>
  )
}

// ——— VOLUMEN HORARIO
export function Volumes() {
  const d = useDonnees()
  if (!d) return null
  const auj = aujourdhui()
  const lignes = d.classes.map((c) => {
    const plan = planningClasse({ ...c, depart: undefined }, d.creneaux, d.reglages)
    const h = (o: (typeof plan)[number]) => minutesEntre(o.creneau.debut, o.creneau.fin) / 60
    const prevues = plan.reduce((t, o) => t + h(o), 0)
    const faites = plan.filter((o) => o.date < auj).reduce((t, o) => t + h(o), 0)
    const edt = d.creneaux.filter((x) => x.classeId === c.id).reduce((t, x) => t + minutesEntre(x.debut, x.fin) / 60 / (x.semaine === 'toutes' ? 1 : 2), 0)
    return { c, prevues, faites, edt }
  })
  const fmt = (x: number) => `${Math.floor(x)} h${Math.round((x % 1) * 60) ? ` ${String(Math.round((x % 1) * 60)).padStart(2, '0')}` : ''}`
  return (
    <div>
      <h1 className="text-3xl font-semibold">Volumen horario <span className="text-xl font-normal text-muted">· volumes horaires</span></h1>
      <section className="carte mt-4 p-4">
        <h2 className="font-semibold">Volumes officiels à respecter</h2>
        <ul className="mt-1 text-sm">{VOLUMES_OFFICIELS.map((v) => <li key={v.niveau}><b>{v.niveau} :</b> {v.volume} <span className="text-muted">— {v.note}</span></li>)}</ul>
      </section>
      <div className="carte mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-3">Classe</th><th className="p-3">Prévu / semaine</th><th className="p-3">Emploi du temps</th><th className="p-3">Fait / prévu sur l’année</th><th className="p-3 w-1/3">Avancement</th>
          </tr></thead>
          <tbody>
            {lignes.map(({ c, prevues, faites, edt }) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3"><span className="inline-flex items-center gap-2 font-bold"><span className="h-3 w-3 rounded-full" style={{ background: c.couleur }} />{c.nom}</span></td>
                <td className="p-3">{fmt(c.heuresHebdo)}</td>
                <td className={`p-3 ${Math.abs(edt - c.heuresHebdo) > 0.01 ? 'font-bold text-grenat' : ''}`}>{edt ? fmt(edt) : '—'}</td>
                <td className="p-3 tabular-nums">{fmt(faites)} / {fmt(prevues)}</td>
                <td className="p-3">
                  <div className="h-3 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full" style={{ width: `${prevues ? (faites / prevues) * 100 : 0}%`, background: c.couleur }} /></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">Calcul : cours de l’emploi du temps entre la rentrée ({d.reglages.rentree}) et la fin d’année, vacances (zone {d.reglages.zone}) et jours fériés exclus. En rouge : l’emploi du temps ne correspond pas au volume prévu.</p>
    </div>
  )
}

import { useState } from 'react'
import { minutesEntre, aujourdhui, fechaEs, formatLong } from '../lib/dates'
import { aller } from '../lib/hooks'
import { RESSOURCES } from '../data/ressources'
import { rituelDuJour, RITUELS } from '../data/rituels'
import { niveauProg } from '../data/programmations'
import { VOLUMES_OFFICIELS } from '../data/officiel'
import { planningClasse, progressionDuNiveau } from '../lib/progression'
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

// ——— RITUALES
export function Rituales({ classeId }: { classeId?: string }) {
  const d = useDonnees()
  const [date, setDate] = useState(aujourdhui())
  const [montrer, setMontrer] = useState(false)
  const [projection, setProjection] = useState(false)
  if (!d) return null
  const classe = d.classes.find((c) => c.id === classeId) ?? d.classes[0]
  if (!classe) return <Vide>Aucune classe.</Vide>
  const n = niveauProg(classe.niveau)
  if (!n) return <Vide>Pas de rituels pour ce niveau.</Vide>
  const r = rituelDuJour(n, date, classe.id)
  // Mot du jour : tiré du vocabulaire de la séquence en cours.
  const occ = planningClasse(classe, d.creneaux, d.reglages).find((o) => o.date >= date)
  const seq = (occ && progressionDuNiveau(n)[occ.index]?.seq) ?? progressionDuNiveau(n)[0].seq
  const mot = seq.lexique[[...date].reduce((h, c) => h + c.charCodeAt(0), 0) % seq.lexique.length]

  const contenu = (
    <div className="flex flex-col gap-4">
      <p className="titre text-3xl first-letter:uppercase" lang="es">{fechaEs(date)}</p>
      {r.rituels.filter((x) => x.titre !== 'La palabra del día').map((x) => (
        <div key={x.titre}>
          <h3 className="text-xl font-semibold">{x.titre}</h3>
          <p className="text-muted">{x.consigne}</p>
          <ul className="mt-1">{x.repliques.map((l) => <li key={l} lang="es">{l}</li>)}</ul>
        </div>
      ))}
      <div>
        <h3 className="text-xl font-semibold">La palabra del día</h3>
        <p className="text-2xl font-bold text-primary" lang="es">{mot[0]} <span className="text-base font-normal text-muted">{montrer && `= ${mot[1]}`}</span></p>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Traduce · {r.traductions.length} phrases</h3>
        <ol className="mt-1 list-decimal pl-6">
          {r.traductions.map(([fr, es]) => <li key={fr} className="py-1">{fr}{montrer && <b className="block text-primary" lang="es">→ {es}</b>}</li>)}
        </ol>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div><h3 className="font-semibold">Refrán del día</h3><p lang="es" className="italic">« {r.refran[0]} »</p>{montrer && <p className="text-sm text-muted">{r.refran[1]}</p>}</div>
        <div><h3 className="font-semibold">Trabalenguas</h3><p lang="es" className="italic">{r.trabalenguas}</p></div>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="text-3xl font-semibold">Rituales <span className="text-xl font-normal text-muted">· rituels d’entrée en classe</span></h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {d.classes.map((c) => (
          <button key={c.id} onClick={() => aller('rituales', c.id)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${c.id === classe.id ? 'text-white' : 'bg-surface'}`} style={{ borderColor: c.couleur, background: c.id === classe.id ? c.couleur : undefined }}>{c.nom}</button>
        ))}
      </div>
      <div className="no-print mt-3 flex flex-wrap items-center gap-2">
        <input type="date" className="champ w-auto" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Date" />
        <button className="btn-ghost" onClick={() => setMontrer(!montrer)}>{montrer ? '🙈 Cacher' : '👀 Montrer'} les réponses</button>
        <button className="btn-primary" onClick={() => setProjection(true)}>▶ Projeter</button>
        <span className="text-sm text-muted">Séquence en cours : « {seq.titre} » · le rituel change chaque jour.</span>
      </div>
      <section className="carte mt-4 p-5">{contenu}</section>
      <details className="carte mt-4 p-4">
        <summary className="cursor-pointer font-semibold">Tous les rituels du niveau {n}</summary>
        <ul className="mt-2 grid gap-3 md:grid-cols-2">{RITUELS[n].map((x) => <li key={x.titre}><b>{x.titre}</b> — {x.consigne}<ul className="text-sm text-muted">{x.repliques.map((l) => <li key={l}>{l}</li>)}</ul></li>)}</ul>
      </details>
      {projection && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#fbf4e6] p-10 text-[#2b2b2b] text-2xl" onClick={() => setProjection(false)}>
          <button className="fixed right-4 top-4 rounded-full bg-[#1F3A5F] px-4 py-2 text-base font-bold text-white">✕ Fermer</button>
          <div className="mx-auto max-w-5xl">{contenu}</div>
        </div>
      )}
      <p className="mt-2 text-xs text-muted">{formatLong(date)}</p>
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

import { useEffect, useState } from 'react'
import { all, del, delClasse, getReglages, put, saveReglages, uid } from '../db/db'
import { exporterTout, importerTout, telecharger } from '../db/backup'
import { sanitizeForPublic } from '../db/sanitize'
import { CECRL, NIVEAUX, type Alternance, type Classe, type Creneau, type JourSemaine, type Theme } from '../db/types'
import { JOURS, aujourdhui, minutesEntre } from '../lib/dates'
import { useQuery } from '../lib/hooks'
import { ajouterClassesInitiales } from '../data/classesInitiales'
import { PastilleClasse, Vide } from '../components/ui'

const ONGLETS = [
  ['classes', 'Mes classes'],
  ['edt', 'Emploi du temps'],
  ['general', 'Général & année scolaire'],
  ['sauvegarde', 'Sauvegarde'],
] as const

export default function VueReglages({ onglet = 'classes' }: { onglet?: string }) {
  return (
    <div>
      <h1 className="mt-2 text-3xl font-semibold">Ajustes <span className="text-xl font-normal text-muted">· paramètres</span></h1>
      <nav className="no-print mt-4 flex gap-1 overflow-x-auto border-b border-line" aria-label="Sections des réglages">
        {ONGLETS.map(([id, l]) => (
          <a key={id} href={`#/reglages/${id}`} aria-current={onglet === id ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 font-bold ${onglet === id ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
            {l}
          </a>
        ))}
      </nav>
      {onglet === 'edt' ? <Edt /> : onglet === 'general' ? <General /> : onglet === 'sauvegarde' ? <Sauvegarde /> : <Classes />}
    </div>
  )
}

// ——— Classes
const COULEURS = ['#C84B31', '#A11C3A', '#E9A500', '#D98A2B', '#1C6E8C', '#3E8E5E', '#7A4FA0', '#5E554C']

function Classes() {
  const data = useQuery(() => Promise.all([all<Classe>('classes'), all<Creneau>('creneaux')]), [])
  if (!data) return null
  const [classes, creneaux] = data
  const ajouter = () =>
    put<Classe>('classes', {
      id: uid(), nom: 'Nouvelle classe', niveau: '5e', option: 'LV2', effectif: 28, cecrlVise: 'A1',
      couleur: COULEURS[classes.length % COULEURS.length], heuresHebdo: 2.5,
    })
  return (
    <div className="mt-4">
      <p className="mb-3 text-sm text-muted">Les modifications sont enregistrées automatiquement.</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {classes.map((c) => {
          const minEdt = creneaux.filter((x) => x.classeId === c.id).reduce((t, x) => t + minutesEntre(x.debut, x.fin) / (x.semaine === 'toutes' ? 1 : 2), 0)
          return <CarteClasse key={c.id} c={c} heuresEdt={minEdt / 60} />
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={ajouter}>+ Ajouter une classe</button>
        <button className="btn-ghost" onClick={async () => { const n = await ajouterClassesInitiales(true); alert(n ? `${n} classe(s) ajoutée(s).` : 'Les 10 classes sont déjà là.') }}>
          Ajouter mes 10 classes 2026-2027 (manquantes)
        </button>
      </div>
    </div>
  )
}

function CarteClasse({ c, heuresEdt }: { c: Classe; heuresEdt: number }) {
  const [d, setD] = useState(c)
  useEffect(() => setD(c), [c])
  const sauver = (patch: Partial<Classe> = {}) => put('classes', { ...d, ...patch })
  const ecart = Math.abs(heuresEdt - d.heuresHebdo) > 0.01
  return (
    <div className="carte overflow-hidden">
      <div className="h-2" style={{ background: d.couleur }} />
      <div className="grid grid-cols-2 gap-3 p-4">
        <label className="col-span-2">
          <span className="label">Nom</span>
          <input className="champ font-bold" value={d.nom} onChange={(e) => setD({ ...d, nom: e.target.value })} onBlur={() => sauver()} />
        </label>
        <label>
          <span className="label">Niveau</span>
          <select className="champ" value={d.niveau} onChange={(e) => sauver({ niveau: e.target.value as Classe['niveau'] })}>
            {NIVEAUX.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Option</span>
          <input className="champ" list="options" value={d.option} onChange={(e) => setD({ ...d, option: e.target.value })} onBlur={() => sauver()} />
          <datalist id="options">{['LV1', 'LV2', 'LV3', 'LVA', 'LVB', 'LVC', 'LLCER', 'Section euro', 'Bilangue'].map((o) => <option key={o} value={o} />)}</datalist>
        </label>
        <label>
          <span className="label">Effectif</span>
          <input type="number" min={0} className="champ" value={d.effectif} onChange={(e) => setD({ ...d, effectif: Number(e.target.value) })} onBlur={() => sauver()} />
        </label>
        <label>
          <span className="label">CECRL visé</span>
          <select className="champ" value={d.cecrlVise} onChange={(e) => sauver({ cecrlVise: e.target.value as Classe['cecrlVise'] })}>
            {CECRL.map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Heures / semaine</span>
          <input type="number" min={0} step={0.5} className="champ" value={d.heuresHebdo} onChange={(e) => setD({ ...d, heuresHebdo: Number(e.target.value) })} onBlur={() => sauver()} />
        </label>
        <div>
          <span className="label">Couleur</span>
          <div className="flex flex-wrap gap-1.5">
            {COULEURS.map((col) => (
              <button key={col} type="button" onClick={() => sauver({ couleur: col })} aria-label={`Couleur ${col}`} aria-pressed={d.couleur === col}
                className={`h-7 w-7 rounded-full ${d.couleur === col ? 'ring-2 ring-ink ring-offset-2 ring-offset-surface' : ''}`} style={{ background: col }} />
            ))}
          </div>
        </div>
        <p className={`col-span-2 text-sm ${ecart ? 'font-bold text-grenat' : 'text-muted'}`}>
          Emploi du temps : {heuresEdt.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} h/semaine
          {ecart && ` — différent des ${d.heuresHebdo} h déclarées`}
        </p>
        <div className="col-span-2 flex justify-end">
          <button className="text-sm font-bold text-grenat hover:underline"
            onClick={() => confirm(`Supprimer « ${d.nom} » ainsi que ses créneaux, séances, devoirs et élèves ?`) && delClasse(d.id)}>
            Supprimer la classe
          </button>
        </div>
      </div>
    </div>
  )
}

// ——— Emploi du temps
function Edt() {
  const data = useQuery(() => Promise.all([all<Classe>('classes'), all<Creneau>('creneaux'), getReglages()]), [])
  const [f, setF] = useState({ classeId: '', jour: 1 as JourSemaine, debut: '08:00', fin: '08:55', salle: '', semaine: 'toutes' as Alternance })
  if (!data) return null
  const [classes, creneaux, r] = data
  if (!classes.length) return <div className="mt-4"><Vide>Crée d’abord tes classes dans l’onglet « Mes classes ».</Vide></div>
  const classe = (id: string) => classes.find((c) => c.id === id)

  async function ajouter(e: React.FormEvent) {
    e.preventDefault()
    if (f.fin <= f.debut) return alert('L’heure de fin doit être après l’heure de début.')
    await put<Creneau>('creneaux', { id: uid(), ...f, classeId: f.classeId || classes[0].id })
  }

  return (
    <div className="mt-4">
      <form onSubmit={ajouter} className="carte grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-7 lg:items-end">
        <label className="sm:col-span-3 lg:col-span-2">
          <span className="label">Classe</span>
          <select className="champ" value={f.classeId || classes[0].id} onChange={(e) => setF({ ...f, classeId: e.target.value })}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Jour</span>
          <select className="champ" value={f.jour} onChange={(e) => setF({ ...f, jour: Number(e.target.value) as JourSemaine })}>
            {Object.entries(JOURS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label><span className="label">Début</span><input type="time" className="champ" value={f.debut} onChange={(e) => setF({ ...f, debut: e.target.value })} /></label>
        <label><span className="label">Fin</span><input type="time" className="champ" value={f.fin} onChange={(e) => setF({ ...f, fin: e.target.value })} /></label>
        <label><span className="label">Salle</span><input className="champ" value={f.salle} onChange={(e) => setF({ ...f, salle: e.target.value })} placeholder="B12" /></label>
        <label>
          <span className="label">Semaine</span>
          <select className="champ" value={f.semaine} onChange={(e) => setF({ ...f, semaine: e.target.value as Alternance })}>
            <option value="toutes">Toutes</option><option value="A">A</option><option value="B">B</option>
          </select>
        </label>
        <button className="btn-primary sm:col-span-3 lg:col-span-7">+ Ajouter le créneau</button>
      </form>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {r.joursTravailles.map((j) => {
          const liste = creneaux.filter((c) => c.jour === j).sort((a, b) => a.debut.localeCompare(b.debut))
          return (
            <section key={j} className="carte p-3">
              <h3 className="mb-2 font-semibold">{JOURS[j]}</h3>
              {liste.length ? (
                <ul className="flex flex-col gap-1.5">
                  {liste.map((c) => (
                    <li key={c.id} className="flex items-center gap-2 text-sm">
                      <span className="w-24 font-bold tabular-nums">{c.debut}–{c.fin}</span>
                      <span className="min-w-0 flex-1 truncate"><PastilleClasse classe={classe(c.classeId)} /></span>
                      {c.salle && <span className="text-muted">{c.salle}</span>}
                      {c.semaine !== 'toutes' && <span className="rounded bg-azulejo px-1 text-xs font-bold text-white dark:text-bg">S{c.semaine}</span>}
                      <button className="text-muted hover:text-grenat" onClick={() => del('creneaux', c.id)} aria-label="Supprimer le créneau">✕</button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">—</p>}
            </section>
          )
        })}
      </div>
      {r.lundiSemaineA === '' && creneaux.some((c) => c.semaine !== 'toutes') && (
        <p className="mt-3 text-sm font-bold text-grenat">Tu as des créneaux en semaine A/B : indique un lundi de semaine A dans « Général ».</p>
      )}
    </div>
  )
}

// ——— Général
function General() {
  const r = useQuery(getReglages, [])
  if (!r) return null

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="carte p-4">
        <h2 className="mb-3 text-lg font-semibold">Apparence</h2>
        <div className="flex gap-2" role="radiogroup" aria-label="Thème">
          {([['systeme', 'Automatique'], ['clair', 'Clair'], ['sombre', 'Sombre']] as [Theme, string][]).map(([t, l]) => (
            <button key={t} role="radio" aria-checked={r.theme === t} onClick={() => saveReglages({ theme: t })}
              className={r.theme === t ? 'btn-primary' : 'btn-ghost'}>{l}</button>
          ))}
        </div>
      </section>

      <section className="carte p-4">
        <h2 className="mb-3 text-lg font-semibold">Semaine de travail</h2>
        <span className="label">Jours travaillés</span>
        <div className="flex flex-wrap gap-3">
          {(Object.keys(JOURS).map(Number) as JourSemaine[]).map((j) => (
            <label key={j} className="flex items-center gap-1.5">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={r.joursTravailles.includes(j)}
                onChange={(e) => saveReglages({ joursTravailles: (e.target.checked ? [...r.joursTravailles, j] : r.joursTravailles.filter((x) => x !== j)).sort() })} />
              {JOURS[j]}
            </label>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="label">Un lundi de semaine A (alternance A/B — laisser vide si pas d’alternance)</span>
          <input type="date" className="champ w-auto" value={r.lundiSemaineA} onChange={(e) => saveReglages({ lundiSemaineA: e.target.value })} />
        </label>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <label><span className="label">Zone de vacances</span>
            <select className="champ" value={r.zone} onChange={(e) => saveReglages({ zone: e.target.value as 'A' | 'B' | 'C' })}>
              <option value="A">Zone A</option><option value="B">Zone B</option><option value="C">Zone C</option>
            </select>
          </label>
          <label><span className="label">Rentrée</span><input type="date" className="champ" value={r.rentree} onChange={(e) => e.target.value && saveReglages({ rentree: e.target.value })} /></label>
          <label><span className="label">Fin d’année</span><input type="date" className="champ" value={r.finAnnee} onChange={(e) => e.target.value && saveReglages({ finAnnee: e.target.value })} /></label>
        </div>
        <p className="mt-1 text-xs text-muted">Zone A : Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers · Zone C : Créteil, Montpellier, Paris, Toulouse, Versailles · Zone B : les autres académies de métropole.</p>
        <span className="label mt-3">Heures affichées dans l’agenda</span>
        <div className="flex items-center gap-2">
          <input type="time" step={3600} className="champ w-auto" value={r.heureDebutAgenda} onChange={(e) => e.target.value && saveReglages({ heureDebutAgenda: e.target.value.slice(0, 2) + ':00' })} aria-label="De" />
          <span>à</span>
          <input type="time" step={3600} className="champ w-auto" value={r.heureFinAgenda} onChange={(e) => e.target.value && saveReglages({ heureFinAgenda: e.target.value.slice(0, 2) + ':00' })} aria-label="À" />
        </div>
      </section>

    </div>
  )
}

// ——— Sauvegarde
function Sauvegarde() {
  const [msg, setMsg] = useState('')
  const persiste = useQuery(async () => (navigator.storage?.persisted ? navigator.storage.persisted() : false), [])
  const json = (o: unknown) => new Blob([JSON.stringify(o, null, 2)], { type: 'application/json' })

  async function importer(f: File | undefined) {
    if (!f) return
    if (!confirm('La restauration REMPLACE toutes les données actuelles de l’appli. Continuer ?')) return
    try {
      await importerTout(JSON.parse(await f.text()))
    } catch (e) {
      setMsg(`Échec : ${(e as Error).message}`)
    }
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="carte p-4">
        <h2 className="mb-1 text-lg font-semibold">Sauvegarde complète</h2>
        <p className="mb-3 text-sm text-muted">
          Tout est stocké dans ce navigateur, sur cet appareil. Fais une sauvegarde régulièrement (une fois par semaine) et range-la
          dans un endroit privé. <strong>Elle contient les données de tes élèves.</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={async () => telecharger(`cuaderno-sauvegarde-${aujourdhui()}.json`, json(await exporterTout()))}>
            ⬇ Télécharger la sauvegarde
          </button>
          <label className="btn-ghost cursor-pointer">
            ⬆ Restaurer…
            <input type="file" accept="application/json,.json" className="sr-only" onChange={(e) => importer(e.target.files?.[0])} />
          </label>
        </div>
        {msg && <p className="mt-2 text-sm font-bold text-grenat" role="alert">{msg}</p>}
        <p className="mt-3 text-sm text-muted">
          Stockage protégé contre l’effacement automatique : <strong>{persiste === undefined ? '…' : persiste ? 'oui' : 'non garanti'}</strong>
        </p>
      </section>

      <section className="carte p-4">
        <h2 className="mb-1 text-lg font-semibold">Journal public (synchro lecture seule)</h2>
        <p className="mb-3 text-sm text-muted">
          Génère un <code>journal.json</code> sans aucune donnée d’élève, sans bilans, sans rappels ni réglages. À utiliser plus tard pour la synchro.
        </p>
        <button className="btn-ghost" onClick={async () => telecharger('journal.json', json(sanitizeForPublic(await exporterTout())))}>
          ⬇ Générer journal.json
        </button>
      </section>
    </div>
  )
}

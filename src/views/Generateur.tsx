import { useState } from 'react'
import { all, getReglages, put } from '../db/db'
import { nouvelleSeance, normaliserSequence, poserSeance, toutesSeances } from '../db/modeles'
import { ACTIVITES, CECRL, type Activite, type Cecrl, type Classe, type Creneau, type Sequence } from '../db/types'
import { aller, useQuery } from '../lib/hooks'
import { genererSeance, POINTS_LANGUE, type ParamsGenerateur } from '../lib/generateur'
import { NATURES_SUPPORT, PROGRAMMES } from '../lib/programmes'

export default function Generateur({ sequenceId }: { sequenceId?: string }) {
  const data = useQuery(async () => {
    const [classes, sequences] = await Promise.all([all<Classe>('classes'), all<Sequence>('sequences')])
    return { classes: classes.filter((c) => !c.archivee), sequences: sequences.map(normaliserSequence) }
  }, [])
  const [p, setP] = useState<ParamsGenerateur>({
    titre: '', theme: '', programme: '', activite: 'CO', secondaires: [], point: 'aucun', lexique: '',
    docNature: '', docTitre: '', docSource: '', cecrlDe: 'A1', cecrlVers: 'A1', duree: 55,
  })
  const [cible, setCible] = useState({ classeId: '', sequenceId: sequenceId ?? '', date: '' })
  const [init, setInit] = useState(false)
  if (!data) return null
  const { classes, sequences } = data

  // Pré-remplissage depuis la séquence / la classe.
  if (!init) {
    const q = sequences.find((x) => x.id === sequenceId)
    const c = classes.find((x) => x.id === q?.classeIds[0]) ?? classes[0]
    if (c || q) {
      setCible((t) => ({ ...t, classeId: c?.id ?? '' }))
      setP((x) => ({ ...x, programme: q?.programme ?? '', cecrlDe: c?.cecrlVise ?? q?.cecrlVise ?? 'A1', cecrlVers: q?.cecrlVise ?? c?.cecrlVise ?? 'A1' }))
    }
    setInit(true)
  }

  const champ = (k: keyof ParamsGenerateur) => ({ value: p[k] as string, onChange: (e: { target: { value: string } }) => setP({ ...p, [k]: e.target.value }) })

  async function generer(e: React.FormEvent) {
    e.preventDefault()
    const classe = classes.find((c) => c.id === cible.classeId)
    if (!classe) return alert('Choisis d’abord une classe (Réglages › Mes classes).')
    const seances = await toutesSeances()
    const dansSeq = seances.filter((s) => s.sequenceId && s.sequenceId === cible.sequenceId).length
    let s = { ...nouvelleSeance(classe, null), ...genererSeance(p), sequenceId: cible.sequenceId || null, ordre: dansSeq }
    if (cible.date) {
      const [creneaux, r] = await Promise.all([all<Creneau>('creneaux'), getReglages()])
      s = await poserSeance(s, classe.id, cible.date, creneaux, r, seances)
    } else await put('seances', s)
    aller('seance', s.id)
  }

  return (
    <div>
      <h1 className="mt-2 text-3xl font-semibold">✨ Générateur de séance</h1>
      <p className="mt-1 max-w-3xl text-muted">
        Je remplis quelques champs, l’appli construit une trame complète à la première personne : déroulement avec mes répliques,
        objectifs, différenciation, obstacles, correction, fiche d’exercices (avec exemple résolu) et diaporama. Je relis ensuite et je complète les <b>[crochets]</b>.
      </p>

      <form onSubmit={generer} className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="carte p-4">
          <h2 className="mb-3 text-lg font-semibold">1. La séance</h2>
          <Ch label="Titre de la séance"><input className="champ" required placeholder="Ex. ¿Quién es Frida Kahlo?" {...champ('titre')} /></Ch>
          <Ch label="De quoi parle-t-elle ? (thème culturel)"><input className="champ" placeholder="Ex. Frida Kahlo et l’autoportrait" {...champ('theme')} /></Ch>
          <Ch label="Référence programme">
            <input className="champ" list="prog-gen" placeholder="Ex. Rencontres avec d’autres cultures" {...champ('programme')} />
            <datalist id="prog-gen">{PROGRAMMES.flatMap((g) => g.items.map((i) => <option key={g.groupe + i} value={i}>{g.groupe}</option>))}</datalist>
          </Ch>
          <div className="grid grid-cols-3 gap-2">
            <Ch label="CECRL de"><select className="champ" value={p.cecrlDe} onChange={(e) => setP({ ...p, cecrlDe: e.target.value as Cecrl })}>{CECRL.map((c) => <option key={c}>{c}</option>)}</select></Ch>
            <Ch label="vers"><select className="champ" value={p.cecrlVers} onChange={(e) => setP({ ...p, cecrlVers: e.target.value as Cecrl })}>{CECRL.map((c) => <option key={c}>{c}</option>)}</select></Ch>
            <Ch label="Durée (min)"><input type="number" min={20} step={5} className="champ" value={p.duree} onChange={(e) => setP({ ...p, duree: Number(e.target.value) })} /></Ch>
          </div>
        </section>

        <section className="carte p-4">
          <h2 className="mb-3 text-lg font-semibold">2. Activités & langue</h2>
          <span className="label">Activité langagière dominante</span>
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(ACTIVITES) as Activite[]).map((a) => (
              <button key={a} type="button" aria-pressed={p.activite === a} onClick={() => setP({ ...p, activite: a, secondaires: p.secondaires.filter((x) => x !== a) })}
                className={`rounded-full border px-3 py-1 text-sm font-bold ${p.activite === a ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface'}`} title={ACTIVITES[a]}>
                {a}
              </button>
            ))}
          </div>
          <span className="label">Activités secondaires</span>
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(ACTIVITES) as Activite[]).filter((a) => a !== p.activite).map((a) => {
              const on = p.secondaires.includes(a)
              return (
                <button key={a} type="button" aria-pressed={on} onClick={() => setP({ ...p, secondaires: on ? p.secondaires.filter((x) => x !== a) : [...p.secondaires, a] })}
                  className={`rounded-full border px-3 py-1 text-sm font-bold ${on ? 'border-azulejo bg-azulejo text-white dark:text-bg' : 'border-line bg-surface'}`} title={ACTIVITES[a]}>
                  {a}
                </button>
              )
            })}
          </div>
          <Ch label="Point de grammaire">
            <select className="champ" value={p.point} onChange={(e) => setP({ ...p, point: e.target.value })}>
              {Object.entries(POINTS_LANGUE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </Ch>
          <Ch label="Vocabulaire (mots séparés par des virgules)"><textarea rows={2} className="champ" placeholder="el autorretrato, la ceja, el collar, el dolor" {...champ('lexique')} /></Ch>
        </section>

        <section className="carte p-4">
          <h2 className="mb-3 text-lg font-semibold">3. Document support</h2>
          <Ch label="Nature">
            <input className="champ" list="nat-gen" placeholder="Œuvre d’art (peinture)" {...champ('docNature')} />
            <datalist id="nat-gen">{NATURES_SUPPORT.map((n) => <option key={n} value={n} />)}</datalist>
          </Ch>
          <Ch label="Titre"><input className="champ" placeholder="Las dos Fridas (1939)" {...champ('docTitre')} /></Ch>
          <Ch label="Auteur / source"><input className="champ" placeholder="Frida Kahlo" {...champ('docSource')} /></Ch>
        </section>

        <section className="carte p-4">
          <h2 className="mb-3 text-lg font-semibold">4. Où la ranger ?</h2>
          <Ch label="Classe">
            <select className="champ" value={cible.classeId} onChange={(e) => setCible({ ...cible, classeId: e.target.value })}>
              {!classes.length && <option value="">Aucune classe</option>}
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </Ch>
          <Ch label="Séquence (facultatif)">
            <select className="champ" value={cible.sequenceId} onChange={(e) => setCible({ ...cible, sequenceId: e.target.value })}>
              <option value="">— Aucune —</option>
              {sequences.map((q) => <option key={q.id} value={q.id}>{q.titre || 'Séquence sans titre'}</option>)}
            </select>
          </Ch>
          <Ch label="Date (facultatif — sinon elle reste dans la bibliothèque)">
            <input type="date" className="champ" value={cible.date} onChange={(e) => setCible({ ...cible, date: e.target.value })} />
          </Ch>
          <button className="btn-primary mt-2 w-full text-lg">✨ Générer la séance</button>
        </section>
      </form>
    </div>
  )
}

function Ch({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

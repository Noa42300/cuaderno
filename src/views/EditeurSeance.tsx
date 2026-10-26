import { useEffect, useRef, useState, type ReactNode } from 'react'
import { all, delSeance, get, put, uid } from '../db/db'
import { ACTIVITES, CECRL, type Activite, type Classe, type Etape, type Seance } from '../db/types'
import { aujourdhui, formatLong } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { NATURES_SUPPORT, PROGRAMMES, problemeVideo } from '../lib/programmes'
import { BadgeAL } from '../components/ui'

type Etat = 'charge' | 'enregistre' | 'modifie'

export default function EditeurSeance({ id }: { id?: string }) {
  const classes = useQuery(() => all<Classe>('classes'), [])
  const [s, setS] = useState<Seance | null | undefined>()
  const [etat, setEtat] = useState<Etat>('charge')
  const premier = useRef(true)

  useEffect(() => {
    premier.current = true
    if (id) get<Seance>('seances', id).then((x) => setS(x ?? null))
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

  if (s === undefined || !classes) return null
  if (s === null) return <p className="mt-6">Séance introuvable. <a className="text-primary underline" href="#/jour">Retour</a></p>

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
    if (!confirm('Supprimer définitivement cette séance (et ses devoirs) ?')) return
    await delSeance(s!.id)
    aller('jour', s!.date ?? aujourdhui())
  }

  return (
    <div>
      <div className="no-print sticky top-0 z-10 -mx-4 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <a href={`#/jour/${s.date ?? aujourdhui()}`} className="font-bold text-azulejo hover:underline">‹ Retour au jour</a>
        <span className="text-sm text-muted" aria-live="polite">
          {etat === 'modifie' ? 'Enregistrement…' : etat === 'enregistre' ? '✓ Enregistré' : ''}
        </span>
      </div>

      <header className="mt-4">
        <p className="text-sm font-bold uppercase tracking-wide text-azulejo">
          {classe?.nom ?? 'Classe ?'} · {s.date ? formatLong(s.date) : 'bibliothèque'}
        </p>
        <input className="titre mt-1 w-full border-b-2 border-dashed border-line bg-transparent text-3xl font-semibold outline-none focus:border-primary"
          placeholder="Titre de la séance (ex. ¿Quién es Frida?)" {...champ('titre')} aria-label="Titre de la séance" />
      </header>

      <Bloc titre="Cadre">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Champ label="Classe">
            <select className="champ" value={s.classeId} onChange={(e) => maj({ classeId: e.target.value })}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </Champ>
          <Champ label="Date">
            <input type="date" className="champ" value={s.date ?? ''} onChange={(e) => maj({ date: e.target.value || null })} />
          </Champ>
          <Champ label="Durée (min)">
            <input type="number" min={5} step={5} className="champ" value={s.dureeMin} onChange={(e) => maj({ dureeMin: Number(e.target.value) })} />
          </Champ>
          <Champ label="Statut">
            <select className="champ" value={s.statut} onChange={(e) => maj({ statut: e.target.value as Seance['statut'] })}>
              <option value="prevue">Prévue</option>
              <option value="faite">Faite</option>
              <option value="annulee">Annulée</option>
            </select>
          </Champ>
        </div>

        <fieldset className="mt-3">
          <legend className="label">Activités langagières travaillées</legend>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACTIVITES) as Activite[]).map((a) => {
              const on = s.activites.includes(a)
              return (
                <button key={a} type="button" aria-pressed={on}
                  onClick={() => maj({ activites: on ? s.activites.filter((x) => x !== a) : [...s.activites, a] })}
                  className={`rounded-full border px-3 py-1 text-sm font-bold ${on ? 'border-primary bg-primary text-on-primary' : 'border-line bg-surface text-ink'}`}>
                  {a} <span className="font-normal">· {ACTIVITES[a]}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-3 grid gap-3 sm:grid-cols-[auto_auto_1fr]">
          <Champ label="CECRL de">
            <select className="champ" value={s.cecrlDe} onChange={(e) => maj({ cecrlDe: e.target.value as Seance['cecrlDe'] })}>
              {CECRL.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Champ>
          <Champ label="vers">
            <select className="champ" value={s.cecrlVers} onChange={(e) => maj({ cecrlVers: e.target.value as Seance['cecrlVers'] })}>
              {CECRL.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Champ>
          <Champ label="Référence programme (thématique / axe)">
            <input className="champ" list="programmes" placeholder="Ex. Art et pouvoir" {...champ('programme')} />
            <datalist id="programmes">
              {PROGRAMMES.flatMap((g) => g.items.map((i) => <option key={g.groupe + i} value={i}>{g.groupe}</option>))}
            </datalist>
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Objectifs">
        <div className="grid gap-3 md:grid-cols-2">
          {([
            ['culturel', 'Culturel', 'Ex. Découvrir Frida Kahlo et l’autoportrait comme affirmation de soi'],
            ['lexical', 'Linguistique — lexique', 'Ex. Le corps, les vêtements, les couleurs'],
            ['grammatical', 'Linguistique — grammaire', 'Ex. ser / estar pour décrire'],
            ['phonologique', 'Linguistique — phonologie', 'Ex. La jota [x] et la r roulée'],
            ['pragmatique', 'Pragmatique', 'Ex. Donner son avis : creo que, me parece que…'],
          ] as const).map(([k, l, ph]) => (
            <Champ key={k} label={l}>
              <textarea rows={2} className="champ" placeholder={ph} value={s.objectifs[k]} onChange={(e) => maj({ objectifs: { ...s.objectifs, [k]: e.target.value } })} />
            </Champ>
          ))}
        </div>
      </Bloc>

      <Bloc titre="Document support & vidéo">
        <div className="grid gap-3 md:grid-cols-2">
          <Champ label="Titre du document">
            <input className="champ" placeholder="Ex. Las dos Fridas (1939)" value={s.support.titre} onChange={(e) => maj({ support: { ...s.support, titre: e.target.value } })} />
          </Champ>
          <Champ label="Nature">
            <input className="champ" list="natures" placeholder="Chanson, œuvre d’art, pub…" value={s.support.nature} onChange={(e) => maj({ support: { ...s.support, nature: e.target.value } })} />
            <datalist id="natures">{NATURES_SUPPORT.map((n) => <option key={n} value={n} />)}</datalist>
          </Champ>
          <Champ label="Auteur / source">
            <input className="champ" placeholder="Ex. Frida Kahlo, Museo de Arte Moderno (México)" value={s.support.source} onChange={(e) => maj({ support: { ...s.support, source: e.target.value } })} />
          </Champ>
          <Champ label="Lien du document">
            <input type="url" className="champ" placeholder="https://…" value={s.support.url} onChange={(e) => maj({ support: { ...s.support, url: e.target.value } })} />
          </Champ>
          <Champ label="Vidéo de la séance (UNE vidéo précise)" large>
            <div className="flex gap-2">
              <input type="url" className="champ" placeholder="https://www.youtube.com/watch?v=…" {...champ('videoUrl')} />
              {s.videoUrl && !pbVideo && <a className="btn-ghost shrink-0" href={s.videoUrl} target="_blank" rel="noreferrer">▶ Ouvrir</a>}
            </div>
            {pbVideo && <p className="mt-1 text-sm font-bold text-grenat">{pbVideo}</p>}
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Tâche & trace écrite">
        <div className="grid gap-3 md:grid-cols-2">
          <Champ label="Tâche">
            <textarea rows={3} className="champ" placeholder="Ex. Par deux, je présente un autoportrait de Frida à la classe (1 min)." {...champ('tache')} />
          </Champ>
          <Champ label="Trace écrite">
            <textarea rows={3} className="champ" placeholder="Ce que les élèves collent / recopient." {...champ('traceEcrite')} />
          </Champ>
        </div>
      </Bloc>

      <Bloc titre="Déroulement" note={
        <span className={dureeEtapes > s.dureeMin ? 'font-bold text-grenat' : 'text-muted'}>{dureeEtapes} / {s.dureeMin} min</span>
      }>
        <p className="mb-3 text-sm text-muted">À la première personne, avec mes répliques à l’oral. Ex. : « Je projette le tableau sans titre. — <i lang="es">¿Qué veis? ¿Quién es?</i> »</p>
        <ol className="flex flex-col gap-3">
          {s.deroulement.map((e, i) => (
            <li key={e.id} className="rounded-xl border border-line bg-surface-2/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-azulejo text-sm font-bold text-white dark:text-bg">{i + 1}</span>
                <input className="champ flex-1" placeholder="Étape (ex. Mise en route — la fecha)" value={e.titre} onChange={(x) => majEtape(i, { titre: x.target.value })} aria-label="Titre de l’étape" />
                <input type="number" min={0} className="champ w-20" value={e.duree} onChange={(x) => majEtape(i, { duree: Number(x.target.value) })} aria-label="Durée en minutes" />
                <span className="text-sm text-muted">min</span>
                <div className="flex gap-1">
                  {(Object.keys(ACTIVITES) as Activite[]).map((a) => (
                    <button key={a} type="button" aria-pressed={e.activites.includes(a)} title={ACTIVITES[a]}
                      onClick={() => majEtape(i, { activites: e.activites.includes(a) ? e.activites.filter((x) => x !== a) : [...e.activites, a] })}
                      className={e.activites.includes(a) ? '' : 'opacity-35'}>
                      <BadgeAL a={a} />
                    </button>
                  ))}
                </div>
                <div className="ml-auto flex gap-1">
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === 0} onClick={() => deplacer(i, -1)} aria-label="Monter">↑</button>
                  <button type="button" className="btn-ghost px-2 py-1" disabled={i === s.deroulement.length - 1} onClick={() => deplacer(i, 1)} aria-label="Descendre">↓</button>
                  <button type="button" className="btn-ghost px-2 py-1 text-grenat" onClick={() => maj({ deroulement: s.deroulement.filter((_, j) => j !== i) })} aria-label="Supprimer l’étape">✕</button>
                </div>
              </div>
              <textarea rows={5} className="champ mt-2" value={e.contenu} onChange={(x) => majEtape(i, { contenu: x.target.value })} aria-label="Contenu de l’étape"
                placeholder={'Je fais entrer les élèves et j’écris la date au tableau.\n— « Buenos días. ¿Qué día es hoy? »\n— « Muy bien, hoy es lunes… »'} />
            </li>
          ))}
        </ol>
        <button type="button" className="btn-ghost mt-3" onClick={() => maj({ deroulement: [...s.deroulement, { id: uid(), titre: '', duree: 10, activites: [], contenu: '' }] })}>+ Ajouter une étape</button>
      </Bloc>

      <Bloc titre="Différenciation">
        <p className="mb-2 text-sm text-muted">Jamais de prénom associé à un trouble ou un besoin particulier ici.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Champ label="Élèves fragiles"><textarea rows={3} className="champ" value={s.differenciation.fragiles} onChange={(e) => maj({ differenciation: { ...s.differenciation, fragiles: e.target.value } })} /></Champ>
          <Champ label="Élèves à l’aise"><textarea rows={3} className="champ" value={s.differenciation.aLaise} onChange={(e) => maj({ differenciation: { ...s.differenciation, aLaise: e.target.value } })} /></Champ>
        </div>
      </Bloc>

      <Bloc titre="Obstacles & remédiation">
        <textarea rows={4} className="champ" placeholder="Ex. Confusion ser/estar (« es cansada ») → je rappelle : estado = estar, je fais reformuler." {...champ('obstacles')} />
      </Bloc>

      <Bloc titre="Correction attendue">
        <textarea rows={4} className="champ" placeholder="Réponses attendues, production visée." {...champ('correction')} />
      </Bloc>

      <Bloc titre="Bilan (après la séance)">
        <textarea rows={3} className="champ" placeholder="Ce qui a marché, ce que je reprends la prochaine fois." {...champ('bilan')} />
      </Bloc>

      <div className="no-print mt-8 flex justify-end">
        <button className="btn-ghost text-grenat" onClick={supprimer}>Supprimer la séance</button>
      </div>
    </div>
  )
}

function Bloc({ titre, note, children }: { titre: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="carte mt-4 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{titre}</h2>
        {note}
      </div>
      {children}
    </section>
  )
}

function Champ({ label, large, children }: { label: string; large?: boolean; children: ReactNode }) {
  return (
    <label className={`block ${large ? 'md:col-span-2' : ''}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { all, byIndex, del, get, put, uid } from '../db/db'
import { telecharger } from '../db/backup'
import { normaliserSeance, normaliserSequence } from '../db/modeles'
import { ACTIVITES, type Classe, type Creneau, type Diapo as TDiapo, type PieceJointe, type Seance, type Sequence } from '../db/types'
import { fechaEs, formatLong } from '../lib/dates'
import { useQuery } from '../lib/hooks'
import { imprimer, nomFichier, pdfDiapos, pdfFeuille } from '../lib/pdf'

const ONGLETS = [
  ['prep', '📋 Fiche de préparation'],
  ['diaporama', '🖥️ Diaporama'],
  ['trace', '📝 Leçon / trace écrite'],
  ['exercices', '✏️ Fiche d’exercices'],
  ['corrige', '✅ Corrigé'],
  ['pj', '📎 Pièces jointes'],
] as const
type Onglet = (typeof ONGLETS)[number][0]

export default function Documents({ id }: { id?: string }) {
  const [onglet, setOnglet] = useState<Onglet>('prep')
  const data = useQuery(async () => {
    const s = await get<Seance>('seances', id ?? '')
    if (!s) return null
    const [classes, creneaux, seq, pjs] = await Promise.all([
      all<Classe>('classes'), all<Creneau>('creneaux'), s.sequenceId ? get<Sequence>('sequences', s.sequenceId) : undefined, byIndex<PieceJointe>('piecesJointes', 'seanceId', s.id),
    ])
    return { s: normaliserSeance(s), classe: classes.find((c) => c.id === s.classeId), creneau: creneaux.find((c) => c.id === s.creneauId), seq: seq && normaliserSequence(seq), pjs }
  }, [id])

  if (data === undefined) return null
  if (data === null) return <p className="mt-6">Séance introuvable. <a className="text-primary underline" href="#/agenda">Retour</a></p>
  const { s } = data

  return (
    <div>
      <div className="no-print sticky top-0 z-10 -mx-4 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
        <a href={`#/seance/${s.id}`} className="font-bold text-azulejo hover:underline">‹ Retour à la séance</a>
      </div>
      <h1 className="mt-4 text-3xl font-semibold">📄 Documents — {s.titre || 'Séance sans titre'}</h1>
      <nav className="no-print mt-3 flex gap-1 overflow-x-auto border-b border-line" aria-label="Documents">
        {ONGLETS.map(([k, l]) => (
          <button key={k} onClick={() => setOnglet(k)} aria-current={onglet === k ? 'page' : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 font-bold ${onglet === k ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>{l}</button>
        ))}
      </nav>
      <div className="mt-4">
        {onglet === 'prep' && <Feuille nom={`preparation-${nomFichier(s.titre)}`}><FichePrep {...data} /></Feuille>}
        {onglet === 'trace' && <Feuille nom={`lecon-${nomFichier(s.titre)}`} vide={!s.traceEcrite.trim() && 'La trace écrite est vide : remplis-la dans la séance (ou utilise le générateur).'}><TraceEcrite s={s} /></Feuille>}
        {onglet === 'exercices' && <Feuille nom={`exercices-${nomFichier(s.titre)}`} vide={!s.exercices.length && 'Aucun exercice : ajoute-les dans la séance, rubrique « Fiche d’exercices ».'}><FicheExercices s={s} /></Feuille>}
        {onglet === 'corrige' && <Feuille nom={`corrige-${nomFichier(s.titre)}`} vide={!s.exercices.length && 'Aucun exercice.'}><FicheExercices s={s} corrige /></Feuille>}
        {onglet === 'diaporama' && <Diaporama s={s} />}
        {onglet === 'pj' && <PiecesJointes s={s} pjs={data.pjs} />}
      </div>
    </div>
  )
}

// ——— Cadre commun : barre d'actions + aperçu + plein écran
function Feuille({ nom, vide, children }: { nom: string; vide?: string | false; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [plein, setPlein] = useState(false)
  const [occupe, setOccupe] = useState(false)
  if (vide) return <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">{vide}</p>

  async function pdf() {
    setOccupe(true)
    try {
      await pdfFeuille(ref.current!, `${nom}.pdf`)
    } catch (e) {
      alert(`Le PDF n’a pas pu être créé (${(e as Error).message}). Utilise « Imprimer » puis « Enregistrer en PDF ».`)
    } finally {
      setOccupe(false)
    }
  }

  return (
    <div>
      <Actions>
        <button className="btn-primary" onClick={pdf} disabled={occupe}>{occupe ? 'Création du PDF…' : '⬇ Télécharger le PDF'}</button>
        <button className="btn-ghost" onClick={() => imprimer(ref.current!)}>🖨 Imprimer</button>
        <button className="btn-ghost" onClick={() => setPlein(true)}>⛶ Plein écran</button>
      </Actions>
      <div className="overflow-x-auto rounded-xl bg-surface-2 p-3 md:p-6">
        <div ref={ref} className="feuille mx-auto shadow-lg">{children}</div>
      </div>
      {plein && (
        <div className="fixed inset-0 z-50 overflow-auto bg-white" onClick={() => setPlein(false)}>
          <button className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full bg-[#2B2B2B] px-4 py-2 font-bold text-white">✕ Fermer</button>
          <div className="feuille mx-auto" style={{ zoom: Math.min(window.innerWidth / 794, 1.6) }}>{children}</div>
        </div>
      )}
    </div>
  )
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="no-print mb-3 flex flex-wrap gap-2">{children}</div>
}

const Lignes = ({ texte }: { texte: string }) => <>{texte.split('\n').map((l, i) => <p key={i} style={{ margin: '0 0 3px' }}>{l || ' '}</p>)}</>

// ——— Fiche de préparation (pour moi)
function FichePrep({ s, classe, creneau, seq }: { s: Seance; classe?: Classe; creneau?: Creneau; seq?: Sequence }) {
  const ligne = (k: string, v: ReactNode) => v ? <tr><th style={{ textAlign: 'left', padding: '3px 8px 3px 0', color: '#5E554C', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{k}</th><td style={{ padding: '3px 0' }}>{v}</td></tr> : null
  const rubrique = (titre: string, contenu: string) => contenu.trim() ? (
    <section data-bloc style={{ marginTop: 12 }}>
      <h3 style={{ fontSize: '12.5pt', borderBottom: '2px solid #1C6E8C', paddingBottom: 2, marginBottom: 4 }}>{titre}</h3>
      <Lignes texte={contenu} />
    </section>
  ) : null
  const o = s.objectifs
  return (
    <div>
      <div className="frise-doc" />
      <div data-bloc style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 10 }}>
        <span style={{ fontWeight: 700, color: '#1C6E8C', textTransform: 'uppercase', fontSize: '9pt', letterSpacing: 1 }}>Fiche de préparation</span>
        <span style={{ fontSize: '9pt', color: '#5E554C' }}>{s.date ? formatLong(s.date) : 'Non datée'}{creneau && ` · ${creneau.debut}–${creneau.fin}${creneau.salle ? ` · salle ${creneau.salle}` : ''}`}</span>
      </div>
      <h1 data-bloc style={{ fontSize: '22pt', margin: '4px 0 8px' }}>{s.titre || 'Séance sans titre'}</h1>
      <table data-bloc style={{ fontSize: '10pt', borderCollapse: 'collapse' }}>
        <tbody>
          {ligne('Classe', classe ? `${classe.nom} (${classe.niveau} ${classe.option}, ${classe.effectif} élèves)` : '')}
          {ligne('Séquence', seq?.titre)}
          {ligne('Durée', `${s.dureeMin} min`)}
          {ligne('CECRL', s.cecrlDe === s.cecrlVers ? s.cecrlDe : `${s.cecrlDe} → ${s.cecrlVers}`)}
          {ligne('Activités', s.activites.map((a) => `${a} (${ACTIVITES[a]})`).join(' · '))}
          {ligne('Programme', s.programme)}
          {ligne('Support', [s.support.nature, s.support.titre, s.support.source].filter(Boolean).join(' — '))}
          {ligne('Vidéo', s.videoUrl)}
        </tbody>
      </table>
      <section data-bloc style={{ marginTop: 12, background: '#FBF4E6', borderRadius: 8, padding: '8px 12px' }}>
        <h3 style={{ fontSize: '12.5pt', marginBottom: 4 }}>Objectifs</h3>
        {o.culturel && <p><b>Culturel :</b> {o.culturel}</p>}
        {o.lexical && <p><b>Lexique :</b> {o.lexical}</p>}
        {o.grammatical && <p><b>Grammaire :</b> {o.grammatical}</p>}
        {o.phonologique && <p><b>Phonologie :</b> {o.phonologique}</p>}
        {o.pragmatique && <p><b>Pragmatique :</b> {o.pragmatique}</p>}
      </section>
      {rubrique('Tâche', s.tache)}
      {s.deroulement.length > 0 && (
        <section style={{ marginTop: 12 }}>
          <h3 data-bloc style={{ fontSize: '12.5pt', borderBottom: '2px solid #1C6E8C', paddingBottom: 2, marginBottom: 4 }}>Déroulement</h3>
          {s.deroulement.map((e, i) => (
            <div key={e.id} data-bloc style={{ display: 'grid', gridTemplateColumns: '18mm 1fr', gap: 8, padding: '6px 0', borderBottom: '1px solid #E6D8BE' }}>
              <div style={{ fontWeight: 700, color: '#1F3A5F' }}>{e.duree} min<div style={{ fontSize: '8.5pt', color: '#5E554C', fontWeight: 400 }}>{e.activites.join(' ')}</div></div>
              <div><b>{i + 1}. {e.titre}</b><Lignes texte={e.contenu} /></div>
            </div>
          ))}
        </section>
      )}
      {(s.differenciation.fragiles || s.differenciation.aLaise) && (
        <section data-bloc style={{ marginTop: 12 }}>
          <h3 style={{ fontSize: '12.5pt', borderBottom: '2px solid #1C6E8C', paddingBottom: 2, marginBottom: 4 }}>Différenciation</h3>
          {s.differenciation.fragiles && <p><b>Élèves fragiles :</b> {s.differenciation.fragiles}</p>}
          {s.differenciation.aLaise && <p><b>Élèves à l’aise :</b> {s.differenciation.aLaise}</p>}
        </section>
      )}
      {rubrique('Obstacles & remédiation', s.obstacles)}
      {rubrique('Correction attendue', s.correction)}
      {rubrique('Trace écrite', s.traceEcrite)}
    </div>
  )
}

// ——— En-tête élève
function EnteteEleve({ titre, s }: { titre: string; s: Seance }) {
  return (
    <div data-bloc>
      <div className="frise-doc" />
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '10pt' }}>
        <span>Nombre : ______________________</span>
        <span>Clase : ________</span>
        <span style={{ marginLeft: 'auto' }}>{s.date ? <span style={{ textTransform: 'capitalize' }}>{fechaEs(s.date)}</span> : 'Fecha : ____________'}</span>
      </div>
      <h1 style={{ fontSize: '22pt', margin: '10px 0 2px' }}>{s.titre || titre}</h1>
      <p style={{ fontSize: '10pt', color: '#5E554C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{titre}</p>
    </div>
  )
}

// ——— Leçon / trace écrite (à coller)
function TraceEcrite({ s }: { s: Seance }) {
  const lignes = s.traceEcrite.split('\n')
  // Les blocs séparés par une ligne vide deviennent des encadrés.
  const blocs: string[][] = [[]]
  for (const l of lignes) l.trim() ? blocs[blocs.length - 1].push(l) : blocs[blocs.length - 1].length && blocs.push([])
  const couleurs = ['#1C6E8C', '#1F3A5F', '#A11C3A', '#D98A2B']
  return (
    <div>
      <EnteteEleve titre="Lección" s={s} />
      {blocs.filter((b) => b.length).map((b, i) => {
        const vocab = b.find((l) => /^vocabulario\s*:/i.test(l))
        return (
          <section key={i} data-bloc style={{ marginTop: 14, border: `2px solid ${couleurs[i % 4]}`, borderRadius: 12, padding: '10px 14px', position: 'relative' }}>
            <span style={{ position: 'absolute', top: -11, left: 12, background: '#fff', padding: '0 6px', color: couleurs[i % 4], fontWeight: 700, fontFamily: 'var(--font-titre)', fontSize: '12pt' }}>
              {i === 0 ? '📖 Lo que hemos visto' : b[0]}
            </span>
            {(i === 0 ? b : b.slice(1)).filter((l) => l !== vocab).map((l, j) => <p key={j} style={{ margin: '4px 0', fontSize: '12pt' }}>{l}</p>)}
            {vocab && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {vocab.replace(/^vocabulario\s*:\s*/i, '').split(/[·,]/).map((m) => m.trim()).filter(Boolean).map((m) => (
                  <span key={m} style={{ background: '#FBF4E6', border: '1px solid #E6D8BE', borderRadius: 999, padding: '2px 10px', fontWeight: 700 }}>{m}</span>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// ——— Fiche d'exercices (exemple résolu en tête de chaque exercice)
function FicheExercices({ s, corrige }: { s: Seance; corrige?: boolean }) {
  return (
    <div>
      <EnteteEleve titre={corrige ? 'Corrección' : 'Ejercicios'} s={s} />
      {s.exercices.map((ex, i) => {
        const items = ex.items.split('\n').filter((x) => x.trim())
        const rep = ex.corrige.split('\n')
        return (
          <section key={ex.id} data-bloc style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '13pt', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ background: '#1C6E8C', color: '#fff', borderRadius: 999, width: 24, height: 24, display: 'inline-grid', placeItems: 'center', fontSize: '11pt' }}>{i + 1}</span>
              {ex.consigne}
            </h2>
            {ex.exemple && (
              <p style={{ margin: '6px 0', background: '#FBF4E6', borderLeft: '4px solid #E9A500', padding: '5px 10px', borderRadius: 4 }}>
                <b>Ejemplo :</b> {ex.exemple}
              </p>
            )}
            <ol style={{ margin: '6px 0 0 22px', listStyle: 'lower-alpha' }}>
              {items.map((it, j) => (
                <li key={j} style={{ padding: '5px 0', borderBottom: corrige ? undefined : '1px dotted #C7B9A6' }}>
                  {it}
                  {corrige ? <b style={{ color: '#1F3A5F' }}> → {rep[j] ?? ''}</b> : <span style={{ display: 'block', height: 18 }} />}
                </li>
              ))}
            </ol>
            {corrige && rep.length > items.length && <p style={{ color: '#1F3A5F' }}>{rep.slice(items.length).join(' ')}</p>}
          </section>
        )
      })}
    </div>
  )
}

// ——— Diaporama
export function useImage(src: string) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    if (!src.startsWith('pj:')) return setUrl(src)
    let u = ''
    get<PieceJointe>('piecesJointes', src.slice(3)).then((pj) => pj && setUrl((u = URL.createObjectURL(pj.blob))))
    return () => { if (u) URL.revokeObjectURL(u) }
  }, [src])
  return url
}

export function Diapo({ d, revele, numero }: { d: TDiapo; revele: number; numero?: string }) {
  const img = useImage(d.image)
  const items = d.aReveler.split('\n').filter((x) => x.trim())
  return (
    <div className="diapo">
      <div style={{ height: '1.4cqw', background: 'repeating-linear-gradient(90deg,#C84B31 0 3cqw,#E9A500 3cqw 6cqw)' }} />
      <div style={{ display: 'flex', gap: '3cqw', padding: '3.5cqw 5cqw', height: 'calc(100% - 1.4cqw)', boxSizing: 'border-box' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-titre)', fontSize: '5.2cqw', lineHeight: 1.1, margin: 0, color: '#A11C3A' }}>{d.titre}</h2>
          {d.texte && <p style={{ fontSize: '2.6cqw', margin: '1.5cqw 0 0', whiteSpace: 'pre-line' }}>{d.texte}</p>}
          <ul style={{ listStyle: 'none', padding: 0, margin: '2cqw 0 0' }}>
            {items.map((it, i) => (
              <li key={i} style={{
                fontSize: '2.6cqw', margin: '0.8cqw 0', padding: '0.6cqw 1.5cqw', borderLeft: '0.6cqw solid #1C6E8C', background: '#ffffff', borderRadius: '0.6cqw',
                opacity: i < revele ? 1 : 0, transform: i < revele ? 'none' : 'translateY(0.8cqw)', transition: 'opacity .35s, transform .35s',
              }}>{it}</li>
            ))}
          </ul>
        </div>
        {img && <img src={img} alt="" crossOrigin={d.image.startsWith('pj:') ? undefined : 'anonymous'} style={{ maxWidth: '45%', maxHeight: '100%', objectFit: 'contain', borderRadius: '1cqw', alignSelf: 'center' }} />}
      </div>
      {numero && <span style={{ position: 'absolute', right: '2cqw', bottom: '1.5cqw', fontSize: '1.4cqw', color: '#5E554C' }}>{numero}</span>}
    </div>
  )
}

function Diaporama({ s }: { s: Seance }) {
  const [projection, setProjection] = useState(false)
  const [occupe, setOccupe] = useState(false)
  const refExport = useRef<HTMLDivElement>(null)
  if (!s.diapos.length) return <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">Aucune diapositive : ajoute-les dans la séance, rubrique « Diaporama », ou utilise le générateur.</p>

  async function pdf() {
    setOccupe(true)
    try {
      await pdfDiapos([...refExport.current!.querySelectorAll<HTMLElement>('.diapo')], `diaporama-${nomFichier(s.titre)}.pdf`)
    } catch (e) {
      alert(`Le PDF n’a pas pu être créé (${(e as Error).message}). Si une image vient d’un autre site, elle peut bloquer l’export : mets-la en pièce jointe.`)
    } finally {
      setOccupe(false)
    }
  }

  return (
    <div>
      <Actions>
        <button className="btn-primary" onClick={() => setProjection(true)}>▶ Projeter</button>
        <button className="btn-ghost" onClick={pdf} disabled={occupe}>{occupe ? 'Création du PDF…' : '⬇ Télécharger le PDF'}</button>
        <button className="btn-ghost" onClick={() => imprimer(refExport.current!, true)}>🖨 Imprimer</button>
      </Actions>
      <p className="no-print mb-3 text-sm text-muted">En projection : clic, espace ou → pour révéler l’élément suivant puis passer à la diapo suivante ; ← pour revenir ; Échap pour quitter.</p>
      <div ref={refExport} className="grid gap-4 md:grid-cols-2">
        {s.diapos.map((d, i) => <div key={d.id} className="overflow-hidden rounded-xl shadow-md"><Diapo d={d} revele={99} numero={`${i + 1} / ${s.diapos.length}`} /></div>)}
      </div>
      {projection && <Projection diapos={s.diapos} onFermer={() => setProjection(false)} />}
    </div>
  )
}

function Projection({ diapos, onFermer }: { diapos: TDiapo[]; onFermer: () => void }) {
  const [pos, setPos] = useState({ i: 0, r: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const nb = (i: number) => diapos[i].aReveler.split('\n').filter((x) => x.trim()).length

  const suivant = () => setPos((p) => (p.r < nb(p.i) ? { ...p, r: p.r + 1 } : p.i < diapos.length - 1 ? { i: p.i + 1, r: 0 } : p))
  const precedent = () => setPos((p) => (p.r > 0 ? { ...p, r: p.r - 1 } : p.i > 0 ? { i: p.i - 1, r: nb(p.i - 1) } : p))

  useEffect(() => {
    ref.current?.requestFullscreen?.().catch(() => {})
    const k = (e: KeyboardEvent) => {
      if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); suivant() }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); precedent() }
      else if (e.key === 'Escape') onFermer()
    }
    const fs = () => !document.fullscreenElement && onFermer()
    addEventListener('keydown', k)
    document.addEventListener('fullscreenchange', fs)
    return () => {
      removeEventListener('keydown', k)
      document.removeEventListener('fullscreenchange', fs)
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={ref} className="fixed inset-0 z-50 grid place-items-center bg-[#111]" onClick={suivant}>
      <div style={{ width: 'min(100vw, 177.78vh)' }}><Diapo d={diapos[pos.i]} revele={pos.r} numero={`${pos.i + 1} / ${diapos.length}`} /></div>
      <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 gap-2 opacity-40 transition hover:opacity-100" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-full bg-white/90 px-4 py-2 font-bold text-[#2B2B2B]" onClick={precedent} aria-label="Précédent">‹</button>
        <button className="rounded-full bg-white/90 px-4 py-2 font-bold text-[#2B2B2B]" onClick={suivant} aria-label="Suivant">›</button>
        <button className="rounded-full bg-white/90 px-4 py-2 font-bold text-[#2B2B2B]" onClick={onFermer}>✕ Quitter</button>
      </div>
    </div>
  )
}

// ——— Pièces jointes (privées, jamais publiées)
function PiecesJointes({ s, pjs }: { s: Seance; pjs: PieceJointe[] }) {
  async function ajouter(files: FileList | null) {
    for (const f of files ?? []) await put<PieceJointe>('piecesJointes', { id: uid(), seanceId: s.id, nom: f.name, type: f.type, blob: f })
  }
  return (
    <div>
      <Actions>
        <label className="btn-primary cursor-pointer">
          + Ajouter des fichiers (PDF, images…)
          <input type="file" multiple accept="application/pdf,image/*,.doc,.docx,.odt,.ppt,.pptx,.mp3,.m4a" className="sr-only" onChange={(e) => ajouter(e.target.files)} />
        </label>
      </Actions>
      <p className="mb-3 text-sm text-muted">Stockées uniquement sur cet appareil. Une image ajoutée ici peut être utilisée dans le diaporama.</p>
      {pjs.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pjs.map((pj) => <CartePJ key={pj.id} pj={pj} />)}
        </ul>
      ) : <p className="rounded-xl border border-dashed border-line p-6 text-center text-muted">Aucune pièce jointe.</p>}
    </div>
  )
}

function CartePJ({ pj }: { pj: PieceJointe }) {
  const url = useImage(`pj:${pj.id}`)
  return (
    <li className="carte overflow-hidden">
      {pj.type.startsWith('image/') && url ? <img src={url} alt="" className="h-36 w-full object-cover" /> : <div className="grid h-36 place-items-center bg-surface-2 text-4xl">{pj.type === 'application/pdf' ? '📕' : '📄'}</div>}
      <div className="flex items-center gap-2 p-3">
        <span className="min-w-0 flex-1 truncate font-bold" title={pj.nom}>{pj.nom}</span>
        {url && <a className="btn-ghost px-2 py-1 text-sm" href={url} target="_blank" rel="noreferrer">Ouvrir</a>}
        <button className="btn-ghost px-2 py-1 text-sm" onClick={() => telecharger(pj.nom, pj.blob)}>⬇</button>
        <button className="btn-ghost px-2 py-1 text-sm text-grenat" onClick={() => confirm(`Supprimer « ${pj.nom} » ?`) && del('piecesJointes', pj.id)} aria-label="Supprimer">✕</button>
      </div>
    </li>
  )
}

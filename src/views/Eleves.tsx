import { useState } from 'react'
import { all, del, put, uid } from '../db/db'
import { ACTIVITES, type Activite, type Eleve, type Observation } from '../db/types'
import { aujourdhui, formatCourt } from '../lib/dates'
import { aller, useQuery } from '../lib/hooks'
import { Vide } from '../components/ui'
import { useDonnees } from './Journee'

/** Suivi des élèves : données strictement locales, jamais publiées. */
export default function Eleves({ classeId }: { classeId?: string }) {
  const d = useDonnees()
  const eleves = useQuery(() => all<Eleve>('eleves'), [])
  const obs = useQuery(() => all<Observation>('observations'), [])
  const [liste, setListe] = useState('')
  const [ouvert, setOuvert] = useState<string | null>(null)
  if (!d || !eleves || !obs) return null
  const classe = d.classes.find((c) => c.id === classeId) ?? d.classes[0]
  if (!classe) return <Vide>Aucune classe.</Vide>
  const ici = eleves.filter((e) => e.classeId === classe.id).sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom))

  async function importer() {
    for (const l of liste.split('\n').map((x) => x.trim()).filter(Boolean)) {
      let nom: string, prenom: string
      if (l.includes(',')) [nom, prenom] = l.split(',').map((x) => x.trim())
      else {
        // « Prénom NOM » ou « NOM Prénom » : les mots en majuscules forment le nom.
        const mots = l.split(/\s+/)
        const maj = mots.filter((m) => m.length > 1 && m === m.toUpperCase())
        nom = maj.length ? maj.join(' ') : mots.slice(-1).join('')
        prenom = mots.filter((m) => (maj.length ? !maj.includes(m) : m !== nom)).join(' ')
      }
      await put<Eleve>('eleves', { id: uid(), classeId: classe.id, nom: nom ?? '', prenom: prenom ?? '', besoins: '' })
    }
    setListe('')
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Alumnos <span className="text-xl font-normal text-muted">· infos élèves</span></h1>
      <p className="mt-1 rounded-lg bg-safran/20 px-3 py-2 text-sm">🔒 Ces informations restent uniquement sur cet appareil. Elles ne sont jamais publiées. Ne note ici que ce qui est utile (bulletins, suivi) ; les besoins particuliers sont des données sensibles.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {d.classes.map((c) => (
          <button key={c.id} onClick={() => aller('alumnos', c.id)} className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${c.id === classe.id ? 'text-white' : 'bg-surface'}`} style={{ borderColor: c.couleur, background: c.id === classe.id ? c.couleur : undefined }}>
            {c.nom} <span className="font-normal opacity-80">({eleves.filter((e) => e.classeId === c.id).length})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="carte p-4">
          <h2 className="mb-2 font-semibold">{classe.nom} — {ici.length} élève{ici.length > 1 ? 's' : ''}</h2>
          {!ici.length ? <p className="text-sm text-muted">Aucun élève. Colle la liste à droite.</p> : (
            <ul className="divide-y divide-line">
              {ici.map((e) => {
                const o = obs.filter((x) => x.eleveId === e.id).sort((a, b) => b.date.localeCompare(a.date))
                return (
                  <li key={e.id} className="py-2">
                    <button className="flex w-full items-center gap-2 text-left" onClick={() => setOuvert(ouvert === e.id ? null : e.id)} aria-expanded={ouvert === e.id}>
                      <span className="text-muted">{ouvert === e.id ? '▾' : '▸'}</span>
                      <span className="font-bold">{e.nom.toUpperCase()} {e.prenom}</span>
                      {e.besoins && <span title="Besoins particuliers notés" aria-label="Besoins particuliers notés">📌</span>}
                      <span className="ml-auto flex gap-1">{(Object.keys(ACTIVITES) as Activite[]).map((a) => { const n = o.filter((x) => x.activite === a).length; return n ? <span key={a} className="rounded bg-surface-2 px-1 text-[11px] font-bold">{a} {n}</span> : null })}</span>
                    </button>
                    {ouvert === e.id && <FicheEleve e={e} obs={o} />}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
        <aside className="carte h-fit p-4">
          <h2 className="font-semibold">Ajouter des élèves</h2>
          <p className="text-xs text-muted">Un élève par ligne : « NOM, Prénom » (ou « Prénom NOM »). Tu peux coller une liste depuis Pronote.</p>
          <textarea rows={8} className="champ mt-2" value={liste} onChange={(e) => setListe(e.target.value)} placeholder={'GARCÍA, Lucía\nMARTIN, Hugo'} />
          <button className="btn-primary mt-2 w-full" disabled={!liste.trim()} onClick={importer}>Ajouter à {classe.nom}</button>
        </aside>
      </div>
    </div>
  )
}

function FicheEleve({ e, obs }: { e: Eleve; obs: Observation[] }) {
  const [f, setF] = useState({ activite: 'general' as Activite | 'general', texte: '' })
  return (
    <div className="mt-2 grid gap-3 rounded-xl bg-surface-2/50 p-3 md:grid-cols-2">
      <div>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="label">Nom</span><input className="champ" defaultValue={e.nom} onBlur={(x) => put('eleves', { ...e, nom: x.target.value })} /></label>
          <label><span className="label">Prénom</span><input className="champ" defaultValue={e.prenom} onBlur={(x) => put('eleves', { ...e, prenom: x.target.value })} /></label>
        </div>
        <label className="mt-2 block"><span className="label">Besoins / aménagements (donnée sensible)</span>
          <textarea rows={3} className="champ" defaultValue={e.besoins} onBlur={(x) => put('eleves', { ...e, besoins: x.target.value })} />
        </label>
        <button className="mt-2 text-sm font-bold text-grenat hover:underline" onClick={async () => { if (confirm(`Supprimer ${e.prenom} ${e.nom} et ses observations ?`)) { for (const o of obs) await del('observations', o.id); await del('eleves', e.id) } }}>Supprimer l’élève</button>
      </div>
      <div>
        <form className="flex flex-col gap-2" onSubmit={async (x) => { x.preventDefault(); if (!f.texte.trim()) return; await put<Observation>('observations', { id: uid(), eleveId: e.id, date: aujourdhui(), ...f, texte: f.texte.trim() }); setF({ ...f, texte: '' }) }}>
          <span className="label">Nouvelle observation (aujourd’hui)</span>
          <select className="champ" value={f.activite} onChange={(x) => setF({ ...f, activite: x.target.value as Activite | 'general' })}>
            <option value="general">Général</option>
            {(Object.keys(ACTIVITES) as Activite[]).map((a) => <option key={a} value={a}>{a} — {ACTIVITES[a]}</option>)}
          </select>
          <input className="champ" placeholder="Ex. Participe beaucoup, bonne prononciation" value={f.texte} onChange={(x) => setF({ ...f, texte: x.target.value })} />
          <button className="btn-primary">Ajouter</button>
        </form>
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {obs.map((o) => (
            <li key={o.id} className="flex gap-2"><span className="w-16 shrink-0 text-muted">{formatCourt(o.date)}</span><b className="w-10 shrink-0">{o.activite === 'general' ? '—' : o.activite}</b><span className="flex-1">{o.texte}</span>
              <button className="text-muted hover:text-grenat" onClick={() => del('observations', o.id)} aria-label="Supprimer l’observation">✕</button></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

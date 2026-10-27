import { useState } from 'react'
import { all, del, put, uid } from '../db/db'
import { TYPES_RAPPEL, type Rappel, type TypeRappel } from '../db/types'
import { aujourdhui, formatLong } from '../lib/dates'
import { useQuery } from '../lib/hooks'

/** Réunions & administration : conseils de classe, rencontres parents, examens… avec compte rendu. */
export default function Reunions() {
  const rappels = useQuery(() => all<Rappel>('rappels'), [])
  const [f, setF] = useState({ date: aujourdhui(), heure: '', type: 'conseil' as TypeRappel, titre: '' })
  const [voirPasses, setVoirPasses] = useState(false)
  if (!rappels) return null
  const tries = [...rappels].sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure))
  const avenir = tries.filter((r) => r.date >= aujourdhui())
  const passes = tries.filter((r) => r.date < aujourdhui()).reverse()

  return (
    <div>
      <h1 className="text-3xl font-semibold">Reuniones <span className="text-xl font-normal text-muted">· réunions & administration</span></h1>
      <form className="carte mt-4 grid gap-2 p-4 sm:grid-cols-[auto_auto_auto_1fr_auto]"
        onSubmit={async (e) => { e.preventDefault(); if (!f.titre.trim()) return; await put<Rappel>('rappels', { id: uid(), note: '', ...f, titre: f.titre.trim() }); setF({ ...f, titre: '' }) }}>
        <input type="date" className="champ" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Date" />
        <input type="time" className="champ" value={f.heure} onChange={(e) => setF({ ...f, heure: e.target.value })} aria-label="Heure" />
        <select className="champ" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as TypeRappel })} aria-label="Type">
          {Object.entries(TYPES_RAPPEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="champ" placeholder="Ex. Conseil de classe 3e C — salle des profs" value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} aria-label="Intitulé" />
        <button className="btn-primary">+ Ajouter</button>
      </form>
      <p className="mt-1 text-xs text-muted">Chaque rendez-vous apparaît aussi en bannière dans Hoy, Semana et le calendrier.</p>

      <h2 className="mt-6 text-xl font-semibold">À venir ({avenir.length})</h2>
      <Liste items={avenir} />
      <button className="mt-6 text-sm font-bold text-azulejo hover:underline" onClick={() => setVoirPasses(!voirPasses)}>{voirPasses ? '▾' : '▸'} Passés ({passes.length})</button>
      {voirPasses && <Liste items={passes} />}
    </div>
  )
}

function Liste({ items }: { items: Rappel[] }) {
  if (!items.length) return <p className="mt-2 text-sm text-muted">Rien.</p>
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {items.map((r) => (
        <li key={r.id} className="carte p-3">
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 [&::-webkit-details-marker]:hidden">
              <span className="w-56 shrink-0 text-sm font-bold first-letter:uppercase">{formatLong(r.date)}{r.heure && ` · ${r.heure}`}</span>
              <span className="rounded bg-safran px-1.5 py-0.5 text-xs font-bold text-[#2B2B2B]">{TYPES_RAPPEL[r.type] ?? r.type}</span>
              <span className="min-w-0 flex-1 font-semibold">{r.titre}</span>
              {r.note && <span className="text-xs text-muted">📝 compte rendu</span>}
            </summary>
            <label className="mt-2 block"><span className="label">Notes / ordre du jour / compte rendu</span>
              <textarea rows={5} className="champ [field-sizing:content]" defaultValue={r.note} onBlur={(e) => put('rappels', { ...r, note: e.target.value })} />
            </label>
            <button className="mt-2 text-sm font-bold text-grenat hover:underline" onClick={() => confirm('Supprimer ?') && del('rappels', r.id)}>Supprimer</button>
          </details>
        </li>
      ))}
    </ul>
  )
}

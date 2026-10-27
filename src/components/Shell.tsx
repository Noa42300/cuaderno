import { useState, type ReactNode } from 'react'
import { useRoute } from '../lib/hooks'
import Logo from './Logo'

interface Lien { id: string; es: string; fr: string; icone: string; groupe: number }

const NAV: Lien[] = [
  { id: 'jour', es: 'Hoy', fr: 'Aujourd’hui', icone: '☀️', groupe: 0 },
  { id: 'semana', es: 'Semana', fr: 'Semaine', icone: '🗓️', groupe: 0 },
  { id: 'agenda', es: 'Calendario', fr: 'Calendrier', icone: '📅', groupe: 0 },
  { id: 'programacion', es: 'Programación', fr: 'Programmations', icone: '📚', groupe: 1 },
  { id: 'progresion', es: 'Progresión', fr: 'Progressions', icone: '📈', groupe: 1 },
  { id: 'sequences', es: 'Secuencias', fr: 'Séquences & bibliothèque', icone: '🧩', groupe: 1 },
  { id: 'generateur', es: 'Generador', fr: 'Générateur de séance', icone: '✨', groupe: 1 },
  { id: 'recursos', es: 'Recursos', fr: 'Ressources', icone: '🔎', groupe: 2 },
  { id: 'rituales', es: 'Rituales', fr: 'Rituels', icone: '🔔', groupe: 2 },
  { id: 'pizarra', es: 'Pizarra', fr: 'Tableau', icone: '✏️', groupe: 2 },
  { id: 'alumnos', es: 'Alumnos', fr: 'Infos élèves', icone: '🎓', groupe: 3 },
  { id: 'reuniones', es: 'Reuniones', fr: 'Réunions / admin', icone: '📁', groupe: 3 },
  { id: 'volumenes', es: 'Volumen horario', fr: 'Volumes horaires', icone: '⏱️', groupe: 3 },
  { id: 'reglages', es: 'Ajustes', fr: 'Paramètres', icone: '⚙️', groupe: 4 },
]
const MOBILE = ['jour', 'semana', 'pizarra', 'rituales']
const RUBRIQUE: Record<string, string> = { seance: 'jour', sequence: 'sequences', hoy: 'jour' }

export default function Shell({ children }: { children: ReactNode }) {
  const [page = 'jour'] = useRoute()
  const actif = RUBRIQUE[page] ?? page
  const [menu, setMenu] = useState(false)

  const liens = (fermer?: () => void) => (
    <nav className="flex flex-col gap-0.5 px-2" aria-label="Navigation principale">
      {NAV.map((n, i) => (
        <div key={n.id}>
          {i > 0 && NAV[i - 1].groupe !== n.groupe && <div className="mx-3 my-2 h-px bg-white/10" />}
          <a href={`#/${n.id}`} onClick={fermer} aria-current={actif === n.id ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-lg border-l-4 px-3 py-1.5 transition ${actif === n.id ? 'border-[#E9A500] bg-white/12 text-white' : 'border-transparent text-white/80 hover:bg-white/8 hover:text-white'}`}>
            <span aria-hidden className="w-6 text-center text-lg">{n.icone}</span>
            <span className="leading-tight">
              <span className="block font-bold" lang="es">{n.es}</span>
              <span className="block text-[11px] text-white/55">{n.fr}</span>
            </span>
          </a>
        </div>
      ))}
    </nav>
  )

  const marque = (
    <a href="#/jour" className="flex items-center gap-3 px-4 pb-3 pt-4">
      <Logo className="h-11 w-11 shrink-0 rounded-xl ring-1 ring-white/20" />
      <span>
        <span className="titre block text-xl font-semibold text-white">Cuaderno</span>
        <span className="block text-xs text-white/60">Español · 2026-2027</span>
      </span>
    </a>
  )

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[244px_1fr]">
      <aside className="no-print navy sticky top-0 hidden h-dvh flex-col overflow-y-auto md:flex">
        <div className="frise" />
        {marque}
        {liens()}
        <div className="azulejo-nuit mt-auto h-24 shrink-0 opacity-40" aria-hidden />
      </aside>

      <div className="flex min-h-dvh flex-col pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 md:px-8 md:pt-6">{children}</main>
      </div>

      {/* Barre d'onglets (iPhone) */}
      <nav aria-label="Navigation principale" className="no-print navy fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.filter((n) => MOBILE.includes(n.id)).map((n) => (
          <a key={n.id} href={`#/${n.id}`} aria-current={actif === n.id ? 'page' : undefined}
            className={`flex flex-col items-center py-2 text-[11px] font-bold ${actif === n.id ? 'text-[#F2C14E]' : 'text-white/75'}`}>
            <span aria-hidden className="text-lg">{n.icone}</span>{n.es}
          </a>
        ))}
        <button onClick={() => setMenu(true)} className={`flex flex-col items-center py-2 text-[11px] font-bold ${MOBILE.includes(actif) ? 'text-white/75' : 'text-[#F2C14E]'}`}>
          <span aria-hidden className="text-lg">☰</span>Más
        </button>
      </nav>
      {menu && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenu(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="navy absolute inset-y-0 left-0 w-72 overflow-y-auto pt-[env(safe-area-inset-top)] pb-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {marque}
            {liens(() => setMenu(false))}
          </div>
        </div>
      )}
    </div>
  )
}

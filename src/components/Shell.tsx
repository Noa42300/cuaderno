import type { ReactNode } from 'react'
import { aller, useRoute } from '../lib/hooks'
import Logo from './Logo'

const NAV = [
  { id: 'agenda', label: 'Agenda', icone: '📅', mobile: true },
  { id: 'sequences', label: 'Séquences', icone: '🧭', mobile: true },
  { id: 'generateur', label: 'Générateur', icone: '✨', mobile: true },
  { id: 'progressions', label: 'Progressions', icone: '🗺️', mobile: false },
  { id: 'eleves', label: 'Élèves', icone: '👥', mobile: true },
  { id: 'reglages', label: 'Réglages', icone: '⚙️', mobile: true },
]
const RUBRIQUE: Record<string, string> = { jour: 'agenda', seance: 'agenda', sequence: 'sequences' }

export default function Shell({ children }: { children: ReactNode }) {
  const [page = 'agenda'] = useRoute()
  const actif = RUBRIQUE[page] ?? page
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[220px_1fr]">
      {/* Barre latérale (Mac / iPad) */}
      <aside className="no-print sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface md:flex">
        <div className="frise" />
        <button onClick={() => aller('agenda')} className="flex items-center gap-3 p-4 text-left">
          <Logo className="h-10 w-10" />
          <span>
            <span className="titre block text-xl font-semibold">Cuaderno</span>
            <span className="block text-xs text-muted">cahier journal · español</span>
          </span>
        </button>
        <nav className="flex flex-col gap-1 px-2" aria-label="Navigation principale">
          {NAV.map((n) => (
            <a key={n.id} href={`#/${n.id}`} aria-current={actif === n.id ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 font-bold ${actif === n.id ? 'bg-primary text-on-primary' : 'text-ink hover:bg-surface-2'}`}>
              <span aria-hidden>{n.icone}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="azulejo mt-auto h-32 opacity-60" aria-hidden />
      </aside>

      <div className="flex min-h-dvh flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-8 md:px-8">{children}</main>
      </div>

      {/* Barre d'onglets (iPhone) */}
      <nav aria-label="Navigation principale"
        className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.filter((n) => n.mobile).map((n) => (
          <a key={n.id} href={`#/${n.id}`} aria-current={actif === n.id ? 'page' : undefined}
            className={`flex flex-col items-center py-2 text-[11px] font-bold ${actif === n.id ? 'text-primary' : 'text-muted'}`}>
            <span aria-hidden className="text-lg">{n.icone}</span>
            {n.label}
          </a>
        ))}
      </nav>
    </div>
  )
}

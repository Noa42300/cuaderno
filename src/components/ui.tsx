import type { ReactNode } from 'react'
import { ACTIVITES, type Activite, type Classe } from '../db/types'

const COULEUR_AL: Record<Activite, string> = {
  CO: 'bg-azulejo/15 text-azulejo',
  CE: 'bg-ocre/20 text-ink',
  EOC: 'bg-teja/15 text-primary',
  EOI: 'bg-grenat/15 text-grenat',
  EE: 'bg-safran/25 text-ink',
}

export function BadgeAL({ a }: { a: Activite }) {
  return (
    <abbr title={ACTIVITES[a]} className={`rounded-md px-1.5 py-0.5 text-xs font-bold no-underline ${COULEUR_AL[a]}`}>
      {a}
    </abbr>
  )
}

export function PastilleClasse({ classe }: { classe?: Classe }) {
  if (!classe) return <span className="text-muted">Classe supprimée</span>
  return (
    <span className="inline-flex items-center gap-2 font-bold">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: classe.couleur }} aria-hidden />
      {classe.nom}
    </span>
  )
}

export function Section({ titre, actions, children }: { titre: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{titre}</h2>
        {actions}
      </div>
      {children}
    </section>
  )
}

export function Vide({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-line p-4 text-center text-muted">{children}</p>
}

import type { Alternance, ISODate, JourSemaine } from '../db/types'

export const JOURS: Record<JourSemaine, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' }

const pad = (n: number) => String(n).padStart(2, '0')
export const toISO = (d: Date): ISODate => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const fromISO = (s: ISODate) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const aujourdhui = () => toISO(new Date())
export const ajouterJours = (s: ISODate, n: number) => {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}
/** 0 = dimanche … 6 = samedi */
export const jourDe = (s: ISODate) => fromISO(s).getDay()

export const formatLong = (s: ISODate) =>
  fromISO(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
export const formatCourt = (s: ISODate) => fromISO(s).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
/** « la fecha » en espagnol, pour le rituel. */
export const fechaEs = (s: ISODate) =>
  fromISO(s).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

/** Semaine A ou B d'après un lundi de référence (vide = pas d'alternance). */
export function semaineAB(s: ISODate, lundiA: ISODate | ''): 'A' | 'B' | null {
  if (!lundiA) return null
  const lundi = (d: Date) => {
    const x = new Date(d)
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7))
    return x
  }
  const diff = Math.round((lundi(fromISO(s)).getTime() - lundi(fromISO(lundiA)).getTime()) / (7 * 864e5))
  return ((diff % 2) + 2) % 2 === 0 ? 'A' : 'B'
}

export const creneauActif = (sem: Alternance, ab: 'A' | 'B' | null) => sem === 'toutes' || ab === null || sem === ab

export const minutesEntre = (debut: string, fin: string) => {
  const m = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))
  return Math.max(0, m(fin) - m(debut))
}

/** Lundi de la semaine contenant `s`. */
export const lundiDe = (s: ISODate) => ajouterJours(s, -((jourDe(s) + 6) % 7))

export const enMinutes = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3, 5))
export const enHeure = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

/** Numéro de semaine ISO. */
export function numeroSemaine(s: ISODate) {
  const d = fromISO(s)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const j4 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - j4.getTime()) / 864e5 - 3 + ((j4.getDay() + 6) % 7)) / 7)
}

export const moisAnnee = (s: ISODate) => fromISO(s).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

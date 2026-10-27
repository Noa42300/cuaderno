import { useEffect, useState } from 'react'
import { getReglages, onDbChange } from './db/db'
import type { Reglages } from './db/types'
import { useRoute } from './lib/hooks'
import { aujourdhui } from './lib/dates'
import Shell from './components/Shell'
import Agenda from './views/Agenda'
import PageSeance from './views/FicheSeance'
import Documents from './views/Documents'
import Sequences, { EditeurSequence } from './views/Sequences'
import Generateur from './views/Generateur'
import VueReglages from './views/VueReglages'
import BientotLa from './views/BientotLa'
import { Hoy, Semana } from './views/Journee'
import { Programmation, Progression } from './views/Programmation'
import { Recursos, Rituales, Volumes } from './views/Annexes'
import Pizarra from './views/Pizarra'
import Eleves from './views/Eleves'
import Reunions from './views/Reunions'

function appliquerTheme(theme: Reglages['theme']) {
  const sombre = theme === 'sombre' || (theme === 'systeme' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', sombre)
}

export default function App() {
  const [reglages, setReglages] = useState<Reglages>()

  useEffect(() => {
    const charger = () => getReglages().then(setReglages)
    charger()
    return onDbChange(charger)
  }, [])

  useEffect(() => {
    if (!reglages) return
    appliquerTheme(reglages.theme)
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const f = () => appliquerTheme(reglages.theme)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [reglages?.theme])

  if (!reglages) return null
  return (
    <Shell>
      <Routes />
    </Shell>
  )
}

function Routes() {
  const [page, a, b, c] = useRoute()
  switch (page) {
    case undefined:
    case 'hoy':
      return <Hoy date={aujourdhui()} />
    case 'jour':
      return <Hoy date={a ?? aujourdhui()} ouvrir={b} />
    case 'semana':
      return <Semana date={a ?? aujourdhui()} />
    case 'agenda':
      return <Agenda mode={a === 'jour' ? 'jour' : 'semaine'} date={b ?? aujourdhui()} />
    case 'seance':
      return b === 'documents' ? <Documents id={a} onglet={c} /> : <PageSeance id={a} />
    case 'programacion':
      return <Programmation classeId={a} />
    case 'progresion':
      return <Progression classeId={a} />
    case 'sequences':
      return <Sequences />
    case 'sequence':
      return <EditeurSequence id={a} />
    case 'generateur':
      return <Generateur sequenceId={a} />
    case 'recursos':
      return <Recursos />
    case 'rituales':
      return <Rituales classeId={a} />
    case 'pizarra':
      return <Pizarra />
    case 'alumnos':
      return <Eleves classeId={a} />
    case 'reuniones':
      return <Reunions />
    case 'volumenes':
      return <Volumes />
    case 'reglages':
      return <VueReglages onglet={a} />
    default:
      return <BientotLa page={page} />
  }
}

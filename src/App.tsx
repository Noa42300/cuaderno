import { useEffect, useState } from 'react'
import { getReglages, onDbChange } from './db/db'
import type { Reglages } from './db/types'
import { useRoute } from './lib/hooks'
import { aujourdhui } from './lib/dates'
import Shell from './components/Shell'
import Agenda from './views/Agenda'
import EditeurSeance from './views/EditeurSeance'
import Documents from './views/Documents'
import Sequences, { EditeurSequence } from './views/Sequences'
import Generateur from './views/Generateur'
import VueReglages from './views/VueReglages'
import BientotLa from './views/BientotLa'

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
  const [page, a, b] = useRoute()
  switch (page) {
    case undefined:
    case 'agenda':
      return <Agenda mode={a === 'jour' ? 'jour' : 'semaine'} date={b ?? aujourdhui()} />
    case 'jour':
      return <Agenda mode="jour" date={a ?? aujourdhui()} />
    case 'seance':
      return b === 'documents' ? <Documents id={a} /> : <EditeurSeance id={a} />
    case 'sequences':
      return <Sequences />
    case 'sequence':
      return <EditeurSequence id={a} />
    case 'generateur':
      return <Generateur sequenceId={a} />
    case 'reglages':
      return <VueReglages onglet={a} />
    default:
      return <BientotLa page={page} />
  }
}

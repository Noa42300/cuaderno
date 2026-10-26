import { useEffect, useState } from 'react'
import { getReglages, onDbChange } from './db/db'
import type { Reglages } from './db/types'
import { useRoute } from './lib/hooks'
import { aujourdhui } from './lib/dates'
import Verrou from './views/Verrou'
import Shell from './components/Shell'
import VueJour from './views/VueJour'
import EditeurSeance from './views/EditeurSeance'
import VueReglages from './views/VueReglages'
import BientotLa from './views/BientotLa'

function appliquerTheme(theme: Reglages['theme']) {
  const sombre = theme === 'sombre' || (theme === 'systeme' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', sombre)
}

export default function App() {
  const [reglages, setReglages] = useState<Reglages>()
  const [deverrouille, setDeverrouille] = useState(false)

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

  // Reverrouillage après X minutes en arrière-plan.
  useEffect(() => {
    let cacheLe = 0
    const f = () => {
      if (document.visibilityState === 'hidden') cacheLe = Date.now()
      else if (cacheLe && reglages && Date.now() - cacheLe > reglages.verrouMinutes * 60_000) setDeverrouille(false)
    }
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [reglages?.verrouMinutes])

  if (!reglages) return null
  if (!deverrouille) return <Verrou reglages={reglages} onOuvert={() => setDeverrouille(true)} />
  return (
    <Shell>
      <Routes />
    </Shell>
  )
}

function Routes() {
  const [page, a] = useRoute()
  switch (page) {
    case undefined:
    case 'jour':
      return <VueJour date={a ?? aujourdhui()} />
    case 'seance':
      return <EditeurSeance id={a} />
    case 'reglages':
      return <VueReglages onglet={a} />
    default:
      return <BientotLa page={page} />
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { enregistrerServiceWorker } from './pwa'
import { demanderStockagePersistant } from './db/db'
import { ajouterClassesInitiales } from './data/classesInitiales'
import { chargerEdtInitial } from './data/edtInitial'

enregistrerServiceWorker()
demanderStockagePersistant()
ajouterClassesInitiales().then(() => chargerEdtInitial())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

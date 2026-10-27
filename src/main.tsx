import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { enregistrerServiceWorker } from './pwa'
import { demanderStockagePersistant } from './db/db'
import { ajouterClassesInitiales } from './data/classesInitiales'

enregistrerServiceWorker()
demanderStockagePersistant()
ajouterClassesInitiales()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

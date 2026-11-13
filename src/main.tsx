import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { enregistrerServiceWorker } from './pwa'
import { demanderStockagePersistant } from './db/db'
import { ajouterClassesInitiales } from './data/classesInitiales'
import { chargerEdtInitial } from './data/edtInitial'
import { ajuster5eD, ajuster5eDFin, ajuster5eDNoel, ajuster1reAxe1, ajuster1reVocesAndinas, ajuster1reAxe2SansTache, ajusterTleMain, ajusterTleMestizaje, appliquerAjustements, preparerJusquaNoel } from './data/ajustements'

enregistrerServiceWorker()
demanderStockagePersistant()
ajouterClassesInitiales().then(() => chargerEdtInitial()).then(() => appliquerAjustements()).then(() => ajuster5eD())
  .then(() => ajuster5eDNoel())
  .then(() => preparerJusquaNoel())
  .then(() => ajuster5eDFin())
  .then(() => ajusterTleMestizaje())
  .then(() => ajusterTleMain())
  .then(() => ajuster1reAxe1())
  .then(() => ajuster1reVocesAndinas())
  .then(() => ajuster1reAxe2SansTache())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

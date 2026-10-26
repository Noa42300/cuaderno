import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { enregistrerServiceWorker } from './pwa'
import { demanderStockagePersistant } from './db/db'

enregistrerServiceWorker()
demanderStockagePersistant()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

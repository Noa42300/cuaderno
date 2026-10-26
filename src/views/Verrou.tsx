import { useState } from 'react'
import type { Reglages } from '../db/types'
import { saveReglages } from '../db/db'
import { empreintePin, nouveauSel, pinValide } from '../lib/pin'
import Logo from '../components/Logo'

export default function Verrou({ reglages, onOuvert }: { reglages: Reglages; onOuvert: () => void }) {
  const creation = !reglages.pinHash
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [erreur, setErreur] = useState('')
  const [occupe, setOccupe] = useState(false)

  async function valider(e: React.FormEvent) {
    e.preventDefault()
    setErreur('')
    setOccupe(true)
    try {
      if (creation) {
        if (!pinValide(pin)) return setErreur('Le code doit comporter 4 à 8 chiffres.')
        if (pin !== confirm) return setErreur('Les deux codes ne correspondent pas.')
        const sel = nouveauSel()
        await saveReglages({ pinSel: sel, pinHash: await empreintePin(pin, sel) })
        onOuvert()
      } else if ((await empreintePin(pin, reglages.pinSel)) === reglages.pinHash) onOuvert()
      else {
        setErreur('Code incorrect.')
        setPin('')
      }
    } finally {
      setOccupe(false)
    }
  }

  return (
    <main className="azulejo grid min-h-dvh place-items-center p-4">
      <form onSubmit={valider} className="carte w-full max-w-sm overflow-hidden">
        <div className="frise" />
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-semibold">Cuaderno</h1>
              <p className="text-sm text-muted">Mon cahier journal d’espagnol</p>
            </div>
          </div>
          {creation && (
            <p className="mb-4 text-sm text-muted">
              Bienvenida&nbsp;! Choisis un code PIN (4 à 8 chiffres). Il protège l’ouverture de l’appli sur cet appareil.
              <strong> Note-le&nbsp;: il ne peut pas être récupéré.</strong>
            </p>
          )}
          <label className="label" htmlFor="pin">{creation ? 'Nouveau code' : 'Code PIN'}</label>
          <input id="pin" className="champ text-center text-2xl tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="off"
            autoFocus maxLength={8} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
          {creation && (
            <>
              <label className="label mt-3" htmlFor="pin2">Confirmer le code</label>
              <input id="pin2" className="champ text-center text-2xl tracking-[0.5em]" type="password" inputMode="numeric" autoComplete="off"
                maxLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))} />
            </>
          )}
          <p role="alert" className="mt-2 min-h-5 text-sm font-bold text-grenat">{erreur}</p>
          <button className="btn-primary mt-2 w-full" disabled={occupe || pin.length < 4}>
            {creation ? 'Créer mon code' : 'Ouvrir'}
          </button>
        </div>
      </form>
    </main>
  )
}

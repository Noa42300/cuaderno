// Le PIN n'est jamais stocké : seulement une empreinte PBKDF2 salée.
// Rappel honnête : c'est un verrou d'usage (évite qu'un tiers ouvre l'appli),
// pas un chiffrement des données.

const enc = new TextEncoder()
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')

export async function empreintePin(pin: string, sel: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(sel), iterations: 150_000 }, key, 256)
  return hex(bits)
}

export const nouveauSel = () => hex(crypto.getRandomValues(new Uint8Array(16)).buffer)
export const pinValide = (pin: string) => /^\d{4,8}$/.test(pin)

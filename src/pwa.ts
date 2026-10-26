import { registerSW } from 'virtual:pwa-register'

/**
 * Mise à jour fiable : le nouveau service worker s'active tout de suite
 * (skipWaiting + clientsClaim) et la page se recharge dès qu'il prend la main.
 * On vérifie aussi régulièrement s'il existe une nouvelle version, et à chaque
 * retour au premier plan (indispensable sur iPhone/iPad où l'appli reste ouverte).
 */
export function enregistrerServiceWorker() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return

  let rechargement = false
  const hadController = !!navigator.serviceWorker.controller
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Premier install : pas de rechargement nécessaire.
    if (!hadController || rechargement) return
    rechargement = true
    location.reload()
  })

  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      if (!reg) return
      const verifier = () => navigator.onLine && reg.update().catch(() => {})
      setInterval(verifier, 30 * 60 * 1000)
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && verifier())
    },
  })
}


import { PROGRAMMES_OFFICIELS } from '../data/officiel'

/** Axes / thématiques des programmes en vigueur (pour les listes de suggestions). */
export const PROGRAMMES = PROGRAMMES_OFFICIELS.map((p) => ({ groupe: p.titre, items: p.axes }))

export const NATURES_SUPPORT = [
  'Chanson', 'Clip vidéo', 'Publicité', 'Extrait de film', 'Extrait de série', 'Court-métrage', 'Œuvre d’art (peinture)',
  'Photographie', 'Article de presse', 'Affiche', 'Extrait littéraire', 'Poème', 'Bande dessinée', 'Infographie', 'Podcast / audio',
]

/** Une URL de vidéo doit pointer vers UNE vidéo précise, pas une recherche. */
export function problemeVideo(url: string): string | null {
  if (!url.trim()) return null
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return 'Ce n’est pas une adresse web valide.'
  }
  if (/results|search|buscar|recherche/i.test(u.pathname + u.search)) return 'Ce lien ressemble à une page de résultats : colle le lien d’UNE vidéo précise.'
  if (/youtube\.com$/.test(u.hostname.replace('www.', '')) && !u.searchParams.get('v') && !/^\/(shorts|embed|live)\//.test(u.pathname))
    return 'Lien YouTube sans identifiant de vidéo (?v=…).'
  return null
}

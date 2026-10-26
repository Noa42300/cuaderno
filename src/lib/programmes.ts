// Références programmes LV (à vérifier par la prof en cas de nouveau BO).
// LLCER : non pré-rempli (à compléter ensemble).

export const PROGRAMMES = [
  {
    groupe: 'Cycle 4 (5e-4e-3e) — culture et lexique',
    items: ['Langages', 'École et société', 'Voyages et migrations', 'Rencontres avec d’autres cultures'],
  },
  {
    groupe: 'Seconde — « L’art de vivre ensemble »',
    items: [
      'Vivre entre générations',
      'Les univers professionnels, le monde du travail',
      'Le village, le quartier, la ville',
      'Représentation de soi et rapport à autrui',
      'Sports et société',
      'La création et le rapport aux arts',
      'Saisir le monde : s’informer',
      'Le passé dans le présent',
    ],
  },
  {
    groupe: 'Cycle terminal — « Gestes fondateurs et mondes en mouvement »',
    items: [
      'Identités et échanges',
      'Espace privé et espace public',
      'Art et pouvoir',
      'Citoyenneté et mondes virtuels',
      'Fictions et réalités',
      'Innovations scientifiques et responsabilité',
      'Diversité et inclusion',
      'Territoire et mémoire',
    ],
  },
]

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

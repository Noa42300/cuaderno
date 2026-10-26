const PREVU: Record<string, { titre: string; items: string[] }> = {
  sequences: {
    titre: 'Séquences & bibliothèque',
    items: ['Créer une séquence (projet final, tâche finale, évaluation)', 'Ranger des séances', 'Poser une séance sur un jour / une classe'],
  },
  progressions: { titre: 'Progressions annuelles', items: ['Progression par niveau (6e → Terminale)', 'Pré-remplissage à partir des programmes'] },
  eleves: {
    titre: 'Suivi des élèves',
    items: ['Profil par classe', 'Observations datées par activité langagière', 'Aide aux bulletins — données strictement locales'],
  },
}

export default function BientotLa({ page }: { page: string }) {
  const p = PREVU[page] ?? { titre: 'Page introuvable', items: [] }
  return (
    <section className="carte mt-4 p-6">
      <h1 className="text-3xl font-semibold">{p.titre}</h1>
      <p className="mt-2 text-muted">Prochaine étape de construction. Prévu :</p>
      <ul className="mt-3 list-disc pl-6">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  )
}

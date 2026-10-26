/** Carreau d'azulejo stylisé : le logo de l'appli (même dessin que l'icône). */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#C84B31" />
      <rect x="6" y="6" width="52" height="52" rx="9" fill="#FBF4E6" />
      <path d="M32 10 L54 32 L32 54 L10 32 Z" fill="#1C6E8C" />
      <path d="M32 18 L46 32 L32 46 L18 32 Z" fill="#FBF4E6" />
      <circle cx="32" cy="32" r="7" fill="#E9A500" />
      <path d="M6 15 Q15 15 15 6 M58 15 Q49 15 49 6 M6 49 Q15 49 15 58 M58 49 Q49 49 49 58" stroke="#A11C3A" strokeWidth="3" fill="none" />
    </svg>
  )
}
